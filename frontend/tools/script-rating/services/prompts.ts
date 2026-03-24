import type { MarketType } from './market-context.ts';
import { buildDomesticTagReference, buildOverseasTagReference } from './tag-library.ts';

/**
 * AI漫剧剧本评级系统 - 分阶段 Prompt 设计
 *
 * 专为AI漫剧（AI生成漫画+配音的竖屏短剧）设计的评级系统
 *
 * 5轮分析 + 1轮综合评级：
 * - Round 1: 结构与世界观分析（钩子、节奏、世界观设定、三幕结构）
 * - Round 2: 人物分析（角色图谱、对白、关系网络）
 * - Round 3: 情感分析（情绪曲线、爽点、冲突）
 * - Round 4: 市场分析（AI漫剧平台、定价、爆款对标）
 * - Round 5: 合规审查（AI内容政策、平台规则、价值观）
 * - Final: 综合评级（含世界观的多维度加权评分）
 */

// ==================== 系统角色 Prompt ====================

export const SYSTEM_PROMPT = `# Role: 资深AI漫剧剧本评估专家

## 身份背景
你是一位专注于AI漫剧（AI Comic Drama）领域的资深内容评估专家，拥有丰富的短视频内容创作和平台运营经验。你精通：
- AI漫剧的创作规律和爆款公式（竖屏、快节奏、强钩子）
- 红果短剧、番茄短剧、ReelShort等AI漫剧分发平台的内容策略
- 2024-2026年AI漫剧市场趋势、爆款案例和用户偏好
- AI生成内容的合规要求和平台审核标准
- 世界观构建和IP化运营思维
- 男频/女频爽文的情绪设计和爽点密度控制

## AI漫剧特点认知
- **形态**：AI生成漫画画面 + 配音 + 字幕的竖屏短视频
- **时长**：单集1-3分钟，整季10-100集
- **平台**：红果短剧、番茄短剧、抖音、快手、ReelShort、Dreame等
- **受众**：下沉市场为主，碎片化娱乐需求
- **核心**：快节奏、强冲突、密集爽点、悬崖钩子

## 评估原则
1. **AI漫剧适配性**：评估剧本是否适合AI漫剧形态呈现
2. **爽点密度**：每30秒至少一个小爽点，2-3分钟一个大爽点
3. **钩子设计**：开篇5秒必须抓人，每集结尾必须有悬念
4. **世界观构建**：设定是否清晰、自洽、有IP延展价值
5. **商业落地**：基于AI漫剧市场给出可操作的商业建议

## 输出要求
- 所有评分采用 1-10 分制
- 分析需要引用剧本原文作为证据
- 建议需要具体可操作，符合AI漫剧制作流程
- 严格按照指定的 JSON 格式输出，不要添加额外解释`;

// ==================== Round 1: 结构与世界观分析 ====================

