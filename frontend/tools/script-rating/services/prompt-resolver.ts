/**
 * 提示词解析器 — 从数据库获取最新提示词，失败时降级到本地硬编码
 *
 * 用法：
 *   const p = await resolvePrompts();
 *   p.SYSTEM_PROMPT          // 优先 DB 内容，降级到本地
 *   p.getCompliance('overseas') // 动态变体
 */

import {
  SYSTEM_PROMPT,
  STRUCTURE_ANALYSIS_PROMPT,
  CHARACTER_ANALYSIS_PROMPT,
  EMOTION_ANALYSIS_PROMPT,
  MARKET_ANALYSIS_PROMPT,
  COMPLIANCE_ANALYSIS_PROMPT,
  COMPREHENSIVE_RATING_PROMPT,
  getComplianceAnalysisPrompt,
} from './prompts.ts';
import {
  EXECUTIVE_SUMMARY_PROMPT,
  MARKET_RESONANCE_DETAILED_PROMPT,
  NARRATIVE_DNA_DETAILED_PROMPT,
  COMMERCIAL_COMPLIANCE_DETAILED_PROMPT,
  ACTIONABLE_RECOMMENDATIONS_PROMPT,
  PRODUCTION_ANALYSIS_PROMPT,
  STRUCTURE_DETAILED_PROMPT,
  CHARACTER_DETAILED_PROMPT,
  EMOTION_DETAILED_PROMPT,
  getMarketDetailedPrompt,
  getRiskDetailedPrompt,
} from './prompts-detailed.ts';
import type { MarketType } from './market-context.ts';

const API_BASE = '/api';
const CACHE_TTL = 60_000; // 1 分钟

/** DB 提示词缓存 */
interface PromptRecord {
  id: string;
  content: string;
  is_dynamic: number;
  variants: string; // JSON string
}

let cachedPrompts: Map<string, PromptRecord> | null = null;
let cacheTs = 0;

/** 从 DB API 批量获取所有 script-rating 提示词 */
async function fetchAllPrompts(): Promise<Map<string, PromptRecord>> {
  if (cachedPrompts && Date.now() - cacheTs < CACHE_TTL) {
    return cachedPrompts;
  }

  try {
    const res = await fetch(`${API_BASE}/prompts/script-rating`);
    if (!res.ok) return cachedPrompts ?? new Map();

    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) return cachedPrompts ?? new Map();

    const map = new Map<string, PromptRecord>();
    for (const p of json.data) {
      // id 格式: "script-rating.system" → key: "system"
      const key = p.id.replace('script-rating.', '');
      map.set(key, p);
    }

    cachedPrompts = map;
    cacheTs = Date.now();
    return map;
  } catch {
    return cachedPrompts ?? new Map();
  }
}

/** 从 Map 获取提示词内容，fallback 到本地 */
function get(map: Map<string, PromptRecord>, key: string, fallback: string): string {
  return map.get(key)?.content || fallback;
}

/** 从 Map 获取动态变体，fallback 到本地函数 */
function getVariant(
  map: Map<string, PromptRecord>,
  key: string,
  variant: string,
  fallbackFn: (mt: MarketType) => string,
): string {
  const record = map.get(key);
  if (record?.is_dynamic && record.variants) {
    try {
      const parsed = typeof record.variants === 'string' ? JSON.parse(record.variants) : record.variants;
      if (parsed[variant]) return parsed[variant];
    } catch { /* fall through */ }
  }
  if (record?.content) return record.content;
  return fallbackFn(variant as MarketType);
}

