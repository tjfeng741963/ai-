import type { RatingResult, DimensionScore, GradeLevel } from './rating.ts';

// ==================== 世界观分析（新增） ====================

/** 力量体系 */
export interface PowerSystem {
  exists: boolean;
  description: string;
  levels: string[];
  rules: string[];
  clarity: number;          // 清晰度 1-10
}

/** 社会架构 */
export interface SocialStructure {
  description: string;
  factions: string[];
  conflicts: string[];
}

/** 世界观一致性 */
export interface WorldConsistency {
  score: number;
  issues: string[];
  strengths: string[];
}

/** IP延展潜力 */
export interface IPPotential {
  score: number;
  sequelPossibility: 'high' | 'medium' | 'low';
  spinoffIdeas: string[];
  merchandisePotential: string[];
}

/** 世界观分析 */
export interface WorldBuilding {
  type: string;             // 世界观类型：都市|玄幻|穿越|末日|仙侠|科幻|校园|职场|古风|现代甜宠
  powerSystem: PowerSystem;
  socialStructure: SocialStructure;
  uniqueElements: string[];
  consistency: WorldConsistency;
  ipPotential: IPPotential;
  worldBuildingScore: number;
  analysis: string;
}

// ==================== 人物分析 ====================

/** 角色类型 */
export type CharacterRole = 'protagonist' | 'antagonist' | 'supporting' | 'minor';

/** 视觉特征（AI绘制用） */
export interface VisualTraits {
  description: string;
  distinctiveFeatures: string[];
  costumeKeywords: string[];
}

/** 角色信息 */
export interface Character {
  id: string;
  name: string;
  role: CharacterRole;
  arcType: string;           // 角色弧线类型，如"逆袭翻身"、"从弱变强"
  motivation: string;        // 核心动机
  flaw: string;              // 性格缺陷
  emotionalArc: string;      // 情感变化描述
  memorableTraits: string[]; // 记忆点特征
  visualTraits?: VisualTraits; // AI绘制用的视觉特征
  score: number;             // 角色塑造评分 1-10
}

/** 角色关系 */
export interface CharacterRelationship {
  from: string;              // 起始角色ID
  to: string;                // 目标角色ID
  type: string;              // 关系类型：甜宠CP|虐恋CP|宿敌|师徒等
  tension: 'high' | 'medium' | 'low';  // 张力程度
  cpPotential?: 'high' | 'medium' | 'low' | 'none'; // CP感
  description: string;       // 关系描述
}

/** CP化学反应 */
export interface CPChemistry {
  mainCP: string;
  cpType: string;
  sugarMoments: string[];
  score: number;
}

/** 人物分析结果 */
export interface CharacterAnalysis {
  characters: Character[];
  relationships: CharacterRelationship[];
  relationshipDensity: number;  // 关系密度 0-1
  conflictStructure: string;    // 冲突结构描述
  voiceDistinction: 'excellent' | 'good' | 'fair' | 'poor';  // 语言区分度
  goldenLines: Array<{
    character: string;
    line: string;
    context: string;
    viralPotential?: 'high' | 'medium' | 'low';
  }>;
  cpChemistry?: CPChemistry;
  visualDistinctiveness?: number; // AI绘制辨识度
}

// ==================== 情绪分析 ====================

/** 情绪类型 */
export type EmotionType =
  | 'tension'      // 紧张
  | 'relief'       // 舒缓
  | 'climax'       // 高潮
  | 'resolution'   // 解决
  | 'hook'         // 钩子
  | 'twist'        // 反转
  | 'tearjerker'   // 催泪
  | 'comedy'       // 搞笑
  | 'romance';     // 浪漫

/** 情绪曲线点 */
export interface EmotionPoint {
  position: number;          // 剧本位置 0-100%
  emotion: EmotionType;
  intensity: number;         // 强度 1-10
  event: string;             // 关联事件
  description: string;       // 描述
  isPeak: boolean;           // 是否为峰值点
}

/** 爽点类型（扩展） */
export type PleasureType =
  | 'reversal'     // 反转
  | 'faceslap'     // 打脸
  | 'revenge'      // 复仇
  | 'levelup'      // 升级
  | 'revelation'   // 揭秘
  | 'reunion'      // 重逢
  | 'sacrifice'    // 牺牲
  | 'showoff';     // 装逼