export const STRUCTURE_ANALYSIS_PROMPT = `## 任务：剧本结构与世界观分析

请对以下AI漫剧剧本进行结构和世界观分析，重点评估：

### 世界观分析（新增重点）
1. **设定体系**：世界观类型（都市、玄幻、穿越、末日等）及核心规则
2. **力量体系**：如有超自然元素，力量等级、修炼体系是否清晰
3. **社会架构**：背景世界的社会结构、阶层关系
4. **独特元素**：区别于同类作品的创新设定
5. **自洽性**：设定是否前后一致，有无逻辑漏洞
6. **IP延展性**：世界观是否具备系列化、衍生创作的潜力

### 结构分析
1. **三幕结构**：开端、发展、高潮、结局的比例和质量
2. **钩子设计**：开场5秒吸引力、每集结尾悬崖钩子
3. **节奏把控**：AI漫剧的快节奏要求（每30秒一个节奏点）
4. **悬念设置**：主悬念、次级悬念的设置与回收
5. **转折点**：关键转折点的位置和爽感强度
6. **分集结构**：是否适合1-3分钟/集的AI漫剧形态

## 剧本内容
{SCRIPT_CONTENT}

## 输出格式（严格JSON）
\`\`\`json
{
  "worldBuilding": {
    "type": "都市|玄幻|穿越|末日|仙侠|科幻|校园|职场|古风|现代甜宠",
    "powerSystem": {
      "exists": true,
      "description": "力量体系描述",
      "levels": ["等级1", "等级2", "等级3"],
      "rules": ["核心规则1", "核心规则2"],
      "clarity": 8
    },
    "socialStructure": {
      "description": "社会架构描述",
      "factions": ["势力1", "势力2"],
      "conflicts": ["核心矛盾1", "核心矛盾2"]
    },
    "uniqueElements": ["创新设定1", "创新设定2"],
    "consistency": {
      "score": 8.5,
      "issues": ["潜在逻辑问题"],
      "strengths": ["设定亮点"]
    },
    "ipPotential": {
      "score": 7.5,
      "sequelPossibility": "high|medium|low",
      "spinoffIdeas": ["衍生方向1", "衍生方向2"],
      "merchandisePotential": ["周边可能1", "周边可能2"]
    },
    "worldBuildingScore": 8.0,
    "analysis": "世界观整体分析（150字）"
  },
  "actStructure": [
    {
      "act": 1,
      "name": "开端/建置",
      "percentage": 20,
      "episodeRange": "1-10集",
      "keyEvents": ["事件1", "事件2"],
      "quality": "质量评价",
      "pacing": "fast|medium|slow",
      "hookStrength": 8
    },
    {
      "act": 2,
      "name": "发展/对抗",
      "percentage": 55,
      "episodeRange": "11-60集",
      "keyEvents": ["事件1", "事件2"],
      "quality": "质量评价",
      "pacing": "medium",
      "hookStrength": 7
    },
    {
      "act": 3,
      "name": "高潮/结局",
      "percentage": 25,
      "episodeRange": "61-80集",
      "keyEvents": ["事件1", "事件2"],
      "quality": "质量评价",
      "pacing": "fast",
      "hookStrength": 9
    }
  ],
  "turningPoints": [
    {
      "position": 10,
      "type": "inciting_incident",
      "name": "激励事件",
      "description": "具体描述",
      "pleasurePower": 8
    },
    {
      "position": 25,
      "type": "first_plot_point",
      "name": "第一转折点",
      "description": "具体描述",
      "pleasurePower": 9
    },
    {
      "position": 50,
      "type": "midpoint",
      "name": "中点反转",
      "description": "具体描述",
      "pleasurePower": 10
    },
    {
      "position": 75,
      "type": "second_plot_point",
      "name": "第二转折点",
      "description": "具体描述",
      "pleasurePower": 9
    },
    {
      "position": 90,
      "type": "climax",
      "name": "高潮",
      "description": "具体描述",
      "pleasurePower": 10
    }
  ],
  "episodeStructure": {
    "suggestedEpisodeCount": 80,
    "avgEpisodeLength": "2分钟",
    "cliffhangerRate": 95,
    "openingHookQuality": "excellent|good|fair|poor"
  },
  "hookPositions": [0, 10, 25, 50, 75, 90],
  "cliffhangerCount": 75,
  "suspenses": [
    {
      "id": "s1",
      "type": "main",
      "question": "悬念问题",
      "setupPosition": 5,
      "resolvePosition": 95,
      "isResolved": true
    }
  ],
  "foreshadowRecoveryRate": 85,
  "structureType": "AI漫剧标准三幕结构",
  "structureScore": 8.5,
  "aiComicSuitability": {
    "score": 8.5,
    "strengths": ["适合AI漫剧的优点"],
    "challenges": ["制作挑战"],
    "suggestions": ["优化建议"]
  },
  "analysis": "结构分析总结（100字）"
}
\`\`\``;

// ==================== Round 2: 人物分析 ====================

export const CHARACTER_ANALYSIS_PROMPT = `## 任务：人物关系分析

请对以下AI漫剧剧本进行人物分析，重点评估：
1. **角色设定**：主角、反派、配角的设定和特征（需适合AI漫画呈现）
2. **角色弧线**：人物成长和转变
3. **人物关系**：角色之间的关系网络和冲突（CP感、对立感）
4. **对白质量**：台词的个性化、金句密度（AI漫剧需要更多短句、金句）
5. **视觉辨识度**：角色外形特征是否鲜明（AI绘制需要）

## 剧本内容
{SCRIPT_CONTENT}

## 输出格式（严格JSON）
\`\`\`json
{
  "characters": [
    {
      "id": "c1",
      "name": "角色名",
      "role": "protagonist|antagonist|supporting|minor",
      "arcType": "逆袭翻身|从弱变强|双强碰撞|虐恋情深|扁平工具人",
      "motivation": "核心动机",
      "flaw": "性格缺陷",
      "emotionalArc": "从X到Y的情感变化",
      "memorableTraits": ["特征1", "特征2"],
      "visualTraits": {
        "description": "外形描述（AI绘制用）",
        "distinctiveFeatures": ["标志性特征1", "特征2"],
        "costumeKeywords": ["服装关键词"]
      },
      "score": 8.5
    }
  ],
  "relationships": [
    {
      "from": "c1",
      "to": "c2",
      "type": "甜宠CP|虐恋CP|宿敌|师徒|兄弟|闺蜜|父子|母子",
      "tension": "high|medium|low",
      "cpPotential": "high|medium|low|none",
      "description": "关系描述"
    }
  ],
  "relationshipDensity": 0.75,
  "conflictStructure": "冲突结构描述",
  "voiceDistinction": "excellent|good|fair|poor",
  "goldenLines": [
    {
      "character": "角色名",
      "line": "金句内容（适合做短视频标题/弹幕热点）",
      "context": "出现场景",
      "viralPotential": "high|medium|low"
    }
  ],
  "cpChemistry": {
    "mainCP": "主CP组合描述",
    "cpType": "甜宠|虐恋|双强|欢喜冤家",
    "sugarMoments": ["甜蜜时刻1", "时刻2"],
    "score": 8.0
  },
  "characterScore": 8.0,
  "dialogueScore": 7.5,
  "visualDistinctiveness": 8.0,
  "analysis": "人物分析总结（100字）"
}
\`\`\``;

// ==================== Round 3: 情感分析 ====================

