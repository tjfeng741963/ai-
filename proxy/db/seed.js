/**
 * 种子数据 — 自动从 TypeScript 源文件编译获取真实提示词内容
 *
 * 工作原理：
 *   1. 使用 esbuild 编译 frontend/.../prompts.ts → 临时 JS 模块
 *   2. 动态导入编译后的模块，提取真实的提示词字符串
 *   3. 通过 upsert 写入数据库（安全可重复执行）
 *
 * 好处：提示词内容始终与 TypeScript 源文件同步，无需手动复制维护
 */

import { buildSync } from 'esbuild';
import { pathToFileURL } from 'url';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync, rmSync } from 'fs';
import { initDB, upsertPrompt, insertConfigIfMissing } from './index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ==================== TypeScript 编译与导入 ====================

/**
 * 编译 TypeScript 提示词源文件并动态导入。
 * 返回 { prompts, detailed } 两个模块的导出对象，
 * 其中模板字面量中的 ${buildDomesticTagReference()} 等
 * 已在模块加载时求值为真实字符串。
 */
async function compileAndLoadPrompts() {
  const frontendDir = join(__dirname, '../../frontend/tools/script-rating/services');
  const tmpDir = join(__dirname, '../data/.compiled');

  if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

  const sourceFiles = ['prompts.ts', 'prompts-detailed.ts'];

  for (const file of sourceFiles) {
    const entryPath = join(frontendDir, file);
    if (!existsSync(entryPath)) {
      console.warn(`[Seed] 源文件不存在，跳过: ${entryPath}`);
      return null;
    }

    buildSync({
      entryPoints: [entryPath],
      bundle: true,
      format: 'esm',
      outfile: join(tmpDir, file.replace('.ts', '.mjs')),
      write: true,
      target: 'node18',
      logLevel: 'silent',
    });
  }

  // 动态导入编译后的模块
  const promptsUrl = pathToFileURL(join(tmpDir, 'prompts.mjs')).href;
  const detailedUrl = pathToFileURL(join(tmpDir, 'prompts-detailed.mjs')).href;

  const prompts = await import(promptsUrl);
  const detailed = await import(detailedUrl);

  // 清理临时文件（失败不影响流程）
  try {
    rmSync(tmpDir, { recursive: true, force: true });
  } catch {
    // Windows 可能文件锁定，忽略
  }

  return { prompts, detailed };
}

// ==================== 提示词 → DB 记录映射 ====================

/**
 * 从编译后的模块导出构建完整的 PROMPTS 数组。
 * p = prompts.ts 的导出, d = prompts-detailed.ts 的导出
 */