/** 爽点/爆点 */
export interface PleasurePoint {
  position: number;          // 位置 0-100%
  type: PleasureType | string;
  power: number;             // 爽感强度 1-10
  description: string;
  technique: string;         // 使用的技法
  viralPotential?: 'high' | 'medium' | 'low';
}

/** 爽点密度评估 */
export interface PleasurePointDensity {
  perEpisode: number;
  assessment: string;
  suggestion: string;
}

/** 题材标签 */
export interface GenreTags {
  primary: string;
  secondary: string[];
  platformTags: string[];
}

/** 上瘾指数 */
export interface AddictionIndex {
  score: number;
  factors: string[];
  bingePotential: 'high' | 'medium' | 'low';
}

/** 情绪分析结果 */
export interface EmotionAnalysis {
  emotionCurve: EmotionPoint[];
  overallArc: string;        // 整体情绪走势
  majorPleasurePoints: PleasurePoint[];
  minorPleasurePoints: PleasurePoint[];
  pleasurePointDensity: string | PleasurePointDensity;
  emotionTags: string[];     // 情感标签
  genreTags?: GenreTags;     // 题材标签
  targetFeeling: string;     // 目标观众情绪体验
  emotionIntensityAvg: number;
  addictionIndex?: AddictionIndex;
}

// ==================== 结构分析 ====================

/** 幕结构 */
export interface ActBreakdown {
  act: number;               // 第几幕
  name: string;              // 幕名称
  percentage: number;        // 占比百分比
  sceneCount?: number;       // 场景数
  episodeRange?: string;     // 集数范围
  keyEvents: string[];       // 关键事件
  quality: string;           // 质量评价
  pacing: 'fast' | 'medium' | 'slow';  // 节奏
  hookStrength?: number;     // 钩子强度
}

/** 转折点 */
export interface TurningPoint {
  position: number;          // 位置 0-100%
  type: 'inciting_incident' | 'first_plot_point' | 'midpoint' | 'second_plot_point' | 'climax' | 'resolution';
  name: string;
  description: string;
  pleasurePower?: number;    // 爽感强度
}

/** 悬念 */
export interface Suspense {
  id: string;
  type: 'main' | 'sub';      // 主悬念/次级悬念
  question: string;          // 悬念问题
  setupPosition: number;     // 设置位置
  resolvePosition: number | null;  // 解答位置，null表示未解答
  isResolved: boolean;
}

