import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { SessionManager } from '../services/ad-script-agent.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

let db;

function createTestDB() {
  const testDb = new Database(':memory:');
  testDb.pragma('foreign_keys = ON');
  const schema = readFileSync(join(__dirname, '..', 'db', 'schema.sql'), 'utf-8');
  testDb.exec(schema);
  return testDb;
}

describe('SessionManager 持久化', () => {
  let manager;

  beforeAll(() => {
    db = createTestDB();
  });

  afterEach(() => {
    if (manager) manager.destroy();
  });

  afterAll(() => {
    db.close();
  });

  it('createSession 应同时写入 SQLite', () => {
    manager = new SessionManager({ db });
    const sessionId = manager.createSession();

    const row = db.prepare('SELECT * FROM ad_script_sessions WHERE id = ?').get(sessionId);
    expect(row).toBeDefined();
    expect(row.current_step).toBe(1);
    expect(row.title).toBe('新对话');
  });

  it('addMessage 应写入 ad_script_messages', () => {
    manager = new SessionManager({ db });
    const sessionId = manager.createSession();

    manager.addMessage(sessionId, 'user', '帮我做一个AI玩具狗的广告');
    manager.addMessage(sessionId, 'assistant', '好的，我来分析产品');

    const msgs = db.prepare('SELECT * FROM ad_script_messages WHERE session_id = ?').all(sessionId);
    expect(msgs).toHaveLength(2);
    expect(msgs[0].role).toBe('user');
    expect(msgs[0].step).toBe(1);
  });

  it('首条用户消息应自动生成标题', () => {
    manager = new SessionManager({ db });
    const sessionId = manager.createSession();

    manager.addMessage(sessionId, 'user', '帮我做一个AI玩具狗的广告剧本');

    const row = db.prepare('SELECT title FROM ad_script_sessions WHERE id = ?').get(sessionId);
    expect(row.title).toContain('AI玩具狗');
    expect(row.title.length).toBeLessThanOrEqual(23);
  });

  it('confirmStep 应持久化步骤状态', () => {
    manager = new SessionManager({ db });
    const sessionId = manager.createSession();
    manager.addMessage(sessionId, 'user', '测试');
    manager.addMessage(sessionId, 'assistant', '回复');

    manager.confirmStep(sessionId, 1);

    const row = db.prepare('SELECT * FROM ad_script_sessions WHERE id = ?').get(sessionId);
    expect(row.current_step).toBe(2);
    expect(JSON.parse(row.step_confirmed)['1']).toBe(true);
  });

  it('updateProfile 应持久化产品档案', () => {
    manager = new SessionManager({ db });
    const sessionId = manager.createSession();

    manager.updateProfile(sessionId, { product: { name: 'AI玩具狗' } });

    const row = db.prepare('SELECT product_profile FROM ad_script_sessions WHERE id = ?').get(sessionId);
    const profile = JSON.parse(row.product_profile);
    expect(profile.product.name).toBe('AI玩具狗');
  });

  it('getSession 应能从 SQLite 恢复已驱逐的会话', () => {
    manager = new SessionManager({ db });
    const sessionId = manager.createSession();
    manager.addMessage(sessionId, 'user', '测试消息');
    manager.addMessage(sessionId, 'assistant', '回复');
    manager.confirmStep(sessionId, 1);

    manager._sessions.delete(sessionId);

    const session = manager.getSession(sessionId);
    expect(session.sessionId).toBe(sessionId);
    expect(session.currentStep).toBe(2);
    expect(session.messages).toHaveLength(2);
    expect(session.messages[0].content).toBe('测试消息');
    expect(session.stepConfirmed[1]).toBe(true);
  });

  it('deleteSession 应同时删除 SQLite 数据', () => {
    manager = new SessionManager({ db });
    const sessionId = manager.createSession();
    manager.addMessage(sessionId, 'user', '测试');

    manager.deleteSession(sessionId);

    const row = db.prepare('SELECT * FROM ad_script_sessions WHERE id = ?').get(sessionId);
    expect(row).toBeUndefined();
    const msgs = db.prepare('SELECT * FROM ad_script_messages WHERE session_id = ?').all(sessionId);
    expect(msgs).toHaveLength(0);
  });

  it('listSessions 应返回会话列表', () => {
    manager = new SessionManager({ db });
    manager.createSession();
    manager.createSession();

    const list = manager.listSessions(10);
    expect(list.length).toBeGreaterThanOrEqual(2);
    expect(list[0]).toHaveProperty('id');
    expect(list[0]).toHaveProperty('title');
  });

  it('persist=false 时不写 SQLite（兼容旧测试）', () => {
    const mgr = new SessionManager({ persist: false });
    const sessionId = mgr.createSession();

    const row = db.prepare('SELECT * FROM ad_script_sessions WHERE id = ?').get(sessionId);
    expect(row).toBeUndefined();

    mgr.destroy();
  });
});
