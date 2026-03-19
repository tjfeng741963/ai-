/**
 * 自动分块重试机制
 *
 * 当大阶段（如NarrativeDNA 8维度、Commercial 4维度）的JSON输出过大导致解析失败时，
 * 自动拆分为子组分别调用，然后合并结果。
 *
 * 三级降级策略：
 * 1. 先尝试完整调用
 * 2. 失败后拆分为子组（如8维度→2组×4维度），分别调用后合并
 * 3. 子组仍失败则拆为单维度逐个调用（每个维度重试1次）
 */

import type { ChatMessage, ChatOptions } from './volcengine.ts';

/** 分块配置 */
export interface SplitConfig {
  /** 阶段名称（用于日志） */
  phaseName: string;
  /** 子组拆分方案：每个子组包含的维度key列表 */
  groups: string[][];
  /** 每个维度对应的prompt生成函数 */
  promptForDimensions: (dimensions: string[]) => string;
}

/** 调用函数类型（与callAndExtractJSON签名一致） */
type CallFn<T> = (
  messages: ChatMessage[],
  options: ChatOptions,
  taskName: string
) => Promise<T>;

/** 生成失败维度的兜底默认值（使用正确的字段格式） */
function makeFallbackDimension(dimName: string): Record<string, unknown> {
  return {
    score: 0,
    grade: 'D',
    analysis: `该维度（${dimName}）分析暂时失败，可能由于网络波动或模型负载过高。建议稍后重新运行分析以获取完整评估结果。`,
    keyFindings: ['该维度分析未能完成，请重试以获取详细发现'],
    evidence: [],
    strengths: [],
    improvements: ['建议重新运行分析以获取完整的改进建议'],
  };
}

/**
 * 带自动分块重试的调用
 *
 * @param callFn - callAndExtractJSON 函数引用
 * @param systemPrompt - 系统提示词
 * @param fullPrompt - 完整prompt（包含所有维度）
 * @param options - 调用选项
 * @param config - 分块配置
 * @returns 合并后的结果对象
 */
export async function callWithSplitRetry<T>(
  callFn: CallFn<T>,
  systemPrompt: string,
  fullPrompt: string,
  options: ChatOptions,
  config: SplitConfig
): Promise<T> {
  const { phaseName, groups, promptForDimensions } = config;

  // Level 1: 尝试完整调用
  try {
    console.log(`[${phaseName}] Level 1: 尝试完整调用`);
    const result = await callFn(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: fullPrompt },
      ],
      options,
      phaseName
    );
    console.log(`[${phaseName}] Level 1: 完整调用成功`);
    return result;
  } catch (error) {
    console.warn(`[${phaseName}] Level 1 失败，降级到分组调用:`, error);
  }

  // Level 2: 拆分为子组分别调用
  try {
    console.log(`[${phaseName}] Level 2: 拆分为 ${groups.length} 个子组`);
    const merged = {} as T;

    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      const groupName = `${phaseName}-组${i + 1}(${group.join(',')})`;
      console.log(`[${phaseName}] Level 2: 调用子组 ${i + 1}/${groups.length}: [${group.join(', ')}]`);

      const groupPrompt = promptForDimensions(group);
      const groupResult = await callFn(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: groupPrompt },
        ],
        options,
        groupName
      );

      // 合并子组结果
      Object.assign(merged, groupResult);
    }

    console.log(`[${phaseName}] Level 2: 分组调用全部成功，已合并`);
    return merged;
  } catch (error) {
    console.warn(`[${phaseName}] Level 2 失败，降级到单维度调用:`, error);
  }

  // Level 3: 逐个维度调用（每个维度重试1次）
  console.log(`[${phaseName}] Level 3: 逐个维度调用`);
  const merged = {} as T;
  const allDimensions = groups.flat();

  for (const dim of allDimensions) {
    const dimName = `${phaseName}-${dim}`;
    let success = false;

    // 最多尝试2次（首次 + 1次重试）
    for (let attempt = 1; attempt <= 2 && !success; attempt++) {
      try {
        if (attempt > 1) {
          console.log(`[${phaseName}] Level 3: 重试维度 [${dim}] (第${attempt}次)`);
        } else {
          console.log(`[${phaseName}] Level 3: 调用单维度 [${dim}]`);
        }
        const dimPrompt = promptForDimensions([dim]);
        const dimResult = await callFn(
          [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: dimPrompt },
          ],
          options,
          dimName
        );
        Object.assign(merged, dimResult);
        success = true;
      } catch (dimError) {
        console.error(`[${phaseName}] Level 3: 维度 [${dim}] 第${attempt}次调用失败:`, dimError);
      }
    }

    // 两次都失败，填充兜底默认值
    if (!success) {
      console.error(`[${phaseName}] Level 3: 维度 [${dim}] 重试后仍失败，使用兜底值`);
      (merged as Record<string, unknown>)[dim] = makeFallbackDimension(dim);
    }
  }

  console.log(`[${phaseName}] Level 3: 单维度调用完成`);
  return merged;
}
