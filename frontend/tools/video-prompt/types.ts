export interface ImageSlot {
  id: string;
  label: string;
  placeholder: string;
}

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

export type TierType = '15s' | '30s' | '60s';

export interface TierSpec {
  label: string;
  shots: string;
  duration: string;
  desc: string;
}

export const TIERS: Record<TierType, TierSpec> = {
  '15s': { label: '15秒极速', shots: '3-5', duration: '15秒', desc: '快节奏产品闪现' },
  '30s': { label: '30秒标准', shots: '5-8', duration: '30秒', desc: '完整功能展示' },
  '60s': { label: '60秒详细', shots: '8-12', duration: '60秒', desc: '场景+功能+种草' },
};

export interface SSEEvent {
  type: 'delta' | 'options' | 'slots' | 'content_replace' | 'done' | 'error';
  content?: string;
  options?: OptionCard[];
  slots?: ImageSlot[];
  error?: string;
}