/** 已解析的提示词集合 */
export interface ResolvedPrompts {
  SYSTEM_PROMPT: string;
  STRUCTURE_ANALYSIS_PROMPT: string;
  CHARACTER_ANALYSIS_PROMPT: string;
  EMOTION_ANALYSIS_PROMPT: string;
  MARKET_ANALYSIS_PROMPT: string;
  COMPLIANCE_ANALYSIS_PROMPT: string;
  COMPREHENSIVE_RATING_PROMPT: string;
  PRODUCTION_ANALYSIS_PROMPT: string;
  EXECUTIVE_SUMMARY_PROMPT: string;
  STRUCTURE_DETAILED_PROMPT: string;
  CHARACTER_DETAILED_PROMPT: string;
  EMOTION_DETAILED_PROMPT: string;
  MARKET_RESONANCE_DETAILED_PROMPT: string;
  NARRATIVE_DNA_DETAILED_PROMPT: string;
  COMMERCIAL_COMPLIANCE_DETAILED_PROMPT: string;
  ACTIONABLE_RECOMMENDATIONS_PROMPT: string;
  getCompliance: (mt: MarketType) => string;
  getMarketDetailed: (mt: MarketType) => string;
  getRiskDetailed: (mt: MarketType) => string;
}

/**
 * 解析所有提示词（DB 优先，本地 fallback）
 *
 * 调用一次即可，内部有 60 秒缓存。
 * 网络失败时静默降级到本地硬编码。
 */
export async function resolvePrompts(): Promise<ResolvedPrompts> {
  const map = await fetchAllPrompts();

  return {
    SYSTEM_PROMPT: get(map, 'system', SYSTEM_PROMPT),
    STRUCTURE_ANALYSIS_PROMPT: get(map, 'structure_analysis', STRUCTURE_ANALYSIS_PROMPT),
    CHARACTER_ANALYSIS_PROMPT: get(map, 'character_analysis', CHARACTER_ANALYSIS_PROMPT),
    EMOTION_ANALYSIS_PROMPT: get(map, 'emotion_analysis', EMOTION_ANALYSIS_PROMPT),
    MARKET_ANALYSIS_PROMPT: get(map, 'market_analysis', MARKET_ANALYSIS_PROMPT),
    COMPLIANCE_ANALYSIS_PROMPT: get(map, 'compliance_analysis', COMPLIANCE_ANALYSIS_PROMPT),
    COMPREHENSIVE_RATING_PROMPT: get(map, 'comprehensive_rating', COMPREHENSIVE_RATING_PROMPT),
    PRODUCTION_ANALYSIS_PROMPT: get(map, 'production_analysis', PRODUCTION_ANALYSIS_PROMPT),
    EXECUTIVE_SUMMARY_PROMPT: get(map, 'executive_summary', EXECUTIVE_SUMMARY_PROMPT),
    STRUCTURE_DETAILED_PROMPT: get(map, 'structure_detailed', STRUCTURE_DETAILED_PROMPT),
    CHARACTER_DETAILED_PROMPT: get(map, 'character_detailed', CHARACTER_DETAILED_PROMPT),
    EMOTION_DETAILED_PROMPT: get(map, 'emotion_detailed', EMOTION_DETAILED_PROMPT),
    MARKET_RESONANCE_DETAILED_PROMPT: get(map, 'market_resonance_detailed', MARKET_RESONANCE_DETAILED_PROMPT),
    NARRATIVE_DNA_DETAILED_PROMPT: get(map, 'narrative_dna_detailed', NARRATIVE_DNA_DETAILED_PROMPT),
    COMMERCIAL_COMPLIANCE_DETAILED_PROMPT: get(map, 'commercial_compliance_detailed', COMMERCIAL_COMPLIANCE_DETAILED_PROMPT),
    ACTIONABLE_RECOMMENDATIONS_PROMPT: get(map, 'actionable_recommendations', ACTIONABLE_RECOMMENDATIONS_PROMPT),
    getCompliance: (mt) => getVariant(map, 'compliance_analysis', mt, getComplianceAnalysisPrompt),
    getMarketDetailed: (mt) => getVariant(map, 'market_detailed', mt, getMarketDetailedPrompt),
    getRiskDetailed: (mt) => getVariant(map, 'risk_detailed', mt, getRiskDetailedPrompt),
  };
}
