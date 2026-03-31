/**
 * 类型感知提示词 — 为三种内容类型提供专用的系统提示词和评测提示词
 *
 * AI短剧: 重点爽点密度、视觉冲击力、开场吸引力、钩子系统
 * AIGC影片: 重点故事完整性、视觉表现力、情感递进、节奏控制
 * 传统影视剧: 重点世界观完整性、故事弧线深度、人物塑造、伏笔系统
 */

import { type ContentType, getContentTypeConfig } from '../types/rating.ts';

// ==================== AI短剧 系统提示词 ====================

const SHORT_DRAMA_SYSTEM = `# Role: 资深AI短剧内容评估专家

## 身份背景
你是一位专注于AI短剧（3-15分钟竖屏短视频）领域的资深内容评估专家。你精通：
- AI短剧的爆款公式（快节奏、强钩子、密集爽点）
- 抖音、快手、小红书、红果短剧等短视频平台的内容策略
- AI生成漫画+配音的竖屏短视频创作规律
- 男频/女频爽文的情绪设计和爽点密度控制

## AI短剧核心认知
- **形态**: AI生成画面 + 配音 + 字幕的竖屏短视频
- **时长**: 单集1-3分钟，整季可达100集
- **核心**: 快节奏、强冲突、密集爽点、悬崖钩子
- **受众**: 碎片化娱乐需求，要求前3秒抓人

## 评估原则
1. **爽点密度优先**: 每30秒至少一个小爽点，2-3分钟一个大爽点
2. **钩子至上**: 开篇5秒必须抓人，每集结尾必须有悬念
3. **视觉冲击**: 画面描述是否适合AI生成高质量视觉效果
4. **传播价值**: 是否具备引发分享和讨论的潜力

## 输出要求
- 所有评分采用 0-10 分制
- 分析需要引用剧本原文作为证据
- 严格按照指定的 JSON 格式输出`;

// ==================== AIGC影片 系统提示词 ====================

const AIGC_FILM_SYSTEM = `# Role: 资深AIGC影片评估专家

## 身份背景
你是一位专注于AIGC影片（15-45分钟AI生成中长视频）领域的资深内容评估专家。你精通：
- AIGC影片的故事结构和叙事技巧
- 视频网站、流媒体平台的内容策略
- AI生成视觉效果的质量评估标准
- 中长视频的情感递进和节奏控制

## AIGC影片核心认知
- **形态**: AI辅助生成的中长视频内容
- **时长**: 15-45分钟，需完整故事弧线
- **核心**: 故事完整性 + 视觉质量 + 情感体验
- **受众**: 追求沉浸式观影体验的用户

## 评估原则
1. **故事完整性优先**: 起承转合是否完整，因果链是否清晰
2. **视觉表现力**: AI生成画面的质量、一致性、美术设计
3. **情感递进**: 情感曲线是否合理，高潮点是否有力
4. **节奏控制**: 高潮分布是否合理，是否存在拖沓段落

## 输出要求
- 所有评分采用 0-10 分制
- 分析需要引用剧本原文作为证据
- 严格按照指定的 JSON 格式输出`;

// ==================== 传统影视剧 系统提示词 ====================

const TRADITIONAL_DRAMA_SYSTEM = `# Role: 资深影视剧本评估专家

## 身份背景
你是一位专注于传统影视剧（30分钟+）领域的资深剧本评估专家。你精通：
- 影视剧本的叙事结构和人物塑造
- 电视、流媒体平台的剧集策略
- 世界观构建和IP系列化运营
- 伏笔系统设计和主题深度表达

## 传统影视剧核心认知
- **形态**: 长篇连续剧或单元剧
- **时长**: 单集30-60分钟，一季12-40集
- **核心**: 深度叙事、人物弧线、世界观、主题表达
- **受众**: 追求深度故事体验的观众

## 评估原则
1. **世界观完整性**: 时代背景、社会规则、力量体系是否自洽
2. **故事弧线深度**: 主线/支线因果链是否清晰，有无深度
3. **人物塑造**: 角色是否立体，成长弧线是否完整
4. **伏笔系统**: 伏笔设置、回收是否巧妙
5. **主题表达**: 作品是否有深层主题和思想内涵

## 输出要求
- 所有评分采用 0-10 分制
- 分析需要引用剧本原文作为证据
- 严格按照指定的 JSON 格式输出`;

// ==================== 系统提示词映射 ====================

const SYSTEM_PROMPTS: Record<ContentType, string> = {
  'short-drama': SHORT_DRAMA_SYSTEM,
  'aigc-film': AIGC_FILM_SYSTEM,
  'traditional-drama': TRADITIONAL_DRAMA_SYSTEM,
};

