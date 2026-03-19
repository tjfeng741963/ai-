/**
 * AI漫剧剧本评级系统 - 详细分析 Prompt（渐进式输出）
 *
 * 优化版本：
 * - 扁平化JSON结构，降低解析失败率
 * - 精准要点（50-80字）+ 原文引用 > 冗长废话（300字+）
 * - 统一评分标准（0-100分 + S/A/B/C/D等级）
 * - 移除模糊格式示例，明确输出要求
 */

// ==================== 执行摘要 Prompt ====================

export const EXECUTIVE_SUMMARY_PROMPT = `## 任务：生成剧本执行摘要

请基于以下AI漫剧剧本，生成一份执行摘要。这是评级报告的开篇部分，需要简洁有力地概括剧本的核心信息。

## 剧本内容
{SCRIPT_CONTENT}

## 前序制作分析数据（参考）
{PRODUCTION_DATA}

## 评分标准
统一使用0-100分制：
- S级 (90-100): 爆款潜力
- A级 (80-89): 优质
- B级 (70-79): 良好
- C级 (60-69): 待完善
- D级 (<60): 需大幅修改

## 输出要求
1. 频类判断要准确（男频/女频/中性）
2. 剧情主线概述要完整（200字以上）
3. 核心结论要有深度，包含AI漫剧适配性、爆款潜力、投资建议

## 输出格式（严格JSON）
\`\`\`json
{
  "genre": "男频|女频|中性",
  "subGenre": "逆袭|甜宠|虐恋|玄幻|都市|重生|穿越|职场|仙侠|御兽",
  "themes": ["主题标签1", "主题标签2", "主题标签3"],
  "platformTags": ["红果推荐标签", "抖音标签", "算法推荐标签"],
  "oneSentence": "一句话卖点（20字内）",
  "plotSummary": "剧情主线概述（200字以上）：起承转合，主角目标、困境、转折、成长、结局",
  "coreConclusion": "核心结论（300字以上）：1.AI漫剧适配性评估；2.爆款潜力分析；3.核心亮点与不足；4.平台推荐建议；5.投资决策建议",
  "aiComicHighlights": ["AI漫剧亮点1", "亮点2", "亮点3"],
  "overallScore": 82,
  "overallGrade": "A"
}
\`\`\``;

// ==================== 市场共鸣详细分析 Prompt ====================

export const MARKET_RESONANCE_DETAILED_PROMPT = `## 任务：市场共鸣与竞争定位详细分析

请对以下AI漫剧剧本进行市场共鸣分析。每个维度都需要精准分析和具体改进建议。

## 剧本内容
{SCRIPT_CONTENT}

## 输出格式要求
每个维度输出固定5个字段：
- score: 0-100评分
- grade: S/A/B/C/D等级
- findings: 关键发现数组（每条50-80字）
- evidence: 剧本原文引用数组（格式：「台词/描述」（集数））
- suggestions: 改进建议数组（每条30-50字）

## 评分标准
- S级 (90-100): 爆款潜力
- A级 (80-89): 优质
- B级 (70-79): 良好
- C级 (60-69): 待完善
- D级 (<60): 需大幅修改

## 输出格式（严格JSON）
\`\`\`json
{
  "targetAudience": {
    "score": 75,
    "grade": "B",
    "findings": [
      "剧本定位为男频，核心受众是18-35岁男性，追求'被低估后逆袭'的代入感",
      "第3-5集的打脸场景能有效激发目标受众的情绪共鸣"
    ],
    "evidence": [
      "「我就是那个被所有人低估的人，现在让你们看看真正的实力」（第5集）",
      "「废物永远是废物」（第3集反派台词）"
    ],
    "suggestions": [
      "建议在第1集增加主角内心独白，强化'强者确认'的第一人称视角"
    ]
  },
  "originality": {
    "score": 82,
    "grade": "A",
    "findings": [
      "题材创新点：本剧以[具体切入点]为核心议题，具备差异化识别度",
      "人设组合记忆点：[角色名]的[具体人设组合]在短剧市场中有一定新鲜感"
    ],
    "evidence": [
      "「原文引用」（第X集）"
    ],
    "suggestions": [
      "建议强化某具体方面的创新"
    ]
  },
  "trendAlignment": {
    "score": 70,
    "grade": "B",
    "findings": [
      "对标分析：对标[爆款名称]，本剧的[定位]使得[爽点类型]与爆款存在偏差",
      "AI漫剧适配性：[题材类型]场景为AI生成的强项，视觉奇观潜力较高"
    ],
    "evidence": [
      "「原文引用」（第X集）"
    ],
    "suggestions": [
      "建议借鉴爆款的具体方面"
    ]
  }
}
\`\`\``;