/** 分集结构 */
export interface EpisodeStructure {
  suggestedEpisodeCount: number;
  avgEpisodeLength: string;
  cliffhangerRate: number;
  openingHookQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

/** AI漫剧适配性 */
export interface AIComicSuitability {
  score: number;
  strengths: string[];
  challenges: string[];
  suggestions: string[];
}

/** 结构分析结果 */
export interface StructureAnalysis {
  worldBuilding?: WorldBuilding;  // 世界观分析
  actStructure: ActBreakdown[];
  turningPoints: TurningPoint[];
  totalScenes?: number;
  averageSceneLength?: string;
  episodeStructure?: EpisodeStructure;
  hookPositions: number[];   // 钩子位置
  cliffhangerCount: number;  // 悬崖钩子数量
  suspenses: Suspense[];
  foreshadowRecoveryRate: number;  // 伏笔回收率 0-100%
  structureType: string;     // 结构类型
  aiComicSuitability?: AIComicSuitability;
}

// ==================== 市场分析（AI漫剧版） ====================

/** 受众画像 */
export interface AudienceProfile {
  gender: 'male' | 'female' | 'neutral';
  genderRatio?: string;      // 性别比例描述
  ageRange: string;          // 如 "25-45"
  primaryAge?: string;       // 核心年龄段
  interests: string[];
  psychographics: string;    // 心理特征描述
  consumption?: string;      // 付费意愿描述
  marketSize: 'large' | 'medium' | 'niche' | 'mass' | 'micro';
}

/** 平台推荐 */
export interface PlatformRecommendation {
  platform: string;
  suitability: 'high' | 'medium' | 'low';
  reason: string;
  expectedRevenue?: string;
}

/** 定价建议 */
export interface PriceSuggestion {
  perEpisode: string;
  fullSeason: string;
  reasoning: string;
}

/** 收益预测 */
export interface RevenueProjection {
  tier: 'S' | 'A' | 'B' | 'C';
  description: string;
  paymentConversion?: string;
  adRevenue?: string;
  totalEstimate?: string;
}

/** 市场建议 */
export interface MarketSuggestion {
  suggestedPriceRange: string | PriceSuggestion;
  targetPlatforms: string[] | PlatformRecommendation[];
  marketingAngles: string[];
  titleSuggestions?: string[];
  coverScenes?: string[];
  similarHits: Array<{
    title: string;
    platform?: string;
    views?: string;
    similarity: number;
    learnableAspects: string[];
    differentiators?: string[];
  }>;
  audienceProfile: AudienceProfile;
  trendMatch: {
    hotElements: string[];
    currentTrends?: string[];
    missingElements: string[];
    competitionLevel: 'high' | 'medium' | 'low';
    timingScore?: number;
    differentiators: string[];
  };
  viralPotential: {
    score: number;
    viralScenes: string[];
    clipPotential?: 'high' | 'medium' | 'low';
    cpPotential: 'high' | 'medium' | 'low';
    memeability: 'high' | 'medium' | 'low';
    hashtagSuggestions?: string[];
  };
  commercialValue?: {
    ipPotential: 'high' | 'medium' | 'low';
    worldBuildingDepth: number;
    merchandisePotential: string[];
    adaptationDifficulty: 'low' | 'medium' | 'high';
  };
  revenueProjection?: RevenueProjection;
}

// ==================== 风险评估（AI漫剧版） ====================

/** 风险项 */
export interface RiskItem {
  type: 'compliance' | 'market' | 'production' | 'platform_policy';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  location?: string;
  affectedPlatforms?: string[];
  suggestion: string;
}

/** AI内容合规 */
export interface AIContentCompliance {
  needsAILabel: boolean;
  deepfakeRisk: 'low' | 'medium' | 'high';
  copyrightRisk: {
    level: 'low' | 'medium' | 'high';
    concerns: string[];
    suggestions: string[];
  };
  likenessRisk: {
    level: 'low' | 'medium' | 'high';
    concerns: string[];
    suggestions: string[];
  };
}

/** 平台合规状态 */
export interface PlatformComplianceStatus {
  status: 'suitable' | 'needs_modification' | 'unsuitable';
  issues: string[];
  suggestions: string[];
}

/** 合规审查结果 */
export interface ComplianceResult {
  overallRisk: 'high' | 'medium' | 'low';
  passRate: number;
  issues: Array<{
    location: string;
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    content: string;
    suggestion: string;
    affectedPlatforms?: string[];
  }>;
  platformSuitability: {
    shortVideo?: 'suitable' | 'needs_modification' | 'unsuitable';
    longVideo?: 'suitable' | 'needs_modification' | 'unsuitable';
    cinema?: 'suitable' | 'needs_modification' | 'unsuitable';
    hongGuo?: PlatformComplianceStatus;
    fanQie?: PlatformComplianceStatus;
    douyin?: PlatformComplianceStatus;
    overseas?: PlatformComplianceStatus;
  };
}

/** 年龄分级 */
export interface AgeRating {
  suggested: string;
  reason: string;
  platformImplications?: string;
}

/** 风险评估结果 */
export interface RiskAssessment {
  compliance: ComplianceResult;
  aiContentCompliance?: AIContentCompliance;
  marketRisks: RiskItem[];
  productionRisks: RiskItem[];
  platformRisks?: RiskItem[];
  canPublish: boolean;
  requiredChanges: string[];
  recommendedChanges: string[];
  platformSpecificChanges?: {
    hongGuo?: string[];
    fanQie?: string[];
    overseas?: string[];
  };
  valueOrientation?: {
    mainTheme: string;
    positiveElements: string[];
    concerns: string[];
    moralClosure?: string;
    score: number;
  };
  ageRating?: AgeRating;
}

// ==================== 制作可行性（AI漫剧版） ====================

/** 预算等级 */
export type BudgetTier = 'S' | 'A' | 'B' | 'C';

/** 特效需求 */
export interface SpecialEffects {
  required: string[];
  difficulty: 'low' | 'medium' | 'high';
}

/** 制作成本估算 */
export interface ProductionCostEstimate {
  perEpisode: string;
  fullSeason: string;
  breakdown?: {
    aiDrawing: string;
    voiceActing: string;
    editing: string;
    other: string;
  };
}

/** 制作可行性评估 */
export interface ProductionFeasibility {
  budgetTier: BudgetTier;
  budgetDescription: string;
  aiComicDifficulty?: 'easy' | 'moderate' | 'challenging';
  difficultyReason?: string;
  sceneComplexity: number;
  characterCount?: number;
  specialEffects?: SpecialEffects;
  vfxRequirement?: 'heavy' | 'moderate' | 'light' | 'none';
  locationCount?: number;
  estimatedProductionCost?: ProductionCostEstimate;
  estimatedDays: number;
  castRequirement?: string;
  technicalChallenges: string[];
  recommendedTools?: string[];
}

// ==================== 分析阶段 ====================

/** 分析阶段状态 */
export type AnalysisPhaseStatus = 'pending' | 'in_progress' | 'completed' | 'error';

/** 分析阶段 */
export interface AnalysisPhase {
  id: string;
  name: string;
  status: AnalysisPhaseStatus;
  progress: number;
  startTime?: number;
  endTime?: number;
  duration?: number;
  error?: string;
}

/** 分析阶段列表（AI漫剧版） */
export const ANALYSIS_PHASES: Array<{ id: string; name: string; weight: number }> = [
  { id: 'structure', name: '结构与世界观分析', weight: 0.25 },
  { id: 'character', name: '人物分析', weight: 0.20 },
  { id: 'emotion', name: '情感与爽点分析', weight: 0.20 },
  { id: 'market', name: 'AI漫剧市场分析', weight: 0.20 },
  { id: 'compliance', name: 'AI内容合规审查', weight: 0.15 },
];

// ==================== 执行摘要（AI漫剧版） ====================

/** 执行摘要 */
export interface ExecutiveSummary {
  genre: '男频' | '女频' | '中性';
  subGenre?: string;         // 子类型：逆袭|甜宠|虐恋|玄幻|都市|重生|穿越|职场
  themes: string[];          // 题材标签
  platformTags?: string[];   // 平台推荐标签
  oneSentence: string;       // 一句话介绍
  plotSummary: string;       // 剧情主线概述
  coreConclusion: string;    // 核心结论
  aiComicHighlights?: string[]; // AI漫剧亮点
}

// ==================== 详细分析维度 ====================

/** 单个维度的详细分析 */
export interface DimensionDetailedAnalysis {
  score: number;
  grade: string;
  analysis: string;
  improvements: string[];
}

/** 市场共鸣分析 */
export interface MarketResonanceAnalysis {
  targetAudience: DimensionDetailedAnalysis;
  originality: DimensionDetailedAnalysis;
  trendAlignment: DimensionDetailedAnalysis;
}

/** 叙事基因分析 */
export interface NarrativeDNAAnalysis {
  worldBuilding?: DimensionDetailedAnalysis;  // 世界观
  narrativeLogic: DimensionDetailedAnalysis;
  hookStrength: DimensionDetailedAnalysis;
  pleasureDesign: DimensionDetailedAnalysis;
  pacingStructure: DimensionDetailedAnalysis;
  plotCoherence: DimensionDetailedAnalysis;
  characterization: DimensionDetailedAnalysis;
  dialogueQuality: DimensionDetailedAnalysis;
  suspenseEffectiveness: DimensionDetailedAnalysis;
}

/** 商业潜力分析 */
export interface CommercialPotentialAnalysis {
  userStickiness: DimensionDetailedAnalysis;
  viralPotential: DimensionDetailedAnalysis;
  aiProductionFit?: DimensionDetailedAnalysis;  // AI制作适配性
}

/** 合规评估分析 */
export interface ComplianceAssessmentAnalysis {
  contentCompliance: DimensionDetailedAnalysis;
  valueOrientation: DimensionDetailedAnalysis;
  platformCompliance?: DimensionDetailedAnalysis;  // 平台规范
}

/** 详细分析汇总 */
export interface DetailedAnalysis {
  marketResonance: MarketResonanceAnalysis;
  narrativeDNA: NarrativeDNAAnalysis;
  commercialPotential: CommercialPotentialAnalysis;
  complianceAssessment: ComplianceAssessmentAnalysis;
}

// ==================== 世界观评估（新增） ====================

export interface WorldBuildingAssessment {
  score: number;
  grade: string;
  type: string;
  analysis: string;
  strengths: string[];
  improvements: string[];
  ipPotential: string;
}

// ==================== 平台推荐（新增） ====================

export interface PlatformRecommendationSummary {
  primary: string;
  secondary: string[];
  reasoning: string;
  launchStrategy?: string;
}

// ==================== 商业闭环（新增） ====================

export interface BusinessLoopKPI {
  metric: string;
  target: string;
  window: string;
  owner?: string;
}

export interface BusinessClosedLoopPlan {
  targetPositioning: string;
  monetizationPath: string[];
  launchPlan: string[];
  kpiDashboard: BusinessLoopKPI[];
  validationExperiments: string[];
  riskMitigation: string[];
  nextQuarterGoal: string;
}

// ==================== 可操作建议 ====================

/** 可操作建议项 */
export interface ActionableRecommendation {
  priority: number;
  category?: string;         // 建议类别
  title: string;
  description: string;
  expectedImpact?: string;   // 预期效果
}

// ==================== 扩展评级结果 ====================

/** 高级评级结果（AI漫剧版） */
export interface AdvancedRatingResult extends RatingResult {
  // 分阶段分析数据
  characterAnalysis: CharacterAnalysis;
  emotionAnalysis: EmotionAnalysis;
  structureAnalysis: StructureAnalysis;
  marketSuggestion: MarketSuggestion;
  riskAssessment: RiskAssessment;
  productionFeasibility: ProductionFeasibility;

