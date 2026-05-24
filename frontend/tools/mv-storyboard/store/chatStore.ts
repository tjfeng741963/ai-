import { create } from 'zustand';
import type { ChatMessage, FlowStep, StoryboardShot, SessionHistoryItem } from '../types';
import { FLOW_STEPS } from '../types';
import { fetchSessionHistory, fetchFullSession, deleteSessionAPI } from '../services/api';

interface ChatState {
  messages: ChatMessage[];
  sessionId: string | null;
  currentStep: number;
  viewingStep: number;
  stepContents: Record<number, string>;
  isStreaming: boolean;
  shots: StoryboardShot[];
  error: string | null;
  historyList: SessionHistoryItem[];
  historyLoading: boolean;
  historyOpen: boolean;

  addMessage: (role: 'user' | 'assistant', content: string) => void;
  appendToLastMessage: (content: string) => void;
  replaceLastMessage: (content: string) => void;
  setSessionId: (id: string) => void;
  setCurrentStep: (step: number) => void;
  setViewingStep: (step: number) => void;
  setStepContent: (step: number, content: string) => void;
  appendStepContent: (step: number, content: string) => void;
  setIsStreaming: (streaming: boolean) => void;
  setShots: (shots: StoryboardShot[]) => void;
  appendShots: (shots: StoryboardShot[]) => void;
  setError: (error: string | null) => void;
  setHistoryOpen: (open: boolean) => void;
  getFlowSteps: () => FlowStep[];
  loadHistory: () => Promise<void>;
  restoreSession: (sessionId: string) => Promise<void>;
  deleteHistorySession: (sessionId: string) => Promise<void>;
  reset: () => void;
}

const initialState = {
  messages: [] as ChatMessage[],
  sessionId: null as string | null,
  currentStep: 1,
  viewingStep: 1,
  stepContents: {} as Record<number, string>,
  isStreaming: false,
  shots: [] as StoryboardShot[],
  error: null as string | null,
  historyList: [] as SessionHistoryItem[],
  historyLoading: false,
  historyOpen: false,
};

export const useChatStore = create<ChatState>()((set, get) => ({
  ...initialState,

  addMessage: (role, content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          role,
          content,
          timestamp: new Date(),
        },
      ],
    })),

  appendToLastMessage: (content) =>
    set((state) => {
      if (state.messages.length === 0) return state;
      const updated = [...state.messages];
      const last = { ...updated[updated.length - 1], content: updated[updated.length - 1].content + content };
      updated[updated.length - 1] = last;
      return { messages: updated };
    }),

  replaceLastMessage: (content) =>
    set((state) => {
      if (state.messages.length === 0) return state;
      const updated = [...state.messages];
      updated[updated.length - 1] = { ...updated[updated.length - 1], content };
      return { messages: updated };
    }),

  setSessionId: (id) => set({ sessionId: id }),
  setCurrentStep: (step) => set({ currentStep: step, viewingStep: step }),
  setViewingStep: (step) => set({ viewingStep: step }),

  setStepContent: (step, content) =>
    set((state) => ({
      stepContents: { ...state.stepContents, [step]: content },
    })),

  appendStepContent: (step, content) =>
    set((state) => ({
      stepContents: {
        ...state.stepContents,
        [step]: (state.stepContents[step] || '') + content,
      },
    })),

  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
  setShots: (shots) => set({ shots }),
  appendShots: (shots) => set((state) => ({ shots: [...state.shots, ...shots] })),
  setError: (error) => set({ error }),

  getFlowSteps: () => {
    const { currentStep } = get();
    return FLOW_STEPS.map((step) => ({
      ...step,
      status: step.step < currentStep ? 'completed' as const
        : step.step === currentStep ? 'active' as const
        : 'pending' as const,
    }));
  },

  setHistoryOpen: (open) => set({ historyOpen: open }),

  loadHistory: async () => {
    set({ historyLoading: true });
    try {
      const sessions = await fetchSessionHistory(20);
      set({ historyList: sessions, historyLoading: false });
    } catch {
      set({ historyList: [], historyLoading: false });
    }
  },

  restoreSession: async (sessionId) => {
    try {
      const data = await fetchFullSession(sessionId);
      const messages: ChatMessage[] = data.messages.map((m, i) => ({
        id: `restored-${i}-${Date.now()}`,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp),
      }));

      set({
        sessionId: data.sessionId,
        currentStep: data.currentStep,
        viewingStep: data.currentStep,
        messages,
        stepContents: data.stepContents || {},
        shots: data.shots || [],
        error: null,
        isStreaming: false,
        historyOpen: false,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '未知错误';
      set({ error: `恢复会话失败: ${msg}` });
    }
  },

  deleteHistorySession: async (sessionId) => {
    const currentSessionId = get().sessionId;
    try {
      await deleteSessionAPI(sessionId);
      set((state) => ({
        historyList: state.historyList.filter((s) => s.id !== sessionId),
      }));
      if (currentSessionId === sessionId) {
        set({ ...initialState, messages: [], stepContents: {}, shots: [], historyList: get().historyList });
      }
    } catch { /* silently ignore delete failures */ }
  },

  reset: () => set({ ...initialState, messages: [], stepContents: {}, shots: [], historyList: [] }),
}));
