/**
 * 国际化标签映射
 * 用于 UI 和导出报告的中英文切换
 */

export type OutputLanguage = 'zh' | 'en';

interface Labels {
  // 报告标题
  reportTitle: string;
  reportSubtitle: string;
  scriptLabel: string;
  dateLabel: string;
  overallScoreLabel: string;
  gradeUnit: string;

  // 执行摘要
  executiveSummary: string;
  genreLabel: string;
  themesLabel: string;
  oneSentenceLabel: string;
  plotSummaryLabel: string;
  coreConclusion: string;
  oneSentenceSummary: string;

  // 详细分析大标题
  detailedAnalysis: string;
  sectionA: string;
  sectionASubtitle: string;
  sectionB: string;
  sectionBSubtitle: string;
  sectionC: string;
  sectionCSubtitle: string;
  sectionD: string;
  sectionDSubtitle: string;

  // 维度名称
  dimensions: Record<string, string>;

  // 内容区块标题
  analysisTitle: string;
  keyFindingsTitle: string;
  evidenceTitle: string;
  strengthsTitle: string;
  improvementsTitle: string;

  // 可操作建议
  actionableRecommendations: string;

  // 商业闭环
  businessClosedLoop: string;
  targetPositioning: string;
  monetizationPath: string;
  launchPlan: string;
  kpiDashboard: string;
  kpiMetric: string;
  kpiTarget: string;
  kpiWindow: string;
  kpiOwner: string;
  validationExperiments: string;
  riskMitigation: string;
  nextQuarterGoal: string;

  // 改进建议（基础模式）
  improvementSection: string;
  criticalChanges: string;
  suggestedChanges: string;
  basicDimensions: string;
  suggestions: string;

  // 等级标签
  gradeLabels: Record<string, string>;

  // 报告页脚
  footerLine1: string;
  footerLine2: string;

  // 空值占位
  noAnalysis: string;
}

const ZH_LABELS: Labels = {
  reportTitle: 'AI智能诊断｜商业适配度·结构风险·变现潜力',
  reportSubtitle: '剧本评级报告',
  scriptLabel: '剧本名称',
  dateLabel: '生成日期',
  overallScoreLabel: '总体潜力评分',
  gradeUnit: '级',

  executiveSummary: 'I. 执行摘要',
  genreLabel: '频类',
  themesLabel: '题材',
  oneSentenceLabel: '一句话介绍',
  plotSummaryLabel: '剧情主线',
  coreConclusion: '核心结论',
  oneSentenceSummary: '一句话总评',

  detailedAnalysis: 'II. 详细分析',
  sectionA: 'A. 市场共鸣与竞争定位',
  sectionASubtitle: '分析剧本与目标市场的契合度',
  sectionB: 'B. 叙事与剧本基因',
  sectionBSubtitle: '评估剧本的核心创作质量',
  sectionC: 'C. 商业化潜力',
  sectionCSubtitle: '评估剧本的商业变现能力',
  sectionD: 'D. 合规性评估',
  sectionDSubtitle: '审查内容安全与价值导向',

  dimensions: {
    targetAudience: '目标受众定位',
    originality: '原创性评分',
    trendAlignment: '当下热播契合度',
    narrativeLogic: '叙事逻辑',
    hookStrength: '钩子强度',
    pleasureDesign: '爽点设计',
    pacingStructure: '节奏与结构',
    plotCoherence: '主线连贯性',
    characterization: '人物塑造',
    dialogueQuality: '对白质量',
    suspenseEffectiveness: '悬念有效性',
    userStickiness: '用户粘性',
    viralPotential: '传播潜力',
    contentCompliance: '内容合规性',
    valueOrientation: '价值观导向',
  },

  analysisTitle: '综合分析',
  keyFindingsTitle: '关键发现',
  evidenceTitle: '原文引用',
  strengthsTitle: '优势亮点',
  improvementsTitle: '可打磨点',

  actionableRecommendations: 'III. 综合可操作建议',
  businessClosedLoop: 'IV. 商业化闭环方案',
  targetPositioning: '目标定位',
  monetizationPath: '变现路径',
  launchPlan: '上线节奏',
  kpiDashboard: '核心KPI看板',
  kpiMetric: '指标',
  kpiTarget: '目标',
  kpiWindow: '周期',
  kpiOwner: '负责人',
  validationExperiments: '验证实验',
  riskMitigation: '风险与兜底',
  nextQuarterGoal: '下一季度目标',

  improvementSection: 'III. 改进建议',
  criticalChanges: '必须修改',
  suggestedChanges: '建议修改',
  basicDimensions: 'II. 维度分析',
  suggestions: '建议',

  gradeLabels: {
    S: 'S级（爆款潜力）',
    'A+': 'A+级（高质量剧本）',
    A: 'A级（优质剧本）',
    B: 'B级（良好剧本）',
    C: 'C级（待完善）',
    D: 'D级（需要大幅修改）',
  },

  footerLine1: '本报告由 AI 剧本评级系统自动生成',
  footerLine2: '评估仅供参考，不构成投资建议',

  noAnalysis: '暂无详细分析，请重新运行以获取完整评估。',
};

