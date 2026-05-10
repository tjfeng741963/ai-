import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  listAdSessions,
  getAdSessionWithMessages,
  upsertAdSession,
  insertAdMessage,
  deleteAdSession,
  updateAdSessionTitle,
} from '../db/ad-script-db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

let db;

function setupTestDB() {
  db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  const schema = readFileSync(join(__dirname, '..', 'db', 'schema.sql'), 'utf-8');
  db.exec(schema);
  return db;
}

describe('ad-script DB CRUD', () => {
  beforeAll(() => {
    setupTestDB();
  });
  afterAll(() => db.close());

  describe('upsertAdSession', () => {
    it('应插入新会话', () => {
      upsertAdSession(db, {
        id: 'ad-crud1',
        title: 'AI玩具狗广告',
        currentStep: 2,
        productProfile: { product: { name: 'AI玩具狗' } },
        stepConfirmed: { 1: true, 2: false, 3: false, 4: false, 5: false },
      });

      const row = db.prepare('SELECT * FROM ad_script_sessions WHERE id = ?').get('ad-crud1');
      expect(row).toBeDefined();
      expect(row.title).toBe('AI玩具狗广告');
      expect(row.current_step).toBe(2);
      expect(JSON.parse(row.product_profile).product.name).toBe('AI玩具狗');
    });

    it('应更新已存在的会话', () => {
      upsertAdSession(db, {
        id: 'ad-crud1',
        title: 'AI玩具狗广告（更新）',
        currentStep: 3,
        productProfile: { product: { name: 'AI玩具狗' } },
        stepConfirmed: { 1: true, 2: true, 3: false, 4: false, 5: false },
      });

      const row = db.prepare('SELECT * FROM ad_script_sessions WHERE id = ?').get('ad-crud1');
      expect(row.title).toBe('AI玩具狗广告（更新）');
      expect(row.current_step).toBe(3);
    });
  });

  describe('insertAdMessage', () => {
    it('应插入消息', () => {
      insertAdMessage(db, 'ad-crud1', 'user', '帮我做广告', 1);
      insertAdMessage(db, 'ad-crud1', 'assistant', '好的，分析产品中...', 1);
      insertAdMessage(db, 'ad-crud1', 'user', '选1', 2);

      const msgs = db.prepare('SELECT * FROM ad_script_messages WHERE session_id = ?').all('ad-crud1');
      expect(msgs).toHaveLength(3);
      expect(msgs[2].step).toBe(2);
    });
  });

  describe('listAdSessions', () => {
    it('应返回会话列表（不含消息）', () => {
      upsertAdSession(db, {
        id: 'ad-crud2',
        title: '蓝牙耳机广告',
        currentStep: 1,
        productProfile: {},
        stepConfirmed: { 1: false, 2: false, 3: false, 4: false, 5: false },
      });

      const list = listAdSessions(db, 20);
      expect(list.length).toBeGreaterThanOrEqual(2);
      expect(list[0]).toHaveProperty('id');
      expect(list[0]).toHaveProperty('title');
      expect(list[0]).not.toHaveProperty('messages');
    });

    it('应按 updated_at 降序排列', () => {
      const list = listAdSessions(db, 20);
      for (let i = 1; i < list.length; i++) {
        expect(list[i - 1].updatedAt >= list[i].updatedAt).toBe(true);
      }
    });

    it('应支持 limit 参数', () => {
      const list = listAdSessions(db, 1);
      expect(list).toHaveLength(1);
    });
  });

  describe('getAdSessionWithMessages', () => {
    it('应返回完整会话含消息', () => {
      const session = getAdSessionWithMessages(db, 'ad-crud1');
      expect(session).toBeDefined();
      expect(session.id).toBe('ad-crud1');
      expect(session.title).toBe('AI玩具狗广告（更新）');
      expect(session.productProfile.product.name).toBe('AI玩具狗');
      expect(session.messages).toHaveLength(3);
      expect(session.messages[0].role).toBe('user');
      expect(session.messages[0].step).toBe(1);
    });

    it('不存在的会话应返回 null', () => {
      const session = getAdSessionWithMessages(db, 'ad-nonexistent');
      expect(session).toBeNull();
    });
  });

  describe('updateAdSessionTitle', () => {
    it('应更新标题', () => {
      updateAdSessionTitle(db, 'ad-crud1', '新标题');
      const row = db.prepare('SELECT title FROM ad_script_sessions WHERE id = ?').get('ad-crud1');
      expect(row.title).toBe('新标题');
    });
  });

  describe('deleteAdSession', () => {
    it('应删除会话和关联消息', () => {
      deleteAdSession(db, 'ad-crud1');
      const row = db.prepare('SELECT * FROM ad_script_sessions WHERE id = ?').get('ad-crud1');
      expect(row).toBeUndefined();
      const msgs = db.prepare('SELECT * FROM ad_script_messages WHERE session_id = ?').all('ad-crud1');
      expect(msgs).toHaveLength(0);
    });

    it('删除不存在的会话不应报错', () => {
      expect(() => deleteAdSession(db, 'ad-nonexistent')).not.toThrow();
    });
  });
});
