import { create } from 'zustand';
import type { ChatMessage, ChatPhase, TierType, ImageSlot, OptionCard } from '../types';
import { stripOptionsMarker, extractImageSlots } from '../utils';
import { sendChat, generateStoryboard } from '../services/api';

interface PromptState {
  input: string;
  chatMessages: ChatMessage[];
  chatPhase: ChatPhase;
  selectedStyle: string | null;
  selectedTier: TierType | null;
  options: OptionCard[];
  isStreaming: boolean;
  storyboardText: string | null;
  imageSlots: ImageSlot[];
  slotImages: Record<string, string>;
  error: string | null;

  setInput: (v: string) => void;
  setSelectedTier: (t: TierType) => void;
  setSlotImage: (slotId: string, base64: string) => void;
  removeSlotImage: (slotId: string) => void;
  reset: () => void;
  sendMessage: (message: string) => Promise<void>;
  selectOption: (option: OptionCard) => void;
  generate: () => Promise<void>;
  getFullScript: () => string;
}

const INITIAL_STATE = {
  input: '',
  chatMessages: [] as ChatMessage[],
  chatPhase: 'input' as ChatPhase,
  selectedStyle: null as string | null,
  selectedTier: null as TierType | null,
  options: [] as OptionCard[],
  isStreaming: false,
  storyboardText: null as string | null,
  imageSlots: [] as ImageSlot[],
  slotImages: {} as Record<string, string>,
  error: null as string | null,
};

export const usePromptStore = create<PromptState>((set, get) => ({
  ...INITIAL_STATE,

  setInput: (input) => set({ input }),

  setSelectedTier: (tier) => set({ selectedTier: tier }),

  setSlotImage: (slotId, base64) =>
    set((s) => ({ slotImages: { ...s.slotImages, [slotId]: base64 } })),

  removeSlotImage: (slotId) =>
    set((s) => {
      const { [slotId]: _, ...rest } = s.slotImages;
      return { slotImages: rest };
    }),

  reset: () => set(INITIAL_STATE),

  sendMessage: async (message) => {
    const state = get();
    const history = state.chatMessages;

    set({
      chatMessages: [...history, { role: 'user', content: message }],
      chatPhase: 'confirming',
      isStreaming: true,
      error: null,
      options: [],
    });

    let assistantContent = '';

    try {
      const stream = sendChat(message, history);
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
          case 'slots':
            if (event.slots) set({ imageSlots: event.slots });
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
      const slots = get().imageSlots.length > 0 ? get().imageSlots : extractImageSlots(fullText);
      set({ isStreaming: false, chatPhase: 'done', imageSlots: slots });
    }
  },

  getFullScript: () => {
    const { storyboardText, imageSlots, slotImages } = get();
    if (!storyboardText) return '';

    const lines = [storyboardText.trim(), '', '---', '参考图清单：'];
    imageSlots.forEach((slot, i) => {
      const uploaded = slotImages[slot.id] ? '✅ 已上传' : '⬜ 未上传';
      lines.push(`图${i + 1}(${slot.label})：${uploaded}`);
    });
    return lines.join('\n');
  },
}));
