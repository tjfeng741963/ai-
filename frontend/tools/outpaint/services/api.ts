/**
 * 扩图 API 服务
 *
 * 参照 scwh 项目的 standalone API 调用模式：
 * 1. 获取可用 provider/model 列表
 * 2. 上传原图拿到 URL
 * 3. 提交扩图任务（指定 provider/model）拿到 taskId
 * 4. 轮询任务状态直到完成
 */

import type { OutpaintRequestParams, OutpaintProvider, OutpaintModel } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const API_BASE: string = ((globalThis as any).__OUTPAINT_API_URL__ as string) ?? '';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('cineai_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: '*/*',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ==================== Provider / Model ====================

/** 获取扩图可用的 Provider 列表 */
export async function getOutpaintProviders(): Promise<OutpaintProvider[]> {
  const res = await fetch(`${API_BASE}/api/outpaint/providers`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`获取 Provider 列表失败 (${res.status})`);
  }

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || '获取 Provider 列表失败');
  }
  return data.data as OutpaintProvider[];
}

/** 获取指定 Provider 的模型列表及参数定义 */
export async function getOutpaintModels(provider: string): Promise<OutpaintModel[]> {
  const res = await fetch(`${API_BASE}/api/outpaint/models/${encodeURIComponent(provider)}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`获取模型列表失败 (${res.status})`);
  }

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || '获取模型列表失败');
  }
  return data.data as OutpaintModel[];
}

// ==================== 图片上传 ====================

/** 上传图片到 OSS，返回可访问的 URL */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', 'outpaint');

  const token = localStorage.getItem('cineai_token');
  const headers: Record<string, string> = { Accept: '*/*' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/api/upload/image`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`上传失败 (${res.status})`);
  }

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || '上传失败');
  }
  return data.data.url as string;
}

// ==================== 扩图任务 ====================

interface SingleTaskResult {
  taskId: string;
  status: 'completed' | 'processing';
  imageUrl?: string;
}

interface BatchTaskResult {
  tasks: SingleTaskResult[];
  errors?: string[];
}

/** 提交扩图任务（单个或批量） */
export async function submitOutpaint(
  params: OutpaintRequestParams,
): Promise<SingleTaskResult | BatchTaskResult> {
  const res = await fetch(`${API_BASE}/api/standalone/outpaint`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error(`提交失败 (${res.status})`);
  }

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || '提交扩图任务失败');
  }

  // numResults > 1 时返回 { tasks: [...], errors?: [...] }
  // numResults === 1 时返回单个 { taskId, status, imageUrl? }
  return data.data;
}

/** 判断是否为批量结果 */
export function isBatchResult(
  result: SingleTaskResult | BatchTaskResult,
): result is BatchTaskResult {
  return 'tasks' in result && Array.isArray((result as BatchTaskResult).tasks);
}

// ==================== 任务状态查询 ====================

/** 查询任务状态 */
export async function getTaskStatus(taskId: string): Promise<{
  taskId: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  resultUrl: string | null;
  error: string | null;
}> {
  const res = await fetch(`${API_BASE}/api/standalone/task/${encodeURIComponent(taskId)}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`查询失败 (${res.status})`);
  }

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || '查询任务失败');
  }
  return data.data;
}