const EN_LABELS: Labels = {
  reportTitle: 'AI Script Diagnostic | Commercial Fit · Structural Risk · Monetization Potential',
  reportSubtitle: 'Script Rating Report',
  scriptLabel: 'Script Name',
  dateLabel: 'Generated',
  overallScoreLabel: 'Overall Potential Score',
  gradeUnit: '',

  executiveSummary: 'I. Executive Summary',
  genreLabel: 'Genre',
  themesLabel: 'Themes',
  oneSentenceLabel: 'One-liner',
  plotSummaryLabel: 'Plot Summary',
  coreConclusion: 'Core Conclusion',
  oneSentenceSummary: 'One-line Summary',

  detailedAnalysis: 'II. Detailed Analysis',
  sectionA: 'A. Market Resonance & Competitive Positioning',
  sectionASubtitle: 'Analyzing script-market fit',
  sectionB: 'B. Narrative DNA & Script Quality',
  sectionBSubtitle: 'Evaluating core creative quality',
  sectionC: 'C. Commercial Potential',
  sectionCSubtitle: 'Assessing monetization capability',
  sectionD: 'D. Compliance Assessment',
  sectionDSubtitle: 'Reviewing content safety & value orientation',

  dimensions: {
    targetAudience: 'Target Audience Fit',
    originality: 'Originality Score',
    trendAlignment: 'Trend Alignment',
    narrativeLogic: 'Narrative Logic',
    hookStrength: 'Hook Strength',
    pleasureDesign: 'Pleasure Point Design',
    pacingStructure: 'Pacing & Structure',
    plotCoherence: 'Plot Coherence',
    characterization: 'Characterization',
    dialogueQuality: 'Dialogue Quality',
    suspenseEffectiveness: 'Suspense Effectiveness',
    userStickiness: 'User Stickiness',
    viralPotential: 'Viral Potential',
    contentCompliance: 'Content Compliance',
    valueOrientation: 'Value Orientation',
  },

  analysisTitle: 'Analysis',
  keyFindingsTitle: 'Key Findings',
  evidenceTitle: 'Evidence',
  strengthsTitle: 'Strengths',
  improvementsTitle: 'Areas for Improvement',

  actionableRecommendations: 'III. Actionable Recommendations',
  businessClosedLoop: 'IV. Business Closed-Loop Plan',
  targetPositioning: 'Target Positioning',
  monetizationPath: 'Monetization Path',
  launchPlan: 'Launch Plan',
  kpiDashboard: 'KPI Dashboard',
  kpiMetric: 'Metric',
  kpiTarget: 'Target',
  kpiWindow: 'Timeframe',
  kpiOwner: 'Owner',
  validationExperiments: 'Validation Experiments',
  riskMitigation: 'Risk Mitigation',
  nextQuarterGoal: 'Next Quarter Goal',

  improvementSection: 'III. Improvement Suggestions',
  criticalChanges: 'Critical Changes Required',
  suggestedChanges: 'Suggested Changes',
  basicDimensions: 'II. Dimension Analysis',
  suggestions: 'Suggestions',

  gradeLabels: {
    S: 'S-Tier (Blockbuster Potential)',
    'A+': 'A+-Tier (High Quality)',
    A: 'A-Tier (Quality Script)',
    B: 'B-Tier (Good Script)',
    C: 'C-Tier (Needs Work)',
    D: 'D-Tier (Major Revision Needed)',
  },

  footerLine1: 'This report was generated by the AI Script Rating System',
  footerLine2: 'For reference only — not investment advice',

  noAnalysis: 'No detailed analysis available. Please re-run for a complete assessment.',
};

/** 获取指定语言的标签 */
export function getLabels(lang: OutputLanguage): Labels {
  return lang === 'en' ? EN_LABELS : ZH_LABELS;
}

/** 获取等级标签 */
export function getGradeLabelByLang(grade: string, lang: OutputLanguage): string {
  const labels = getLabels(lang);
  return labels.gradeLabels[grade] || `${grade}${labels.gradeUnit}`;
}

/** 获取维度名称 */
export function getDimensionLabel(key: string, lang: OutputLanguage): string {
  const labels = getLabels(lang);
  return labels.dimensions[key] || key;
}
