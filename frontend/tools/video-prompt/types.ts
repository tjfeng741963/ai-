export interface OptionCard {
  id: string;
  label: string;
  description: string;
  selected?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type ChatPhase = 'input' | 'confirming' | 'tier_select' | 'generating' | 'done';

export type TierType = 'info_flow' | 'short_film';

export interface TierSpec {
  label: string;
  shots: string;
  duration: string;
  desc: string;
}

export const TIERS: Record<TierType, TierSpec> = {
  info_flow: { label: '信息流', shots: '12-25', duration: '0-3分钟', desc: '快节奏电商信息流，每镜≤15秒' },
  short_film: { label: '短片', shots: '20-50', duration: '3-10分钟', desc: '完整叙事短片，每镜≤15秒' },
};

export interface SSEEvent {
  type: 'delta' | 'options' | 'content_replace' | 'done' | 'error';
  content?: string;
  options?: OptionCard[];
  error?: string;
}

export interface SessionRecord {
  id: string;
  title: string;
  createdAt: string;
  chatMessages: ChatMessage[];
  storyboardText: string;
  selectedStyle: string | null;
  selectedTier: TierType | null;
}
