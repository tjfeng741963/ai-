/**
 * 广告剧本会话 — SQLite 持久化层
 *
 * 所有函数接受 db 实例作为第一参数，便于测试注入内存数据库。
 */

export function listAdSessions(db, limit = 20) {
  const rows = db.prepare(`
    SELECT id, title, current_step, step_confirmed, status, created_at, updated_at
    FROM ad_script_sessions
    ORDER BY updated_at DESC
    LIMIT ?
  `).all(limit);

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    currentStep: r.current_step,
    stepConfirmed: JSON.parse(r.step_confirmed),
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export function getAdSessionWithMessages(db, id) {
  const row = db.prepare('SELECT * FROM ad_script_sessions WHERE id = ?').get(id);
  if (!row) return null;

  const msgs = db.prepare(
    'SELECT role, content, step, created_at FROM ad_script_messages WHERE session_id = ? ORDER BY id'
  ).all(id);

  return {
    id: row.id,
    title: row.title,
    currentStep: row.current_step,
    productProfile: JSON.parse(row.product_profile),
    stepConfirmed: JSON.parse(row.step_confirmed),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    messages: msgs.map((m) => ({
      role: m.role,
      content: m.content,
      step: m.step,
      timestamp: m.created_at,
    })),
  };
}

export function upsertAdSession(db, data) {
  db.prepare(`
    INSERT INTO ad_script_sessions (id, title, current_step, product_profile, step_confirmed, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      current_step = excluded.current_step,
      product_profile = excluded.product_profile,
      step_confirmed = excluded.step_confirmed,
      updated_at = datetime('now')
  `).run(
    data.id,
    data.title || '新对话',
    data.currentStep || 1,
    JSON.stringify(data.productProfile || {}),
    JSON.stringify(data.stepConfirmed || {}),
  );
}

export function insertAdMessage(db, sessionId, role, content, step = 1) {
  db.prepare(`
    INSERT INTO ad_script_messages (session_id, role, content, step)
    VALUES (?, ?, ?, ?)
  `).run(sessionId, role, content, step);
}

export function updateAdSessionTitle(db, id, title) {
  db.prepare(`
    UPDATE ad_script_sessions SET title = ?, updated_at = datetime('now') WHERE id = ?
  `).run(title, id);
}

export function deleteAdSession(db, id) {
  db.prepare('DELETE FROM ad_script_sessions WHERE id = ?').run(id);
}
