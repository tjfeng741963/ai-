// 评级等级
export type GradeLevel = 'S' | 'A' | 'B' | 'C' | 'D';

// ==================== 多类型评级系统 ====================

/** 内容类型 */
export type ContentType = 'short-drama' | 'aigc-film' | 'traditional-drama';

/** 类型化维度定义 */
export interface TypedDimension {
  key: string;
  name: string;
  weight: number;
  description: string;
}

/** 内容类型配置 */
export interface ContentTypeConfig {
  type: ContentType;
  label: string;
  description: string;
  timeRange: string;
  platform: string;
  icon: string;
  dimensions: TypedDimension[];
}

/** 三种类型的静态配置 */
export const CONTENT_TYPE_CONFIGS: ContentTypeConfig[] = [
  {
    type: 'short-drama',
    label: 'AI短剧',
    description: '快速爽感、视觉冲击、传播价值',
    timeRange: '3-15分钟',
    platform: '抖音、快手、小红书',
    icon: '⚡',
    dimensions: [
      { key: 'pleasureDensity', name: '爽点密度', weight: 0.15, description: '每分钟的反转/打脸/情感高潮数量' },
      { key: 'visualImpact', name: '视觉冲击力', weight: 0.12, description: '画面、特效、镜头感的视觉吸引力' },
      { key: 'hookSystem', name: '钩子系统', weight: 0.12, description: '反转的有效性和设计' },
      { key: 'pacingTightness', name: '节奏紧凑度', weight: 0.10, description: '是否存在冗余段落' },
      { key: 'emotionalBurst', name: '情感爆发点', weight: 0.10, description: '情感高潮的设计和执行' },
      { key: 'densityTone', name: '密度基调系统', weight: 0.10, description: '密度和基调的执行' },
      { key: 'openingAttraction', name: '开场吸引力', weight: 0.08, description: '前3秒是否能抓住观众' },
      { key: 'endingMemory', name: '结尾记忆点', weight: 0.08, description: '最后一幕是否能形成传播点' },
      { key: 'styleConsistency', name: '画风一致性', weight: 0.08, description: '画风表现是否符合选定风格' },
      { key: 'compliance', name: '内容合规性', weight: 0.07, description: '是否符合平台规范' },
    ],
  },
  {
    type: 'aigc-film',
    label: 'AIGC影片',
    description: '完整故事、视觉表现、情感体验',
    timeRange: '15-45分钟',
    platform: '视频网站、流媒体平台',
    icon: '🎬',
    dimensions: [
      { key: 'storyCompleteness', name: '故事完整性', weight: 0.15, description: '故事弧线、因果链、情节递进' },
      { key: 'visualExpression', name: '视觉表现力', weight: 0.14, description: '画面质量、特效、美术设计' },
      { key: 'emotionalProgression', name: '情感递进', weight: 0.12, description: '情感高潮的分布和深度' },
      { key: 'pacingControl', name: '节奏控制', weight: 0.12, description: '高潮分布、节奏曲线' },
      { key: 'styleConsistency', name: '画风一致性', weight: 0.10, description: '画风表现是否符合选定风格' },
      { key: 'hookSystem', name: '钩子系统', weight: 0.10, description: '悬念设计、反转有效性' },
      { key: 'densityTone', name: '密度基调系统', weight: 0.10, description: '密度和基调的执行' },
      { key: 'characterization', name: '人物塑造', weight: 0.08, description: '主要人物的成长和塑造' },
      { key: 'worldBuilding', name: '世界观完整性', weight: 0.05, description: '设定自洽性、地理环境' },
      { key: 'compliance', name: '内容合规性', weight: 0.04, description: '是否符合平台规范' },
    ],
  },
  {
    type: 'traditional-drama',
    label: '传统影视剧',
    description: '深度叙事、人物塑造、主题表达',
    timeRange: '30分钟+',
    platform: '电视、流媒体平台',
    icon: '🎭',
    dimensions: [
      { key: 'storyArcDepth', name: '故事弧线深度', weight: 0.14, description: '主线和支线的因果链、情节递进' },
      { key: 'worldBuilding', name: '世界观完整性', weight: 0.12, description: '时代背景、地理环境、社会规则' },
      { key: 'characterization', name: '人物塑造', weight: 0.12, description: '人物成长、性格塑造、关系发展' },
      { key: 'foreshadowing', name: '伏笔系统', weight: 0.10, description: '伏笔数量、埋设、揭露时机' },
      { key: 'themeExpression', name: '主题表达', weight: 0.10, description: '主题的深度和表达方式' },
      { key: 'hookSystem', name: '钩子系统', weight: 0.10, description: '悬念设计、反转有效性' },
      { key: 'densityTone', name: '密度基调系统', weight: 0.10, description: '密度和基调的执行' },
      { key: 'styleConsistency', name: '画风一致性', weight: 0.08, description: '画风表现是否符合选定风格' },
      { key: 'pacingControl', name: '节奏控制', weight: 0.08, description: '高潮分布、节奏曲线' },
      { key: 'compliance', name: '内容合规性', weight: 0.06, description: '是否符合平台规范' },
    ],
  },
];