// ==================== 叙事与剧本基因详细分析 Prompt ====================

export const NARRATIVE_DNA_DETAILED_PROMPT = `## 任务：叙事与剧本基因详细分析

请对以下AI漫剧剧本进行叙事基因分析。每个维度都需要精准分析和具体改进建议。

## 剧本内容
{SCRIPT_CONTENT}

## 分析维度
1. 叙事逻辑：因果链、逻辑闭环
2. 钩子强度：开篇5秒、每集结尾悬念
3. 爽点设计：爽点类型、密度、强度
4. 节奏与结构：AI漫剧快节奏适配性
5. 主线连贯性：多线交织、结局收束
6. 人物塑造：角色鲜明度、弧线完整度
7. 对白质量：金句密度、病毒传播潜力
8. 悬念有效性：悬念设置、维持、回收

## 输出格式要求
每个维度输出固定5个字段：
- score: 0-100评分
- grade: S/A/B/C/D等级
- findings: 关键发现数组（每条50-80字）
- evidence: 剧本原文引用数组（格式：「台词/描述」（集数））
- suggestions: 改进建议数组（每条30-50字）

## 输出格式（严格JSON）
\`\`\`json
{
  "narrativeLogic": {
    "score": 85,
    "grade": "A",
    "findings": [
      "世界观设定自洽：[具体分析]，因果链明确，逻辑闭环完整",
      "关键情节逻辑：[某测试/揭秘情节]的逻辑设计有效推动剧情"
    ],
    "evidence": [
      "「原文引用」（第X集）"
    ],
    "suggestions": []
  },
  "hookStrength": {
    "score": 88,
    "grade": "A",
    "findings": [
      "第1集开篇钩子：[某场景→某事件]在极短篇幅内完成'平静被打破→危机确认→强者出手'的完整钩子结构",
      "每集结尾悬念：[具体分析]结尾设有有效悬念，能驱动下一集点击"
    ],
    "evidence": [
      "「原文引用」（第X集）"
    ],
    "suggestions": [
      "建议在某集结尾增加更强的悬念钩子"
    ]
  },
  "pleasureDesign": {
    "score": 80,
    "grade": "A",
    "findings": [
      "最强爽点：[第X集某角色以某方式做了某事]，满足男频/女频核心需求",
      "爽点密度：前X集爽点密度较高，但中后期以段落为单位分布，略显稀疏"
    ],
    "evidence": [
      "「原文引用」（第X集）"
    ],
    "suggestions": [
      "建议在第X集增加小爽点"
    ]
  },
  "pacingStructure": {
    "score": 82,
    "grade": "A",
    "findings": [
      "起承转合结构：[具体分析]，六段式结构叙事目标明确",
      "分镜节奏：前X集节奏紧凑，场景切换频率适中"
    ],
    "evidence": [
      "「原文引用」（第X集）"
    ],
    "suggestions": [
      "建议压缩某段对话密度"
    ]
  },
  "plotCoherence": {
    "score": 86,
    "grade": "A",
    "findings": [
      "核心主线聚焦：全剧始终围绕核心主线推进，无明显支线干扰",
      "结尾设计：[具体分析]，主线连贯性与续集潜力兼顾"
    ],
    "evidence": [
      "「原文引用」（第X集）"
    ],
    "suggestions": []
  },
  "characterization": {
    "score": 83,
    "grade": "A",
    "findings": [
      "主角人设：[分析反差层次、记忆点、执行度]",
      "核心配角弧线：[分析配角弧线是否完整]",
      "反派深度：[分析反派的动机是否足够复杂]"
    ],
    "evidence": [
      "「原文引用」（第X集）"
    ],
    "suggestions": [
      "建议强化某角色的主动性"
    ]
  },
  "dialogueQuality": {
    "score": 84,
    "grade": "A",
    "findings": [
      "金句密度：[某角色金句]具备强传播潜力，符合短剧金句要求",
      "台词反差感：[某角色台词]构成喜剧/情感序列"
    ],
    "evidence": [
      "「原文引用」（第X集）"
    ],
    "suggestions": [
      "建议压缩某处长句"
    ]
  },
  "suspenseEffectiveness": {
    "score": 75,
    "grade": "B",
    "findings": [
      "开篇悬念设置：[分析开篇悬念是否有效]",
      "每集结尾悬念：[分析结尾悬念设计是否参差不齐]",
      "中后期悬念维持：相对较弱，缺乏具体集尾钩子设计"
    ],
    "evidence": [
      "「原文引用」（第X集）"
    ],
    "suggestions": [
      "建议避免悬念手法重复使用"
    ]
  }
}
\`\`\``;

