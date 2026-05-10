import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useChatStore } from '../store/chatStore';

vi.mock('../services/api', () => ({
  fetchSessionHistory: vi.fn(),
  fetchFullSession: vi.fn(),
  deleteSessionAPI: vi.fn(),
}));

import { fetchSessionHistory, fetchFullSession, deleteSessionAPI } from '../services/api';

function resetStore() {
  useChatStore.setState(useChatStore.getInitialState());
}

describe('chatStore', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('初始状态', () => {
    it('应有正确的初始值', () => {
      const state = useChatStore.getState();
      expect(state.messages).toEqual([]);
      expect(state.sessionId).toBeNull();
      expect(state.currentStep).toBe(1);
      expect(state.viewingStep).toBe(1);
      expect(state.stepContents).toEqual({});
      expect(state.isStreaming).toBe(false);
      expect(state.script).toBeNull();
      expect(state.showTierModal).toBe(false);
      expect(state.selectedTier).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe('addMessage', () => {
    it('应添加用户消息', () => {
      const { addMessage } = useChatStore.getState();
      addMessage('user', '你好');
      const { messages } = useChatStore.getState();
      expect(messages).toHaveLength(1);
      expect(messages[0].role).toBe('user');
      expect(messages[0].content).toBe('你好');
      expect(messages[0].id).toBeDefined();
      expect(messages[0].timestamp).toBeInstanceOf(Date);
    });

    it('应添加助手消息', () => {
      const { addMessage } = useChatStore.getState();
      addMessage('assistant', '我是广告创意总监');
      const { messages } = useChatStore.getState();
      expect(messages[0].role).toBe('assistant');
    });

    it('应支持带图片的消息', () => {
      const { addMessage } = useChatStore.getState();
      addMessage('user', '看这个产品', ['img1.jpg', 'img2.jpg']);
      const { messages } = useChatStore.getState();
      expect(messages[0].images).toEqual(['img1.jpg', 'img2.jpg']);
    });
  });

  describe('appendToLastMessage', () => {
    it('应追加内容到最后一条消息', () => {
      const { addMessage, appendToLastMessage } = useChatStore.getState();
      addMessage('assistant', '你好');
      appendToLastMessage('，世界');
      const { messages } = useChatStore.getState();
      expect(messages[0].content).toBe('你好，世界');
    });

    it('无消息时不应报错', () => {
      const { appendToLastMessage } = useChatStore.getState();
      expect(() => appendToLastMessage('test')).not.toThrow();
    });
  });

  describe('setSessionId', () => {
    it('应设置sessionId', () => {
      const { setSessionId } = useChatStore.getState();
      setSessionId('ad-123');
      expect(useChatStore.getState().sessionId).toBe('ad-123');
    });
  });

  describe('setCurrentStep', () => {
    it('应更新当前步骤并同步viewingStep', () => {
      const { setCurrentStep } = useChatStore.getState();
      setCurrentStep(3);
      expect(useChatStore.getState().currentStep).toBe(3);
      expect(useChatStore.getState().viewingStep).toBe(3);
    });
  });

  describe('viewingStep', () => {
    it('应独立设置viewingStep', () => {
      const { setViewingStep } = useChatStore.getState();
      setViewingStep(2);
      expect(useChatStore.getState().viewingStep).toBe(2);
      expect(useChatStore.getState().currentStep).toBe(1);
    });
  });

  describe('stepContents', () => {
    it('应设置步骤内容', () => {
      const { setStepContent } = useChatStore.getState();
      setStepContent(1, '产品分析结果');
      expect(useChatStore.getState().stepContents[1]).toBe('产品分析结果');
    });

    it('应追加步骤内容', () => {
      const { setStepContent, appendStepContent } = useChatStore.getState();
      setStepContent(1, '你好');
      appendStepContent(1, '世界');
      expect(useChatStore.getState().stepContents[1]).toBe('你好世界');
    });

    it('空步骤追加应创建新内容', () => {
      const { appendStepContent } = useChatStore.getState();
      appendStepContent(2, '新内容');
      expect(useChatStore.getState().stepContents[2]).toBe('新内容');
    });
  });

  describe('setIsStreaming', () => {
    it('应设置流式状态', () => {
      const { setIsStreaming } = useChatStore.getState();
      setIsStreaming(true);
      expect(useChatStore.getState().isStreaming).toBe(true);
    });
  });

  describe('setScript', () => {
    it('应设置生成的剧本', () => {
      const { setScript } = useChatStore.getState();
      setScript('## 第一幕\n主角登场');
      expect(useChatStore.getState().script).toBe('## 第一幕\n主角登场');
    });
  });

  describe('setShowTierModal', () => {
    it('应控制档位弹窗显示', () => {
      const { setShowTierModal } = useChatStore.getState();
      setShowTierModal(true);
      expect(useChatStore.getState().showTierModal).toBe(true);
    });
  });

  describe('setSelectedTier', () => {
    it('应设置选择的档位', () => {
      const { setSelectedTier } = useChatStore.getState();
      setSelectedTier('short');
      expect(useChatStore.getState().selectedTier).toBe('short');
    });
  });

  describe('setError', () => {
    it('应设置错误信息', () => {
      const { setError } = useChatStore.getState();
      setError('网络错误');
      expect(useChatStore.getState().error).toBe('网络错误');
    });

    it('应清除错误信息', () => {
      const { setError } = useChatStore.getState();
      setError('网络错误');
      setError(null);
      expect(useChatStore.getState().error).toBeNull();
    });
  });

  describe('reset', () => {
    it('应重置所有状态', () => {
      const state = useChatStore.getState();
      state.addMessage('user', '测试');
      state.setSessionId('ad-123');
      state.setCurrentStep(3);
      state.setIsStreaming(true);
      state.setScript('剧本内容');
      state.setError('错误');

      state.reset();

      const fresh = useChatStore.getState();
      expect(fresh.messages).toEqual([]);
      expect(fresh.sessionId).toBeNull();
      expect(fresh.currentStep).toBe(1);
      expect(fresh.viewingStep).toBe(1);
      expect(fresh.stepContents).toEqual({});
      expect(fresh.isStreaming).toBe(false);
      expect(fresh.script).toBeNull();
      expect(fresh.error).toBeNull();
    });
  });

  describe('flowSteps', () => {
    it('应根据currentStep返回正确的步骤状态', () => {
      const { setCurrentStep } = useChatStore.getState();
      setCurrentStep(3);
      const steps = useChatStore.getState().getFlowSteps();
      expect(steps[0].status).toBe('completed');
      expect(steps[1].status).toBe('completed');
      expect(steps[2].status).toBe('active');
      expect(steps[3].status).toBe('pending');
    });
  });

  describe('历史记录状态', () => {
    it('初始状态应包含历史记录字段', () => {
      const state = useChatStore.getState();
      expect(state.historyList).toEqual([]);
      expect(state.historyLoading).toBe(false);
      expect(state.historyOpen).toBe(false);
    });

    it('setHistoryOpen 应切换抽屉状态', () => {
      useChatStore.getState().setHistoryOpen(true);
      expect(useChatStore.getState().historyOpen).toBe(true);
      useChatStore.getState().setHistoryOpen(false);
      expect(useChatStore.getState().historyOpen).toBe(false);
    });

    it('reset 应重置历史记录状态', () => {
      useChatStore.setState({ historyOpen: true, historyList: [{ id: 'x', title: 't', currentStep: 1, status: 'active', updatedAt: '' }] });
      useChatStore.getState().reset();
      const state = useChatStore.getState();
      expect(state.historyOpen).toBe(false);
      expect(state.historyList).toEqual([]);
    });
  });

  describe('loadHistory', () => {
    it('应加载历史列表', async () => {
      const mockList = [
        { id: 'ad-1', title: '测试会话', currentStep: 3, status: 'active', updatedAt: '2026-01-01' },
        { id: 'ad-2', title: '另一个', currentStep: 1, status: 'active', updatedAt: '2026-01-02' },
      ];
      vi.mocked(fetchSessionHistory).mockResolvedValue(mockList);

      await useChatStore.getState().loadHistory();

      expect(fetchSessionHistory).toHaveBeenCalledWith(20);
      expect(useChatStore.getState().historyList).toEqual(mockList);
      expect(useChatStore.getState().historyLoading).toBe(false);
    });

    it('加载失败应清空列表且不报错', async () => {
      vi.mocked(fetchSessionHistory).mockRejectedValue(new Error('网络错误'));

      await useChatStore.getState().loadHistory();

      expect(useChatStore.getState().historyList).toEqual([]);
      expect(useChatStore.getState().historyLoading).toBe(false);
    });
  });

  describe('restoreSession', () => {
    it('应恢复完整会话状态', async () => {
      const mockSession = {
        sessionId: 'ad-restore',
        title: '恢复测试',
        currentStep: 3,
        stepConfirmed: { 1: true, 2: true, 3: false, 4: false, 5: false },
        productProfile: { product: { name: '测试产品' }, audience: {}, strategy: {}, creative: {}, placement: {}, source: { type: null, taobaoLink: null, uploadedImages: [] } },
        messages: [
          { role: 'user' as const, content: '你好', timestamp: '2026-01-01T00:00:00Z' },
          { role: 'assistant' as const, content: '第一步分析', timestamp: '2026-01-01T00:01:00Z' },
          { role: 'user' as const, content: '确认', timestamp: '2026-01-01T00:02:00Z' },
          { role: 'assistant' as const, content: '第二步分析', timestamp: '2026-01-01T00:03:00Z' },
          { role: 'user' as const, content: '好的', timestamp: '2026-01-01T00:04:00Z' },
          { role: 'assistant' as const, content: '第三步内容', timestamp: '2026-01-01T00:05:00Z' },
        ],
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };
      vi.mocked(fetchFullSession).mockResolvedValue(mockSession);

      await useChatStore.getState().restoreSession('ad-restore');

      const state = useChatStore.getState();
      expect(state.sessionId).toBe('ad-restore');
      expect(state.currentStep).toBe(3);
      expect(state.messages).toHaveLength(6);
      expect(state.messages[0].role).toBe('user');
      expect(state.messages[0].content).toBe('你好');
      expect(state.historyOpen).toBe(false);
      expect(state.error).toBeNull();
      expect(state.script).toBeNull();
    });

    it('恢复失败应设置错误信息', async () => {
      vi.mocked(fetchFullSession).mockRejectedValue(new Error('会话不存在'));

      await useChatStore.getState().restoreSession('ad-bad');

      expect(useChatStore.getState().error).toBe('恢复会话失败: 会话不存在');
    });
  });

  describe('deleteHistorySession', () => {
    it('应从列表中删除并调用API', async () => {
      vi.mocked(deleteSessionAPI).mockResolvedValue(undefined);
      useChatStore.setState({
        historyList: [
          { id: 'ad-1', title: 'A', currentStep: 1, status: 'active', updatedAt: '' },
          { id: 'ad-2', title: 'B', currentStep: 2, status: 'active', updatedAt: '' },
        ],
      });

      await useChatStore.getState().deleteHistorySession('ad-1');

      expect(deleteSessionAPI).toHaveBeenCalledWith('ad-1');
      expect(useChatStore.getState().historyList).toHaveLength(1);
      expect(useChatStore.getState().historyList[0].id).toBe('ad-2');
    });

    it('删除当前活跃会话应同时重置', async () => {
      vi.mocked(deleteSessionAPI).mockResolvedValue(undefined);
      useChatStore.setState({
        sessionId: 'ad-active',
        historyList: [
          { id: 'ad-active', title: 'Active', currentStep: 3, status: 'active', updatedAt: '' },
        ],
      });

      await useChatStore.getState().deleteHistorySession('ad-active');

      expect(useChatStore.getState().sessionId).toBeNull();
      expect(useChatStore.getState().messages).toEqual([]);
    });
  });

  describe('setLastMessageOptions', () => {
    it('应设置最后一条消息的选项', () => {
      const { addMessage, setLastMessageOptions } = useChatStore.getState();
      addMessage('assistant', '请选择方案');

      const options = [
        { id: '1', label: '情感共鸣', description: '让用户产生共情' },
        { id: '2', label: '搞笑反转', description: '用反差制造记忆点' },
      ];
      setLastMessageOptions(options);

      const { messages } = useChatStore.getState();
      expect(messages[0].options).toEqual(options);
    });

    it('无消息时不应报错', () => {
      const { setLastMessageOptions } = useChatStore.getState();
      expect(() => setLastMessageOptions([{ id: '1', label: 'a', description: 'b' }])).not.toThrow();
    });

    it('不应影响之前的消息', () => {
      const { addMessage, setLastMessageOptions } = useChatStore.getState();
      addMessage('user', '你好');
      addMessage('assistant', '方案如下');

      setLastMessageOptions([{ id: '1', label: 'X', description: 'Y' }]);

      const { messages } = useChatStore.getState();
      expect(messages[0].options).toBeUndefined();
      expect(messages[1].options).toHaveLength(1);
    });
  });
});
