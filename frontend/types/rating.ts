// 评级等级
export type GradeLevel = 'S' | 'A' | 'B' | 'C' | 'D';

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
