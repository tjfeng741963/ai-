import type { MarketType } from './market-context.ts';

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
每个维度输出固定7个字段：
- score: 0-100评分
- grade: S/A/B/C/D等级
- analysis: 综合分析文本（200-400字，深入分析该维度的表现，包含具体论据和引用）
- keyFindings: 关键发现数组（3-5条，每条50-80字，概括核心发现）
- evidence: 剧本原文引用数组（2-4条，格式：「台词/描述」（集数））
- strengths: 优势亮点数组（2-3条，每条30-50字）
- improvements: 改进建议数组（2-3条，每条30-50字，无需改进则为空数组）

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
    "analysis": "剧本定位为男频逆袭题材，核心受众是18-35岁男性用户，追求'被低估后逆袭'的代入感。第3-5集的打脸场景能有效激发目标受众的情绪共鸣，如「我就是那个被所有人低估的人」（第5集）精准击中男频用户的爽点需求。但受众定位略显单一，缺乏对女性用户的吸引力设计，建议在情感线上增加甜宠元素以扩大受众覆盖面。整体来看，核心受众匹配度较高，但需要在受众广度上做优化。",
    "keyFindings": [
      "核心受众定位精准：18-35岁男性，追求逆袭代入感，与短剧主流用户画像高度匹配",
      "第3-5集打脸场景是最强受众共鸣点，情绪激发效果显著",
      "受众覆盖面偏窄，缺乏对女性用户和25+用户群体的吸引力设计"
    ],
    "evidence": [
      "「我就是那个被所有人低估的人，现在让你们看看真正的实力」（第5集）",
      "「废物永远是废物」（第3集反派台词，激发观众逆反心理）"
    ],
    "strengths": [
      "核心受众画像清晰，男频逆袭定位精准",
      "打脸场景设计符合目标受众的情绪需求"
    ],
    "improvements": [
      "建议在第1集增加主角内心独白，强化'强者确认'的第一人称视角",
      "建议增加情感支线，扩大女性受众覆盖"
    ]
  },
  "originality": {
    "score": 82,
    "grade": "A",
    "analysis": "题材创新点突出，本剧以[具体切入点]为核心议题，在同类短剧中具备差异化识别度。人设组合方面，[角色名]的[具体人设组合]在短剧市场中有一定新鲜感，如「原文引用」（第X集）展示了独特的角色魅力。但创新深度有限，核心叙事模式仍遵循传统逆袭框架，建议在世界观或能力体系上增加更多原创元素，提升IP延展潜力。",
    "keyFindings": [
      "题材切入点具备差异化：[具体创新点]在同类短剧中较为少见",
      "人设组合有记忆点：[角色名]的[人设组合]提供了新鲜感",
      "核心叙事模式仍偏传统，创新停留在表层设定而非深层结构"
    ],
    "evidence": [
      "「原文引用」（第X集）"
    ],
    "strengths": [
      "题材切入角度新颖，具备差异化竞争力",
      "人设组合有记忆点，利于口碑传播"
    ],
    "improvements": [
      "建议深化世界观原创性，增强IP延展潜力"
    ]
  },
  "trendAlignment": {
    "score": 70,
    "grade": "B",
    "analysis": "对标分析显示，本剧与当前爆款[爆款名称]在题材定位上有相似之处，但爽点类型存在偏差。[题材类型]场景为AI漫剧生成的强项，视觉奇观潜力较高，如「原文引用」（第X集）的场景描写适合AI视觉化呈现。但在热播元素匹配度上，缺乏当前平台算法偏好的[具体元素]，可能影响推荐流量获取。建议借鉴爆款的节奏设计和钩子密度，同时保持自身差异化。",
    "keyFindings": [
      "对标爆款[名称]：题材相似但爽点类型存在偏差，需调整匹配度",
      "AI漫剧适配性高：[题材类型]场景为AI生成强项，视觉奇观潜力大",
      "平台算法匹配度不足：缺乏当前热门标签和推荐偏好元素"
    ],
    "evidence": [
      "「原文引用」（第X集）"
    ],
    "strengths": [
      "题材适合AI漫剧视觉化呈现",
      "与爆款题材有相似基因，具备市场验证基础"
    ],
    "improvements": [
      "建议借鉴爆款的钩子密度和节奏设计",
      "建议增加平台算法偏好的热门标签元素"
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
每个维度输出固定7个字段：
- score: 0-100评分
- grade: S/A/B/C/D等级
- analysis: 综合分析文本（200-400字，深入分析该维度的表现，包含具体论据和引用）
- keyFindings: 关键发现数组（3-5条，每条50-80字，概括核心发现）
- evidence: 剧本原文引用数组（2-4条，格式：「台词/描述」（集数））
- strengths: 优势亮点数组（2-3条，每条30-50字）
- improvements: 改进建议数组（2-3条，每条30-50字，无需改进则为空数组）

## 输出格式（严格JSON）
\`\`\`json
{
  "narrativeLogic": {
    "score": 85,
    "grade": "A",
    "analysis": "世界观设定自洽，因果链明确，逻辑闭环完整。[具体分析因果链如何运作，包括主要事件之间的因果关系]。关键情节如「原文引用」（第X集）的逻辑设计有效推动剧情发展，角色动机与行为逻辑一致，每个重要决策都有合理的前因后果支撑。但[某处]存在轻微逻辑跳跃，角色从A状态到B状态的转变缺乏足够铺垫，需要补充过渡情节。整体叙事逻辑在同类短剧中属于上乘水平，因果链的完整度为后续剧情发展提供了坚实基础。",
    "keyFindings": [
      "因果链完整度高：主要事件之间的因果关系清晰，逻辑闭环无明显漏洞",
      "角色动机一致性强：主角的行为决策与其人设和处境高度匹配",
      "[某处]存在逻辑跳跃：从[A状态]到[B状态]的转变缺乏铺垫"
    ],
    "evidence": [
      "「原文引用」（第X集）",
      "「原文引用」（第X集）"
    ],
    "strengths": [
      "因果链设计严密，逻辑闭环完整",
      "角色动机与行为高度一致"
    ],
    "improvements": []
  },
  "hookStrength": {
    "score": 88,
    "grade": "A",
    "analysis": "第1集开篇钩子极强：[某场景→某事件]在极短篇幅内完成'平静被打破→危机确认→强者出手'的完整钩子结构。如「原文引用」（第1集）瞬间抓住观众注意力，信息密度高且节奏紧凑。每集结尾悬念设计[具体分析各集结尾悬念的类型和效果]，整体能有效驱动下一集点击。但第X集结尾悬念力度偏弱，缺乏足够的情感冲击或信息悬念，可能导致该集到下一集的留存率下降。钩子密度和强度整体达到优质短剧水准，前3集的钩子设计尤为出色。",
    "keyFindings": [
      "开篇钩子结构完整：5秒内完成'平静→打破→危机→出手'的完整钩子链",
      "每集结尾悬念整体有效：[X]集中有[Y]集设有强力结尾悬念",
      "第X集结尾悬念力度偏弱，可能影响该集到下一集的留存率"
    ],
    "evidence": [
      "「原文引用」（第1集开篇）",
      "「原文引用」（第X集结尾悬念）"
    ],
    "strengths": [
      "开篇钩子结构完整，5秒内抓住注意力",
      "整体悬念密度达到优质短剧水准"
    ],
    "improvements": [
      "建议在第X集结尾增加更强的悬念钩子，当前结尾力度偏弱"
    ]
  },
  "pleasureDesign": {
    "score": 80,
    "grade": "A",
    "analysis": "最强爽点出现在第X集：[某角色以某方式做了某事]，满足男频/女频核心需求，情感冲击力极强。如「原文引用」（第X集）带来强烈的情感宣泄体验。爽点类型涵盖[打脸/逆袭/甜宠/复仇]等多种类型，前X集爽点密度较高，平均每集[N]个爽点。但中后期爽点分布略显稀疏，以段落为单位出现，缺乏持续的小爽点维持观众兴奋度。爽点强度递进设计[分析是否有层层递进]，整体爽感体验在同类短剧中处于中上水平。",
    "keyFindings": [
      "最强爽点：第X集[具体场景]，情感冲击力极强，满足核心受众需求",
      "爽点密度前高后低：前X集密度高，中后期分布稀疏",
      "爽点类型多样但强度递进不够明显，缺乏终极大爽点的铺垫"
    ],
    "evidence": [
      "「原文引用」（第X集，最强爽点）",
      "「原文引用」（第X集）"
    ],
    "strengths": [
      "核心爽点设计精准，击中目标受众需求",
      "爽点类型多样，避免单一化"
    ],
    "improvements": [
      "建议在第X集增加小爽点，维持中后期节奏",
      "建议设计更明确的爽点递进链，让终极爽点更有冲击力"
    ]
  },
  "pacingStructure": {
    "score": 82,
    "grade": "A",
    "analysis": "采用六段式结构，起承转合叙事目标明确。如「原文引用」（第X集）展示了[具体分析结构转折点]。前X集节奏紧凑，场景切换频率适中，每集控制在[N]个场景左右，适合AI漫剧的快节奏要求。分镜节奏方面，动作场景与对话场景的交替设计合理，但[某段]对话密度偏高，连续[N]页纯对话可能影响分镜节奏流畅度。整体结构完整度高，适合80集短剧的体量要求。",
    "keyFindings": [
      "六段式结构完整：起承转合目标明确，结构转折点设计合理",
      "前X集节奏紧凑：场景切换频率适中，适合AI漫剧快节奏",
      "[某段]对话密度偏高，连续纯对话影响分镜节奏"
    ],
    "evidence": [
      "「原文引用」（第X集，结构转折点）",
      "「原文引用」（第X集，对话密集段）"
    ],
    "strengths": [
      "结构完整，起承转合目标明确",
      "场景切换频率适合AI漫剧节奏"
    ],
    "improvements": [
      "建议压缩第X集某段对话密度，保持视觉节奏流畅"
    ]
  },
  "plotCoherence": {
    "score": 86,
    "grade": "A",
    "analysis": "核心主线聚焦，全剧始终围绕[核心主线]推进，无明显支线干扰。如「原文引用」（第X集）体现了主线的连贯推进，关键情节点之间的衔接自然流畅。多线交织方面，[分析支线与主线的关系]，支线服务于主线发展而非分散注意力。结尾设计[具体分析]，兼顾主线完整性与续集潜力，为后续发展留下空间。但[某处]的伏笔回收略显仓促，建议增加过渡情节。",
    "keyFindings": [
      "核心主线聚焦：全剧围绕[主线]推进，无明显支线干扰",
      "情节衔接自然：关键情节点之间的过渡流畅",
      "结尾设计兼顾完整性与续集潜力"
    ],
    "evidence": [
      "「原文引用」（第X集，主线推进）",
      "「原文引用」（第X集，结尾设计）"
    ],
    "strengths": [
      "主线清晰聚焦，叙事不散",
      "结尾设计巧妙，兼顾完整与延展"
    ],
    "improvements": []
  },
  "characterization": {
    "score": 83,
    "grade": "A",
    "analysis": "主角人设具备[反差层次]，记忆点鲜明，执行度高。如「原文引用」（第X集）展现了角色的多面性和深度。核心配角弧线[分析是否完整]，[配角名]从[初始状态]到[最终状态]的转变有合理铺垫。反派动机[分析复杂度]，不是简单的脸谱化反派。但部分配角的性格转变缺乏铺垫，[某角色]在第X集的态度突变显得突兀，影响角色可信度。整体人物塑造在短剧中属于较高水平，主角的记忆点设计利于观众形成情感连接。",
    "keyFindings": [
      "主角人设反差层次丰富：[具体反差点]，记忆点鲜明",
      "核心配角弧线[完整/不完整]：[配角名]的转变[有/缺乏]合理铺垫",
      "部分配角性格转变突兀：[某角色]第X集态度突变缺乏铺垫"
    ],
    "evidence": [
      "「原文引用」（第X集，主角人设展现）",
      "「原文引用」（第X集，配角转变）"
    ],
    "strengths": [
      "主角人设反差鲜明，记忆点强",
      "反派动机有深度，非脸谱化"
    ],
    "improvements": [
      "建议强化[某角色]的主动性，增加其决策驱动的情节",
      "建议为[某角色]第X集的态度转变增加铺垫"
    ]
  },
  "dialogueQuality": {
    "score": 84,
    "grade": "A",
    "analysis": "金句密度达标，如「某角色金句」（第X集）具备强传播潜力，符合短剧金句要求，适合截图传播和二创。台词反差感突出，「某角色台词」构成喜剧/情感序列，如「原文引用」（第X集）展示了对白的节奏感和冲击力。角色语言个性化程度[分析]，主角和反派的语言风格有明显区分。但部分场景对白偏长，第X集某段连续对话超过[N]句，不利于AI漫剧的快节奏呈现和分镜切割。",
    "keyFindings": [
      "金句密度达标：[N]处金句具备传播潜力，适合截图和二创",
      "台词反差感突出：喜剧/情感序列设计有效",
      "部分对白偏长：第X集某段连续对话不利于分镜节奏"
    ],
    "evidence": [
      "「某角色金句」（第X集）",
      "「某角色台词」（第X集，反差对白）"
    ],
    "strengths": [
      "金句设计具备强传播潜力",
      "角色语言个性化，风格区分明显"
    ],
    "improvements": [
      "建议压缩第X集某处长句，控制单句在15字以内",
      "建议增加更多视觉化描述替代纯对话"
    ]
  },
  "suspenseEffectiveness": {
    "score": 75,
    "grade": "B",
    "analysis": "开篇悬念设置[分析是否有效]，如「原文引用」（第1集）成功建立核心悬念，吸引观众继续观看。但每集结尾悬念设计参差不齐，[X]集中仅[Y]集有强力结尾悬念，部分集数结尾缺乏有效钩子。中后期悬念维持相对较弱，悬念手法存在重复使用的问题（如多次使用[某种悬念手法]），降低了观众的期待感和新鲜感。悬念回收方面，[分析主要悬念是否得到合理回收]，但部分小悬念被遗忘未回收。",
    "keyFindings": [
      "开篇悬念有效：第1集成功建立核心悬念，吸引力强",
      "结尾悬念参差不齐：[X]集中仅[Y]集有强力结尾悬念",
      "悬念手法重复：多次使用[某种手法]，新鲜感下降"
    ],
    "evidence": [
      "「原文引用」（第1集，核心悬念建立）",
      "「原文引用」（第X集，悬念薄弱处）"
    ],
    "strengths": [
      "开篇悬念建立成功，核心悬念吸引力强",
      "主要悬念回收合理"
    ],
    "improvements": [
      "建议避免悬念手法重复，第X集可尝试[新的悬念类型]",
      "建议为每集结尾设计差异化的悬念钩子"
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
每个维度输出固定7个字段：
- score: 0-100评分
- grade: S/A/B/C/D等级
- analysis: 综合分析文本（200-400字，深入分析该维度的表现，包含具体论据和引用）
- keyFindings: 关键发现数组（3-5条，每条50-80字，概括核心发现）
- evidence: 剧本原文引用数组（2-4条，格式：「台词/描述」（集数））
- strengths: 优势亮点数组（2-3条，每条30-50字）
- improvements: 改进建议数组（2-3条，每条30-50字，无需改进则为空数组）

## 输出格式（严格JSON）
\`\`\`json
{
  "userStickiness": {
    "score": 78,
    "grade": "B",
    "analysis": "粘性基础扎实，[某种叙事视角/情节设计]具有天然的用户粘性。如「原文引用」（第X集）展示了最强粘性来源：[全剧最强的粘性来源分析]。上瘾机制方面，[分析追更动力的来源和强度]，每集结尾的悬念设计能有效驱动用户继续观看。但缺乏[某类情感补偿元素]，中后期用户留存可能下降。付费转化点设计[分析是否有效]，[某集某情节]是最佳付费卡点位置。整体粘性设计适合短剧的碎片化消费模式，但需要在中后期增加情感锚点。",
    "keyFindings": [
      "最强粘性来源：[具体情节/机制]，天然具备用户留存基础",
      "追更动力设计：每集结尾悬念能有效驱动下一集点击",
      "中后期粘性下降风险：缺乏[某类情感补偿元素]，留存可能走低"
    ],
    "evidence": [
      "「原文引用」（第X集，最强粘性点）",
      "「原文引用」（第X集，付费卡点）"
    ],
    "strengths": [
      "天然粘性基础扎实，适合碎片化消费",
      "悬念驱动的追更机制设计有效"
    ],
    "improvements": [
      "建议增加崇拜反应场景，强化用户情感投入",
      "建议在中后期增加情感锚点，防止留存下降"
    ]
  },
  "viralPotential": {
    "score": 76,
    "grade": "B",
    "analysis": "最强UGC传播点：[某画面/场景]具备极强的喜剧反差感/情感冲击力，如「原文引用」（第X集）适合二创传播，预计能在短视频平台引发模仿和讨论。话题性方面，[某反转/情节]具有社交讨论潜力，适合制造话题营销。金句传播方面，[分析是否有适合截图传播的台词]。但整体缺乏视觉符号和标志性台词，限制了自发传播的广度。建议设计1-2个标志性视觉符号（如特定动作、道具、表情），增强品牌记忆和传播辨识度。",
    "keyFindings": [
      "最强UGC传播点：[某场景]喜剧反差感/情感冲击力极强，适合二创",
      "话题性：[某反转/情节]具有社交讨论潜力",
      "缺乏视觉符号：无标志性动作/道具/表情，限制自发传播广度"
    ],
    "evidence": [
      "「原文引用」（第X集，最强传播点）",
      "「原文引用」（第X集，话题性情节）"
    ],
    "strengths": [
      "核心传播点情感冲击力强，适合二创",
      "话题性情节具备社交讨论潜力"
    ],
    "improvements": [
      "建议设计视觉符号，如标志性动作或道具，增强品牌记忆",
      "建议为金句台词设计视觉化呈现，利于截图传播"
    ]
  },
  "contentCompliance": {
    "score": 88,
    "grade": "A",
    "analysis": "暴力尺度控制得当，[分析暴力内容尺度控制情况]，未出现过度血腥或残忍描写。冲突解决有明确法理/道德依据，如「原文引用」（第X集）体现了合理的冲突解决方式，正义最终得到伸张。AI漫剧制作合规方面，题材对AI生成的适配性[具体分析]，场景描写适合AI视觉化呈现，无明显违规风险点。价值导向方面，[分析是否存在擦边或敏感内容]，整体符合各主流平台的内容审核标准。但需注意[某处]的描写可能在部分平台触发审核，建议做适当调整。",
    "keyFindings": [
      "暴力尺度控制得当：未出现过度血腥或残忍描写",
      "冲突解决合理：有明确法理/道德依据，正义得到伸张",
      "AI制作合规：题材适合AI生成，无明显违规风险"
    ],
    "evidence": [
      "「原文引用」（第X集，合规冲突解决）",
      "「原文引用」（第X集，需注意的描写）"
    ],
    "strengths": [
      "暴力尺度控制精准，符合平台标准",
      "冲突解决有法理依据，价值导向正面"
    ],
    "improvements": []
  },
  "valueOrientation": {
    "score": 90,
    "grade": "S",
    "analysis": "核心价值观与主流价值导向高度契合，全剧围绕[核心主题]展开，传递了[具体正面价值]。如「原文引用」（第X集）体现了正面价值传递，角色通过[具体方式]实现成长。主要角色成长弧线传递积极价值观，主角从[初始状态]到[最终状态]的转变体现了[具体价值]。善恶有完整道德闭环，反派得到应有惩罚，正义得到伸张。整体符合平台内容导向要求，适合全年龄段观众观看，具备正能量传播潜力。",
    "keyFindings": [
      "核心价值观契合主流：围绕[核心主题]传递正面价值",
      "角色成长弧线积极：主角转变体现[具体价值]",
      "道德闭环完整：善恶有报，正义得到伸张"
    ],
    "evidence": [
      "「原文引用」（第X集，正面价值传递）",
      "「原文引用」（第X集，角色成长体现）"
    ],
    "strengths": [
      "核心价值观与主流导向高度契合",
      "道德闭环完整，适合全年龄段"
    ],
    "improvements": []
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

## AI漫剧制作成本参考（2025年实际市场数据）
- 每集约30-40个分镜
- C级轻量（纯对话/静态场景为主）：30-50元/集，80集约2400-4000元
- B级标准（常规动态场景）：50-80元/集，80集约4000-6400元
- A级优质（丰富场景/中等特效）：80-120元/集，80集约6400-9600元
- S级精品（复杂场景/大量特效/高品质）：120-200元/集，80集约9600-16000元

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
    "perEpisode": "单集制作成本（如：50-80元）",
    "fullSeason": "整季制作成本（如：4000-6400元）",
    "panelsPerEpisode": "每集分镜数（如：30-40）",
    "breakdown": {
      "aiDrawing": "AI绘图占比（如：60%）",
      "aiVideo": "AI视频生成占比（如：15%）",
      "voiceActing": "配音占比（如：15%）",
      "editing": "剪辑后期占比（如：10%）"
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

export function getMarketDetailedPrompt(marketType: MarketType = 'domestic'): string {
  const isOverseas = marketType === 'overseas';

  const hints = isOverseas
    ? `## 重要提示
1. 定价必须基于海外短剧平台实际情况（ReelShort、DramaBox、ShortMax等）
2. 海外短剧主流付费模式：按集解锁（$0.5-2/集）、会员订阅、广告变现
3. 参考北美短剧市场ARPU和付费转化率
4. 分析跨文化适配性和本地化需求`
    : `## 重要提示
1. 定价必须基于AI漫剧市场实际情况（不是真人短剧）
2. 参考竞品：红果短剧、番茄短剧的AI漫剧定价
3. AI漫剧单集成本约500-2000元`;

  const priceExample = isOverseas
    ? `"suggestedPriceRange": {
    "perEpisode": "$0.5-1.5/episode",
    "fullSeason": "$9.99-29.99",
    "reasoning": "定价理由（200字）"
  }`
    : `"suggestedPriceRange": {
    "perEpisode": "0.5-1元/集",
    "fullSeason": "9.9-19.9元",
    "reasoning": "定价理由（200字）"
  }`;

  const platformExample = isOverseas
    ? `"targetPlatforms": [
    {
      "platform": "ReelShort",
      "suitability": "high|medium|low",
      "reason": "推荐原因（100字）",
      "expectedRevenue": "预期收益"
    }
  ]`
    : `"targetPlatforms": [
    {
      "platform": "红果短剧",
      "suitability": "high|medium|low",
      "reason": "推荐原因（100字）",
      "expectedRevenue": "预期收益"
    }
  ]`;

  const hashtagExample = isOverseas
    ? `"hashtagSuggestions": ["#BillionaireLove", "#ReelShort", "#ShortDrama"]`
    : `"hashtagSuggestions": ["#标签1", "#标签2", "#标签3"]`;

  return `## 任务：AI漫剧市场与定价分析

请对以下AI漫剧剧本进行市场分析。${isOverseas ? '本剧本面向海外市场（出海），请重点分析海外平台适配性、跨文化吸引力和海外变现模式。' : ''}

## 剧本内容
{SCRIPT_CONTENT}

${hints}

## 输出格式（严格JSON）
\`\`\`json
{
  ${priceExample},
  "revenueProjection": {
    "tier": "A",
    "description": "预期收益描述",
    "paymentConversion": "预估付费转化率：3-5%",
    "adRevenue": "广告收益预估",
    "totalEstimate": "月收益预估"
  },
  ${platformExample},
  "marketingAngles": ["营销切入点1", "营销切入点2", "营销切入点3"],
  "titleSuggestions": ["${isOverseas ? 'English Title 1' : '备选标题1'}", "${isOverseas ? 'English Title 2' : '备选标题2'}"],
  "coverScenes": ["封面场景1", "封面场景2"],
  "similarHits": [
    {
      "title": "${isOverseas ? 'Reference hit title' : '对标爆款名称'}",
      "platform": "${isOverseas ? 'ReelShort' : '平台'}",
      "views": "播放量",
      "similarity": 85,
      "learnableAspects": ["可借鉴点1", "可借鉴点2"],
      "differentiators": ["差异化点1", "差异化点2"]
    }
  ],
  "audienceProfile": {
    "gender": "male|female|neutral",
    "genderRatio": "${isOverseas ? 'Female 70% Male 30%' : '男70%女30%'}",
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
    ${hashtagExample}
  }
}
\`\`\``;
}

// 保留旧名称兼容（默认国内）
export const MARKET_DETAILED_PROMPT = getMarketDetailedPrompt('domestic');

// ==================== 风险评估 Prompt ====================

// 国内平台审核重点与JSON格式
const DOMESTIC_RISK_PLATFORMS = `### 各平台审核重点
- **红果短剧**：严控暴力血腥、色情擦边、价值观问题
- **番茄短剧**：关注版权、原创性、内容健康度
- **抖音/快手**：AI内容标识、版权、低俗内容`;

const DOMESTIC_PLATFORM_SUITABILITY = `"platformSuitability": {
      "hongGuo": {"status": "suitable|needs_modification|unsuitable", "issues": [], "suggestions": []},
      "fanQie": {"status": "suitable", "issues": [], "suggestions": []},
      "douyin": {"status": "suitable", "issues": [], "suggestions": []}
    }`;

const DOMESTIC_PLATFORM_CHANGES = `"platformSpecificChanges": {
    "hongGuo": ["红果平台特定修改（如有）"],
    "fanQie": ["番茄平台特定修改（如有）"]
  },`;

// 海外平台审核重点与JSON格式
const OVERSEAS_RISK_PLATFORMS = `### 各平台审核重点（出海市场）
- **ReelShort**：北美头部短剧平台，注意COPPA儿童保护、暴力/性内容分级、种族敏感内容
- **DramaBox**：全球分发平台，注意多地区合规差异、宗教敏感内容
- **ShortMax**：北美+东南亚市场，注意文化差异、政治敏感话题
- **FlexTV**：北美市场，注意美国FTC广告法规、AI内容标识要求
- **TikTok**：全球短视频平台，注意各地区内容审核差异、AI标识、版权
- **YouTube Shorts**：全球覆盖，注意YouTube社区准则、版权声明、年龄限制

### 出海合规特殊关注
- 北美：COPPA儿童保护法、FTC广告法规、种族/性别平等
- 欧洲：GDPR数据保护、内容分级制度、仇恨言论法规
- 中东：宗教敏感（猪、酒精、暴露着装）、政治敏感
- 东南亚：王室/宗教/政治敏感话题、本地化要求
- 跨文化：避免种族歧视、宗教冒犯、政治争议、中式梗直译`;

const OVERSEAS_PLATFORM_SUITABILITY = `"platformSuitability": {
      "reelShort": {"status": "suitable|needs_modification|unsuitable", "issues": [], "suggestions": []},
      "dramaBox": {"status": "suitable|needs_modification|unsuitable", "issues": [], "suggestions": []},
      "shortMax": {"status": "suitable|needs_modification|unsuitable", "issues": [], "suggestions": []},
      "flexTV": {"status": "suitable|needs_modification|unsuitable", "issues": [], "suggestions": []},
      "tiktok": {"status": "suitable|needs_modification|unsuitable", "issues": [], "suggestions": []},
      "youtubeShorts": {"status": "suitable|needs_modification|unsuitable", "issues": [], "suggestions": []}
    }`;

const OVERSEAS_PLATFORM_CHANGES = `"platformSpecificChanges": {
    "reelShort": ["ReelShort平台特定修改（如有）"],
    "dramaBox": ["DramaBox平台特定修改（如有）"],
    "shortMax": ["ShortMax平台特定修改（如有）"],
    "tiktok": ["TikTok平台特定修改（如有）"]
  },`;

export function getRiskDetailedPrompt(marketType: MarketType = 'domestic'): string {
  const isOverseas = marketType === 'overseas';
  const platformSection = isOverseas ? OVERSEAS_RISK_PLATFORMS : DOMESTIC_RISK_PLATFORMS;
  const suitabilityJson = isOverseas ? OVERSEAS_PLATFORM_SUITABILITY : DOMESTIC_PLATFORM_SUITABILITY;
  const changesJson = isOverseas ? OVERSEAS_PLATFORM_CHANGES : DOMESTIC_PLATFORM_CHANGES;

  return `## 任务：AI漫剧风险评估

请对以下AI漫剧剧本进行风险评估。${isOverseas ? '本剧本面向海外市场（出海），请重点评估跨文化合规性和各海外平台的适配性。' : ''}

${platformSection}

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
        "type": "${isOverseas ? '文化敏感|宗教|种族|版权|AI生成|暴力|色情|政治' : '暴力|色情|政治|低俗|其他'}",
        "severity": "critical|high|medium|low",
        "content": "问题内容描述",
        "suggestion": "修改建议",
        "affectedPlatforms": ["平台1", "平台2"]
      }
    ],
    ${suitabilityJson}
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
  ${changesJson}
  "marketRisks": [
    {
      "type": "market",
      "severity": "medium|high|low",
      "description": "${isOverseas ? '海外市场风险描述' : '市场风险描述'}",
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
  ],${isOverseas ? `
  "platformRisks": [
    {
      "type": "platform_policy",
      "severity": "medium",
      "description": "海外平台政策风险描述",
      "affectedPlatforms": ["ReelShort", "DramaBox"],
      "suggestion": "应对建议"
    }
  ],` : ''}
  "canPublish": true,
  "requiredChanges": ["必须修改项1（如有）"],
  "recommendedChanges": ["建议修改项1", "建议修改项2"],
  "valueOrientation": {
    "mainTheme": "核心主题",
    "positiveElements": ["正面元素1", "正面元素2"],
    "concerns": ["顾虑点1（如有）"],
    "moralClosure": "${isOverseas ? '道德闭环是否符合海外观众价值观' : '善恶有报是否完整'}",
    "score": 88
  },
  "ageRating": {
    "suggested": "${isOverseas ? 'PG|PG-13|R|NC-17' : '12+|15+|18+'}",
    "reason": "分级理由",
    "platformImplications": "平台影响说明"
  }
}
\`\`\``;
}

// 保留旧名称兼容（默认国内）
export const RISK_DETAILED_PROMPT = getRiskDetailedPrompt('domestic');

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
