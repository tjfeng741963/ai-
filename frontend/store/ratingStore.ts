import { create } from 'zustand';
import type { RatingResult, RatingStatus } from '@/types/rating.ts';
import type {
  AdvancedRatingResult,
  AnalysisPhase,
  AnalysisPhaseStatus,
} from '@/types/rating-advanced.ts';
import { ANALYSIS_PHASES } from '@/types/rating-advanced.ts';
import {
  getRatingRecords,
  saveRatingRecord,
  deleteRatingRecord,
  clearRatingRecords,
  updateRecordName,
  type RatingRecord,
} from '@/services/storage.ts';
import type { MarketType } from '@/services/market-context.ts';

/** 分析模式 */
export type AnalysisMode = 'simple' | 'advanced';

interface RatingState {
  // 状态
  scriptContent: string;
  status: RatingStatus;
  result: RatingResult | null;
  advancedResult: AdvancedRatingResult | null;
  error: string | null;
  progress: number;
  currentStep: string;
  analysisStartTime: number | null;

  // 高级分析状态
  analysisMode: AnalysisMode;
  marketType: MarketType;
  outputLanguage: 'zh' | 'en';
  phases: AnalysisPhase[];
  currentPhaseIndex: number;

  // 视图状态
  activeTab: 'overview' | 'report' | 'structure' | 'character' | 'emotion' | 'market' | 'risk';

  // 历史记录状态
  historyRecords: RatingRecord[];
  selectedRecordId: string | null;
  showHistory: boolean;

  // Actions
  setScriptContent: (content: string) => void;
  setAnalysisMode: (mode: AnalysisMode) => void;
  setMarketType: (market: MarketType) => void;
  setOutputLanguage: (lang: 'zh' | 'en') => void;
  startAnalyzing: () => void;
  setProgress: (progress: number, step: string, phaseIndex?: number) => void;
  updatePhase: (phase: AnalysisPhase) => void;
  setResult: (result: RatingResult) => void;
  setAdvancedResult: (result: AdvancedRatingResult) => void;
  setError: (error: string) => void;
  setActiveTab: (tab: RatingState['activeTab']) => void;
  reset: () => void;

  // 历史记录 Actions
  loadHistory: () => void;
  saveToHistory: (scriptName?: string) => RatingRecord | null;
  deleteFromHistory: (id: string) => void;
  clearHistory: () => void;
  selectRecord: (id: string | null) => void;
  loadFromRecord: (record: RatingRecord) => void;
  toggleHistory: () => void;
  renameRecord: (id: string, newName: string) => void;
}

// 创建初始阶段数据
const createInitialPhases = (): AnalysisPhase[] =>
  ANALYSIS_PHASES.map((p) => ({
    id: p.id,
    name: p.name,
    status: 'pending' as AnalysisPhaseStatus,
    progress: 0,
  }));

export const useRatingStore = create<RatingState>((set, get) => ({
  // 初始状态
  scriptContent: '',
  status: 'idle',
  result: null,
  advancedResult: null,
  error: null,
  progress: 0,
  currentStep: '',
  analysisStartTime: null,

  // 高级分析状态
  analysisMode: 'advanced',
  marketType: 'domestic' as MarketType,
  outputLanguage: 'zh' as const,
  phases: createInitialPhases(),
  currentPhaseIndex: -1,

  // 视图状态
  activeTab: 'overview',

  // 历史记录状态
  historyRecords: getRatingRecords(),
  selectedRecordId: null,
  showHistory: false,

  // Actions
  setScriptContent: (content) => set({ scriptContent: content }),

  setAnalysisMode: (mode) => set({ analysisMode: mode }),

  setMarketType: (market) => set({ marketType: market }),

  setOutputLanguage: (lang) => set({ outputLanguage: lang }),

  startAnalyzing: () =>
    set({
      status: 'analyzing',
      result: null,
      advancedResult: null,
      error: null,
      progress: 0,
      currentStep: '准备分析...',
      phases: createInitialPhases(),
      currentPhaseIndex: 0,
      analysisStartTime: Date.now(),
    }),

  setProgress: (progress, step, phaseIndex) =>
    set({
      progress,
      currentStep: step,
      currentPhaseIndex: phaseIndex ?? get().currentPhaseIndex,
    }),

  updatePhase: (updatedPhase) =>
    set((state) => ({
      phases: state.phases.map((p) =>
        p.id === updatedPhase.id ? updatedPhase : p
      ),
      currentPhaseIndex:
        updatedPhase.status === 'in_progress'
          ? state.phases.findIndex((p) => p.id === updatedPhase.id)
          : state.currentPhaseIndex,
    })),

  setResult: (result) =>
    set({
      status: 'completed',
      result,
      progress: 100,
      currentStep: '分析完成',
    }),

  setAdvancedResult: (result) =>
    set({
      status: 'completed',
      result: result, // 兼容基础类型
      advancedResult: result,
      progress: 100,
      currentStep: '分析完成',
      phases: result.analysisPhases || get().phases,
    }),

  setError: (error) =>
    set({
      status: 'error',
      error,
      progress: 0,
      currentStep: '',
    }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  reset: () =>
    set({
      scriptContent: '',
      status: 'idle',
      result: null,
      advancedResult: null,
      error: null,
      progress: 0,
      currentStep: '',
      phases: createInitialPhases(),
      currentPhaseIndex: -1,
      activeTab: 'overview',
      analysisStartTime: null,
      selectedRecordId: null,
    }),

  // 历史记录 Actions
  loadHistory: () => set({ historyRecords: getRatingRecords() }),

  saveToHistory: (scriptName?: string) => {
    const state = get();
    const resultToSave = state.advancedResult || state.result;
    if (!resultToSave || !state.scriptContent) return null;

    const duration = state.analysisStartTime
      ? Date.now() - state.analysisStartTime
      : 0;

    const record = saveRatingRecord(
      state.scriptContent,
      resultToSave,
      state.analysisMode,
      duration,
      scriptName
    );

    set({ historyRecords: getRatingRecords(), selectedRecordId: record.id });
    return record;
  },

  deleteFromHistory: (id: string) => {
    deleteRatingRecord(id);
    const state = get();
    set({
      historyRecords: getRatingRecords(),
      selectedRecordId: state.selectedRecordId === id ? null : state.selectedRecordId,
    });
  },

  clearHistory: () => {
    clearRatingRecords();
    set({ historyRecords: [], selectedRecordId: null });
  },

  selectRecord: (id: string | null) => set({ selectedRecordId: id }),

  loadFromRecord: (record: RatingRecord) => {
    const isAdvanced = record.analysisMode === 'advanced';
    set({
      scriptContent: record.scriptPreview.replace(/\.\.\.$/,''), // 预览可能被截断
      status: 'completed',
      result: record.result,
      advancedResult: isAdvanced ? (record.result as AdvancedRatingResult) : null,
      analysisMode: record.analysisMode,
      activeTab: 'overview',
      selectedRecordId: record.id,
      showHistory: false,
    });
  },

  toggleHistory: () => set((state) => ({ showHistory: !state.showHistory })),

  renameRecord: (id: string, newName: string) => {
    updateRecordName(id, newName);
    set({ historyRecords: getRatingRecords() });
  },
}));