/** 根据类型获取配置 */
export function getContentTypeConfig(type: ContentType): ContentTypeConfig {
  const config = CONTENT_TYPE_CONFIGS.find((c) => c.type === type);
  if (!config) throw new Error(`未知的内容类型: ${type}`);
  return config;
}

/** 根据类型获取维度 key 到 name 的映射 */
export function getTypedDimensionLabels(type: ContentType): Record<string, string> {
  const config = getContentTypeConfig(type);
  return Object.fromEntries(config.dimensions.map((d) => [d.key, d.name]));
}

// ==================== 类型化评级结果 ====================

/** 类型化维度评分 */
export interface TypedDimensionScore {
  score: number;
  weight: number;
  weighted: number;
  analysis: string;
  evidence?: string[];
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
}

/** 类型化评级结果 */
export interface TypedRatingResult {
  contentType: ContentType;
  overallScore: number;
  overallGrade: GradeLevel;
  gradeLabel: string;
  dimensions: Record<string, TypedDimensionScore>;
  summary: {
    oneSentence: string;
    paragraph: string;
  };
  highlights: {
    top3Strengths: string[];
    uniqueSellingPoints: string[];
    bestScenes: string[];
  };
  improvements: {
    critical: string[];
    important: string[];
    optional: string[];
  };
  risks: {
    compliance: string[];
    market: string[];
    production: string[];
  };
}

// 维度评分
export interface DimensionScore {
  score: number;
  weight: number;
  weighted: number;
  analysis: string;
  evidence?: string[];
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
}

// 评级结果
export interface RatingResult {
  overallScore: number;
  overallGrade: GradeLevel;
  gradeLabel: string;
  dimensions: {
    hookPower: DimensionScore;          // 钩子强度
    pleasurePoints: DimensionScore;     // 爽点设计
    pacingStructure: DimensionScore;    // 节奏与结构
    suspenseEffect: DimensionScore;     // 悬念有效性
    conflictDesign: DimensionScore;     // 冲突设计
    characterization: DimensionScore;   // 人物塑造
    dialogueQuality: DimensionScore;    // 对白质���
    plotCoherence: DimensionScore;      // 主线连贯性
    targetAudience: DimensionScore;     // 目标受众
    trendAlignment: DimensionScore;     // 热播契合度
    viralPotential: DimensionScore;     // 传播潜力
    commercialValue: DimensionScore;    // 商业价���
    compliance: DimensionScore;         // 内容合规性
    valueOrientation: DimensionScore;   // 价值观导向
    originality: DimensionScore;        // 原创性
    userStickiness: DimensionScore;     // 用户粘性
  };
  summary: {
    oneSentence: string;
    paragraph: string;
  };
  highlights: {
    top3Strengths: string[];
    uniqueSellingPoints: string[];
    bestScenes: string[];
  };
  improvements: {
    critical: string[];
    important: string[];
    optional: string[];
  };
  risks: {
    compliance: string[];
    market: string[];
    production: string[];
  };
}

// 评级状态
export type RatingStatus = 'idle' | 'analyzing' | 'completed' | 'error';

// 维度中文名映射
export const DIMENSION_LABELS: Record<string, string> = {
  hookPower: '钩子强度',
  pleasurePoints: '爽点设计',
  pacingStructure: '节奏与结构',
  suspenseEffect: '悬念有效性',
  conflictDesign: '冲突设计',
  characterization: '人物塑造',
  dialogueQuality: '对白质量',
  plotCoherence: '主线连贯性',
  targetAudience: '目标受众',
  trendAlignment: '热播契合度',
  viralPotential: '传播潜力',
  commercialValue: '商业价值',
  compliance: '内容合规性',
  valueOrientation: '价值观导向',
  originality: '原创性',
  userStickiness: '用户粘性',
};

// 等级配置
export const GRADE_CONFIG: Record<GradeLevel, { label: string; color: string; bgColor: string }> = {
  S: { label: '爆款潜力', color: 'text-red-500', bgColor: 'bg-red-50' },
  A: { label: '优质剧本', color: 'text-orange-500', bgColor: 'bg-orange-50' },
  B: { label: '良好剧本', color: 'text-blue-500', bgColor: 'bg-blue-50' },
  C: { label: '待完善', color: 'text-gray-500', bgColor: 'bg-gray-50' },
  D: { label: '需大幅修改', color: 'text-gray-400', bgColor: 'bg-gray-100' },
};
