/**
 * 评级记录本地存储服务
 * 使用 localStorage 持久化存储评级历史
 */

import type { RatingResult } from '@/types/rating.ts';
import type { AdvancedRatingResult } from '@/types/rating-advanced.ts';

const STORAGE_KEY = 'script_rating_history';
const MAX_RECORDS = 50; // 最多保存50条记录

/** 评级记录 */
export interface RatingRecord {
  id: string;
  scriptName: string;           // 剧本名称（用户输入或自动提取）
  scriptPreview: string;        // 剧本预览（前200字）
  scriptLength: number;         // 剧本字数
  createdAt: string;            // 创建时间 ISO
  analysisMode: 'simple' | 'advanced';
  result: RatingResult | AdvancedRatingResult;
  duration: number;             // 分析耗时 ms
  cost?: number;                // 估算成本（可选）
}

/** 生成唯一ID */
function generateId(): string {
  return `rating_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/** 从剧本内容提取名称 */
export function extractScriptName(content: string): string {
  // 尝试从内容中提取剧本名称
  const patterns = [
    /^[\s\S]*?[《【「]([^》】」]+)[》】」]/m,  // 《剧本名》
    /剧本名称[：:]\s*(.+)/m,
    /片名[：:]\s*(.+)/m,
    /标题[：:]\s*(.+)/m,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match?.[1]) {
      return match[1].trim().slice(0, 50);
    }
  }

  // 如果没找到，用前20个字符
  const firstLine = content.trim().split('\n')[0];
  if (firstLine) {
    return firstLine.slice(0, 20) + (firstLine.length > 20 ? '...' : '');
  }

  return '未命名剧本';
}

/** 获取所有评级记录 */
export function getRatingRecords(): RatingRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as RatingRecord[];
  } catch (error) {
    console.error('读取评级记录失败:', error);
    return [];
  }
}

/** 保存评级记录 */
export function saveRatingRecord(
  scriptContent: string,
  result: RatingResult | AdvancedRatingResult,
  analysisMode: 'simple' | 'advanced',
  duration: number,
  scriptName?: string
): RatingRecord {
  const records = getRatingRecords();

  const newRecord: RatingRecord = {
    id: generateId(),
    scriptName: scriptName || extractScriptName(scriptContent),
    scriptPreview: scriptContent.slice(0, 200) + (scriptContent.length > 200 ? '...' : ''),
    scriptLength: scriptContent.length,
    createdAt: new Date().toISOString(),
    analysisMode,
    result,
    duration,
  };

  // 添加到开头
  records.unshift(newRecord);

  // 限制最大数量
  if (records.length > MAX_RECORDS) {
    records.splice(MAX_RECORDS);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('保存评级记录失败:', error);
    // 如果存储空间不足，删除旧记录重试
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      records.splice(Math.floor(MAX_RECORDS / 2));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }
  }

  return newRecord;
}

/** 获取单条评级记录 */
export function getRatingRecord(id: string): RatingRecord | null {
  const records = getRatingRecords();
  return records.find((r) => r.id === id) || null;
}

/** 删除评级记录 */
export function deleteRatingRecord(id: string): boolean {
  const records = getRatingRecords();
  const index = records.findIndex((r) => r.id === id);

  if (index === -1) return false;

  records.splice(index, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return true;
}

/** 清空所有评级记录 */
export function clearRatingRecords(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/** 更新记录名称 */
export function updateRecordName(id: string, newName: string): boolean {
  const records = getRatingRecords();
  const record = records.find((r) => r.id === id);

  if (!record) return false;

  record.scriptName = newName;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return true;
}

/** 获取存储使用情况 */
export function getStorageUsage(): { used: number; records: number } {
  const data = localStorage.getItem(STORAGE_KEY);
  return {
    used: data ? new Blob([data]).size : 0,
    records: getRatingRecords().length,
  };
}

/** 导出所有记录为JSON */
export function exportRecordsAsJSON(): string {
  const records = getRatingRecords();
  return JSON.stringify(records, null, 2);
}

/** 从JSON导入记录 */
export function importRecordsFromJSON(json: string): number {
  try {
    const imported = JSON.parse(json) as RatingRecord[];
    const existing = getRatingRecords();
    const existingIds = new Set(existing.map((r) => r.id));

    // 只导入不存在的记录
    const newRecords = imported.filter((r) => !existingIds.has(r.id));
    const merged = [...newRecords, ...existing].slice(0, MAX_RECORDS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return newRecords.length;
  } catch (error) {
    console.error('导入记录失败:', error);
    return 0;
  }
}
