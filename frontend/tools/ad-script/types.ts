export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: string[];
  timestamp: Date;
  options?: OptionCard[];
}

export interface OptionCard {
  id: string;
  label: string;
  description: string;
  selected?: boolean;
}

export type FlowStepStatus = 'pending' | 'active' | 'completed';

export interface FlowStep {
  step: number;
  label: string;
  status: FlowStepStatus;
}

export interface ProductProfile {
  product: {
    name?: string;
    category?: string;
    price?: string;
    sellingPoints?: string[];
    competitiveEdge?: string;
    visualFeatures?: string;
  };
  audience: {
    targetGroup?: string;
    painPoint?: string;
    scenario?: string;
  };
  strategy: {
    approach?: string;
    emotionalTone?: string;
  };
  creative: {
    concept?: string;
    characters?: Array<{ name: string; age?: number; trait: string }>;
    setting?: string;
  };
  placement: {
    firstAppearance?: string;
    coreShowcase?: string;
    productCloseup?: string;
    cta?: string;
  };
  source: {
    type: string | null;
    taobaoLink: string | null;
    uploadedImages: string[];
  };
}

export type TierType = 'ultra-short' | 'short' | 'standard' | 'long-feed' | 'mini-drama' | 'brand-drama';

export interface TierConfig {
  id: TierType;
  label: string;
  duration: string;
  sceneCount: string;
  wordCount: string;
  description: string;
  category: 'feed' | 'drama';
}

export interface TierCategory {
  id: 'feed' | 'drama';
  label: string;
  description: string;
}

export const TIER_CATEGORIES: TierCategory[] = [
  { id: 'feed', label: '信息流广告', description: '0-3分钟，适合抖音/小红书/视频号投放' },
  { id: 'drama', label: '广告短剧', description: '3-10分钟，品牌微短剧/系列化内容' },
];

export const TIER_CONFIGS: TierConfig[] = [
  // 信息流广告
  { id: 'ultra-short', category: 'feed', label: '极短', duration: '15-30s', sceneCount: '3-6镜', wordCount: '100-200字', description: '快速种草，视觉冲击' },
  { id: 'short', category: 'feed', label: '短片', duration: '30-60s', sceneCount: '6-12镜', wordCount: '200-500字', description: '小故事弧线，产品登场' },
  { id: 'standard', category: 'feed', label: '标准', duration: '1-2min', sceneCount: '12-24镜', wordCount: '500-1000字', description: '角色互动，情感层次' },
  { id: 'long-feed', category: 'feed', label: '长信息流', duration: '2-3min', sceneCount: '24-36镜', wordCount: '1000-1500字', description: '三幕结构，品牌深度' },
  // 广告短剧
  { id: 'mini-drama', category: 'drama', label: '迷你短剧', duration: '3-5min', sceneCount: '36-60镜', wordCount: '1500-2500字', description: '多幕叙事，产品深度融入' },
  { id: 'brand-drama', category: 'drama', label: '品牌短剧', duration: '5-10min', sceneCount: '60-120镜', wordCount: '2500-5000字', description: '世界观+人物群像+系列化' },
];

export const FLOW_STEPS: FlowStep[] = [
  { step: 1, label: '产品解析', status: 'pending' },
  { step: 2, label: '人群痛点', status: 'pending' },
  { step: 3, label: '广告策略', status: 'pending' },
  { step: 4, label: '创意构思', status: 'pending' },
  { step: 5, label: '植入设计', status: 'pending' },
  { step: 6, label: '生成剧本', status: 'pending' },
];

export interface SessionHistoryItem {
  id: string;
  title: string;
  currentStep: number;
  status: string;
  updatedAt: string;
}

export interface FullSessionData {
  sessionId: string;
  title: string;
  currentStep: number;
  stepConfirmed: Record<number, boolean>;
  productProfile: ProductProfile;
  messages: { role: 'user' | 'assistant'; content: string; timestamp: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface SSEEvent {
  type: 'session' | 'delta' | 'step' | 'profile' | 'options' | 'content_replace' | 'done' | 'error';
  content?: string;
  sessionId?: string;
  step?: number;
  currentStep?: number;
  isReadyToGenerate?: boolean;
  profile?: Partial<ProductProfile>;
  options?: OptionCard[];
  script?: string;
  error?: string;
}
