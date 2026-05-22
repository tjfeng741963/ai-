import { create } from 'zustand';
import type { StoryLake, CreationProfile, CreatorStep, OutlineData, StoryNode } from '../types';
import * as api from '../services/api';

interface CreatorState {
  view: 'list' | 'creator' | 'player';
  activeLakeId: string | null;
  currentStep: CreatorStep;
  lakeTitle: string;
  creationProfile: CreationProfile;
  lakeList: StoryLake[];
  isGeneratingOutline: boolean;
  outlineStreamText: string;
  outlineData: OutlineData | null;
  isGeneratingContent: boolean;
  contentStreamText: string;
  generationProgress: { currentBatch: number; totalBatches: number; currentNodeTitle: string } | null;
  generatedNodes: StoryNode[];

  setCurrentStep: (step: CreatorStep) => void;
  updateProfile: (partial: Partial<CreationProfile>) => void;
  loadLakeList: () => Promise<void>;
  createNewLake: (title: string) => Promise<StoryLake | null>;
  loadLake: (lakeId: string) => Promise<void>;
  saveProfile: () => Promise<void>;
  requestOutline: () => Promise<void>;
  confirmOutline: () => Promise<void>;
  startContentGeneration: () => Promise<void>;
  regenerateNode: (nodeId: string, instruction: string) => Promise<void>;
  reset: () => void;
}

const DEFAULT_PROFILE: CreationProfile = {
  coreIdea: '',
  targetAudience: '',
  emotionalArc: '',
  characters: [],
  worldSetting: '',
  keyEvents: [],
  endings: [],
  styleParams: {},
};

export const useCreatorStore = create<CreatorState>((set, get) => ({
  view: 'list',
  activeLakeId: null,
  currentStep: 1,
  lakeTitle: '',
  creationProfile: { ...DEFAULT_PROFILE },
  lakeList: [],
  isGeneratingOutline: false,
  outlineStreamText: '',
  outlineData: null,
  isGeneratingContent: false,
  contentStreamText: '',
  generationProgress: null,
  generatedNodes: [],

  setCurrentStep: (step) => set({ currentStep: step }),

  updateProfile: (partial) =>
    set((s) => ({ creationProfile: { ...s.creationProfile, ...partial } })),

  loadLakeList: async () => {
    try {
      const lakes = await api.listLakes();
      set({ lakeList: lakes });
    } catch { /* empty list is fine */ }
  },

  createNewLake: async (title) => {
    try {
      const lake = await api.createLake({ title });
      set((s) => ({ lakeList: [lake, ...s.lakeList] }));
      return lake;
    } catch {
      return null;
    }
  },

  loadLake: async (lakeId) => {
    try {
      const lake = await api.getLake(lakeId);
      set({
        activeLakeId: lake.id,
        lakeTitle: lake.title,
        creationProfile: lake.creationProfile || { ...DEFAULT_PROFILE },
        currentStep: lake.status === 'ready' ? 6 : 1,
      });
    } catch { /* not found */ }
  },

  saveProfile: async () => {
    const { activeLakeId, creationProfile, lakeTitle } = get();
    if (!activeLakeId) return;
    try {
      await api.updateLake(activeLakeId, {
        title: lakeTitle,
        creationProfile,
      });
    } catch { /* save failed */ }
  },

  requestOutline: async () => {
    const { activeLakeId } = get();
    if (!activeLakeId) return;
    set({ isGeneratingOutline: true, outlineStreamText: '', outlineData: null });
    try {
      const stream = api.generateOutline(activeLakeId);
      for await (const event of stream) {
        if ((event.type === 'delta' || event.type === 'reasoning') && event.content) {
          set((s) => ({
            outlineStreamText: (s.outlineStreamText + event.content).replace(/<!--\s*PROFILE:[\s\S]*?-->/g, ''),
          }));
        } else if (event.type === 'profile' && event.data) {
          set({ outlineData: event.data as unknown as OutlineData });
        }
      }
    } catch { /* error */ } finally {
      set({ isGeneratingOutline: false });
    }
  },

  confirmOutline: async () => {
    const { activeLakeId, outlineData } = get();
    if (!activeLakeId || !outlineData) return;
    try {
      await api.applyOutline(activeLakeId, outlineData.nodes, outlineData.edges);
      set({ currentStep: 6 });
    } catch { /* error */ }
  },

  startContentGeneration: async () => {
    const { activeLakeId } = get();
    if (!activeLakeId) return;
    set({ isGeneratingContent: true, contentStreamText: '', generationProgress: null });

    try {
      const gen = api.generateContent(activeLakeId);
      for await (const event of gen) {
        if (event.type === 'progress') {
          set({
            generationProgress: {
              currentBatch: event.batch || 0,
              totalBatches: event.total || 0,
              currentNodeTitle: event.nodeTitle || '',
            },
          });
        } else if ((event.type === 'delta' || event.type === 'reasoning') && event.content) {
          set((s) => ({
            contentStreamText: (s.contentStreamText + event.content).replace(/<!--\s*PROFILE:[\s\S]*?-->/g, ''),
          }));
        } else if (event.type === 'node_complete') {
          // 逐个追加完成的节点，不清空已有内容
          const lake = await api.getLake(activeLakeId);
          const dbNodes = lake.nodes || [];
          set((s) => {
            // 合并：DB有内容的用DB的，DB空的保留本地已有内容
            const merged = dbNodes.map((dbn) => {
              const existing = s.generatedNodes.find((gn) => gn.id === dbn.id);
              if (existing && existing.content && !dbn.content) return existing;
              return dbn;
            });
            return { generatedNodes: merged, contentStreamText: '' };
          });
        } else if (event.type === 'batch_complete') {
          set({ contentStreamText: '' });
        } else if (event.type === 'done') {
          const lake = await api.getLake(activeLakeId);
          set((s) => {
            const dbNodes = lake.nodes || [];
            const merged = dbNodes.map((dbn) => {
              const existing = s.generatedNodes.find((gn) => gn.id === dbn.id);
              if (existing && existing.content && !dbn.content) return existing;
              return dbn;
            });
            return { generatedNodes: merged };
          });
        }
      }
    } catch { /* error */ } finally {
      set({ isGeneratingContent: false });
    }
  },

  regenerateNode: async (nodeId, instruction) => {
    try {
      const node = await api.regenerateNode(nodeId, instruction);
      set((s) => ({
        generatedNodes: s.generatedNodes.map((n) => (n.id === node.id ? node : n)),
      }));
    } catch { /* error */ }
  },

  reset: () =>
    set({
      view: 'list',
      activeLakeId: null,
      currentStep: 1,
      lakeTitle: '',
      creationProfile: { ...DEFAULT_PROFILE },
      outlineData: null,
      isGeneratingOutline: false,
      outlineStreamText: '',
      isGeneratingContent: false,
      generationProgress: null,
      generatedNodes: [],
    }),
}));
