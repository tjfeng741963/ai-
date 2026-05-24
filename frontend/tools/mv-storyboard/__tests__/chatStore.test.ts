import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useChatStore } from '../store/chatStore';

vi.mock('../services/api', () => ({
  fetchSessionHistory: vi.fn(),
  fetchFullSession: vi.fn(),
  deleteSessionAPI: vi.fn(),
}));

import { fetchSessionHistory, fetchFullSession, deleteSessionAPI } from '../services/api';

function resetStore() {
  useChatStore.setState({
    messages: [],
    sessionId: null,
    currentStep: 1,
    viewingStep: 1,
    stepContents: {},
    isStreaming: false,
    shots: [],
    error: null,
    historyList: [],
    historyLoading: false,
    historyOpen: false,
  });
}

describe('chatStore', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useChatStore.getState();
      expect(state.messages).toEqual([]);
      expect(state.sessionId).toBeNull();
      expect(state.currentStep).toBe(1);
      expect(state.viewingStep).toBe(1);
      expect(state.stepContents).toEqual({});
      expect(state.isStreaming).toBe(false);
      expect(state.shots).toEqual([]);
      expect(state.error).toBeNull();
    });
  });

  describe('addMessage', () => {
    it('should add user message', () => {
      const { addMessage } = useChatStore.getState();
      addMessage('user', '你好');
      const { messages } = useChatStore.getState();
      expect(messages).toHaveLength(1);
      expect(messages[0].role).toBe('user');
      expect(messages[0].content).toBe('你好');
      expect(messages[0].id).toBeDefined();
      expect(messages[0].timestamp).toBeInstanceOf(Date);
    });

    it('should add assistant message', () => {
      const { addMessage } = useChatStore.getState();
      addMessage('assistant', '歌曲解析完成');
      const { messages } = useChatStore.getState();
      expect(messages[0].role).toBe('assistant');
    });
  });

  describe('appendToLastMessage', () => {
    it('should append content to last message', () => {
      const { addMessage, appendToLastMessage } = useChatStore.getState();
      addMessage('assistant', '你好');
      appendToLastMessage('，世界');
      const { messages } = useChatStore.getState();
      expect(messages[0].content).toBe('你好，世界');
    });

    it('should not throw when no messages', () => {
      const { appendToLastMessage } = useChatStore.getState();
      expect(() => appendToLastMessage('test')).not.toThrow();
    });
  });

  describe('replaceLastMessage', () => {
    it('should replace last message content', () => {
      const { addMessage, replaceLastMessage } = useChatStore.getState();
      addMessage('assistant', '原始内容');
      replaceLastMessage('替换内容');
      const { messages } = useChatStore.getState();
      expect(messages[0].content).toBe('替换内容');
    });

    it('should not throw when no messages', () => {
      const { replaceLastMessage } = useChatStore.getState();
      expect(() => replaceLastMessage('test')).not.toThrow();
    });
  });

  describe('setSessionId', () => {
    it('should set sessionId', () => {
      const { setSessionId } = useChatStore.getState();
      setSessionId('mv-123');
      expect(useChatStore.getState().sessionId).toBe('mv-123');
    });
  });

  describe('setCurrentStep', () => {
    it('should update currentStep and sync viewingStep', () => {
      const { setCurrentStep } = useChatStore.getState();
      setCurrentStep(2);
      expect(useChatStore.getState().currentStep).toBe(2);
      expect(useChatStore.getState().viewingStep).toBe(2);
    });
  });

  describe('viewingStep', () => {
    it('should set viewingStep independently', () => {
      const { setViewingStep } = useChatStore.getState();
      setViewingStep(2);
      expect(useChatStore.getState().viewingStep).toBe(2);
      expect(useChatStore.getState().currentStep).toBe(1);
    });
  });

  describe('stepContents', () => {
    it('should set step content', () => {
      const { setStepContent } = useChatStore.getState();
      setStepContent(1, '歌曲分析结果');
      expect(useChatStore.getState().stepContents[1]).toBe('歌曲分析结果');
    });

    it('should append to step content', () => {
      const { setStepContent, appendStepContent } = useChatStore.getState();
      setStepContent(1, '你好');
      appendStepContent(1, '世界');
      expect(useChatStore.getState().stepContents[1]).toBe('你好世界');
    });

    it('should create new entry when appending to empty step', () => {
      const { appendStepContent } = useChatStore.getState();
      appendStepContent(2, '新内容');
      expect(useChatStore.getState().stepContents[2]).toBe('新内容');
    });
  });

  describe('isStreaming', () => {
    it('should set streaming state', () => {
      const { setIsStreaming } = useChatStore.getState();
      setIsStreaming(true);
      expect(useChatStore.getState().isStreaming).toBe(true);
    });
  });

  describe('shots', () => {
    it('should set shots', () => {
      const { setShots } = useChatStore.getState();
      const mockShots = [
        { shotNumber: 1, duration: '5s', lyricsRef: '你好世界', visualDescription: '城市夜景', cameraMovement: '推镜头', lightingTone: 'neon-lit', seedancePrompt: 'A city at night...' },
      ];
      setShots(mockShots);
      expect(useChatStore.getState().shots).toEqual(mockShots);
    });

    it('should append shots', () => {
      const { setShots, appendShots } = useChatStore.getState();
      const shot1 = [{ shotNumber: 1, duration: '5s', lyricsRef: 'A', visualDescription: 'desc', cameraMovement: '推', lightingTone: 'neon', seedancePrompt: '...' }];
      const shot2 = [{ shotNumber: 2, duration: '6s', lyricsRef: 'B', visualDescription: 'desc2', cameraMovement: '拉', lightingTone: 'golden', seedancePrompt: '...' }];
      setShots(shot1);
      appendShots(shot2);
      expect(useChatStore.getState().shots).toHaveLength(2);
    });
  });

  describe('error', () => {
    it('should set error message', () => {
      const { setError } = useChatStore.getState();
      setError('网络错误');
      expect(useChatStore.getState().error).toBe('网络错误');
    });

    it('should clear error', () => {
      const { setError } = useChatStore.getState();
      setError('网络错误');
      setError(null);
      expect(useChatStore.getState().error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset all state', () => {
      const state = useChatStore.getState();
      state.addMessage('user', '测试');
      state.setSessionId('mv-123');
      state.setCurrentStep(2);
      state.setIsStreaming(true);
      state.setShots([{ shotNumber: 1, duration: '5s', lyricsRef: '', visualDescription: '', cameraMovement: '', lightingTone: '', seedancePrompt: '' }]);
      state.setError('错误');

      state.reset();

      const fresh = useChatStore.getState();
      expect(fresh.messages).toEqual([]);
      expect(fresh.sessionId).toBeNull();
      expect(fresh.currentStep).toBe(1);
      expect(fresh.viewingStep).toBe(1);
      expect(fresh.stepContents).toEqual({});
      expect(fresh.isStreaming).toBe(false);
      expect(fresh.shots).toEqual([]);
      expect(fresh.error).toBeNull();
    });
  });

  describe('flowSteps', () => {
    it('should return correct step statuses based on currentStep', () => {
      const { setCurrentStep } = useChatStore.getState();
      setCurrentStep(2);
      const steps = useChatStore.getState().getFlowSteps();
      expect(steps[0].status).toBe('completed');
      expect(steps[1].status).toBe('active');
      expect(steps[2].status).toBe('pending');
    });

    it('should have 3 steps', () => {
      const steps = useChatStore.getState().getFlowSteps();
      expect(steps).toHaveLength(3);
    });
  });

  describe('history state', () => {
    it('should have initial history fields', () => {
      const state = useChatStore.getState();
      expect(state.historyList).toEqual([]);
      expect(state.historyLoading).toBe(false);
      expect(state.historyOpen).toBe(false);
    });

    it('setHistoryOpen should toggle drawer', () => {
      useChatStore.getState().setHistoryOpen(true);
      expect(useChatStore.getState().historyOpen).toBe(true);
      useChatStore.getState().setHistoryOpen(false);
      expect(useChatStore.getState().historyOpen).toBe(false);
    });

    it('reset should clear history state', () => {
      useChatStore.setState({ historyOpen: true, historyList: [{ id: 'x', title: 't', currentStep: 1, status: 'active', updatedAt: '' }] });
      useChatStore.getState().reset();
      const state = useChatStore.getState();
      expect(state.historyOpen).toBe(false);
      expect(state.historyList).toEqual([]);
    });
  });

  describe('loadHistory', () => {
    it('should load history list', async () => {
      const mockList = [
        { id: 'mv-1', title: '测试会话', currentStep: 2, status: 'active', updatedAt: '2026-01-01' },
        { id: 'mv-2', title: '另一个', currentStep: 3, status: 'active', updatedAt: '2026-01-02' },
      ];
      vi.mocked(fetchSessionHistory).mockResolvedValue(mockList);

      await useChatStore.getState().loadHistory();

      expect(fetchSessionHistory).toHaveBeenCalledWith(20);
      expect(useChatStore.getState().historyList).toEqual(mockList);
      expect(useChatStore.getState().historyLoading).toBe(false);
    });

    it('should clear list on failure', async () => {
      vi.mocked(fetchSessionHistory).mockRejectedValue(new Error('网络错误'));

      await useChatStore.getState().loadHistory();

      expect(useChatStore.getState().historyList).toEqual([]);
      expect(useChatStore.getState().historyLoading).toBe(false);
    });
  });

  describe('restoreSession', () => {
    it('should restore full session state', async () => {
      const mockSession = {
        sessionId: 'mv-restore',
        title: '恢复测试',
        currentStep: 2,
        messages: [
          { role: 'user' as const, content: '江南烟雨的故事', timestamp: '2026-01-01T00:00:00Z' },
          { role: 'assistant' as const, content: '第一步分析', timestamp: '2026-01-01T00:01:00Z' },
        ],
        stepContents: { 1: '歌曲分析内容' },
        shots: [],
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };
      vi.mocked(fetchFullSession).mockResolvedValue(mockSession);

      await useChatStore.getState().restoreSession('mv-restore');

      const state = useChatStore.getState();
      expect(state.sessionId).toBe('mv-restore');
      expect(state.currentStep).toBe(2);
      expect(state.messages).toHaveLength(2);
      expect(state.historyOpen).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set error on restore failure', async () => {
      vi.mocked(fetchFullSession).mockRejectedValue(new Error('会话不存在'));

      await useChatStore.getState().restoreSession('mv-bad');

      expect(useChatStore.getState().error).toBe('恢复会话失败: 会话不存在');
    });
  });

  describe('deleteHistorySession', () => {
    it('should remove from list and call API', async () => {
      vi.mocked(deleteSessionAPI).mockResolvedValue(undefined);
      useChatStore.setState({
        historyList: [
          { id: 'mv-1', title: 'A', currentStep: 1, status: 'active', updatedAt: '' },
          { id: 'mv-2', title: 'B', currentStep: 2, status: 'active', updatedAt: '' },
        ],
      });

      await useChatStore.getState().deleteHistorySession('mv-1');

      expect(deleteSessionAPI).toHaveBeenCalledWith('mv-1');
      expect(useChatStore.getState().historyList).toHaveLength(1);
      expect(useChatStore.getState().historyList[0].id).toBe('mv-2');
    });

    it('should reset if deleting active session', async () => {
      vi.mocked(deleteSessionAPI).mockResolvedValue(undefined);
      useChatStore.setState({
        sessionId: 'mv-active',
        historyList: [
          { id: 'mv-active', title: 'Active', currentStep: 3, status: 'active', updatedAt: '' },
        ],
      });

      await useChatStore.getState().deleteHistorySession('mv-active');

      expect(useChatStore.getState().sessionId).toBeNull();
      expect(useChatStore.getState().messages).toEqual([]);
    });
  });
});
