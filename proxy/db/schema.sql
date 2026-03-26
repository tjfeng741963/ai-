-- 提示词管理系统数据库 Schema

-- 提示词模板
CREATE TABLE IF NOT EXISTS prompt_templates (
  id          TEXT PRIMARY KEY,        -- 如 'script-rating.structure_analysis'
  tool_id     TEXT NOT NULL,           -- 如 'script-rating', 'outpaint', '_global'
  name        TEXT NOT NULL,           -- 显示名称
  description TEXT DEFAULT '',         -- 用途说明
  content     TEXT NOT NULL,           -- 提示词内容（支持 {VAR} 占位符）
  variables   TEXT DEFAULT '[]',       -- JSON: 可用变量列表 [{name, description, required}]
  is_dynamic  INTEGER DEFAULT 0,      -- 是否有动态变体（如 domestic/overseas）
  variants    TEXT DEFAULT '{}',       -- JSON: {variantKey: content} 动态变体内容
  sort_order  INTEGER DEFAULT 0,
  updated_at  TEXT DEFAULT (datetime('now')),
  created_at  TEXT DEFAULT (datetime('now'))
);

-- 全局配置
CREATE TABLE IF NOT EXISTS global_configs (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  label       TEXT DEFAULT '',
  description TEXT DEFAULT '',
  type        TEXT DEFAULT 'string',   -- string | number | boolean | json
  updated_at  TEXT DEFAULT (datetime('now'))
);

-- 修改历史
CREATE TABLE IF NOT EXISTS config_history (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  target_type TEXT NOT NULL,           -- 'prompt' | 'config'
  target_id   TEXT NOT NULL,
  old_value   TEXT,
  new_value   TEXT NOT NULL,
  changed_by  TEXT DEFAULT 'admin',
  created_at  TEXT DEFAULT (datetime('now'))
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_prompt_tool ON prompt_templates(tool_id);
CREATE INDEX IF NOT EXISTS idx_history_target ON config_history(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_history_created ON config_history(created_at DESC);
