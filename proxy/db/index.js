/**
 * 数据库初始化 + CRUD 操作层
 *
 * 使用 better-sqlite3 同步操作，适合本项目单进程 Express 场景。
 */

import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 数据库文件路径
const DATA_DIR = join(__dirname, '..', 'data');
const DB_PATH = join(DATA_DIR, 'prompts.db');

let db;

/** 初始化数据库（自动建表） */
export function initDB() {
  if (db) return db;

  // 确保 data 目录存在
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // 执行建表 SQL
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  db.exec(schema);

  console.log(`[DB] SQLite 数据库已初始化: ${DB_PATH}`);
  return db;
}

/** 获取数据库实例 */
export function getDB() {
  if (!db) initDB();
  return db;
}

// ==================== Prompt Templates CRUD ====================

/** 列出提示词模板（可按 tool_id 过滤） */
export function listPrompts(toolId) {
  const d = getDB();
  if (toolId) {
    return d.prepare('SELECT * FROM prompt_templates WHERE tool_id = ? ORDER BY sort_order, id').all(toolId);
  }
  return d.prepare('SELECT * FROM prompt_templates ORDER BY tool_id, sort_order, id').all();
}

/** 获取单个提示词模板 */
export function getPrompt(id) {
  return getDB().prepare('SELECT * FROM prompt_templates WHERE id = ?').get(id);
}

/** 获取某工具的某个提示词（toolId + promptKey 组合查询） */
export function getPromptByToolAndKey(toolId, promptKey) {
  const id = `${toolId}.${promptKey}`;
  return getPrompt(id);
}

/** 更新提示词模板（只允许更新内容相关字段） */
export function updatePrompt(id, updates) {
  const d = getDB();
  const existing = d.prepare('SELECT * FROM prompt_templates WHERE id = ?').get(id);
  if (!existing) return null;

  // 记录历史
  insertHistory('prompt', id, existing.content, updates.content ?? existing.content);

  const fields = [];
  const values = [];

  if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
  if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
  if (updates.content !== undefined) { fields.push('content = ?'); values.push(updates.content); }
  if (updates.variables !== undefined) { fields.push('variables = ?'); values.push(JSON.stringify(updates.variables)); }
  if (updates.is_dynamic !== undefined) { fields.push('is_dynamic = ?'); values.push(updates.is_dynamic ? 1 : 0); }
  if (updates.variants !== undefined) { fields.push('variants = ?'); values.push(JSON.stringify(updates.variants)); }
  if (updates.sort_order !== undefined) { fields.push('sort_order = ?'); values.push(updates.sort_order); }

  if (fields.length === 0) return existing;

  fields.push("updated_at = datetime('now')");
  values.push(id);

  d.prepare(`UPDATE prompt_templates SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return d.prepare('SELECT * FROM prompt_templates WHERE id = ?').get(id);
}

/** 创建提示词模板（用于 seed） */
export function upsertPrompt(data) {
  const d = getDB();
  d.prepare(`
    INSERT INTO prompt_templates (id, tool_id, name, description, content, variables, is_dynamic, variants, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      description = excluded.description,
      content = excluded.content,
      variables = excluded.variables,
      is_dynamic = excluded.is_dynamic,
      variants = excluded.variants,
      sort_order = excluded.sort_order,
      updated_at = datetime('now')
  `).run(
    data.id,
    data.tool_id,
    data.name,
    data.description || '',
    data.content,
    JSON.stringify(data.variables || []),
    data.is_dynamic ? 1 : 0,
    JSON.stringify(data.variants || {}),
    data.sort_order || 0,
  );
}

// ==================== Global Configs CRUD ====================

/** 列出所有全局配置 */
export function listConfigs() {
  return getDB().prepare('SELECT * FROM global_configs ORDER BY key').all();
}

/** 获取单个配置 */
export function getConfig(key) {
  return getDB().prepare('SELECT * FROM global_configs WHERE key = ?').get(key);
}

/** 更新配置 */
export function updateConfig(key, updates) {
  const d = getDB();
  const existing = d.prepare('SELECT * FROM global_configs WHERE key = ?').get(key);
  if (!existing) return null;

  insertHistory('config', key, existing.value, updates.value ?? existing.value);

  const fields = [];
  const values = [];

  if (updates.value !== undefined) { fields.push('value = ?'); values.push(updates.value); }
  if (updates.label !== undefined) { fields.push('label = ?'); values.push(updates.label); }
  if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }

  if (fields.length === 0) return existing;

  fields.push("updated_at = datetime('now')");
  values.push(key);

  d.prepare(`UPDATE global_configs SET ${fields.join(', ')} WHERE key = ?`).run(...values);
  return d.prepare('SELECT * FROM global_configs WHERE key = ?').get(key);
}

/** 创建或更新配置（用于 seed） */
export function upsertConfig(data) {
  getDB().prepare(`
    INSERT INTO global_configs (key, value, label, description, type)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      label = excluded.label,
      description = excluded.description,
      type = excluded.type,
      updated_at = datetime('now')
  `).run(
    data.key,
    data.value,
    data.label || '',
    data.description || '',
    data.type || 'string',
  );
}

// ==================== History ====================

/** 查询历史记录 */
export function listHistory({ targetType, targetId, limit = 50, offset = 0 } = {}) {
  const d = getDB();
  const conditions = [];
  const values = [];

  if (targetType) { conditions.push('target_type = ?'); values.push(targetType); }
  if (targetId) { conditions.push('target_id = ?'); values.push(targetId); }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  values.push(limit, offset);

  return d.prepare(`SELECT * FROM config_history ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...values);
}

/** 获取单条历史 */
export function getHistory(id) {
  return getDB().prepare('SELECT * FROM config_history WHERE id = ?').get(id);
}

/** 回滚到某条历史 */
export function rollbackToHistory(historyId) {
  const d = getDB();
  const history = d.prepare('SELECT * FROM config_history WHERE id = ?').get(historyId);
  if (!history) return null;

  if (history.target_type === 'prompt') {
    const prompt = d.prepare('SELECT * FROM prompt_templates WHERE id = ?').get(history.target_id);
    if (!prompt) return null;
    // old_value 就是回滚目标
    updatePrompt(history.target_id, { content: history.old_value });
  } else if (history.target_type === 'config') {
    const config = d.prepare('SELECT * FROM global_configs WHERE key = ?').get(history.target_id);
    if (!config) return null;
    updateConfig(history.target_id, { value: history.old_value });
  }

  return history;
}

/** 写入历史记录 */
function insertHistory(targetType, targetId, oldValue, newValue) {
  // 相同内容不记录
  if (oldValue === newValue) return;

  getDB().prepare(`
    INSERT INTO config_history (target_type, target_id, old_value, new_value)
    VALUES (?, ?, ?, ?)
  `).run(targetType, targetId, oldValue, newValue);
}