export const EMOTION_ANALYSIS_PROMPT = `## 任务：情绪曲线与爽点分析

请对以下AI漫剧剧本进行情感分析，重点评估：
1. **情绪曲线**：整体情绪起伏和节奏（AI漫剧需要更密集的情绪波动）
2. **爽点设计**：反转、打脸、逆袭、撒糖等爽点的设计（核心指标）
3. **爽点密度**：每集是否有足够的爽点支撑（建议每2分钟至少1个爽点）
4. **冲突强度**：核心冲突的张力和层次
5. **情感标签**：作品的情感基调（用于平台推荐算法）

## 剧本内容
{SCRIPT_CONTENT}

${buildDomesticTagReference()}

## 输出格式（严格JSON）
\`\`\`json
{
  "emotionCurve": [
    {
      "position": 0,
      "emotion": "hook",
      "intensity": 8,
      "event": "开场钩子事件",
      "description": "情绪描述",
      "isPeak": false
    },
    {
      "position": 15,
      "emotion": "tension",
      "intensity": 7,
      "event": "冲突建立",
      "description": "情绪描述",
      "isPeak": false
    },
    {
      "position": 30,
      "emotion": "twist",
      "intensity": 9,
      "event": "第一次反转",
      "description": "情绪描述",
      "isPeak": true
    },
    {
      "position": 50,
      "emotion": "climax",
      "intensity": 10,
      "event": "中点高潮",
      "description": "情绪描述",
      "isPeak": true
    },
    {
      "position": 75,
      "emotion": "tension",
      "intensity": 9,
      "event": "危机加深",
      "description": "情绪描述",
      "isPeak": false
    },
    {
      "position": 90,
      "emotion": "climax",
      "intensity": 10,
      "event": "最终高潮",
      "description": "情绪描述",
      "isPeak": true
    },
    {
      "position": 100,
      "emotion": "resolution",
      "intensity": 8,
      "event": "爽快收尾/开放结局",
      "description": "情绪描述",
      "isPeak": false
    }
  ],
  "overallArc": "情绪走势整体描述",
  "majorPleasurePoints": [
    {
      "position": 30,
      "type": "reversal|faceslap|revenge|levelup|revelation|reunion|sacrifice|showoff",
      "power": 9,
      "description": "爽点描述",
      "technique": "使用的技法（如：反转打脸、装逼打脸、逆袭复仇等）",
      "viralPotential": "high|medium|low"
    }
  ],
  "minorPleasurePoints": [
    {
      "position": 15,
      "type": "faceslap",
      "power": 7,
      "description": "小爽点",
      "technique": "技法"
    }
  ],
  "pleasurePointDensity": {
    "perEpisode": 2.5,
    "assessment": "密度适中|密度不足|密度过高",
    "suggestion": "调整建议"
  },
  "emotionTags": ["从风格基调标签库中选取3-6个，如：逆袭、打脸、爽文、甜宠、热血、上头、燃、催泪、治愈等"],
  "genreTags": {
    "primary": "频道+题材组合，如：男频逆袭|女频甜宠|男频玄幻|女频虐恋|都市复仇|古装权谋|全民群像...",
    "secondary": ["从标签库人设/情感/情节模式中选取2-4个，如：战神、重生、大女主、先婚后爱"],
    "platformTags": ["平台推荐标签，如：红果爆款、抖音热门、番茄推荐"]
  },
  "targetFeeling": "观众预期情绪体验描述",
  "emotionIntensityAvg": 8.2,
  "conflictScore": 8.5,
  "pleasureScore": 8.5,
  "addictionIndex": {
    "score": 8.0,
    "factors": ["上瘾因素1", "因素2"],
    "bingePotential": "high|medium|low"
  },
  "analysis": "情感分析总结（100字）"
}
\`\`\``;

// ==================== Round 4: 市场分析（AI漫剧专属） ====================

