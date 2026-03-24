/**
 * 分块Prompt模板
 *
 * 当大阶段需要拆分为子组时，使用这些模板生成子组的prompt。
 * 每个子组prompt只包含对应维度的分析要求和输出格式。
 */

const DIMENSION_DESCRIPTIONS: Record<string, { name: string; desc: string }> = {
  // NarrativeDNA 8维度
  narrativeLogic: { name: '叙事逻辑', desc: '因果链、逻辑闭环、合理性' },
  hookStrength: { name: '钩子强度', desc: '开篇5秒吸引力、每集结尾悬念、整体悬念架构' },
  pleasureDesign: { name: '爽点设计', desc: '爽点类型、密度、节奏、强度递进' },
  pacingStructure: { name: '节奏与结构', desc: 'AI漫剧的快节奏适配性、分集结构' },
  plotCoherence: { name: '主线连贯性', desc: '多线交织、结局收束、主线清晰度' },
  characterization: { name: '人物塑造', desc: '角色鲜明度、弧线完整度、AI绘制适配性' },
  dialogueQuality: { name: '对白质量', desc: '金句密度、配音适配性、病毒传播潜力' },
  suspenseEffectiveness: { name: '悬念有效性', desc: '悬念设置、维持、回收' },
  // Commercial 4维度
  userStickiness: { name: '用户粘性', desc: '上瘾机制、追更动力、付费转化点' },
  viralPotential: { name: '传播潜力', desc: '出圈场景、话题性、UGC潜力' },
  contentCompliance: { name: '内容合规', desc: '各平台审核通过率预估' },
  valueOrientation: { name: '价值导向', desc: '正向价值、道德闭环' },
};

/**
 * 生成子组prompt
 * @param dimensions - 需要分析的维度key列表
 * @param scriptContent - 剧本内容
 * @param phase - 阶段标识 'narrative' | 'commercial'
 */
export function buildSubGroupPrompt(
  dimensions: string[],
  scriptContent: string,
  phase: 'narrative' | 'commercial'
): string {
  const phaseTitle = phase === 'narrative' ? '叙事与剧本基因' : '商业化潜力与合规性';

  const dimDescriptions = dimensions
    .map((dim) => {
      const info = DIMENSION_DESCRIPTIONS[dim];
      if (!info) return `- ${dim}`;
      return `- **${info.name}**（${dim}）：${info.desc}`;
    })
    .join('\n');

  const dimKeys = dimensions
    .map((dim) => `  "${dim}": { "score": 0, "grade": "", "analysis": "", "keyFindings": [], "evidence": [], "strengths": [], "improvements": [] }`)
    .join(',\n');

  return `## 任务：${phaseTitle}详细分析（部分维度）

对以下AI漫剧剧本进行以下维度的分析：

${dimDescriptions}

## 剧本内容
${scriptContent}

## 输出格式（严格JSON，每个维度7个字段）
score(0-100), grade(S/A/B/C/D), analysis(200-400字深入分析含论据引用), keyFindings(3-5条,50-80字/条), evidence(2-4条「原文」（集数）), strengths(2-3条,30-50字/条), improvements(2-3条,30-50字/条,无需改进则空数组)

\`\`\`json
{
${dimKeys}
}
\`\`\``;
}

/** NarrativeDNA 分组配置 */
export const NARRATIVE_SPLIT_GROUPS = [
  ['narrativeLogic', 'hookStrength', 'pleasureDesign', 'pacingStructure'],
  ['plotCoherence', 'characterization', 'dialogueQuality', 'suspenseEffectiveness'],
];

/** Commercial 分组配置 */
export const COMMERCIAL_SPLIT_GROUPS = [
  ['userStickiness', 'viralPotential'],
  ['contentCompliance', 'valueOrientation'],
];
