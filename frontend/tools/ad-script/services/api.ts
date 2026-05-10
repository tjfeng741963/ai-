import type { SSEEvent, TierType, SessionHistoryItem, FullSessionData } from '../types';

export const API_BASE = '/api/ad-script';

export function parseSSELine(line: string): SSEEvent | null {
  const trimmed = line.trim();
  if (!trimmed || !trimmed.startsWith('data: ')) return null;

  try {
    return JSON.parse(trimmed.slice(6)) as SSEEvent;
  } catch {
    return null;
  }
}

export interface ChatParams {
  sessionId?: string;
  message: string;
  images?: string[];
  taobaoLink?: string;
  confirmStep?: boolean;
}

export interface GenerateParams {
  sessionId: string;
  tier: TierType;
}

export async function* sendChatMessage(
  params: ChatParams,
  signal?: AbortSignal
): AsyncGenerator<SSEEvent> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
    signal,
  });

  if (!res.ok) {
    const body = await res.text();
    let msg = `请求失败: ${res.status}`;
    try { msg = JSON.parse(body).error || msg; } catch {}
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

export async function* generateScript(
  params: GenerateParams,
  signal?: AbortSignal
): AsyncGenerator<SSEEvent> {
  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
    signal,
  });

  if (!res.ok) {
    const body = await res.text();
    let msg = `生成请求失败: ${res.status}`;
    try { msg = JSON.parse(body).error || msg; } catch {}
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

export async function fetchSessionHistory(limit = 20): Promise<SessionHistoryItem[]> {
  const res = await fetch(`${API_BASE}/sessions?limit=${limit}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.sessions;
}

export async function fetchFullSession(sessionId: string): Promise<FullSessionData> {
  const res = await fetch(`${API_BASE}/session/${sessionId}/full`);
  if (!res.ok) {
    const body = await res.text();
    let msg = '会话不存在';
    try { msg = JSON.parse(body).error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function deleteSessionAPI(sessionId: string): Promise<void> {
  await fetch(`${API_BASE}/session/${sessionId}`, { method: 'DELETE' });
}