export const MARKET_ANALYSIS_PROMPT = `## 任务：AI漫剧市场商业分析

请对以下AI漫剧剧本进行市场分析，**基于AI漫剧市场**（非传统影视市场）进行评估：

### AI漫剧市场背景（2024-2026）
- **主要平台**：红果短剧、番茄短剧、抖音、快手、ReelShort、Dreame、ShortMax
- **剧本定价**：单集500-2000元，整季（50-100集）2.5万-15万元
- **制作成本**：AI漫剧单集制作成本约500-2000元（AI绘图+配音+剪辑）
- **分成模式**：平台分成（流量分成）+ 付费解锁 + 广告分成
- **近期爆款**：《我在精神病院学斩神》《重生之我是仙尊》《闪婚后亿万老公掉马了》《神豪从系统开始》

### 分析重点
1. **AI漫剧适配性**：剧本是否适合AI漫剧形态
2. **平台匹配**：最适合的分发平台及原因
3. **定价建议**：基于剧本质量的合理定价区间
4. **爆款对标**：与近期AI漫剧爆款的相似度和差异化
5. **受众画像**：目标用户群体（年龄、性别、偏好）
6. **流量预测**：基于题材热度和内容质量的流量预期

## 剧本内容
{SCRIPT_CONTENT}

## 输出格式（严格JSON）
\`\`\`json
{
  "marketSuggestion": {
    "suggestedPriceRange": {
      "perEpisode": "800-1500元/集",
      "fullSeason": "4万-8万元（50集）",
      "reasoning": "定价依据说明"
    },
    "targetPlatforms": [
      {
        "platform": "红果短剧",
        "suitability": "high|medium|low",
        "reason": "推荐原因",
        "expectedRevenue": "预期收益描述"
      },
      {
        "platform": "番茄短剧",
        "suitability": "high|medium|low",
        "reason": "推荐原因",
        "expectedRevenue": "预期收益描述"
      },
      {
        "platform": "抖音/快手",
        "suitability": "high|medium|low",
        "reason": "推荐原因",
        "expectedRevenue": "预期收益描述"
      },
      {
        "platform": "海外(ReelShort/Dreame)",
        "suitability": "high|medium|low",
        "reason": "推荐原因",
        "expectedRevenue": "预期收益描述"
      }
    ],
    "marketingAngles": ["营销切入点1", "营销切入点2", "营销切入点3"],
    "titleSuggestions": ["备选标题1", "备选标题2", "备选标题3"],
    "coverScenes": ["适合做封面的场景1", "场景2"],
    "similarHits": [
      {
        "title": "近期AI漫剧爆款名",
        "platform": "平台",
        "views": "播放量（如有）",
        "similarity": 0.8,
        "learnableAspects": ["可学习点1", "可学习点2"],
        "differentiators": ["差异化优势"]
      }
    ],
    "audienceProfile": {
      "gender": "female|male|neutral",
      "genderRatio": "女性占比70%",
      "ageRange": "25-45",
      "primaryAge": "30-40",
      "interests": ["短剧", "爽文", "逆袭", "甜宠"],
      "psychographics": "心理特征描述（如：渴望逆袭翻身、追求情感代入）",
      "consumption": "付费意愿描述",
      "marketSize": "large|medium|niche"
    },
    "trendMatch": {
      "hotElements": ["匹配的热门元素1", "元素2"],
      "currentTrends": ["2024-2026热门趋势1", "趋势2"],
      "missingElements": ["可补充的热门元素"],
      "competitionLevel": "high|medium|low",
      "timingScore": 8,
      "differentiators": ["差异化优势1", "优势2"]
    },
    "viralPotential": {
      "score": 8,
      "viralScenes": ["可能出圈的场景1（配文案建议）", "场景2"],
      "clipPotential": "high|medium|low",
      "memeability": "high|medium|low",
      "hashtagSuggestions": ["#推荐话题1", "#话题2"]
    },
    "revenueProjection": {
      "tier": "S|A|B|C",
      "description": "收益预期描述",
      "paymentConversion": "付费转化预期",
      "adRevenue": "广告收益预期",
      "totalEstimate": "综合收益预估"
    }
  },
  "productionFeasibility": {
    "aiComicDifficulty": "easy|moderate|challenging",
    "difficultyReason": "难度原因",
    "sceneComplexity": 7,
    "characterCount": 8,
    "specialEffects": {
      "required": ["需要的特效类型"],
      "difficulty": "low|medium|high"
    },
    "estimatedProductionCost": {
      "perEpisode": "800-1500元",
      "fullSeason": "4万-7.5万元",
      "breakdown": {
        "aiDrawing": "40%",
        "voiceActing": "30%",
        "editing": "20%",
        "other": "10%"
      }
    },
    "estimatedDays": 30,
    "technicalChallenges": ["技术难点1", "难点2"],
    "recommendedTools": ["推荐AI工具1", "工具2"]
  },
  "audienceScore": 8.0,
  "trendScore": 7.5,
  "viralScore": 8.5,
  "commercialScore": 8.0,
  "aiComicFitScore": 8.5,
  "analysis": "市场分析总结（100字）"
}
\`\`\``;

// ==================== Round 5: 合规审查（AI漫剧专属） ====================

