/**
 * 分块Prompt模板
 *
 * 当大阶段需要拆分为子组时，使用这些模板生成子组的prompt。
 * 每个子组prompt只包含对应维度的分析要求和输出格式。
 */

const DIMENSION_DESCRIPTIONS: Record<string, { name: string; desc: string; example: string }> = {
  // NarrativeDNA 8维度
  narrativeLogic: {
    name: '叙事逻辑',
    desc: '因果链、逻辑闭环、合理性',
    example: '"narrativeLogic": { "score": 85, "grade": "A", "analysis": "世界观设定自洽，因果链明确，逻辑闭环完整...(200-400字详细分析)", "keyFindings": ["因果链完整度高", "角色动机一致性强"], "evidence": ["「原文引用」（第X集）"], "strengths": ["因果链设计严密"], "improvements": [] }',
  },
  hookStrength: {
    name: '钩子强度',
    desc: '开篇5秒吸引力、每集结尾悬念、整体悬念架构',
    example: '"hookStrength": { "score": 88, "grade": "A", "analysis": "第1集开篇钩子极强...(200-400字详细分析)", "keyFindings": ["开篇钩子结构完整", "每集结尾悬念有效"], "evidence": ["「原文引用」（第1集）"], "strengths": ["开篇5秒抓住注意力"], "improvements": ["建议第X集增强结尾悬念"] }',
  },
  pleasureDesign: {
    name: '爽点设计',
    desc: '爽点类型、密度、节奏、强度递进',
    example: '"pleasureDesign": { "score": 80, "grade": "A", "analysis": "最强爽点出现在第X集...(200-400字详细分析)", "keyFindings": ["核心爽点击中受众需求", "爽点密度前高后低"], "evidence": ["「原文引用」（第X集）"], "strengths": ["核心爽点设计精准"], "improvements": ["建议中后期增加小爽点"] }',
  },
  pacingStructure: {
    name: '节奏与结构',
    desc: 'AI漫剧的快节奏适配性、分集结构',
    example: '"pacingStructure": { "score": 82, "grade": "A", "analysis": "采用六段式结构...(200-400字详细分析)", "keyFindings": ["结构完整", "前X集节奏紧凑"], "evidence": ["「原文引用」（第X集）"], "strengths": ["结构完整，节奏适合AI漫剧"], "improvements": ["建议压缩某段对话密度"] }',
  },
  plotCoherence: {
    name: '主线连贯性',
    desc: '多线交织、结局收束、主线清晰度',
    example: '"plotCoherence": { "score": 86, "grade": "A", "analysis": "核心主线聚焦...(200-400字详细分析)", "keyFindings": ["主线清晰聚焦", "结尾设计兼顾完整与延展"], "evidence": ["「原文引用」（第X集）"], "strengths": ["主线不散，叙事聚焦"], "improvements": [] }',
  },
  characterization: {
    name: '人物塑造',
    desc: '角色鲜明度、弧线完整度、AI绘制适配性',
    example: '"characterization": { "score": 83, "grade": "A", "analysis": "主角人设具备反差层次...(200-400字详细分析)", "keyFindings": ["主角反差层次丰富", "配角弧线需完善"], "evidence": ["「原文引用」（第X集）"], "strengths": ["主角记忆点鲜明"], "improvements": ["建议强化某角色主动性"] }',
  },
  dialogueQuality: {
    name: '对白质量',
    desc: '金句密度、配音适配性、病毒传播潜力',
    example: '"dialogueQuality": { "score": 84, "grade": "A", "analysis": "金句密度达标...(200-400字详细分析)", "keyFindings": ["金句具备传播潜力", "台词反差感突出"], "evidence": ["「某角色金句」（第X集）"], "strengths": ["金句设计利于传播"], "improvements": ["建议压缩长句"] }',
  },
  suspenseEffectiveness: {
    name: '悬念有效性',
    desc: '悬念设置、维持、回收',
    example: '"suspenseEffectiveness": { "score": 75, "grade": "B", "analysis": "开篇悬念设置有效...(200-400字详细分析)", "keyFindings": ["开篇悬念有效", "结尾悬念参差不齐"], "evidence": ["「原文引用」（第1集）"], "strengths": ["核心悬念吸引力强"], "improvements": ["建议避免悬念手法重复"] }',
  },
  // Commercial 4维度
  userStickiness: {
    name: '用户粘性',
    desc: '上瘾机制、追更动力、付费转化点',
    example: '"userStickiness": { "score": 78, "grade": "B", "analysis": "粘性基础扎实...(200-400字详细分析)", "keyFindings": ["天然粘性基础好", "中后期留存风险"], "evidence": ["「原文引用」（第X集）"], "strengths": ["适合碎片化消费"], "improvements": ["建议增加情感锚点"] }',
  },
  viralPotential: {
    name: '传播潜力',
    desc: '出圈场景、话题性、UGC潜力',
    example: '"viralPotential": { "score": 80, "grade": "A", "analysis": "最强UGC传播点...(200-400字详细分析)", "keyFindings": ["核心传播点冲击力强", "缺乏视觉符号"], "evidence": ["「原文引用」（第X集）"], "strengths": ["二创传播潜力大"], "improvements": ["建议设计视觉符号"] }',
  },
  contentCompliance: {
    name: '内容合规',
    desc: '各平台审核通过率预估',
    example: '"contentCompliance": { "score": 88, "grade": "A", "analysis": "暴力尺度控制得当...(200-400字详细分析)", "keyFindings": ["暴力尺度合规", "冲突解决合理"], "evidence": ["「原文引用」（第X集）"], "strengths": ["符合平台审核标准"], "improvements": [] }',
  },
  valueOrientation: {
    name: '价值导向',
    desc: '正向价值、道德闭环',
    example: '"valueOrientation": { "score": 90, "grade": "S", "analysis": "核心价值观与主流导向高度契合...(200-400字详细分析)", "keyFindings": ["价值观契合主流", "道德闭环完整"], "evidence": ["「原文引用」（第X集）"], "strengths": ["正能量传播潜力大"], "improvements": [] }',
  },
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

  const dimExamples = dimensions
    .map((dim) => {
      const info = DIMENSION_DESCRIPTIONS[dim];
      return info ? `  ${info.example}` : `  "${dim}": { "score": 0, "grade": "D", "analysis": "", "keyFindings": [], "evidence": [], "strengths": [], "improvements": [] }`;
    })
    .join(',\n');

  return `## 任务：${phaseTitle}详细分析（部分维度）

请对以下AI漫剧剧本进行以下维度的分析：

${dimDescriptions}

## 剧本内容
${scriptContent}

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

## 输出格式（严格JSON，仅输出以下维度）
\`\`\`json
{
${dimExamples}
}
\`\`\`

## 强制输出约束（必须满足）
1. 仅输出合法JSON对象，不要输出代码块，不要输出额外解释。
2. 所有字段必须与要求一致，禁止省略关键字段。
3. analysis字段必须是200-400字的完整分析段落，不能为空字符串。
4. keyFindings必须有3-5条关键发现，每条50-80字。
5. 若信息不足，请用空数组或明确字符串说明，不要擅自删字段。`;
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