  // 商业评级报告新增内容
  executiveSummary?: ExecutiveSummary;
  worldBuildingAssessment?: WorldBuildingAssessment;
  detailedAnalysis?: DetailedAnalysis;
  actionableRecommendations?: ActionableRecommendation[];
  platformRecommendation?: PlatformRecommendationSummary;
  finalSummary?: {
    overallScore: number;
    overallGrade: string;
    gradeLabel: string;
    oneSentence: string;
    paragraph: string;
    highlights: {
      top3Strengths: string[];
      uniqueSellingPoints: string[];
      viralMoments: string[];
    };
    platformRecommendation: PlatformRecommendationSummary;
    businessClosedLoop?: BusinessClosedLoopPlan;
  };

  // 元信息
  analysisTimestamp: string;
  analysisPhases: AnalysisPhase[];
  totalDuration: number;
  aiModel: string;
}

// ==================== 维度分组（AI漫剧版） ====================

/** 维度分组配置 */
export const DIMENSION_GROUPS = {
  creation: {
    label: '核心创作',
    weight: 0.35,
    dimensions: ['hookPower', 'pleasurePoints', 'pacingStructure', 'suspenseEffect', 'conflictDesign'],
  },
  worldAndCharacter: {
    label: '世界观与人物',
    weight: 0.25,
    dimensions: ['worldBuilding', 'characterization', 'dialogueQuality', 'plotCoherence'],
  },
  market: {
    label: '市场商业',
    weight: 0.20,
    dimensions: ['targetAudience', 'trendAlignment', 'viralPotential', 'commercialValue', 'aiProductionFit'],
  },
  compliance: {
    label: '合规价值',
    weight: 0.10,
    dimensions: ['compliance', 'valueOrientation'],
  },
  innovation: {
    label: '创新粘性',
    weight: 0.10,
    dimensions: ['originality', 'userStickiness'],
  },
};

/** 计算分组得分 */
export function calculateGroupScore(
  dimensions: Record<string, DimensionScore>,
  groupKey: keyof typeof DIMENSION_GROUPS
): number {
  const group = DIMENSION_GROUPS[groupKey];
  let totalWeight = 0;
  let weightedSum = 0;

  for (const dimKey of group.dimensions) {
    const dim = dimensions[dimKey];
    if (dim) {
      weightedSum += dim.score * dim.weight;
      totalWeight += dim.weight;
    }
  }

  return totalWeight > 0 ? (weightedSum / totalWeight) * 10 : 0;
}
