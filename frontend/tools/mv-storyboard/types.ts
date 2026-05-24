export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface StoryboardShot {
  shotNumber: number;
  duration: string;
  lyricsRef: string;
  visualDescription: string;
  cameraMovement: string;
  lightingTone: string;
  seedancePrompt: string;
}

export type FlowStepStatus = 'pending' | 'active' | 'completed';

export type FlowStepId = 'song-analysis' | 'visual-narrative' | 'storyboard';

export interface FlowStep {
  step: number;
  id: FlowStepId;
  label: string;
  status: FlowStepStatus;
}

export const FLOW_STEPS: FlowStep[] = [
  { step: 1, id: 'song-analysis', label: '歌曲解析', status: 'pending' },
  { step: 2, id: 'visual-narrative', label: '视觉叙事', status: 'pending' },
  { step: 3, id: 'storyboard', label: '生成分镜', status: 'pending' },
];

export interface SSEEvent {
  type: 'session' | 'delta' | 'step' | 'content_replace' | 'done' | 'error';
  content?: string;
  sessionId?: string;
  step?: number;
  currentStep?: number;
  shots?: StoryboardShot[];
  error?: string;
}

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
  messages: { role: 'user' | 'assistant'; content: string; timestamp: string }[];
  stepContents: Record<number, string>;
  shots: StoryboardShot[];
  createdAt: string;
  updatedAt: string;
}
