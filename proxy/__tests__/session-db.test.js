import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let db;

function setupTestDB() {
  db = new Database(':memory:');
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  const schema = readFileSync(join(__dirname, '..', 'db', 'schema.sql'), 'utf-8');
  db.exec(schema);
  return db;
}

describe('ad_script_sessions schema', () => {
  beforeAll(() => setupTestDB());
  afterAll(() => db.close());

  it('应创建 ad_script_sessions 表', () => {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='ad_script_sessions'").all();
    expect(tables).toHaveLength(1);
  });

  it('应创建 ad_script_messages 表', () => {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='ad_script_messages'").all();
    expect(tables).toHaveLength(1);
  });

  it('应能插入会话记录', () => {
    db.prepare(`
      INSERT INTO ad_script_sessions (id, title, current_step, product_profile, step_confirmed)
      VALUES ('ad-test1', '测试会话', 1, '{}', '{"1":false,"2":false,"3":false,"4":false,"5":false}')
    `).run();

    const row = db.prepare('SELECT * FROM ad_script_sessions WHERE id = ?').get('ad-test1');
    expect(row.id).toBe('ad-test1');
    expect(row.title).toBe('测试会话');
    expect(row.current_step).toBe(1);
    expect(row.status).toBe('active');
  });

  it('应能插入消息并关联会话', () => {
    db.prepare(`
      INSERT INTO ad_script_messages (session_id, role, content, step)
      VALUES ('ad-test1', 'user', '帮我做广告', 1)
    `).run();
    db.prepare(`
      INSERT INTO ad_script_messages (session_id, role, content, step)
      VALUES ('ad-test1', 'assistant', '好的，请告诉我产品信息', 1)
    `).run();

    const msgs = db.prepare('SELECT * FROM ad_script_messages WHERE session_id = ? ORDER BY id').all('ad-test1');
    expect(msgs).toHaveLength(2);
    expect(msgs[0].role).toBe('user');
    expect(msgs[1].role).toBe('assistant');
    expect(msgs[0].step).toBe(1);
  });

  it('删除会话应级联删除消息', () => {
    db.prepare('DELETE FROM ad_script_sessions WHERE id = ?').run('ad-test1');
    const msgs = db.prepare('SELECT * FROM ad_script_messages WHERE session_id = ?').all('ad-test1');
    expect(msgs).toHaveLength(0);
  });

  it('不允许插入不存在会话的消息', () => {
    expect(() => {
      db.prepare(`
        INSERT INTO ad_script_messages (session_id, role, content, step)
        VALUES ('ad-nonexistent', 'user', 'test', 1)
      `).run();
    }).toThrow();
  });
});
