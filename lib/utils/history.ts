'use client';

import { CategoryType, GenderType } from '@/types/divination';
import { CATEGORY_LABELS } from '@/lib/constants';

const STORAGE_KEY = 'liuyao_history';
const MAX_RECORDS = 50;

export interface HistoryRecord {
  id: string;
  timestamp: number;
  category: CategoryType;
  gender: GenderType;
  question: string | null;
  hexagramName: string;
  hexagramSymbol: string;
  palaceName: string;
  archetype: string;
  verdict: string;
  bazi: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
}

/**
 * 保存占卜记录
 */
export function saveHistory(record: HistoryRecord): void {
  if (typeof window === 'undefined') return;

  try {
    const existing = getHistory();
    const updated = [record, ...existing].slice(0, MAX_RECORDS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage 可能满了，忽略
  }
}

/**
 * 校验单条记录是否有效
 */
function isValidRecord(record: unknown): record is HistoryRecord {
  if (typeof record !== 'object' || record === null) return false;
  const r = record as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    typeof r.timestamp === 'number' &&
    typeof r.category === 'string' &&
    typeof r.gender === 'string' &&
    typeof r.hexagramName === 'string' &&
    typeof r.hexagramSymbol === 'string'
  );
}

/**
 * 获取历史记录
 */
export function getHistory(): HistoryRecord[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed: unknown = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidRecord);
  } catch {
    return [];
  }
}

/**
 * 删除单条记录
 */
export function deleteHistory(id: string): void {
  if (typeof window === 'undefined') return;

  try {
    const existing = getHistory();
    const updated = existing.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // 忽略
  }
}

/**
 * 清空所有记录
 */
export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * 生成记录 ID
 */
export function generateHistoryId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * 格式化时间戳
 */
export function formatHistoryTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return `${diffMin}分钟前`;
  if (diffHour < 24) return `${diffHour}小时前`;
  if (diffDay < 7) return `${diffDay}天前`;

  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

/**
 * 获取类别标签
 */
export function getCategoryLabel(category: CategoryType): string {
  return CATEGORY_LABELS[category] || '综合';
}
