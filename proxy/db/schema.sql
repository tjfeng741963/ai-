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

-- 广告剧本会话
CREATE TABLE IF NOT EXISTS ad_script_sessions (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL DEFAULT '新对话',
  current_step    INTEGER NOT NULL DEFAULT 1,
  product_profile TEXT NOT NULL DEFAULT '{}',
  step_confirmed  TEXT NOT NULL DEFAULT '{}',
  status          TEXT NOT NULL DEFAULT 'active',
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now'))
);

-- 广告剧本消息
CREATE TABLE IF NOT EXISTS ad_script_messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL REFERENCES ad_script_sessions(id) ON DELETE CASCADE,
  role       TEXT NOT NULL,
  content    TEXT NOT NULL,
  step       INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================
-- 互动剧系统
-- ============================================================

CREATE TABLE IF NOT EXISTS story_lakes (
  id               TEXT PRIMARY KEY,
  title            TEXT NOT NULL DEFAULT '新故事湖',
  description      TEXT DEFAULT '',
  creation_profile TEXT NOT NULL DEFAULT '{}',
  config           TEXT NOT NULL DEFAULT '{}',
  user_id          TEXT DEFAULT '',
  status           TEXT NOT NULL DEFAULT 'draft',
  version          INTEGER NOT NULL DEFAULT 1,
  created_at       TEXT DEFAULT (datetime('now')),
  updated_at       TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS story_nodes (
  id                TEXT PRIMARY KEY,
  lake_id           TEXT NOT NULL REFERENCES story_lakes(id) ON DELETE CASCADE,
  type              TEXT NOT NULL DEFAULT 'choice',
  title             TEXT NOT NULL DEFAULT '',
  content           TEXT DEFAULT '',
  entry_conditions  TEXT DEFAULT '{}',
  content_variants  TEXT DEFAULT '[]',
  position_x        REAL NOT NULL DEFAULT 0,
  position_y        REAL NOT NULL DEFAULT 0,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  version           INTEGER NOT NULL DEFAULT 1,
  is_ai_generated   INTEGER DEFAULT 0,
  is_protected      INTEGER DEFAULT 0,
  created_at        TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS story_edges (
  id            TEXT PRIMARY KEY,
  lake_id       TEXT NOT NULL REFERENCES story_lakes(id) ON DELETE CASCADE,
  from_node_id  TEXT NOT NULL REFERENCES story_nodes(id) ON DELETE CASCADE,
  to_node_id    TEXT NOT NULL REFERENCES story_nodes(id) ON DELETE CASCADE,
  option_text   TEXT DEFAULT '',
  priority      INTEGER NOT NULL DEFAULT 0,
  conditions    TEXT DEFAULT '{}',
  state_changes TEXT DEFAULT '[]',
  timing        TEXT DEFAULT '{}',
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS state_variables (
  id            TEXT PRIMARY KEY,
  lake_id       TEXT NOT NULL REFERENCES story_lakes(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'boolean',
  initial_value TEXT DEFAULT '',
  description   TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS play_sessions (
  id               TEXT PRIMARY KEY,
  lake_id          TEXT NOT NULL REFERENCES story_lakes(id) ON DELETE CASCADE,
  user_id          TEXT DEFAULT '',
  current_node_id  TEXT,
  current_state    TEXT NOT NULL DEFAULT '{}',
  visited_node_ids TEXT NOT NULL DEFAULT '[]',
  path_edges       TEXT NOT NULL DEFAULT '[]',
  status           TEXT NOT NULL DEFAULT 'playing',
  started_at       TEXT DEFAULT (datetime('now')),
  updated_at       TEXT DEFAULT (datetime('now')),
  ended_at         TEXT
);

CREATE TABLE IF NOT EXISTS play_events (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id      TEXT NOT NULL REFERENCES play_sessions(id) ON DELETE CASCADE,
  node_id         TEXT,
  edge_id         TEXT,
  option_chosen   TEXT DEFAULT '',
  state_snapshot  TEXT DEFAULT '{}',
  created_at      TEXT DEFAULT (datetime('now'))
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_prompt_tool ON prompt_templates(tool_id);
CREATE INDEX IF NOT EXISTS idx_history_target ON config_history(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_history_created ON config_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ad_sessions_updated ON ad_script_sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ad_messages_session ON ad_script_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_story_nodes_lake ON story_nodes(lake_id);
CREATE INDEX IF NOT EXISTS idx_story_edges_lake ON story_edges(lake_id);
CREATE INDEX IF NOT EXISTS idx_story_edges_from ON story_edges(from_node_id);
CREATE INDEX IF NOT EXISTS idx_story_edges_to ON story_edges(to_node_id);
CREATE INDEX IF NOT EXISTS idx_state_vars_lake ON state_variables(lake_id);
CREATE INDEX IF NOT EXISTS idx_play_sessions_lake ON play_sessions(lake_id);
CREATE INDEX IF NOT EXISTS idx_play_events_session ON play_events(session_id);