export function getComplianceAnalysisPrompt(marketType: MarketType = 'domestic'): string {
  const isOverseas = marketType === 'overseas';

  const platformAudit = isOverseas
    ? `### 各平台审核重点（出海市场）
- **ReelShort**：北美头部平台，COPPA儿童保护、暴力/性内容分级、种族敏感
- **DramaBox**：全球分发，多地区合规差异、宗教敏感内容
- **ShortMax**：北美+东南亚，文化差异、政治敏感话题
- **FlexTV**：北美市场，FTC广告法规、AI内容标识
- **TikTok**：全球短视频，各地区审核差异、AI标识、版权
- **YouTube Shorts**：全球覆盖，社区准则、版权声明、年龄限制

### 出海合规特殊关注
- 北美：COPPA儿童保护法、种族/性别平等、暴力尺度
- 欧洲：GDPR数据保护、仇恨言论法规
- 中东：宗教敏感（猪、酒精、暴露着装）
- 东南亚：王室/宗教/政治敏感话题
- 跨文化：避免种族歧视、宗教冒犯、中式梗直译`
    : `### 各平台审核重点
- **红果短剧**：严控暴力血腥、色情擦边、价值观问题
- **番茄短剧**：关注版权、原创性、内容健康度
- **抖音/快手**：AI内容标识、版权、低俗内容
- **海外平台**：文化敏感性、宗教元素、政治内容`;

  const suitabilityJson = isOverseas
    ? `"platformSuitability": {
      "reelShort": {
        "status": "suitable|needs_modification|unsuitable",
        "issues": ["平台特定问题"],
        "suggestions": ["针对性建议"]
      },
      "dramaBox": {
        "status": "suitable|needs_modification|unsuitable",
        "issues": ["平台特定问题"],
        "suggestions": ["针对性建议"]
      },
      "shortMax": {
        "status": "suitable|needs_modification|unsuitable",
        "issues": ["平台特定问题"],
        "suggestions": ["针对性建议"]
      },
      "flexTV": {
        "status": "suitable|needs_modification|unsuitable",
        "issues": ["平台特定问题"],
        "suggestions": ["针对性建议"]
      },
      "tiktok": {
        "status": "suitable|needs_modification|unsuitable",
        "issues": ["平台特定问题"],
        "suggestions": ["针对性建议"]
      },
      "youtubeShorts": {
        "status": "suitable|needs_modification|unsuitable",
        "issues": ["平台特定问题"],
        "suggestions": ["针对性建议"]
      }
    }`
    : `"platformSuitability": {
      "hongGuo": {
        "status": "suitable|needs_modification|unsuitable",
        "issues": ["平台特定问题"],
        "suggestions": ["针对性建议"]
      },
      "fanQie": {
        "status": "suitable|needs_modification|unsuitable",
        "issues": ["平台特定问题"],
        "suggestions": ["针对性建议"]
      },
      "douyin": {
        "status": "suitable|needs_modification|unsuitable",
        "issues": ["平台特定问题"],
        "suggestions": ["针对性建议"]
      },
      "overseas": {
        "status": "suitable|needs_modification|unsuitable",
        "issues": ["平台特定问题"],
        "suggestions": ["针对性建议"]
      }
    }`;

  const changesJson = isOverseas
    ? `"platformSpecificChanges": {
      "reelShort": ["ReelShort平台特定修改"],
      "dramaBox": ["DramaBox平台特定修改"],
      "shortMax": ["ShortMax平台特定修改"],
      "tiktok": ["TikTok平台特定修改"]
    }`
    : `"platformSpecificChanges": {
      "hongGuo": ["红果平台特定修改"],
      "fanQie": ["番茄平台特定修改"],
      "overseas": ["海外平台特定修改"]
    }`;

  return `## 任务：AI漫剧合规与平台审核评估

请对以下AI漫剧剧本进行合规审查，**重点关注AI生成内容和${isOverseas ? '海外平台' : '短视频平台'}的特殊要求**：

### AI漫剧合规特殊关注点
1. **AI生成内容标识**：是否需要标注AI生成
2. **平台内容规范**：各平台的内容红线
3. **版权风险**：AI生成内容的版权问题
4. **肖像权风险**：AI生成人物是否有侵权风险
5. **价值观导向**：${isOverseas ? '跨文化价值观适配性' : '短视频平台对价值观的严格要求'}
6. **未成年人保护**：${isOverseas ? 'COPPA等各地区未成年人保护法规' : '短视频平台的特殊保护要求'}

${platformAudit}

## 剧本内容
{SCRIPT_CONTENT}

## 输出格式（严格JSON）
\`\`\`json
{
  "compliance": {
    "overallRisk": "high|medium|low",
    "passRate": 90,
    "issues": [
      {
        "location": "第X集/场",
        "type": "${isOverseas ? '文化敏感|宗教|种族|版权|AI生成|暴力|色情|政治' : '暴力|色情|政治|迷信|价值观|版权|AI生成|低俗'}",
        "severity": "critical|high|medium|low",
        "content": "问题内容描述",
        "suggestion": "修改建议",
        "affectedPlatforms": ["可能受影响的平台"]
      }
    ],
    ${suitabilityJson}
  },
  "aiContentCompliance": {
    "needsAILabel": true,
    "deepfakeRisk": "low|medium|high",
    "copyrightRisk": {
      "level": "low|medium|high",
      "concerns": ["版权关注点"],
      "suggestions": ["规避建议"]
    },
    "likenessRisk": {
      "level": "low|medium|high",
      "concerns": ["肖像权关注点"],
      "suggestions": ["规避建议"]
    }
  },
  "riskAssessment": {
    "marketRisks": [
      {
        "type": "market",
        "severity": "medium",
        "description": "${isOverseas ? '海外市场风险描述' : '市场风险描述'}",
        "suggestion": "应对建议"
      }
    ],
    "productionRisks": [
      {
        "type": "production",
        "severity": "low",
        "description": "制作风险描述",
        "suggestion": "应对建议"
      }
    ],
    "platformRisks": [
      {
        "type": "platform_policy",
        "severity": "medium",
        "description": "平台政策风险描述",
        "affectedPlatforms": ["平台列表"],
        "suggestion": "应对建议"
      }
    ],
    "canPublish": true,
    "requiredChanges": ["必须修改项"],
    "recommendedChanges": ["建议修改项"],
    ${changesJson}
  },
  "valueOrientation": {
    "mainTheme": "主题描述",
    "positiveElements": ["正向元素1", "元素2"],
    "concerns": ["需关注点"],
    "moralClosure": "${isOverseas ? '道德闭环是否符合海外观众价值观' : '善恶有报的闭环是否完整'}",
    "score": 8.5
  },
  "ageRating": {
    "suggested": "${isOverseas ? 'PG|PG-13|R|NC-17' : '全年龄|12+|16+|18+'}",
    "reason": "分级原因",
    "platformImplications": "对平台分发的影响"
  },
  "complianceScore": 8.5,
  "valueScore": 8.5,
  "platformReadiness": 8.0,
  "analysis": "合规分析总结（100字）"
}
\`\`\``;
}