// ==================== 商业化与合规详细分析 Prompt ====================

export const COMMERCIAL_COMPLIANCE_DETAILED_PROMPT = `## 任务：商业化潜力与合规性详细分析

请对以下AI漫剧剧本进行商业化潜力和合规性分析。

## 剧本内容
{SCRIPT_CONTENT}

## 输出格式要求
每个维度输出固定5个字段：
- score: 0-100评分
- grade: S/A/B/C/D等级
- findings: 关键发现数组（每条50-80字）
- evidence: 剧本原文引用数组（格式：「台词/描述」（集数））
- suggestions: 改进建议数组（每条30-50字）

## 输出格式（严格JSON）
\`\`\`json
{
  "userStickiness": {
    "score": 78,
    "grade": "B",
    "findings": [
      "粘性基础：[分析某种叙事视角/情节设计具有的粘性基础]",
      "最强粘性来源：[全剧最强的粘性来源]",
      "缺失元素：[缺乏某类情感补偿元素]"
    ],
    "evidence": [
      "「原文引用」（第X集）"
    ],
    "suggestions": [
      "建议增加崇拜反应场景"
    ]
  },
  "viralPotential": {
    "score": 76,
    "grade": "B",
    "findings": [
      "最强UGC传播点：[某画面/场景]是最强UGC传播点，喜剧反差感/情感冲击力极强",
      "话题性：[某反转/情节]具有话题性"
    ],
    "evidence": [
      "「原文引用」（第X集）"
    ],
    "suggestions": [
      "建议设计视觉符号"
    ]
  },
  "contentCompliance": {
    "score": 88,
    "grade": "A",
    "findings": [
      "暴力尺度：[分析暴力内容尺度控制]",
      "法理依据：[冲突解决有明确法理/道德依据]",
      "AI漫剧制作合规：[分析题材对AI生成的适配性]"
    ],
    "evidence": [
      "「原文引用」（第X集）"
    ],
    "suggestions": []
  },
  "valueOrientation": {
    "score": 90,
    "grade": "S",
    "findings": [
      "核心价值观：[分析全剧核心主题是否与主流价值导向契合]",
      "角色成长价值：[分析主要角色成长是否传递正面价值]",
      "道德闭环：[分析善恶是否有完整闭环]"
    ],
    "evidence": [
      "「原文引用」（第X集）"
    ],
    "suggestions": []
  }
}
\`\`\``;

// ==================== 综合建议 Prompt ====================

