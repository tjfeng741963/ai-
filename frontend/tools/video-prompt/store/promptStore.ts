import { create } from 'zustand';
import type { ChatMessage, ChatPhase, TierType, OptionCard, SessionRecord } from '../types';
import { stripOptionsMarker } from '../utils';
import { sendChat, generateStoryboard } from '../services/api';

const HISTORY_KEY = 'vp_sessions';
const MAX_HISTORY = 20;

function loadHistory(): SessionRecord[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveHistory(sessions: SessionRecord[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions.slice(0, MAX_HISTORY)));
}

interface PromptState {
  input: string;
  chatMessages: ChatMessage[];
  chatPhase: ChatPhase;
  selectedStyle: string | null;
  selectedTier: TierType | null;
  options: OptionCard[];
  isStreaming: boolean;
  storyboardText: string | null;
  error: string | null;
  sessions: SessionRecord[];

  setInput: (v: string) => void;
  setSelectedTier: (t: TierType) => void;
  reset: () => void;
  sendMessage: (message: string, options?: { images?: string[]; productUrl?: string }) => Promise<void>;
  selectOption: (option: OptionCard) => void;
  generate: () => Promise<void>;
  getFullScript: () => string;
  loadSession: (session: SessionRecord) => void;
  deleteSession: (id: string) => void;
}

const INITIAL_WORK_STATE = {
  input: '',
  chatMessages: [] as ChatMessage[],
  chatPhase: 'input' as ChatPhase,
  selectedStyle: null as string | null,
  selectedTier: null as TierType | null,
  options: [] as OptionCard[],
  isStreaming: false,
  storyboardText: null as string | null,
  error: null as string | null,
};

export const usePromptStore = create<PromptState>((set, get) => ({
  ...INITIAL_WORK_STATE,
  sessions: loadHistory(),

  setInput: (input) => set({ input }),

  setSelectedTier: (tier) => set({ selectedTier: tier }),

  reset: () => set(INITIAL_WORK_STATE),

  sendMessage: async (message, options) => {
    const state = get();
    const history = state.chatMessages;

    // User message displayed shows text (+ image count hint if any)
    const hasImages = (options?.images?.length ?? 0) > 0;
    const displayContent = hasImages
      ? `${message}${message ? '\n' : ''}[附图 ${options!.images!.length} 张]`
      : message;

    set({
      chatMessages: [...history, { role: 'user', content: displayContent }],
      chatPhase: 'confirming',
      isStreaming: true,
      error: null,
      options: [],
    });

    let assistantContent = '';

    try {
      const stream = sendChat(message, history, options);
      for await (const event of stream) {
        switch (event.type) {
          case 'delta':
            if (event.content) {
              assistantContent += event.content;
              set((s) => {
                const msgs = [...s.chatMessages];
                const last = msgs[msgs.length - 1];
                if (last?.role === 'assistant') {
                  msgs[msgs.length - 1] = { ...last, content: assistantContent };
                } else {
                  msgs.push({ role: 'assistant', content: assistantContent });
                }
                return { chatMessages: msgs };
              });
            }
            break;
          case 'content_replace':
            if (event.content !== undefined) {
              assistantContent = event.content;
              set((s) => {
                const msgs = [...s.chatMessages];
                const last = msgs[msgs.length - 1];
                if (last?.role === 'assistant') {
                  msgs[msgs.length - 1] = { ...last, content: event.content! };
                }
                return { chatMessages: msgs };
              });
            }
            break;
          case 'options':
            if (event.options) set({ options: event.options });
            break;
          case 'error':
            set({ error: event.error || '未知错误' });
            break;
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        set({ error: err.message });
      }
    } finally {
      const finalContent = stripOptionsMarker(assistantContent);
      set((s) => {
        const msgs = [...s.chatMessages];
        const last = msgs[msgs.length - 1];
        if (last?.role === 'assistant') {
          msgs[msgs.length - 1] = { ...last, content: finalContent };
        }
        return { chatMessages: msgs, isStreaming: false };
      });
    }
  },

  selectOption: (option) => {
    set((s) => ({
      selectedStyle: option.label,
      options: s.options.map((o) =>
        o.id === option.id ? { ...o, selected: true } : o
      ),
      chatPhase: 'tier_select',
    }));
  },

  generate: async () => {
    const { selectedStyle, selectedTier, chatMessages } = get();
    if (!selectedStyle || !selectedTier) return;

    set({ isStreaming: true, chatPhase: 'generating', error: null, storyboardText: '' });

    let fullText = '';

    try {
      const stream = generateStoryboard(selectedStyle, selectedTier, chatMessages);
      for await (const event of stream) {
        switch (event.type) {
          case 'delta':
            if (event.content) {
              fullText += event.content;
              set({ storyboardText: fullText });
            }
            break;
          case 'error':
            set({ error: event.error || '未知错误' });
            break;
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        set({ error: err.message });
      }
    } finally {
      set({ isStreaming: false, chatPhase: 'done' });

      // 保存到历史记录
      const { chatMessages: msgs, selectedStyle: style, selectedTier: tier } = get();
      if (fullText) {
        const firstUserMsg = msgs.find((m) => m.role === 'user')?.content ?? '';
        const title = firstUserMsg.slice(0, 30) + (firstUserMsg.length > 30 ? '…' : '');
        const record: SessionRecord = {
          id: `${Date.now()}`,
          title,
          createdAt: new Date().toISOString(),
          chatMessages: msgs,
          storyboardText: fullText,
          selectedStyle: style,
          selectedTier: tier,
        };
        const updated = [record, ...loadHistory()];
        saveHistory(updated);
        set({ sessions: updated });
      }
    }
  },

  getFullScript: () => {
    const { storyboardText } = get();
    if (!storyboardText) return '';
    return storyboardText.trim();
  },

  loadSession: (session) => {
    set({
      ...INITIAL_WORK_STATE,
      chatMessages: session.chatMessages,
      storyboardText: session.storyboardText,
      selectedStyle: session.selectedStyle,
      selectedTier: session.selectedTier,
      chatPhase: 'done',
    });
  },

  deleteSession: (id) => {
    const updated = get().sessions.filter((s) => s.id !== id);
    saveHistory(updated);
    set({ sessions: updated });
  },
}));