function buildPromptsData(p, d) {
  return [
    // ==================== script-rating: 基础分析 (prompts.ts) ====================
    {
      id: 'script-rating.system',
      tool_id: 'script-rating',
      name: '系统角色 Prompt',
      description: '定义 AI 漫剧剧本评估专家的角色和评估原则',
      content: p.SYSTEM_PROMPT,
      variables: [],
      sort_order: 0,
    },
    {
      id: 'script-rating.structure_analysis',
      tool_id: 'script-rating',
      name: '结构与世界观分析',
      description: 'Round 1: 三幕结构、转折点、悬念、世界观、IP延展性',
      content: p.STRUCTURE_ANALYSIS_PROMPT,
      variables: [{ name: 'SCRIPT_CONTENT', description: '剧本内容', required: true }],
      sort_order: 1,
    },
    {
      id: 'script-rating.character_analysis',
      tool_id: 'script-rating',
      name: '人物关系分析',
      description: 'Round 2: 角色设定、关系网络、对白、视觉辨识度',
      content: p.CHARACTER_ANALYSIS_PROMPT,
      variables: [{ name: 'SCRIPT_CONTENT', description: '剧本内容', required: true }],
      sort_order: 2,
    },
    {
      id: 'script-rating.emotion_analysis',
      tool_id: 'script-rating',
      name: '情绪曲线与爽点分析',
      description: 'Round 3: 情绪曲线、爽点设计、冲突强度、情感标签（含国内标签库）',
      content: p.EMOTION_ANALYSIS_PROMPT,
      variables: [{ name: 'SCRIPT_CONTENT', description: '剧本内容', required: true }],
      sort_order: 3,
    },
    {
      id: 'script-rating.market_analysis',
      tool_id: 'script-rating',
      name: 'AI漫剧市场商业分析',
      description: 'Round 4: 平台匹配、定价、爆款对标、受众画像、流量预测',
      content: p.MARKET_ANALYSIS_PROMPT,
      variables: [{ name: 'SCRIPT_CONTENT', description: '剧本内容', required: true }],
      sort_order: 4,
    },
    {
      id: 'script-rating.compliance_analysis',
      tool_id: 'script-rating',
      name: '合规与平台审核评估',
      description: 'Round 5: AI内容标识、平台规范、版权、价值观（国内/海外双变体）',
      content: p.getComplianceAnalysisPrompt('domestic'),
      variables: [{ name: 'SCRIPT_CONTENT', description: '剧本内容', required: true }],
      is_dynamic: true,
      variants: {
        domestic: p.getComplianceAnalysisPrompt('domestic'),
        overseas: p.getComplianceAnalysisPrompt('overseas'),
      },
      sort_order: 5,
    },
    {
      id: 'script-rating.comprehensive_rating',
      tool_id: 'script-rating',
      name: '综合评级报告',
      description: 'Final: 16维加权评分、可操作建议、平台推荐（含国内+海外标签库）',
      content: p.COMPREHENSIVE_RATING_PROMPT,
      variables: [
        { name: 'STRUCTURE_DATA', description: '结构分析结果', required: true },
        { name: 'CHARACTER_DATA', description: '人物分析结果', required: true },
        { name: 'EMOTION_DATA', description: '情感分析结果', required: true },
        { name: 'MARKET_DATA', description: '市场分析结果', required: true },
        { name: 'COMPLIANCE_DATA', description: '合规分析结果', required: true },
      ],
      sort_order: 6,
    },

    // ==================== script-rating: 详细分析 (prompts-detailed.ts) ====================
    {
      id: 'script-rating.production_analysis',
      tool_id: 'script-rating',
      name: 'AI漫剧制作分析',
      description: 'AI生成概率、格式规范性、制作难度、资源需求、成本估算',
      content: d.PRODUCTION_ANALYSIS_PROMPT,
      variables: [{ name: 'SCRIPT_CONTENT', description: '剧本内容', required: true }],
      sort_order: 10,
    },
    {
      id: 'script-rating.executive_summary',
      tool_id: 'script-rating',
      name: '执行摘要',
      description: '频类、题材、一句话卖点、剧情主线、核心结论（含国内+海外标签库）',
      content: d.EXECUTIVE_SUMMARY_PROMPT,
      variables: [
        { name: 'SCRIPT_CONTENT', description: '剧本内容', required: true },
        { name: 'PRODUCTION_DATA', description: '制作分析结果', required: false },
      ],
      sort_order: 11,
    },
    {
      id: 'script-rating.structure_detailed',
      tool_id: 'script-rating',
      name: '结构深度分析',
      description: '世界观、三幕结构、转折点、悬念设计（详细版）',
      content: d.STRUCTURE_DETAILED_PROMPT,
      variables: [{ name: 'SCRIPT_CONTENT', description: '剧本内容', required: true }],
      sort_order: 12,
    },
    {
      id: 'script-rating.character_detailed',
      tool_id: 'script-rating',
      name: '人物关系深度分析',
      description: '角色塑造、关系网络、金句、CP化学反应（详细版）',
      content: d.CHARACTER_DETAILED_PROMPT,
      variables: [{ name: 'SCRIPT_CONTENT', description: '剧本内容', required: true }],
      sort_order: 13,
    },
    {
      id: 'script-rating.emotion_detailed',
      tool_id: 'script-rating',
      name: '情感曲线深度分析',
      description: '情绪曲线、爽点分布、上瘾指数（详细版）',
      content: d.EMOTION_DETAILED_PROMPT,
      variables: [{ name: 'SCRIPT_CONTENT', description: '剧本内容', required: true }],
      sort_order: 14,
    },
    {
      id: 'script-rating.market_resonance_detailed',
      tool_id: 'script-rating',
      name: '市场共鸣分析',
      description: '目标受众、原创性、热播契合度（3维度）',
      content: d.MARKET_RESONANCE_DETAILED_PROMPT,
      variables: [{ name: 'SCRIPT_CONTENT', description: '剧本内容', required: true }],
      sort_order: 15,
    },
    {
      id: 'script-rating.market_detailed',
      tool_id: 'script-rating',
      name: '市场定价分析',
      description: '定价建议、平台推荐、收益预测、竞品对标（国内/海外双变体）',
      content: d.getMarketDetailedPrompt('domestic'),
      variables: [{ name: 'SCRIPT_CONTENT', description: '剧本内容', required: true }],
      is_dynamic: true,
      variants: {
        domestic: d.getMarketDetailedPrompt('domestic'),
        overseas: d.getMarketDetailedPrompt('overseas'),
      },
      sort_order: 16,
    },
    {
      id: 'script-rating.narrative_dna_detailed',
      tool_id: 'script-rating',
      name: '叙事基因分析',
      description: '8维度：叙事逻辑、钩子、爽点、节奏、人物、对白、悬念',
      content: d.NARRATIVE_DNA_DETAILED_PROMPT,
      variables: [{ name: 'SCRIPT_CONTENT', description: '剧本内容', required: true }],
      sort_order: 17,
    },
    {
      id: 'script-rating.risk_detailed',
      tool_id: 'script-rating',
      name: '风险评估',
      description: '合规风险、市场风险、制作风险、价值观（国内/海外双变体）',
      content: d.getRiskDetailedPrompt('domestic'),
      variables: [
        { name: 'SCRIPT_CONTENT', description: '剧本内容', required: true },
        { name: 'PRODUCTION_DATA', description: '制作分析结果', required: false },
        { name: 'COMMERCIAL_DATA', description: '商业合规分析结果', required: false },
      ],
      is_dynamic: true,
      variants: {
        domestic: d.getRiskDetailedPrompt('domestic'),
        overseas: d.getRiskDetailedPrompt('overseas'),
      },
      sort_order: 18,
    },
    {
      id: 'script-rating.commercial_compliance_detailed',
      tool_id: 'script-rating',
      name: '商业合规分析',
      description: '用户粘性、传播潜力、内容合规、价值导向（4维度）',
      content: d.COMMERCIAL_COMPLIANCE_DETAILED_PROMPT,
      variables: [{ name: 'SCRIPT_CONTENT', description: '剧本内容', required: true }],
      sort_order: 19,
    },
    {
      id: 'script-rating.actionable_recommendations',
      tool_id: 'script-rating',
      name: '综合建议',
      description: '5条可操作建议、总评、平台推荐、商业闭环',
      content: d.ACTIONABLE_RECOMMENDATIONS_PROMPT,
      variables: [
        { name: 'PRODUCTION_DATA', description: '制作分析结果', required: true },
        { name: 'MARKET_RESONANCE_DATA', description: '市场共鸣分析结果', required: true },
        { name: 'NARRATIVE_DNA_DATA', description: '叙事基因分析结果', required: true },
        { name: 'COMMERCIAL_COMPLIANCE_DATA', description: '商业合规分析结果', required: true },
      ],
      sort_order: 20,
    },

    // ==================== outpaint: 扩图 ====================
    {
      id: 'outpaint.expand_prompt',
      tool_id: 'outpaint',
      name: '扩图方向提示词',
      description: '根据原图位置和目标尺寸生成扩展方向提示',
      content: 'The original image is placed at the {POSITION_DESC} of a {ASPECT_RATIO} canvas ({TARGET_WIDTH}x{TARGET_HEIGHT}). Expand and extend the scene {DIRECTION_DESC} to fill the entire canvas. Seamlessly continue the scene beyond the original borders, maintaining consistent style, lighting, perspective and content. The expanded areas should look natural and blend perfectly with the original image.',
      variables: [
        { name: 'POSITION_DESC', description: '位置描述', required: true },
        { name: 'ASPECT_RATIO', description: '目标宽高比', required: true },
        { name: 'TARGET_WIDTH', description: '目标宽度', required: true },
        { name: 'TARGET_HEIGHT', description: '目标高度', required: true },
        { name: 'DIRECTION_DESC', description: '扩展方向', required: true },
      ],
      sort_order: 0,
    },
  ];
}

