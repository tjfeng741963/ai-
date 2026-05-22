import type { StoryLake, StoryNode, StoryEdge, StateVariable, OutlineData, DramaSSEEvent, PlayerState } from '../types';

export const API_BASE = '/api/interactive-drama';

function parseSSELine(line: string): DramaSSEEvent | null {
  const trimmed = line.trim();
  if (!trimmed || !trimmed.startsWith('data: ')) return null;
  try {
    return JSON.parse(trimmed.slice(6)) as DramaSSEEvent;
  } catch {
    return null;
  }
}

// ========== 故事湖 ==========

export async function listLakes(): Promise<StoryLake[]> {
  const res = await fetch(`${API_BASE}/lakes`);
  if (!res.ok) throw new Error('获取列表失败');
  const data = await res.json();
  return data.data;
}

export async function createLake(body: Partial<StoryLake>): Promise<StoryLake> {
  const res = await fetch(`${API_BASE}/lakes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('创建失败');
  const data = await res.json();
  return data.data;
}

export async function getLake(id: string): Promise<StoryLake> {
  const res = await fetch(`${API_BASE}/lakes/${id}`);
  if (!res.ok) throw new Error('获取失败');
  const data = await res.json();
  return data.data;
}

export async function updateLake(id: string, body: Partial<StoryLake>): Promise<StoryLake> {
  const res = await fetch(`${API_BASE}/lakes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('更新失败');
  const data = await res.json();
  return data.data;
}

export async function deleteLake(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/lakes/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('删除失败');
}

// ========== 一键生成完整设定 ==========

export async function generateFullProfile(lakeId: string, idea: string, signal?: AbortSignal): Promise<Response> {
  return fetch(`${API_BASE}/lakes/${lakeId}/generate-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idea }),
    signal,
  });
}

// ========== 对话式创作 (SSE) ==========

export interface ChatSSEEvent {
  type: 'delta' | 'profile' | 'done' | 'error';
  content?: string;
  data?: Record<string, unknown>;
  message?: string;
}

export async function* sendChatMessage(
  lakeId: string,
  step: number,
  message: string,
  signal?: AbortSignal,
): AsyncGenerator<ChatSSEEvent> {
  const res = await fetch(`${API_BASE}/lakes/${lakeId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, step }),
    signal,
  });

  if (!res.ok) {
    const body = await res.text();
    let msg = `请求失败: ${res.status}`;
    try { msg = JSON.parse(body).error || msg; } catch { /* ignore */ }
    throw new Error(msg);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const event = parseSSELine(line);
      if (event) yield event as ChatSSEEvent;
    }
  }

  if (buffer.trim()) {
    const event = parseSSELine(buffer);
    if (event) yield event as ChatSSEEvent;
  }
}

// ========== 节点 ==========

export async function createNode(lakeId: string, body: Partial<StoryNode>): Promise<StoryNode> {
  const res = await fetch(`${API_BASE}/lakes/${lakeId}/nodes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return data.data;
}

export async function updateNode(nodeId: string, body: Partial<StoryNode>): Promise<StoryNode> {
  const res = await fetch(`${API_BASE}/nodes/${nodeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return data.data;
}

export async function deleteNode(nodeId: string): Promise<void> {
  await fetch(`${API_BASE}/nodes/${nodeId}`, { method: 'DELETE' });
}

// ========== 边 ==========

export async function createEdge(body: Partial<StoryEdge>): Promise<StoryEdge> {
  const res = await fetch(`${API_BASE}/edges`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return data.data;
}

export async function updateEdge(edgeId: string, body: Partial<StoryEdge>): Promise<StoryEdge> {
  const res = await fetch(`${API_BASE}/edges/${edgeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return data.data;
}

export async function deleteEdge(edgeId: string): Promise<void> {
  await fetch(`${API_BASE}/edges/${edgeId}`, { method: 'DELETE' });
}

// ========== AI 生成 ==========

export async function* generateOutline(lakeId: string, signal?: AbortSignal): AsyncGenerator<DramaSSEEvent> {
  const res = await fetch(`${API_BASE}/lakes/${lakeId}/generate-outline`, {
    method: 'POST',
    signal,
  });
  if (!res.ok) {
    const body = await res.text();
    let msg = `生成大纲失败: ${res.status}`;
    try { msg = JSON.parse(body).error || msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      const event = parseSSELine(line);
      if (event) yield event;
    }
  }
  if (buffer.trim()) {
    const event = parseSSELine(buffer);
    if (event) yield event;
  }
}

export async function applyOutline(lakeId: string, nodes: unknown[], edges: unknown[]): Promise<{ nodes: StoryNode[]; edges: StoryEdge[] }> {
  const res = await fetch(`${API_BASE}/lakes/${lakeId}/apply-outline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodes, edges }),
  });
  const data = await res.json();
  return data.data;
}

export async function* generateContent(lakeId: string, batchNodes?: unknown[], signal?: AbortSignal): AsyncGenerator<DramaSSEEvent> {
  const res = await fetch(`${API_BASE}/lakes/${lakeId}/generate-content`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ batchNodes }),
    signal,
  });

  if (!res.ok) {
    const body = await res.text();
    let msg = `生成内容失败: ${res.status}`;
    try { msg = JSON.parse(body).error || msg; } catch { /* ignore */ }
    throw new Error(msg);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      const event = parseSSELine(line);
      if (event) yield event;
    }
  }
  if (buffer.trim()) {
    const event = parseSSELine(buffer);
    if (event) yield event;
  }
}

export async function regenerateNode(nodeId: string, instruction: string): Promise<StoryNode> {
  const res = await fetch(`${API_BASE}/nodes/${nodeId}/regenerate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instruction }),
  });
  const data = await res.json();
  return data.data;
}

// ========== 播放验证 ==========

export async function startPlaySession(lakeId: string): Promise<PlayerState> {
  const res = await fetch(`${API_BASE}/lakes/${lakeId}/sessions`, { method: 'POST' });
  const data = await res.json();
  return data.data;
}

export async function getPlayState(sessionId: string): Promise<PlayerState> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}`);
  const data = await res.json();
  return data.data;
}

export async function makeChoice(sessionId: string, edgeId: string): Promise<PlayerState> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/choose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ edgeId }),
  });
  const data = await res.json();
  return data.data;
}

export async function deleteSessionAPI(sessionId: string): Promise<void> {
  await fetch(`${API_BASE}/sessions/${sessionId}`, { method: 'DELETE' });
}
