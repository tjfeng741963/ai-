/**
 * 提示词客户端 — 共享模块
 *
 * 工具页面通过此模块获取最新提示词，带缓存 + 本地 fallback。
 * 当后端不可用时自动降级到本地硬编码。
 */

const API_BASE = '/api';
const CACHE_TTL = 60_000; // 1 分钟缓存

interface CacheEntry {
  data: string;
  ts: number;
}

const cache = new Map<string, CacheEntry>();

/**
 * 获取单个提示词内容
 *
 * @param toolId  工具 ID（如 'script-rating'）
 * @param promptKey  提示词 key（如 'structure_analysis'）
 * @returns 提示词内容字符串
 */
export async function getPrompt(toolId: string, promptKey: string): Promise<string | null> {
  const cacheKey = `${toolId}.${promptKey}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data;
  }

  try {
    const res = await fetch(`${API_BASE}/prompts/${toolId}/${promptKey}`);
    if (!res.ok) return null;

    const json = await res.json();
    if (!json.success || !json.data?.content) return null;

    const content = json.data.content;
    cache.set(cacheKey, { data: content, ts: Date.now() });
    return content;
  } catch {
    // 后端不可用，返回 null（调用方自行 fallback）
    return null;
  }
}

/**
 * 获取动态提示词的特定变体
 */
export async function getPromptVariant(
  toolId: string,
  promptKey: string,
  variant: string,
): Promise<string | null> {
  const cacheKey = `${toolId}.${promptKey}::${variant}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data;
  }

  try {
    const res = await fetch(`${API_BASE}/prompts/${toolId}/${promptKey}`);
    if (!res.ok) return null;

    const json = await res.json();
    if (!json.success || !json.data) return null;

    const { is_dynamic, variants, content } = json.data;

    if (is_dynamic && variants) {
      const parsed = typeof variants === 'string' ? JSON.parse(variants) : variants;
      const variantContent = parsed[variant];
      if (variantContent) {
        cache.set(cacheKey, { data: variantContent, ts: Date.now() });
        return variantContent;
      }
    }

    // fallback 到主内容
    cache.set(cacheKey, { data: content, ts: Date.now() });
    return content;
  } catch {
    return null;
  }
}

/**
 * 获取全局配置
 */
export async function getConfigs(): Promise<Record<string, string> | null> {
  const cacheKey = '__configs__';
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return JSON.parse(cached.data);
  }

  try {
    const res = await fetch(`${API_BASE}/configs`);
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success) return null;

    cache.set(cacheKey, { data: JSON.stringify(json.data), ts: Date.now() });
    return json.data;
  } catch {
    return null;
  }
}

/**
 * 替换提示词模板中的占位符
 */
export function fillPrompt(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}

/**
 * 清除缓存（调试用）
 */
export function clearPromptCache(): void {
  cache.clear();
}