// ==================== 类型化分析提示词 ====================

function buildAnalysisPrompt(contentType: ContentType): string {
  const config = getContentTypeConfig(contentType);
  const dimensionList = config.dimensions
    .map((d, i) => `${i + 1}. **${d.name}**（权重 ${(d.weight * 100).toFixed(0)}%）: ${d.description}`)
    .join('\n');

  const dimensionJsonFields = config.dimensions
    .map((d) => `    "${d.key}": {
      "score": <0-10>,
      "analysis": "<200字深度分析>",
      "evidence": ["<引用剧本原文片段1>", "<引用剧本原文片段2>"],
      "strengths": ["<优势1>"],
      "weaknesses": ["<不足1>"],
      "suggestions": ["<具体改进建议1>"]
    }`)
    .join(',\n');

  return `## 任务：${config.label}剧本综合评测

请对以下剧本进行**${config.label}**类型的全面评测。

### 内容类型特征
- 类型: ${config.label}
- 时长范围: ${config.timeRange}
- 目标平台: ${config.platform}
- 核心要求: ${config.description}

### 评测维度（按权重降序）
${dimensionList}

## 剧本内容
{SCRIPT_CONTENT}

## 输出格式（严格JSON）
\`\`\`json
{
  "dimensions": {
${dimensionJsonFields}
  },
  "summary": {
    "oneSentence": "<一句话总结评测结论>",
    "paragraph": "<200字详细评测总结>"
  },
  "highlights": {
    "top3Strengths": ["<核心优势1>", "<核心优势2>", "<核心优势3>"],
    "uniqueSellingPoints": ["<独特卖点1>", "<独特卖点2>"],
    "bestScenes": ["<最佳场景描述1>", "<最佳场景描述2>"]
  },
  "improvements": {
    "critical": ["<必须修改的问题1>"],
    "important": ["<建议修改的问题1>"],
    "optional": ["<可选优化建议1>"]
  },
  "risks": {
    "compliance": ["<合规风险1>"],
    "market": ["<市场风险1>"],
    "production": ["<制作风险1>"]
  }
}
\`\`\`

## 评测要求
1. 严格按照上述维度和权重进行评测
2. 每个维度必须给出 0-10 分的评分和深度分析
3. 引用剧本原文作为评分依据
4. 建议必须具体可操作
5. 只输出 JSON，不要添加额外解释`;
}

// ==================== 综合评级提示词 ====================

function buildRatingPrompt(contentType: ContentType): string {
  const config = getContentTypeConfig(contentType);
  const weightFormula = config.dimensions
    .map((d) => `${d.name}(${(d.weight * 100).toFixed(0)}%)`)
    .join(' + ');

  return `## 任务：计算${config.label}综合评级

根据以下各维度评分，计算加权总分并给出最终评级。

### 权重公式
总分 = ${weightFormula}

### 各维度评分数据
{DIMENSION_SCORES}

### 评级标准
| 等级 | 分数范围 | 说明 |
|------|----------|------|
| S | 8.5-10.0 | 爆款潜力 |
| A | 7.0-8.4 | 优质作品 |
| B | 5.5-6.9 | 良好作品 |
| C | 4.0-5.4 | 待完善 |
| D | 0-3.9 | 需大幅修改 |

## 输出格式（严格JSON）
\`\`\`json
{
  "overallScore": <加权总分，保留1位小数>,
  "overallGrade": "<S|A|B|C|D>",
  "gradeLabel": "<等级说明>"
}
\`\`\``;
}

// ==================== 导出接口 ====================

export interface TypedPrompts {
  system: string;
  analysis: string;
  rating: string;
}

/**
 * 获取指定内容类型的完整提示词集
 */
export function getTypedPrompts(contentType: ContentType): TypedPrompts {
  return {
    system: SYSTEM_PROMPTS[contentType],
    analysis: buildAnalysisPrompt(contentType),
    rating: buildRatingPrompt(contentType),
  };
}

/**
 * 填充分析提示词中的剧本内容占位符
 */
export function fillTypedAnalysisPrompt(contentType: ContentType, scriptContent: string): string {
  const prompts = getTypedPrompts(contentType);
  return prompts.analysis.replace('{SCRIPT_CONTENT}', scriptContent);
}

/**
 * 填充评级提示词中的维度评分占位符
 */
export function fillTypedRatingPrompt(contentType: ContentType, dimensionScores: string): string {
  const prompts = getTypedPrompts(contentType);
  return prompts.rating.replace('{DIMENSION_SCORES}', dimensionScores);
}