export const ACTIONABLE_RECOMMENDATIONS_PROMPT = `## 任务：生成综合可操作建议

基于前面的分析结果，请生成5条优先级排序的综合可操作建议，并输出可执行的商业化闭环方案。每条建议都要具体、可执行，并说明预期效果。

## 前序分析数据
- 制作分析结论：{PRODUCTION_DATA}
- 市场共鸣分析：{MARKET_RESONANCE_DATA}
- 叙事基因分析：{NARRATIVE_DNA_DATA}
- 商业合规分析：{COMMERCIAL_COMPLIANCE_DATA}

## 输出格式要求
- priority: 优先级（1-5）
- category: 类别（爽点优化|结构调整|人物强化|合规修改|世界观完善|受众定位）
- title: 建议标题（15字以内）
- description: 详细建议（100字以上，包含具体修改位置和内容）
- expectedImpact: 预期效果

## 输出格式（严格JSON）
\`\`\`json
{
  "actionableRecommendations": [
    {
      "priority": 1,
      "category": "爽点优化",
      "title": "强化主角第一视角叙事",
      "description": "具体描述修改方案，包括修改位置、修改内容、修改方式。在第1集开篇增加主角内心独白，明确其'我就是这个世界最强者'的身份确认，让目标观众直接代入强者视角。",
      "expectedImpact": "解决受众定位模糊问题，提升目标受众代入感"
    },
    {
      "priority": 2,
      "category": "结构调整",
      "title": "建议标题",
      "description": "详细建议（100字以上）",
      "expectedImpact": "预期效果"
    }
  ],
  "finalSummary": {
    "overallScore": 80,
    "overallGrade": "A",
    "gradeLabel": "优质AI漫剧剧本",
    "oneSentence": "一句话总评",
    "paragraph": "详细段落总评（200字以上）：综合评估AI漫剧适配性、爆款潜力、主要优势与不足、平台推荐、投资建议",
    "highlights": {
      "top3Strengths": ["核心亮点1", "核心亮点2", "核心亮点3"],
      "uniqueSellingPoints": ["独特卖点1", "独特卖点2"],
      "viralMoments": ["可能出圈的名场面1", "名场面2"]
    },
    "platformRecommendation": {
      "primary": "首推平台",
      "secondary": ["备选平台1", "备选平台2"],
      "reasoning": "推荐原因",
      "launchStrategy": "上线策略建议"
    },
    "businessClosedLoop": {
      "targetPositioning": "核心受众+核心卖点+核心平台的三位一体定位（100字以上）",
      "monetizationPath": ["变现路径1：短剧付费解锁", "变现路径2：广告分成", "变现路径3：IP衍生开发"],
      "launchPlan": ["T+0上线动作", "T+7复盘动作", "T+30扩量动作"],
      "kpiDashboard": [
        {"metric": "3秒完播率", "target": ">= 78%", "window": "首周"},
        {"metric": "付费转化率", "target": ">= 4.5%", "window": "首月"},
        {"metric": "单集ROI", "target": ">= 1.5", "window": "首月"}
      ],
      "validationExperiments": ["A/B测试实验1", "A/B测试实验2"],
      "riskMitigation": ["高风险项及兜底方案1", "高风险项及兜底方案2"],
      "nextQuarterGoal": "下一季度商业目标（50字以上）"
    }
  }
}
\`\`\``;

// ==================== 角色场景特效分析 Prompt ====================