// ==================== 全局配置 ====================

const CONFIGS = [
  {
    key: 'default_ai_provider',
    value: 'volcengine',
    label: '默认 AI 提供商',
    description: '剧本评级使用的默认 AI 提供商',
    type: 'string',
  },
  {
    key: 'default_ai_model',
    value: 'ep-20250305155658-vnnqh',
    label: '默认 AI 模型',
    description: '剧本评级使用的默认模型 ID',
    type: 'string',
  },
  {
    key: 'max_tokens',
    value: '8000',
    label: '最大 Token 数',
    description: 'AI 响应最大 token 数（Admin 修改后实时生效）',
    type: 'number',
  },
  {
    key: 'temperature',
    value: '0.3',
    label: '温度参数',
    description: 'AI 响应随机性 0-1（Admin 修改后实时生效）',
    type: 'number',
  },
  {
    key: 'outpaint_provider',
    value: 'official-stable',
    label: '扩图默认渠道',
    description: '扩图功能使用的默认 provider',
    type: 'string',
  },
  {
    key: 'outpaint_model',
    value: 'nanobanana-pro',
    label: '扩图默认模型',
    description: '扩图功能使用的默认模型',
    type: 'string',
  },
];

// ==================== Seed 执行 ====================

/**
 * 同步真实提示词内容到数据库。
 *
 * - 配置项：每次启动都 upsert（安全幂等）
 * - 提示词：从 TypeScript 源文件编译提取，确保 DB 内容与源码一致
 * - 如果编译失败（如源文件不存在），保留数据库现有内容不变
 */
export async function seedAll() {
  // 1. 写入全局配置（仅插入不存在的，不覆盖用户已修改的值）
  for (const c of CONFIGS) {
    insertConfigIfMissing(c);
  }

  // 2. 编译 TypeScript 并提取真实提示词
  let modules;
  try {
    modules = await compileAndLoadPrompts();
  } catch (err) {
    console.warn(`[Seed] TypeScript 编译失败，跳过提示词同步:`, err.message);
    return;
  }

  if (!modules) {
    console.warn('[Seed] 源文件不存在，跳过提示词同步');
    return;
  }

  const prompts = buildPromptsData(modules.prompts, modules.detailed);

  for (const p of prompts) {
    upsertPrompt(p);
  }

  console.log(`[Seed] 已同步 ${prompts.length} 条提示词 + ${CONFIGS.length} 条配置`);
}

// 支持直接运行: node proxy/db/seed.js
if (process.argv[1]?.endsWith('seed.js')) {
  initDB();
  await seedAll();
  console.log('[Seed] 完成');
}
