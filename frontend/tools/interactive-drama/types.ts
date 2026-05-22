// ========== 数据模型 ==========

export interface StoryLake {
  id: string;
  title: string;
  description: string;
  creationProfile: CreationProfile;
  config: Record<string, unknown>;
  userId?: string;
  status: 'draft' | 'generating' | 'ready' | 'published';
  version: number;
  createdAt: string;
  updatedAt: string;
  nodes?: StoryNode[];
  edges?: StoryEdge[];
  variables?: StateVariable[];
}

export interface StoryNode {
  id: string;
  lakeId: string;
  type: NodeType;
  title: string;
  content: string;
  entryConditions: Record<string, unknown>;
  contentVariants: ContentVariant[];
  positionX: number;
  positionY: number;
  sortOrder: number;
  version: number;
  isAiGenerated: boolean;
  isProtected: boolean;
  createdAt: string;
}

export interface StoryEdge {
  id: string;
  lakeId: string;
  fromNodeId: string;
  toNodeId: string;
  optionText: string;
  priority: number;
  conditions: Record<string, unknown>;
  stateChanges: StateChange[];
  timing: Record<string, unknown>;
  createdAt: string;
}

export interface StateVariable {
  id: string;
  lakeId: string;
  name: string;
  type: 'boolean' | 'number' | 'timing';
  initialValue: string;
  description: string;
}

export interface ContentVariant {
  condition: Record<string, unknown>;
  text: string;
}

export interface StateChange {
  variable: string;
  operator: 'set' | 'add' | 'sub' | 'mul' | 'div';
  value: number | string | boolean;
}

// ========== 创作配置 ==========

export interface CreationProfile {
  coreIdea: string;
  targetAudience: string;
  emotionalArc: string;
  characters: Character[];
  worldSetting: string;
  keyEvents: KeyEvent[];
  endings: Ending[];
  styleParams: StyleParams;
}

export interface Character {
  name: string;
  identity: string;
  personality: string;
  motivation: string;
  relationship: string;
}

export interface KeyEvent {
  description: string;
  expectedTiming: string;
}

export interface Ending {
  name: string;
  type: 'good' | 'bad' | 'hidden' | 'true';
  description: string;
}

export interface StyleParams {
  narrationTone?: Record<string, number>;
  pacingDensity?: string;
  characterType?: string;
  characterSystem?: string;
  foreshadowType?: string;
  writingTechniques?: string[];
  branchDensity?: number;
  allowMerge?: boolean;
  timingSensitivity?: 'low' | 'medium' | 'high';
}

// ========== 基础类型 ==========

export type NodeType = 'start' | 'choice' | 'merge' | 'ending';
export type CreatorStep = 1 | 2 | 3 | 4 | 5 | 6;
export type FlowStepStatus = 'pending' | 'active' | 'completed';
export type EditorMode = 'outline' | 'content';
export type PropertyTab = 'content' | 'conditions' | 'edges';

export interface FlowStep {
  step: number;
  label: string;
  status: FlowStepStatus;
}

// ========== 播放器 ==========

export interface PlayerState {
  sessionId: string;
  lakeId: string;
  status: 'playing' | 'ended';
  currentNode: {
    id: string;
    type: string;
    title: string;
    content: string;
  } | null;
  currentState: Record<string, unknown>;
  availableEdges: Array<{
    id: string;
    optionText: string;
    conditions: Record<string, unknown>;
  }>;
  visitedNodeIds: string[];
  pathEdges: string[];
  startedAt: string;
  updatedAt: string;
  endedAt: string | null;
}

// ========== SSE 事件 ==========

export interface DramaSSEEvent {
  type: string;
  content?: string;
  data?: unknown;
  message?: string;
  batch?: number;
  total?: number;
  nodeTitle?: string;
  nodeId?: string;
  nodeIds?: string[];
  nodeCount?: number;
}

// ========== 大纲数据 ==========

export interface OutlineData {
  nodes: OutlineNode[];
  edges: OutlineEdge[];
  variables: OutlineVariable[];
  hookTracking: {
    hooksTriggered: Array<{ nodeTempId: string; hook: string }>;
    hooksResolved: Array<{ nodeTempId: string; hook: string }>;
  };
}

export interface OutlineNode {
  tempId: string;
  type: NodeType;
  title: string;
  summary: string;
  endingType: 'good' | 'bad' | 'hidden' | 'true' | null;
}

export interface OutlineEdge {
  fromTempId: string;
  toTempId: string;
  optionText: string;
  conditions: Record<string, unknown>;
  stateChanges: StateChange[];
  timingNote: string;
}

export interface OutlineVariable {
  name: string;
  type: 'boolean' | 'number' | 'timing';
  initialValue: string;
  description: string;
}

// ========== 步骤常量 ==========

export const CREATOR_STEPS: FlowStep[] = [
  { step: 1, label: '核心创意', status: 'pending' },
  { step: 2, label: '角色设定', status: 'pending' },
  { step: 3, label: '世界观与风格', status: 'pending' },
  { step: 4, label: '结局与转折', status: 'pending' },
  { step: 5, label: '大纲预览', status: 'pending' },
  { step: 6, label: '生成内容', status: 'pending' },
];

export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  start: '起始',
  choice: '选择',
  merge: '汇合',
  ending: '结局',
};

export const ENDING_TYPE_LABELS: Record<string, string> = {
  good: '好结局',
  bad: '坏结局',
  hidden: '隐藏结局',
  true: '真结局',
};