export const PRODUCTION_ANALYSIS_PROMPT = `## 任务：AI漫剧制作分析

请对以下剧本进行制作难度和资源需求分析。

## 剧本内容
{SCRIPT_CONTENT}

## AI漫剧制作成本参考（2025年市场数据）
- C级轻量（纯对话/静态场景为主）：200-500元/分钟，80集约3-8万元
- B级标准（常规动态场景）：500-1000元/分钟，80集约8-15万元
- A级优质（丰富场景/中等特效）：1000-2000元/分钟，80集约15-30万元
- S级精品（复杂场景/大量特效/高品质）：2000-3000元/分钟，80集约30-50万元

## 评估维度
1. 角色数量和设计复杂度
2. 场景多样性
3. 动作/特效复杂度
4. 风格统一性要求

## 输出格式（严格JSON）
\`\`\`json
{
  "aiGenerationProbability": {
    "percentage": 42.6,
    "assessment": "AI辅助",
    "warning": "预警说明（200字以上）：分析AI生成内容的分布特征、可能的风险、对商业交付的影响"
  },
  "formatCompliance": {
    "level": "规范|一般|较差",
    "description": "格式规范性说明（100字以上）"
  },
  "productionDifficulty": {
    "level": "高|中|低",
    "description": "难度说明（150字以上）"
  },
  "budgetTier": "S|A|B|C",
  "resourceTable": {
    "characters": ["角色1（角色类型）", "角色2（角色类型）"],
    "scenes": ["场景1", "场景2", "场景3"],
    "effects": ["特效1", "特效2", "特效3"]
  },
  "estimatedCost": {
    "perMinute": "每分钟成本",
    "perEpisode": "单集制作成本",
    "fullSeason": "整季制作成本",
    "breakdown": {
      "aiDrawing": "AI绘图占比",
      "aiVideo": "AI视频生成占比",
      "voiceActing": "配音占比",
      "editing": "剪辑后期占比"
    }
  },
  "technicalChallenges": ["AI生成难点1", "难点2"],
  "recommendedTools": ["推荐工具1", "推荐工具2"]
}
\`\`\``;

// ==================== 结构分析 Prompt ====================

export const STRUCTURE_DETAILED_PROMPT = `## 任务：剧本结构深度分析

请对以下AI漫剧剧本进行结构分析。

## 剧本内容
{SCRIPT_CONTENT}

## 输出格式（严格JSON）
\`\`\`json
{
  "worldBuilding": {
    "type": "世界观类型（都市/玄幻/穿越/末日/仙侠/科幻/校园/职场/古风/现代甜宠）",
    "powerSystem": {
      "exists": true,
      "description": "力量体系描述（200字以上）",
      "levels": ["等级1", "等级2", "等级3"],
      "rules": ["规则1", "规则2"],
      "clarity": 8
    },
    "socialStructure": {
      "description": "社会架构描述（150字以上）",
      "factions": ["势力1", "势力2"],
      "conflicts": ["核心冲突1", "核心冲突2"]
    },
    "uniqueElements": ["独特设定1", "独特设定2", "独特设定3"],
    "consistency": {
      "score": 85,
      "issues": ["逻辑漏洞1（如有）"],
      "strengths": ["自洽优点1", "自洽优点2"]
    },
    "ipPotential": {
      "score": 80,
      "sequelPossibility": "high|medium|low",
      "spinoffIdeas": ["衍生方向1", "衍生方向2"],
      "merchandisePotential": ["周边潜力1", "周边潜力2"]
    },
    "worldBuildingScore": 82
  },
  "actStructure": [
    {
      "act": 1,
      "name": "起（建置）",
      "percentage": 25,
      "episodeRange": "第1-3集",
      "keyEvents": ["关键事件1", "关键事件2"],
      "quality": "质量评价",
      "pacing": "fast|medium|slow",
      "hookStrength": 8
    }
  ],
  "turningPoints": [
    {
      "position": 10,
      "type": "inciting_incident",
      "name": "激励事件",
      "description": "描述",
      "pleasurePower": 7
    }
  ],
  "suspenses": [
    {
      "id": "s1",
      "type": "main",
      "question": "主悬念问题",
      "setupPosition": 5,
      "resolvePosition": 95,
      "isResolved": true
    }
  ],
  "hookPositions": [5, 15, 25, 35, 50, 65, 80, 95],
  "cliffhangerCount": 10,
  "foreshadowRecoveryRate": 85,
  "structureType": "三幕式|多线交织|单元剧|连续剧"
}
\`\`\``;

