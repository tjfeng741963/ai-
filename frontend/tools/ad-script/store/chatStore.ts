import { create } from 'zustand';
import type { ChatMessage, FlowStep, TierType, SessionHistoryItem, OptionCard } from '../types';
import { FLOW_STEPS } from '../types';
import { fetchSessionHistory, fetchFullSession, deleteSessionAPI } from '../services/api';

interface ChatState {
  messages: ChatMessage[];
  sessionId: string | null;
  currentStep: number;
  viewingStep: number;
  stepContents: Record<number, string>;
  isStreaming: boolean;
  script: string | null;
  showTierModal: boolean;
  selectedTier: TierType | null;
  error: string | null;
  historyList: SessionHistoryItem[];
  historyLoading: boolean;
  historyOpen: boolean;

  addMessage: (role: 'user' | 'assistant', content: string, images?: string[]) => void;
  appendToLastMessage: (content: string) => void;
  setSessionId: (id: string) => void;
  setCurrentStep: (step: number) => void;
  setViewingStep: (step: number) => void;
  setStepContent: (step: number, content: string) => void;
  appendStepContent: (step: number, content: string) => void;
  setIsStreaming: (streaming: boolean) => void;
  setScript: (script: string) => void;
  setShowTierModal: (show: boolean) => void;
  setSelectedTier: (tier: TierType) => void;
  setError: (error: string | null) => void;
  setHistoryOpen: (open: boolean) => void;
  setLastMessageOptions: (options: OptionCard[]) => void;
  replaceLastMessage: (content: string) => void;
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
  script: null as string | null,
  showTierModal: false,
  selectedTier: null as TierType | null,
  error: null as string | null,
  historyList: [] as SessionHistoryItem[],
  historyLoading: false,
  historyOpen: false,
};

export const useChatStore = create<ChatState>()((set, get) => ({
  ...initialState,

  addMessage: (role, content, images) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          role,
          content,
          images,
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
  setScript: (script) => set({ script }),
  setShowTierModal: (show) => set({ showTierModal: show }),
  setSelectedTier: (tier) => set({ selectedTier: tier }),
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

  setLastMessageOptions: (options) =>
    set((state) => {
      if (state.messages.length === 0) return state;
      const updated = [...state.messages];
      updated[updated.length - 1] = { ...updated[updated.length - 1], options };
      return { messages: updated };
    }),

  replaceLastMessage: (content) =>
    set((state) => {
      if (state.messages.length === 0) return state;
      const updated = [...state.messages];
      updated[updated.length - 1] = { ...updated[updated.length - 1], content };
      return { messages: updated };
    }),

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

      const stepContents: Record<number, string> = {};
      for (let step = 1; step <= 6; step++) {
        const stepsMessages = data.messages.filter(
          (_m, idx, arr) => {
            let currentStep = 1;
            for (let j = 0; j < idx; j++) {
              if (arr[j].role === 'assistant' && j > 0) {
                const prevConfirmed = data.stepConfirmed[currentStep];
                if (prevConfirmed && currentStep < 6) currentStep++;
              }
            }
            return currentStep === step;
          }
        );
        const lastAssistant = [...stepsMessages].reverse().find((m) => m.role === 'assistant');
        if (lastAssistant) stepContents[step] = lastAssistant.content;
      }

      set({
        sessionId: data.sessionId,
        currentStep: data.currentStep,
        viewingStep: data.currentStep,
        messages,
        stepContents,
        script: null,
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
        set({ ...initialState, messages: [], stepContents: {}, historyList: get().historyList });
      }
    } catch {}
  },

  reset: () => set({ ...initialState, messages: [], stepContents: {}, historyList: [] }),
}));
