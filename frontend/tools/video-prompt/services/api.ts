import type { SSEEvent, ChatMessage } from '../types';

const API_BASE = '/api/video-prompt';

export async function* sendChat(
  message: string,
  history: ChatMessage[],
  options?: { images?: string[]; productUrl?: string; signal?: AbortSignal }
): AsyncGenerator<SSEEvent> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      history,
      images: options?.images ?? [],
      productUrl: options?.productUrl ?? '',
    }),
    signal: options?.signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: '请求失败' }));
    yield { type: 'error', error: err.error || `HTTP ${response.status}` };
    return;
  }

  yield* readSSEStream(response);
}

export async function* generateStoryboard(
  style: string,
  tier: string,
  history: ChatMessage[],
  signal?: AbortSignal
): AsyncGenerator<SSEEvent> {
  const response = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ style, tier, history }),
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: '请求失败' }));
    yield { type: 'error', error: err.error || `HTTP ${response.status}` };
    return;
  }

  yield* readSSEStream(response);
}

async function* readSSEStream(response: Response): AsyncGenerator<SSEEvent> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      try {
        yield JSON.parse(trimmed.slice(6)) as SSEEvent;
      } catch {
        // ignore non-JSON lines
      }
    }
  }

  if (buffer.trim().startsWith('data: ')) {
    try {
      yield JSON.parse(buffer.trim().slice(6)) as SSEEvent;
    } catch {
      // ignore
    }
  }
}