// 保留旧名称兼容（默认国内）
export const COMPLIANCE_ANALYSIS_PROMPT = getComplianceAnalysisPrompt('domestic');

// ==================== Final: 综合评级（AI漫剧版） ====================

export const COMPREHENSIVE_RATING_PROMPT = `## 任务：AI漫剧商业级评级报告

基于前面的分阶段分析结果，请生成一份专业的AI漫剧商业评级报告。报告需要非常详尽，每个维度都需要有充分的分析依据和可操作的改进建议。

## 前序分析数据
- 结构与世界观分析：{STRUCTURE_DATA}
- 人物分析：{CHARACTER_DATA}
- 情感分析：{EMOTION_DATA}
- 市场分析：{MARKET_DATA}
- 合规分析：{COMPLIANCE_DATA}

${buildDomesticTagReference()}

${buildOverseasTagReference()}

## 评分体系（百分制）- AI漫剧标准
- S级 (90-100): 爆款潜力，各平台争抢的优质IP，预期播放量1亿+
- A+级 (85-89): 高质量剧本，有望成为平台热推作品
- A级 (80-84): 优质剧本，稳健投资选择，预期表现良好
- B级 (70-79): 良好剧本，需要打磨，有一定商业价值
- C级 (60-69): 待完善，需要较大修改才能上线
- D级 (<60): 需要大幅重写，暂不建议制作

## AI漫剧特殊评估维度
1. **世界观构建**：设定是否清晰、自洽、有IP延展价值
2. **爽点密度**：是否满足AI漫剧的高频爽点要求
3. **AI制作适配性**：是否适合AI绘制和配音制作
4. **平台适配性**：是否符合各AI漫剧平台的内容偏好

## 分析要求
1. **每个维度评分都必须附带详细分析**：至少3-5个分析要点
2. **引用剧本原文**：分析必须引用剧本中的具体场景、对白作为证据
3. **可打磨点**：每个维度都要给出2-3条具体可操作的改进建议
4. **AI漫剧视角**：所有建议都要符合AI漫剧的制作和分发特点

## 输出格式（严格JSON）
\`\`\`json
{
  "overallScore": 82,
  "overallGrade": "A",
  "gradeLabel": "优质AI漫剧剧本",

  "executiveSummary": {
    "genre": "男频|女频|中性|全民",
    "subGenre": "从标签库选取，如：都市逆袭|古装权谋|玄幻修仙|现代甜宠|重生复仇|仙侠|末日|悬疑|校园|年代...",
    "themes": ["从标签库各分类混搭选取3-6个，如：战神、逆袭、打脸、爽文、重生、大男主、豪门、热血"],
    "platformTags": ["红果推荐标签", "抖音标签", "算法推荐标签"],
    "overseasTags": ["English tags if applicable, e.g.: CEO, Revenge, Rebirth, Dark Romance"],
    "oneSentence": "一句话卖点（20字内，如：废柴小子觉醒神级系统逆袭打脸）",
    "plotSummary": "剧情主线概述（200字以上）",
    "coreConclusion": "核心结论（300字以上）：包含AI漫剧适配性、爆款潜力、平台推荐、投资建议",
    "aiComicHighlights": ["AI漫剧亮点1", "亮点2", "亮点3"]
  },

  "worldBuildingAssessment": {
    "score": 80,
    "grade": "A",
    "type": "世界观类型",
    "analysis": "世界观详细分析（200字以上）：设定创新性、自洽性、IP延展性",
    "strengths": ["世界观亮点1", "亮点2"],
    "improvements": ["可优化点1", "优化点2"],
    "ipPotential": "IP化潜力评估"
  },

  "detailedAnalysis": {
    "marketResonance": {
      "targetAudience": {
        "score": 75,
        "grade": "B",
        "analysis": "详细分析（300字以上）：1. 频类定位（男频/女频）；2. 核心受众画像；3. 与平台用户的匹配度",
        "improvements": ["可打磨点1", "可打磨点2"]
      },
      "originality": {
        "score": 82,
        "grade": "A",
        "analysis": "详细分析（300字以上）：1. 题材创新点；2. 与近期爆款的差异化；3. 独特卖点",
        "improvements": ["可打磨点1", "可打磨点2"]
      },
      "trendAlignment": {
        "score": 78,
        "grade": "B",
        "analysis": "详细分析（300字以上）：1. 与2024-2026 AI漫剧热门趋势的匹配度；2. 市场饱和度；3. 入场时机",
        "improvements": ["可打磨点1", "可打磨点2"]
      }
    },

    "narrativeDNA": {
      "worldBuilding": {
        "score": 80,
        "grade": "A",
        "analysis": "世界观构建分析（300字以上）：设定体系、力量系统、社会架构、自洽性",
        "improvements": ["可打磨点1", "可打磨点2"]
      },
      "narrativeLogic": {
        "score": 85,
        "grade": "A+",
        "analysis": "叙事逻辑分析（300字以上）：因果链、逻辑闭环、合理性",
        "improvements": []
      },
      "hookStrength": {
        "score": 88,
        "grade": "A+",
        "analysis": "钩子设计分析（300字以上）：开篇5秒吸引力、每集结尾悬念、整体悬念架构",
        "improvements": ["可打磨点"]
      },
      "pleasureDesign": {
        "score": 85,
        "grade": "A+",
        "analysis": "爽点设计分析（300字以上）：爽点类型、密度、节奏、强度递进",
        "improvements": ["可打磨点1", "可打磨点2"]
      },
      "pacingStructure": {
        "score": 82,
        "grade": "A",
        "analysis": "节奏结构分析（300字以上）：AI漫剧的快节奏适配性、分集结构",
        "improvements": ["可打磨点1", "可打磨点2"]
      },
      "plotCoherence": {
        "score": 86,
        "grade": "A+",
        "analysis": "情节连贯性分析（300字以上）：主线清晰度、多线交织、结局收束",
        "improvements": []
      },
      "characterization": {
        "score": 83,
        "grade": "A",
        "analysis": "人物塑造分析（300字以上）：角色鲜明度、弧线完整度、AI绘制适配性",
        "improvements": ["可打磨点1", "可打磨点2"]
      },
      "dialogueQuality": {
        "score": 84,
        "grade": "A",
        "analysis": "对白质量分析（300字以上）：金句密度、配音适配性、病毒传播潜力",
        "improvements": ["可打磨点1", "可打磨点2"]
      },
      "suspenseEffectiveness": {
        "score": 80,
        "grade": "A",
        "analysis": "悬念效果分析（300字以上）：悬念设置、维持、回收",
        "improvements": ["可打磨点1", "可打磨点2"]
      }
    },

    "commercialPotential": {
      "userStickiness": {
        "score": 82,
        "grade": "A",
        "analysis": "用户粘性分析（300字以上）：上瘾机制、追更动力、付费转化点",
        "improvements": ["可打磨点1", "可打磨点2"]
      },
      "viralPotential": {
        "score": 78,
        "grade": "B",
        "analysis": "传播潜力分析（300字以上）：出圈场景、话题性、UGC潜力",
        "improvements": ["可打磨点1", "可打磨点2"]
      },
      "aiProductionFit": {
        "score": 85,
        "grade": "A+",
        "analysis": "AI制作适配性分析（200字以上）：场景复杂度、角色数量、特效需求",
        "improvements": ["可打磨点"]
      }
    },

    "complianceAssessment": {
      "contentCompliance": {
        "score": 88,
        "grade": "A+",
        "analysis": "内容合规分析（200字以上）：各平台审核通过率预估",
        "improvements": []
      },
      "valueOrientation": {
        "score": 90,
        "grade": "S",
        "analysis": "价值导向分析（200字以上）：正向价值、道德闭环",
        "improvements": []
      },
      "platformCompliance": {
        "score": 85,
        "grade": "A+",
        "analysis": "平台规范分析（200字以上）：AI内容标识、版权风险、各平台特殊要求",
        "improvements": ["可打磨点"]
      }
    }
  },

  "actionableRecommendations": [
    {
      "priority": 1,
      "category": "爽点优化|结构调整|人物强化|合规修改|世界观完善",
      "title": "建议标题",
      "description": "详细建议（100字以上）：具体修改方案、预期效果",
      "expectedImpact": "预期提升效果"
    },
    {
      "priority": 2,
      "category": "category",
      "title": "建议标题",
      "description": "详细建议",
      "expectedImpact": "预期效果"
    },
    {
      "priority": 3,
      "category": "category",
      "title": "建议标题",
      "description": "详细建议",
      "expectedImpact": "预期效果"
    },
    {
      "priority": 4,
      "category": "category",
      "title": "建议标题",
      "description": "详细建议",
      "expectedImpact": "预期效果"
    },
    {
      "priority": 5,
      "category": "category",
      "title": "建议标题",
      "description": "详细建议",
      "expectedImpact": "预期效果"
    }
  ],

  "dimensions": {
    "hookPower": { "score": 8.8, "weight": 0.10, "weighted": 0.88, "analysis": "钩子强度简评", "strengths": ["亮点"], "weaknesses": [], "suggestions": [] },
    "pleasurePoints": { "score": 8.5, "weight": 0.12, "weighted": 1.02, "analysis": "爽点设计简评", "strengths": [], "weaknesses": [], "suggestions": [] },
    "worldBuilding": { "score": 8.0, "weight": 0.08, "weighted": 0.64, "analysis": "世界观简评", "strengths": [], "weaknesses": [], "suggestions": [] },
    "pacingStructure": { "score": 8.2, "weight": 0.08, "weighted": 0.656, "analysis": "节奏结构简评", "strengths": [], "weaknesses": [], "suggestions": [] },
    "suspenseEffect": { "score": 8.0, "weight": 0.06, "weighted": 0.48, "analysis": "悬念效果简评", "strengths": [], "weaknesses": [], "suggestions": [] },
    "conflictDesign": { "score": 8.5, "weight": 0.08, "weighted": 0.68, "analysis": "冲突设计简评", "strengths": [], "weaknesses": [], "suggestions": [] },
    "characterization": { "score": 8.3, "weight": 0.08, "weighted": 0.664, "analysis": "人物塑造简评", "strengths": [], "weaknesses": [], "suggestions": [] },
    "dialogueQuality": { "score": 8.4, "weight": 0.06, "weighted": 0.504, "analysis": "对白质量简评", "strengths": [], "weaknesses": [], "suggestions": [] },
    "plotCoherence": { "score": 8.6, "weight": 0.06, "weighted": 0.516, "analysis": "情节连贯简评", "strengths": [], "weaknesses": [], "suggestions": [] },
    "targetAudience": { "score": 7.5, "weight": 0.05, "weighted": 0.375, "analysis": "受众匹配简评", "strengths": [], "weaknesses": [], "suggestions": [] },
    "trendAlignment": { "score": 7.8, "weight": 0.05, "weighted": 0.39, "analysis": "趋势契合简评", "strengths": [], "weaknesses": [], "suggestions": [] },
    "viralPotential": { "score": 7.8, "weight": 0.05, "weighted": 0.39, "analysis": "传播潜力简评", "strengths": [], "weaknesses": [], "suggestions": [] },
    "commercialValue": { "score": 8.0, "weight": 0.05, "weighted": 0.40, "analysis": "商业价值简评", "strengths": [], "weaknesses": [], "suggestions": [] },
    "compliance": { "score": 8.8, "weight": 0.04, "weighted": 0.352, "analysis": "合规性简评", "strengths": [], "weaknesses": [], "suggestions": [] },
    "valueOrientation": { "score": 9.0, "weight": 0.02, "weighted": 0.18, "analysis": "价值导向简评", "strengths": [], "weaknesses": [], "suggestions": [] },
    "aiProductionFit": { "score": 8.5, "weight": 0.02, "weighted": 0.17, "analysis": "AI制作适配简评", "strengths": [], "weaknesses": [], "suggestions": [] }
  },

  "summary": {
    "oneSentence": "一句话总评",
    "paragraph": "详细段落总评（200字以上）：AI漫剧适配性、爆款潜力、平台推荐、投资建议"
  },

  "highlights": {
    "top3Strengths": ["核心亮点1", "核心亮点2", "核心亮点3"],
    "uniqueSellingPoints": ["独特卖点1", "独特卖点2"],
    "bestScenes": ["最佳场景描述及其爽点设计"],
    "viralMoments": ["可能出圈的名场面"]
  },

  "improvements": {
    "critical": ["必须修改项"],
    "important": ["建议修改项"],
    "optional": ["可选优化项"]
  },

  "platformRecommendation": {
    "primary": "首推平台",
    "secondary": ["备选平台1", "备选平台2"],
    "reasoning": "推荐原因",
    "launchStrategy": "上线策略建议"
  }
}
\`\`\``;

