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

export type TierType = 'ultra-short' | 'short' | 'standard' | 'story';

export interface TierConfig {
  id: TierType;
  label: string;
  duration: string;
  sceneCount: string;
  wordCount: string;
  description: string;
}

export const TIER_CONFIGS: TierConfig[] = [
  { id: 'ultra-short', label: '极短', duration: '15-30s', sceneCount: '3-5个画面', wordCount: '100-200字', description: '信息流快速种草' },
  { id: 'short', label: '短片', duration: '30-60s', sceneCount: '5-10个场景', wordCount: '200-500字', description: '信息流广告主力' },
  { id: 'standard', label: '标准', duration: '1-2min', sceneCount: '10-15个场景', wordCount: '500-800字', description: '品牌深度种草' },
  { id: 'story', label: '剧情', duration: '2-3min', sceneCount: '15-25个场景', wordCount: '800-1500字', description: '品牌微短剧' },
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
