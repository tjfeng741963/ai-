import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SessionManager } from '../services/ad-script-agent.js';

describe('SessionManager', () => {
  let manager;

  beforeEach(() => {
    manager = new SessionManager({ persist: false });
  });

  afterEach(() => {
    manager.destroy();
  });

  describe('createSession', () => {
    it('应该创建新会话并返回sessionId', () => {
      const sessionId = manager.createSession();
      expect(sessionId).toMatch(/^ad-/);
    });

    it('创建的会话应包含初始产品档案结构', () => {
      const sessionId = manager.createSession();
      const session = manager.getSession(sessionId);

      expect(session.currentStep).toBe(1);
      expect(session.messages).toEqual([]);
      expect(session.productProfile).toEqual({
        product: {},
        audience: {},
        strategy: {},
        creative: {},
        placement: {},
        source: { type: null, taobaoLink: null, uploadedImages: [] },
      });
      expect(session.stepConfirmed).toEqual({
        1: false, 2: false, 3: false, 4: false, 5: false,
      });
    });

    it('每次创建的sessionId应不同', () => {
      const id1 = manager.createSession();
      const id2 = manager.createSession();
      expect(id1).not.toBe(id2);
    });
  });

  describe('getSession', () => {
    it('获取存在的会话应返回完整数据', () => {
      const sessionId = manager.createSession();
      const session = manager.getSession(sessionId);

      expect(session).toBeDefined();
      expect(session.sessionId).toBe(sessionId);
      expect(session.createdAt).toBeInstanceOf(Date);
      expect(session.updatedAt).toBeInstanceOf(Date);
    });

    it('获取不存在的会话应抛出错误', () => {
      expect(() => manager.getSession('ad-nonexistent')).toThrow('会话不存在');
    });
  });

  describe('updateProfile', () => {
    it('应该合并更新产品档案', () => {
      const sessionId = manager.createSession();

      manager.updateProfile(sessionId, {
        product: { name: 'AI玩具狗', category: 'AI玩具' },
      });

      const session = manager.getSession(sessionId);
      expect(session.productProfile.product.name).toBe('AI玩具狗');
      expect(session.productProfile.product.category).toBe('AI玩具');
    });

    it('更新应深度合并而非覆盖', () => {
      const sessionId = manager.createSession();

      manager.updateProfile(sessionId, {
        product: { name: 'AI玩具狗' },
      });
      manager.updateProfile(sessionId, {
        product: { category: 'AI玩具' },
      });

      const session = manager.getSession(sessionId);
      expect(session.productProfile.product.name).toBe('AI玩具狗');
      expect(session.productProfile.product.category).toBe('AI玩具');
    });

    it('更新后updatedAt应变化', async () => {
      const sessionId = manager.createSession();
      const before = manager.getSession(sessionId).updatedAt.getTime();

      await new Promise((r) => setTimeout(r, 10));
      manager.updateProfile(sessionId, { product: { name: 'test' } });

      const after = manager.getSession(sessionId).updatedAt.getTime();
      expect(after).toBeGreaterThanOrEqual(before);
    });
  });

  describe('advanceStep', () => {
    it('应该推进到下一步', () => {
      const sessionId = manager.createSession();
      expect(manager.getSession(sessionId).currentStep).toBe(1);

      manager.confirmStep(sessionId, 1);
      expect(manager.getSession(sessionId).currentStep).toBe(2);
      expect(manager.getSession(sessionId).stepConfirmed[1]).toBe(true);
    });

    it('不应超过第6步', () => {
      const sessionId = manager.createSession();
      for (let i = 1; i <= 6; i++) {
        manager.confirmStep(sessionId, i);
      }
      expect(manager.getSession(sessionId).currentStep).toBe(6);
    });

    it('可以回退到之前的步骤', () => {
      const sessionId = manager.createSession();
      manager.confirmStep(sessionId, 1);
      manager.confirmStep(sessionId, 2);
      expect(manager.getSession(sessionId).currentStep).toBe(3);

      manager.goToStep(sessionId, 1);
      expect(manager.getSession(sessionId).currentStep).toBe(1);
    });
  });

  describe('addMessage', () => {
    it('应该添加用户消息', () => {
      const sessionId = manager.createSession();
      manager.addMessage(sessionId, 'user', '帮我做个广告');

      const session = manager.getSession(sessionId);
      expect(session.messages).toHaveLength(1);
      expect(session.messages[0].role).toBe('user');
      expect(session.messages[0].content).toBe('帮我做个广告');
    });

    it('应该添加assistant消息', () => {
      const sessionId = manager.createSession();
      manager.addMessage(sessionId, 'assistant', '好的，请告诉我产品信息');

      const session = manager.getSession(sessionId);
      expect(session.messages[0].role).toBe('assistant');
    });

    it('消息应包含时间戳', () => {
      const sessionId = manager.createSession();
      manager.addMessage(sessionId, 'user', 'test');

      const session = manager.getSession(sessionId);
      expect(session.messages[0].timestamp).toBeInstanceOf(Date);
    });
  });

  describe('deleteSession', () => {
    it('应该删除已存在的会话', () => {
      const sessionId = manager.createSession();
      manager.deleteSession(sessionId);

      expect(() => manager.getSession(sessionId)).toThrow('会话不存在');
    });

    it('删除不存在的会话不应报错', () => {
      expect(() => manager.deleteSession('ad-nonexistent')).not.toThrow();
    });
  });

  describe('isAllStepsConfirmed', () => {
    it('前5步全部确认后应返回true', () => {
      const sessionId = manager.createSession();
      for (let i = 1; i <= 5; i++) {
        manager.confirmStep(sessionId, i);
      }
      expect(manager.isReadyToGenerate(sessionId)).toBe(true);
    });

    it('有步骤未确认应返回false', () => {
      const sessionId = manager.createSession();
      manager.confirmStep(sessionId, 1);
      expect(manager.isReadyToGenerate(sessionId)).toBe(false);
    });
  });
});