// ==================== 人物分析 Prompt ====================

export const CHARACTER_DETAILED_PROMPT = `## 任务：人物关系深度分析

请对以下AI漫剧剧本进行人物分析。

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
      "arcType": "角色弧线类型",
      "motivation": "核心动机（100字）",
      "flaw": "性格缺陷",
      "emotionalArc": "情感变化描述（150字）",
      "memorableTraits": ["记忆点1", "记忆点2", "记忆点3"],
      "visualTraits": {
        "description": "外貌描述",
        "distinctiveFeatures": ["特征1", "特征2"],
        "costumeKeywords": ["服装关键词1", "服装关键词2"]
      },
      "score": 85
    }
  ],
  "relationships": [
    {
      "from": "c1",
      "to": "c2",
      "type": "关系类型",
      "tension": "high|medium|low",
      "cpPotential": "high|medium|low|none",
      "description": "关系描述（100字）"
    }
  ],
  "goldenLines": [
    {
      "character": "角色名",
      "line": "金句原文",
      "context": "出现场景",
      "viralPotential": "high|medium|low"
    }
  ],
  "voiceDistinction": "excellent|good|fair|poor",
  "relationshipDensity": 0.75,
  "conflictStructure": "冲突结构描述（200字）",
  "cpChemistry": {
    "mainCP": "主CP名称",
    "cpType": "CP类型",
    "sugarMoments": ["甜蜜时刻1", "甜蜜时刻2", "甜蜜时刻3"],
    "score": 8
  }
}
\`\`\``;

// ==================== 情感分析 Prompt ====================

export const EMOTION_DETAILED_PROMPT = `## 任务：情感曲线深度分析

请对以下AI漫剧剧本进行情感分析。

## 剧本内容
{SCRIPT_CONTENT}

## 输出格式（严格JSON）
\`\`\`json
{
  "emotionCurve": [
    {"position": 0, "emotion": "hook", "intensity": 7, "event": "开场事件", "description": "描述", "isPeak": false},
    {"position": 20, "emotion": "climax", "intensity": 8, "event": "第一个爽点", "description": "描述", "isPeak": true},
    {"position": 50, "emotion": "twist", "intensity": 9, "event": "中点反转", "description": "描述", "isPeak": true},
    {"position": 100, "emotion": "resolution", "intensity": 7, "event": "结局", "description": "描述", "isPeak": false}
  ],
  "majorPleasurePoints": [
    {
      "position": 20,
      "type": "faceslap|reversal|levelup|other",
      "power": 8,
      "description": "爽点描述（150字）",
      "technique": "使用的技法",
      "viralPotential": "high|medium|low"
    }
  ],
  "minorPleasurePoints": [
    {"position": 15, "type": "showoff|revenge|other", "power": 6, "description": "小爽点描述", "technique": "技法"}
  ],
  "overallArc": "整体情绪走势描述（200字）",
  "emotionTags": ["爽感", "逆袭", "打脸", "热血", "燃"],
  "targetFeeling": "目标观众应获得的情绪体验（100字）",
  "emotionIntensityAvg": 7.5,
  "pleasurePointDensity": {
    "perEpisode": 2.5,
    "assessment": "爽点密度评估（100字）",
    "suggestion": "优化建议"
  },
  "addictionIndex": {
    "score": 82,
    "factors": ["上瘾因素1", "上瘾因素2", "上瘾因素3"],
    "bingePotential": "high|medium|low"
  }
}
\`\`\``;

// ==================== 市场详细分析 Prompt ====================