// ==================== 导出工具函数 ====================

const OUTPUT_GUARD = `
## 强制输出约束（必须满足）
1. 仅输出合法JSON对象，不要输出代码块，不要输出额外解释。
2. 所有字段必须与要求一致，禁止省略关键字段。
3. 若信息不足，请用空数组或明确字符串说明，不要擅自删字段。
`;

/** 替换 Prompt 中的占位符 */
export function fillPrompt(template: string, data: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return `${result}\n\n${OUTPUT_GUARD}`;
}

/** 分析阶段配置 */
export const ANALYSIS_PHASES_CONFIG = [
  {
    id: 'structure',
    name: '结构与世界观分析',
    prompt: STRUCTURE_ANALYSIS_PROMPT,
    weight: 0.25,
    description: '分析世界观设定、三幕结构、转折点、悬念设置',
  },
  {
    id: 'character',
    name: '人物分析',
    prompt: CHARACTER_ANALYSIS_PROMPT,
    weight: 0.20,
    description: '分析角色设定、关系网络、对白质量、CP感',
  },
  {
    id: 'emotion',
    name: '情感与爽点分析',
    prompt: EMOTION_ANALYSIS_PROMPT,
    weight: 0.20,
    description: '分析情绪曲线、爽点密度、上瘾机制',
  },
  {
    id: 'market',
    name: 'AI漫剧市场分析',
    prompt: MARKET_ANALYSIS_PROMPT,
    weight: 0.20,
    description: '分析平台适配、定价、爆款对标、受众画像',
  },
  {
    id: 'compliance',
    name: 'AI内容合规审查',
    prompt: COMPLIANCE_ANALYSIS_PROMPT,
    weight: 0.15,
    description: '审查AI内容政策、平台规则、价值导向',
  },
];
