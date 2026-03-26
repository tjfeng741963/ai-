/**
 * 种子数据 — 从硬编码的 prompts.ts / prompts-detailed.ts 提取
 *
 * 运行方式：
 *   node proxy/db/seed.js          # 直接执行
 *   在 server.js 启动时自动调用     # initDB() 后调用 seedIfEmpty()
 */

import { initDB, upsertPrompt, upsertConfig, listPrompts } from './index.js';

// ==================== Seed 数据 ====================

const PROMPTS = [
  // ==================== script-rating: 基础分析 prompts.ts ====================
  {
    id: 'script-rating.system',
    tool_id: 'script-rating',
    name: '系统角色 Prompt',
    description: '定义 AI 漫剧剧本评估专家的角色和评估原则',
    content: 'SYSTEM_PROMPT',
    variables: [],
    sort_order: 0,
  },
  {
    id: 'script-rating.structure_analysis',
    tool_id: 'script-rating',
    name: '结构与世界观分析',
    description: 'Round 1: 三幕结构、转折点、悬念、世界观、IP延展性',
    content: 'STRUCTURE_ANALYSIS_PROMPT',
    variables: [{ name: 'SCRIPT_CONTENT', description: '剧本内容', required: true }],
    sort_order: 1,
  },
  {
    id: 'script-rating.character_analysis',
    tool_id: 'script-rating',
    name: '人物关系分析',
    description: 'Round 2: 角色设定、关系网络、对白、视觉辨识度',
    content: 'CHARACTER_ANALYSIS_PROMPT',
    variables: [{ name: 'SCRIPT_CONTENT', description: '剧本内容', required: true }],
    sort_order: 2,
  },
  {
    id: 'script-rating.emotion_analysis',
    tool_id: 'script-rating',
    name: '情绪曲线与爽点分析',
    description: 'Round 3: 情绪曲线、爽点设计、冲突强度、情感标签',
    content: 'EMOTION_ANALYSIS_PROMPT',
    variables: [{ name: 'SCRIPT_CONTENT', description: '剧本内容', required: true }],
    sort_order: 3,
  },
  {
    id: 'script-rating.market_analysis',
    tool_id: 'script-rating',
    name: 'AI漫剧市场商业分析',
    description: 'Round 4: 平台匹配、定价、爆款对标、受众画像、流量预测',
    content: 'MARKET_ANALYSIS_PROMPT',
    variables: [{ name: 'SCRIPT_CONTENT', description: '剧本内容', required: true }],
    sort_order: 4,
  },
  {
    id: 'script-rating.compliance_analysis',
    tool_id: 'script-rating',
    name: '合规与平台审核评估',
    description: 'Round 5: AI内容标识、平台规范、版权、价值观（国内/海外双变体）',
    content: 'COMPLIANCE_ANALYSIS_PROMPT_DOMESTIC',
    variables: [{ name: 'SCRIPT_CONTENT', description: '剧本内容', required: true }],
    is_dynamic: true,
    variants: {
      domestic: 'COMPLIANCE_ANALYSIS_PROMPT_DOMESTIC',
      overseas: 'COMPLIANCE_ANALYSIS_PROMPT_OVERSEAS',
    },
    sort_order: 5,
  },
  {
    id: 'script-rating.comprehensive_rating',
    tool_id: 'script-rating',
    name: '综合评级报告',
    description: 'Final: 16维加权评分、可操作建议、平台推荐',
    content: 'COMPREHENSIVE_RATING_PROMPT',
    variables: [
      { name: 'STRUCTURE_DATA', description: '结构分析结果', required: true },
      { name: 'CHARACTER_DATA', description: '人物分析结果', required: true },
      { name: 'EMOTION_DATA', description: '情感分析结果', required: true },
      { name: 'MARKET_DATA', description: '市场分析结果', required: true },
      { name: 'COMPLIANCE_DATA', description: '合规分析结果', required: true },
    ],
    sort_order: 6,
  },

  // ==================== script-rating: 详细分析 prompts-detailed.ts ====================
  {
    id: 'script-rating.production_analysis',
    tool_id: 'script-rating',
    name: 'AI漫剧制作分析',
    description: 'AI生成概率、格式规范性、制作难度、资源需求、成本估算',
    content: 'PRODUCTION_ANALYSIS_PROMPT',
    variables: [{ name: 'SCRIPT_CONTENT', description: '剧本内容', required: true }],
    sort_order: 10,
  },
  {
    id: 'script-rating.executive_summary',
    tool_id: 'script-rating',
    name: '执行摘要',
    description: '频类、题材、一句话卖点、剧情主线、核心结论',
    content: 'EXECUTIVE_SUMMARY_PROMPT',
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
    content: 'STRUCTURE_DETAILED_PROMPT',
    variables: [{ name: 'SCRIPT_CONTENT', description: '剧本内容', required: true }],
    sort_order: 12,
  },
  {
    id: 'script-rating.character_detailed',
    tool_id: 'script-rating',
    name: '人物关系深度分析',
    description: '角色塑造、关系网络、金句、CP化学反应（详细版）',
    content: 'CHARACTER_DETAILED_PROMPT',
    variables: [{ name: 'SCRIPT_CONTENT', description: '剧本内容', required: true }],
    sort_order: 13,
  },
  {
    id: 'script-rating.emotion_detailed',
    tool_id: 'script-rating',
    name: '情感曲线深度分析',
    description: '情绪曲线、爽点分布、上瘾指数（详细版）',
    content: 'EMOTION_DETAILED_PROMPT',
    variables: [{ name: 'SCRIPT_CONTENT', description: '剧本内容', required: true }],
    sort_order: 14,
  },
  {
    id: 'script-rating.market_resonance_detailed',
    tool_id: 'script-rating',
    name: '市场共鸣分析',
    description: '目标受众、原创性、热播契合度（3维度）',
    content: 'MARKET_RESONANCE_DETAILED_PROMPT',
    variables: [{ name: 'SCRIPT_CONTENT', description: '剧本内容', required: true }],
    sort_order: 15,
  },
  {
    id: 'script-rating.market_detailed',
    tool_id: 'script-rating',
    name: '市场定价分析',
    description: '定价建议、平台推荐、收益预测、竞品对标（国内/海外双变体）',
    content: 'MARKET_DETAILED_PROMPT_DOMESTIC',
    variables: [{ name: 'SCRIPT_CONTENT', description: '剧本内容', required: true }],
    is_dynamic: true,
    variants: {
      domestic: 'MARKET_DETAILED_PROMPT_DOMESTIC',
      overseas: 'MARKET_DETAILED_PROMPT_OVERSEAS',
    },
    sort_order: 16,
  },
  {
    id: 'script-rating.narrative_dna_detailed',
    tool_id: 'script-rating',
    name: '叙事基因分析',
    description: '8维度：叙事逻辑、钩子、爽点、节奏、人物、对白、悬念',
    content: 'NARRATIVE_DNA_DETAILED_PROMPT',
    variables: [{ name: 'SCRIPT_CONTENT', description: '剧本内容', required: true }],
    sort_order: 17,
  },
  {
    id: 'script-rating.risk_detailed',
    tool_id: 'script-rating',
    name: '风险评估',
    description: '合规风险、市场风险、制作风险、价值观（国内/海外双变体）',
    content: 'RISK_DETAILED_PROMPT_DOMESTIC',
    variables: [
      { name: 'SCRIPT_CONTENT', description: '剧本内容', required: true },
      { name: 'PRODUCTION_DATA', description: '制作分析结果', required: false },
      { name: 'COMMERCIAL_DATA', description: '商业合规分析结果', required: false },
    ],
    is_dynamic: true,
    variants: {
      domestic: 'RISK_DETAILED_PROMPT_DOMESTIC',
      overseas: 'RISK_DETAILED_PROMPT_OVERSEAS',
    },
    sort_order: 18,
  },
  {
    id: 'script-rating.commercial_compliance_detailed',
    tool_id: 'script-rating',
    name: '商业合规分析',
    description: '用户粘性、传播潜力、内容合规、价值导向（4维度）',
    content: 'COMMERCIAL_COMPLIANCE_DETAILED_PROMPT',
    variables: [{ name: 'SCRIPT_CONTENT', description: '剧本内容', required: true }],
    sort_order: 19,
  },
  {
    id: 'script-rating.actionable_recommendations',
    tool_id: 'script-rating',
    name: '综合建议',
    description: '5条可操作建议、总评、平台推荐、商业闭环',
    content: 'ACTIONABLE_RECOMMENDATIONS_PROMPT',
    variables: [
      { name: 'PRODUCTION_DATA', description: '制作分析结果', required: true },
      { name: 'MARKET_RESONANCE_DATA', description: '市场共鸣分析结果', required: true },
      { name: 'NARRATIVE_DNA_DATA', description: '叙事基因分析结果', required: true },
      { name: 'COMMERCIAL_COMPLIANCE_DATA', description: '商业合规分析结果', required: true },
    ],
    sort_order: 20,
  },

  // ==================== outpaint: 扩图 prompt ====================
  {
    id: 'outpaint.expand_prompt',
    tool_id: 'outpaint',
    name: '扩图方向提示词',
    description: '根据原图位置和目标尺寸生成扩展方向提示',
    content: `The original image is placed at the {POSITION_DESC} of a {ASPECT_RATIO} canvas ({TARGET_WIDTH}x{TARGET_HEIGHT}). Expand and extend the scene {DIRECTION_DESC} to fill the entire canvas. Seamlessly continue the scene beyond the original borders, maintaining consistent style, lighting, perspective and content. The expanded areas should look natural and blend perfectly with the original image.`,
    variables: [
      { name: 'POSITION_DESC', description: '位置描述（如 center, top-left corner）', required: true },
      { name: 'ASPECT_RATIO', description: '目标宽高比（如 16:9）', required: true },
      { name: 'TARGET_WIDTH', description: '目标宽度', required: true },
      { name: 'TARGET_HEIGHT', description: '目标高度', required: true },
      { name: 'DIRECTION_DESC', description: '扩展方向描述（如 left and right）', required: true },
    ],
    sort_order: 0,
  },
];

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
    description: 'AI 响应最大 token 数',
    type: 'number',
  },
  {
    key: 'temperature',
    value: '0.3',
    label: '温度参数',
    description: 'AI 响应随机性（0-1）',
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
 * 如果数据库为空则写入种子数据
 * 注意：seed 中的 content 是占位符名称，实际内容在前端硬编码中
 * 在 Phase 4 迁移时会用实际内容替换
 */
export function seedIfEmpty() {
  const existing = listPrompts();
  if (existing.length > 0) {
    console.log(`[DB] 已有 ${existing.length} 条提示词记录，跳过 seed`);
    return;
  }

  console.log(`[DB] 数据库为空，写入种子数据...`);

  for (const p of PROMPTS) {
    upsertPrompt(p);
  }
  console.log(`[DB] 写入 ${PROMPTS.length} 条提示词模板`);

  for (const c of CONFIGS) {
    upsertConfig(c);
  }
  console.log(`[DB] 写入 ${CONFIGS.length} 条全局配置`);
}

// 如果直接运行此文件
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  initDB();
  seedIfEmpty();
  console.log('[DB] Seed 完成');
}