export const MARKET_DETAILED_PROMPT = `## 任务：AI漫剧市场与定价分析

请对以下AI漫剧剧本进行市场分析。

## 剧本内容
{SCRIPT_CONTENT}

## 重要提示
1. 定价必须基于AI漫剧市场实际情况（不是真人短剧）
2. 参考竞品：红果短剧、番茄短剧的AI漫剧定价
3. AI漫剧单集成本约500-2000元

## 输出格式（严格JSON）
\`\`\`json
{
  "suggestedPriceRange": {
    "perEpisode": "0.5-1元/集",
    "fullSeason": "9.9-19.9元",
    "reasoning": "定价理由（200字）"
  },
  "revenueProjection": {
    "tier": "A",
    "description": "预期收益描述",
    "paymentConversion": "预估付费转化率：3-5%",
    "adRevenue": "广告收益预估",
    "totalEstimate": "月收益预估"
  },
  "targetPlatforms": [
    {
      "platform": "红果短剧",
      "suitability": "high|medium|low",
      "reason": "推荐原因（100字）",
      "expectedRevenue": "预期收益"
    }
  ],
  "marketingAngles": ["营销切入点1", "营销切入点2", "营销切入点3"],
  "titleSuggestions": ["备选标题1", "备选标题2"],
  "coverScenes": ["封面场景1", "封面场景2"],
  "similarHits": [
    {
      "title": "对标爆款名称",
      "platform": "平台",
      "views": "播放量",
      "similarity": 85,
      "learnableAspects": ["可借鉴点1", "可借鉴点2"],
      "differentiators": ["差异化点1", "差异化点2"]
    }
  ],
  "audienceProfile": {
    "gender": "male|female|neutral",
    "genderRatio": "男70%女30%",
    "ageRange": "18-35",
    "primaryAge": "25-30",
    "interests": ["兴趣1", "兴趣2", "兴趣3"],
    "psychographics": "心理特征描述（150字）",
    "consumption": "付费意愿描述",
    "marketSize": "large|medium|niche"
  },
  "trendMatch": {
    "hotElements": ["热门元素1", "热门元素2"],
    "currentTrends": ["当前趋势1", "当前趋势2"],
    "missingElements": ["缺失元素1"],
    "competitionLevel": "high|medium|low",
    "timingScore": 75,
    "differentiators": ["差异化优势1", "差异化优势2"]
  },
  "viralPotential": {
    "score": 78,
    "viralScenes": ["出圈场景1", "出圈场景2"],
    "clipPotential": "high|medium|low",
    "cpPotential": "high|medium|low",
    "memeability": "high|medium|low",
    "hashtagSuggestions": ["#标签1", "#标签2", "#标签3"]
  }
}
\`\`\``;

// ==================== 风险评估 Prompt ====================

export const RISK_DETAILED_PROMPT = `## 任务：AI漫剧风险评估

请对以下AI漫剧剧本进行风险评估。

## 剧本内容
{SCRIPT_CONTENT}

## 前序分析数据（参考）
- 制作分析结论：{PRODUCTION_DATA}
- 商业合规分析：{COMMERCIAL_DATA}

## 输出格式（严格JSON）
\`\`\`json
{
  "compliance": {
    "overallRisk": "high|medium|low",
    "passRate": 92,
    "issues": [
      {
        "location": "第X集第X场",
        "type": "暴力|色情|政治|低俗|其他",
        "severity": "critical|high|medium|low",
        "content": "问题内容描述",
        "suggestion": "修改建议",
        "affectedPlatforms": ["平台1", "平台2"]
      }
    ],
    "platformSuitability": {
      "hongGuo": {"status": "suitable|needs_modification|unsuitable", "issues": [], "suggestions": []},
      "fanQie": {"status": "suitable", "issues": [], "suggestions": []},
      "douyin": {"status": "suitable", "issues": [], "suggestions": []}
    }
  },
  "aiContentCompliance": {
    "needsAILabel": true,
    "deepfakeRisk": "low|medium|high",
    "copyrightRisk": {
      "level": "low|medium|high",
      "concerns": ["版权风险点1"],
      "suggestions": ["建议1"]
    },
    "likenessRisk": {
      "level": "low|medium|high",
      "concerns": [],
      "suggestions": []
    }
  },
  "marketRisks": [
    {
      "type": "market",
      "severity": "medium|high|low",
      "description": "市场风险描述",
      "suggestion": "应对建议"
    }
  ],
  "productionRisks": [
    {
      "type": "production",
      "severity": "low|medium|high",
      "description": "制作风险描述",
      "suggestion": "应对建议"
    }
  ],
  "canPublish": true,
  "requiredChanges": ["必须修改项1（如有）"],
  "recommendedChanges": ["建议修改项1", "建议修改项2"],
  "valueOrientation": {
    "mainTheme": "核心主题",
    "positiveElements": ["正面元素1", "正面元素2"],
    "concerns": ["顾虑点1（如有）"],
    "moralClosure": "善恶有报是否完整",
    "score": 88
  },
  "ageRating": {
    "suggested": "12+|15+|18+",
    "reason": "分级理由",
    "platformImplications": "平台影响说明"
  }
}
\`\`\``;

