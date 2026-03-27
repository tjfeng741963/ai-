/**
 * Admin API 客户端
 */

const API_BASE = '/api';

/** 安全解析 JSON 响应，非 JSON 时抛出友好错误 */
async function safeJson(res: Response): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const text = await res.text();
  if (!text) throw new Error(`服务器返回空响应 (${res.status})`);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`服务器返回非 JSON 响应 (${res.status})，请确认后端已启动且路由已挂载`);
  }
}

// ==================== 类型 ====================

export interface PromptTemplate {
  id: string;
  tool_id: string;
  name: string;
  description: string;
  content: string;
  variables: string; // JSON string
  is_dynamic: number;
  variants: string; // JSON string
  sort_order: number;
  updated_at: string;
  created_at: string;
}

export interface GlobalConfig {
  key: string;
  value: string;
  label: string;
  description: string;
  type: string;
  updated_at: string;
}

export interface HistoryRecord {
  id: number;
  target_type: 'prompt' | 'config';
  target_id: string;
  old_value: string | null;
  new_value: string;
  changed_by: string;
  created_at: string;
}

// ==================== 提示词 ====================

export async function fetchPrompts(toolId?: string): Promise<PromptTemplate[]> {
  const url = toolId ? `${API_BASE}/admin/prompts?tool_id=${toolId}` : `${API_BASE}/admin/prompts`;
  const res = await fetch(url);
  const data = await safeJson(res);
  if (!data.success) throw new Error(data.error || '获取失败');
  return data.data as PromptTemplate[];
}

export async function fetchPrompt(id: string): Promise<PromptTemplate> {
  const res = await fetch(`${API_BASE}/admin/prompts/${id}`);
  const data = await safeJson(res);
  if (!data.success) throw new Error(data.error || '获取失败');
  return data.data as PromptTemplate;
}

export async function updatePrompt(
  id: string,
  updates: Partial<Pick<PromptTemplate, 'name' | 'description' | 'content' | 'sort_order'> & { variables: unknown; variants: unknown; is_dynamic: boolean }>,
): Promise<PromptTemplate> {
  const res = await fetch(`${API_BASE}/admin/prompts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await safeJson(res);
  if (!data.success) throw new Error(data.error || '更新失败');
  return data.data as PromptTemplate;
}

// ==================== 配置 ====================

export async function fetchConfigs(): Promise<GlobalConfig[]> {
  const res = await fetch(`${API_BASE}/admin/configs`);
  const data = await safeJson(res);
  if (!data.success) throw new Error(data.error || '获取失败');
  return data.data as GlobalConfig[];
}

export async function updateConfig(key: string, updates: { value?: string; label?: string; description?: string }): Promise<GlobalConfig> {
  const res = await fetch(`${API_BASE}/admin/configs/${key}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await safeJson(res);
  if (!data.success) throw new Error(data.error || '更新失败');
  return data.data as GlobalConfig;
}

// ==================== 历史 ====================

export async function fetchHistory(params?: { target_type?: string; target_id?: string; limit?: number; offset?: number }): Promise<HistoryRecord[]> {
  const searchParams = new URLSearchParams();
  if (params?.target_type) searchParams.set('target_type', params.target_type);
  if (params?.target_id) searchParams.set('target_id', params.target_id);
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.offset) searchParams.set('offset', String(params.offset));

  const res = await fetch(`${API_BASE}/admin/history?${searchParams}`);
  const data = await safeJson(res);
  if (!data.success) throw new Error(data.error || '获取失败');
  return data.data as HistoryRecord[];
}

export async function rollbackHistory(historyId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/history/${historyId}/rollback`, { method: 'POST' });
  const data = await safeJson(res);
  if (!data.success) throw new Error(data.error || '回滚失败');
}
