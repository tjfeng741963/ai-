/**
 * 互动剧系统 — SQLite 持久化层
 *
 * 所有函数接受 db 实例作为第一参数，便于测试注入内存数据库。
 */
import { randomBytes } from 'crypto';

function genId(prefix) {
  return `${prefix}-${randomBytes(8).toString('hex')}`;
}

// ========== 故事湖 ==========

export function listStoryLakes(db, limit = 50) {
  const rows = db.prepare(`
    SELECT id, title, description, status, version, created_at, updated_at
    FROM story_lakes
    ORDER BY updated_at DESC
    LIMIT ?
  `).all(limit);

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    status: r.status,
    version: r.version,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export function getStoryLake(db, id) {
  const row = db.prepare('SELECT * FROM story_lakes WHERE id = ?').get(id);
  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    creationProfile: JSON.parse(row.creation_profile),
    config: JSON.parse(row.config),
    userId: row.user_id,
    status: row.status,
    version: row.version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createStoryLake(db, data = {}) {
  const id = genId('sl');
  db.prepare(`
    INSERT INTO story_lakes (id, title, description, creation_profile, config, user_id, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.title || '新故事湖',
    data.description || '',
    JSON.stringify(data.creationProfile || {}),
    JSON.stringify(data.config || {}),
    data.userId || '',
    data.status || 'draft',
  );
  return getStoryLake(db, id);
}

export function updateStoryLake(db, id, data) {
  const sets = [];
  const vals = [];

  if (data.title !== undefined) { sets.push('title = ?'); vals.push(data.title); }
  if (data.description !== undefined) { sets.push('description = ?'); vals.push(data.description); }
  if (data.creationProfile !== undefined) { sets.push('creation_profile = ?'); vals.push(JSON.stringify(data.creationProfile)); }
  if (data.config !== undefined) { sets.push('config = ?'); vals.push(JSON.stringify(data.config)); }
  if (data.status !== undefined) { sets.push('status = ?'); vals.push(data.status); }
  if (data.version !== undefined) { sets.push('version = ?'); vals.push(data.version); }

  if (sets.length === 0) return getStoryLake(db, id);

  sets.push("updated_at = datetime('now')");
  vals.push(id);

  db.prepare(`UPDATE story_lakes SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  return getStoryLake(db, id);
}

export function deleteStoryLake(db, id) {
  db.prepare('DELETE FROM story_lakes WHERE id = ?').run(id);
}

// ========== 节点 ==========

export function listNodesByLake(db, lakeId) {
  const rows = db.prepare(`
    SELECT * FROM story_nodes WHERE lake_id = ? ORDER BY sort_order, created_at
  `).all(lakeId);

  return rows.map(rowToNode);
}

export function getNode(db, nodeId) {
  const row = db.prepare('SELECT * FROM story_nodes WHERE id = ?').get(nodeId);
  return row ? rowToNode(row) : null;
}

export function createNode(db, data) {
  const id = genId('sn');
  db.prepare(`
    INSERT INTO story_nodes (id, lake_id, type, title, content, entry_conditions, content_variants, position_x, position_y, sort_order, is_ai_generated, is_protected)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.lakeId,
    data.type || 'choice',
    data.title || '',
    data.content || '',
    JSON.stringify(data.entryConditions || {}),
    JSON.stringify(data.contentVariants || []),
    data.positionX || 0,
    data.positionY || 0,
    data.sortOrder || 0,
    data.isAiGenerated ? 1 : 0,
    data.isProtected ? 1 : 0,
  );
  return getNode(db, id);
}

export function updateNode(db, nodeId, data) {
  const sets = [];
  const vals = [];

  if (data.type !== undefined) { sets.push('type = ?'); vals.push(data.type); }
  if (data.title !== undefined) { sets.push('title = ?'); vals.push(data.title); }
  if (data.content !== undefined) { sets.push('content = ?'); vals.push(data.content); }
  if (data.entryConditions !== undefined) { sets.push('entry_conditions = ?'); vals.push(JSON.stringify(data.entryConditions)); }
  if (data.contentVariants !== undefined) { sets.push('content_variants = ?'); vals.push(JSON.stringify(data.contentVariants)); }
  if (data.positionX !== undefined) { sets.push('position_x = ?'); vals.push(data.positionX); }
  if (data.positionY !== undefined) { sets.push('position_y = ?'); vals.push(data.positionY); }
  if (data.sortOrder !== undefined) { sets.push('sort_order = ?'); vals.push(data.sortOrder); }
  if (data.isAiGenerated !== undefined) { sets.push('is_ai_generated = ?'); vals.push(data.isAiGenerated ? 1 : 0); }
  if (data.isProtected !== undefined) { sets.push('is_protected = ?'); vals.push(data.isProtected ? 1 : 0); }

  if (sets.length === 0) return getNode(db, nodeId);

  vals.push(nodeId);
  db.prepare(`UPDATE story_nodes SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  return getNode(db, nodeId);
}

export function deleteNode(db, nodeId) {
  db.prepare('DELETE FROM story_nodes WHERE id = ?').run(nodeId);
}

// ========== 边 ==========

export function listEdgesByLake(db, lakeId) {
  const rows = db.prepare(`
    SELECT * FROM story_edges WHERE lake_id = ? ORDER BY priority, created_at
  `).all(lakeId);

  return rows.map(rowToEdge);
}

export function getEdge(db, edgeId) {
  const row = db.prepare('SELECT * FROM story_edges WHERE id = ?').get(edgeId);
  return row ? rowToEdge(row) : null;
}

export function createEdge(db, data) {
  const id = genId('se');
  db.prepare(`
    INSERT INTO story_edges (id, lake_id, from_node_id, to_node_id, option_text, priority, conditions, state_changes, timing)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.lakeId,
    data.fromNodeId,
    data.toNodeId,
    data.optionText || '',
    data.priority || 0,
    JSON.stringify(data.conditions || {}),
    JSON.stringify(data.stateChanges || []),
    JSON.stringify(data.timing || {}),
  );
  return getEdge(db, id);
}

export function updateEdge(db, edgeId, data) {
  const sets = [];
  const vals = [];

  if (data.fromNodeId !== undefined) { sets.push('from_node_id = ?'); vals.push(data.fromNodeId); }
  if (data.toNodeId !== undefined) { sets.push('to_node_id = ?'); vals.push(data.toNodeId); }
  if (data.optionText !== undefined) { sets.push('option_text = ?'); vals.push(data.optionText); }
  if (data.priority !== undefined) { sets.push('priority = ?'); vals.push(data.priority); }
  if (data.conditions !== undefined) { sets.push('conditions = ?'); vals.push(JSON.stringify(data.conditions)); }
  if (data.stateChanges !== undefined) { sets.push('state_changes = ?'); vals.push(JSON.stringify(data.stateChanges)); }
  if (data.timing !== undefined) { sets.push('timing = ?'); vals.push(JSON.stringify(data.timing)); }

  if (sets.length === 0) return getEdge(db, edgeId);

  vals.push(edgeId);
  db.prepare(`UPDATE story_edges SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  return getEdge(db, edgeId);
}

export function deleteEdge(db, edgeId) {
  db.prepare('DELETE FROM story_edges WHERE id = ?').run(edgeId);
}

// ========== 状态变量 ==========

export function listVariables(db, lakeId) {
  const rows = db.prepare('SELECT * FROM state_variables WHERE lake_id = ?').all(lakeId);
  return rows.map((r) => ({
    id: r.id,
    lakeId: r.lake_id,
    name: r.name,
    type: r.type,
    initialValue: r.initial_value,
    description: r.description,
  }));
}

export function createVariable(db, data) {
  const id = genId('sv');
  db.prepare(`
    INSERT INTO state_variables (id, lake_id, name, type, initial_value, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, data.lakeId, data.name, data.type || 'boolean', data.initialValue || '', data.description || '');
  return listVariables(db, data.lakeId).find((v) => v.id === id);
}

export function updateVariable(db, varId, data) {
  const sets = [];
  const vals = [];

  if (data.name !== undefined) { sets.push('name = ?'); vals.push(data.name); }
  if (data.type !== undefined) { sets.push('type = ?'); vals.push(data.type); }
  if (data.initialValue !== undefined) { sets.push('initial_value = ?'); vals.push(data.initialValue); }
  if (data.description !== undefined) { sets.push('description = ?'); vals.push(data.description); }

  if (sets.length === 0) return null;

  vals.push(varId);
  db.prepare(`UPDATE state_variables SET ${sets.join(', ')} WHERE id = ?`).run(...vals);

  const row = db.prepare('SELECT * FROM state_variables WHERE id = ?').get(varId);
  if (!row) return null;
  return {
    id: row.id,
    lakeId: row.lake_id,
    name: row.name,
    type: row.type,
    initialValue: row.initial_value,
    description: row.description,
  };
}

export function deleteVariable(db, varId) {
  db.prepare('DELETE FROM state_variables WHERE id = ?').run(varId);
}

// ========== 播放会话 ==========

export function createPlaySession(db, data) {
  const id = genId('ps');
  db.prepare(`
    INSERT INTO play_sessions (id, lake_id, user_id, current_node_id, current_state)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    id,
    data.lakeId,
    data.userId || '',
    data.currentNodeId || null,
    JSON.stringify(data.currentState || {}),
  );
  return getPlaySession(db, id);
}

export function getPlaySession(db, sessionId) {
  const row = db.prepare('SELECT * FROM play_sessions WHERE id = ?').get(sessionId);
  if (!row) return null;

  return {
    id: row.id,
    lakeId: row.lake_id,
    userId: row.user_id,
    currentNodeId: row.current_node_id,
    currentState: JSON.parse(row.current_state),
    visitedNodeIds: JSON.parse(row.visited_node_ids),
    pathEdges: JSON.parse(row.path_edges),
    status: row.status,
    startedAt: row.started_at,
    updatedAt: row.updated_at,
    endedAt: row.ended_at,
  };
}

export function updatePlaySession(db, sessionId, data) {
  const sets = [];
  const vals = [];

  if (data.currentNodeId !== undefined) { sets.push('current_node_id = ?'); vals.push(data.currentNodeId); }
  if (data.currentState !== undefined) { sets.push('current_state = ?'); vals.push(JSON.stringify(data.currentState)); }
  if (data.visitedNodeIds !== undefined) { sets.push('visited_node_ids = ?'); vals.push(JSON.stringify(data.visitedNodeIds)); }
  if (data.pathEdges !== undefined) { sets.push('path_edges = ?'); vals.push(JSON.stringify(data.pathEdges)); }
  if (data.status !== undefined) { sets.push('status = ?'); vals.push(data.status); }
  if (data.endedAt !== undefined) { sets.push('ended_at = ?'); vals.push(data.endedAt); }

  if (sets.length === 0) return getPlaySession(db, sessionId);

  sets.push("updated_at = datetime('now')");
  vals.push(sessionId);

  db.prepare(`UPDATE play_sessions SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  return getPlaySession(db, sessionId);
}

export function addPlayEvent(db, data) {
  db.prepare(`
    INSERT INTO play_events (session_id, node_id, edge_id, option_chosen, state_snapshot)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    data.sessionId,
    data.nodeId || null,
    data.edgeId || null,
    data.optionChosen || '',
    JSON.stringify(data.stateSnapshot || {}),
  );
}

export function deletePlaySession(db, sessionId) {
  db.prepare('DELETE FROM play_sessions WHERE id = ?').run(sessionId);
}

// ========== 辅助 ==========

function rowToNode(r) {
  return {
    id: r.id,
    lakeId: r.lake_id,
    type: r.type,
    title: r.title,
    content: r.content,
    entryConditions: JSON.parse(r.entry_conditions),
    contentVariants: JSON.parse(r.content_variants),
    positionX: r.position_x,
    positionY: r.position_y,
    sortOrder: r.sort_order,
    version: r.version,
    isAiGenerated: !!r.is_ai_generated,
    isProtected: !!r.is_protected,
    createdAt: r.created_at,
  };
}

function rowToEdge(r) {
  return {
    id: r.id,
    lakeId: r.lake_id,
    fromNodeId: r.from_node_id,
    toNodeId: r.to_node_id,
    optionText: r.option_text,
    priority: r.priority,
    conditions: JSON.parse(r.conditions),
    stateChanges: JSON.parse(r.state_changes),
    timing: JSON.parse(r.timing),
    createdAt: r.created_at,
  };
}