// ==================== 工具函数 ====================

const DETAILED_OUTPUT_GUARD = `
## 强制输出约束（必须满足）
1. 只输出一个合法JSON对象，不要输出 markdown 代码块，不要附加解释文字。
2. 所有评分必须是数字；所有数组必须是JSON数组；禁止使用省略号。
3. findings 必须给出可验证事实，evidence 必须引用剧本原文片段。
4. suggestions 必须可执行，尽量包含“修改位置 + 修改动作 + 预期结果”。
5. 商业化建议必须包含可量化KPI，确保可执行与可复盘。
`;

/** 替换 Prompt 中的占位符 */
export function fillDetailedPrompt(template: string, data: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return `${result}\n\n${DETAILED_OUTPUT_GUARD}`;
}

/** 详细分析阶段配置 - 11轮分段输出 */
export const DETAILED_ANALYSIS_PHASES = [
  {
    id: 'production',
    name: 'AI漫剧制作分析',
    prompt: PRODUCTION_ANALYSIS_PROMPT,
    description: 'AI生成概率、格式规范性、制作难度、资源需求',
  },
  {
    id: 'executive',
    name: '执行摘要',
    prompt: EXECUTIVE_SUMMARY_PROMPT,
    description: '频类、题材、一句话介绍、剧情主线、核心结论',
  },
  {
    id: 'structure',
    name: '结构分析',
    prompt: STRUCTURE_DETAILED_PROMPT,
    description: '世界观、三幕结构、转折点、悬念设计',
  },
  {
    id: 'character',
    name: '人物分析',
    prompt: CHARACTER_DETAILED_PROMPT,
    description: '角色塑造、人物关系、金句提取、CP化学反应',
  },
  {
    id: 'emotion',
    name: '情感分析',
    prompt: EMOTION_DETAILED_PROMPT,
    description: '情绪曲线、爽点分布、上瘾指数',
  },
  {
    id: 'marketResonance',
    name: '市场共鸣分析',
    prompt: MARKET_RESONANCE_DETAILED_PROMPT,
    description: '目标受众、原创性、热播契合度',
  },
  {
    id: 'market',
    name: '市场定价分析',
    prompt: MARKET_DETAILED_PROMPT,
    description: '定价建议、平台推荐、收益预测、竞品对标',
  },
  {
    id: 'narrativeDNA',
    name: '叙事基因分析',
    prompt: NARRATIVE_DNA_DETAILED_PROMPT,
    description: '叙事逻辑、钩子、爽点、节奏、人物、对白、悬念',
  },
  {
    id: 'risk',
    name: '风险评估',
    prompt: RISK_DETAILED_PROMPT,
    description: '合规风险、市场风险、制作风险、价值观评估',
  },
  {
    id: 'commercial',
    name: '商业合规分析',
    prompt: COMMERCIAL_COMPLIANCE_DETAILED_PROMPT,
    description: '用户粘性、传播潜力、内容合规、价值导向',
  },
  {
    id: 'recommendations',
    name: '综合建议',
    prompt: ACTIONABLE_RECOMMENDATIONS_PROMPT,
    description: '5条可操作建议、总评、平台推荐',
  },
];
