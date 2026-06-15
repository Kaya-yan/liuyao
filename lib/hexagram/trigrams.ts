import { TrigramData, TrigramName } from '@/types/hexagram';

export const trigrams: Record<TrigramName, TrigramData> = {
  '乾': {
    name: '乾',
    lines: [1, 1, 1],
    wuxing: '金',
    direction: '西北',
    nature: '天',
    najia_outer: ['戌', '申', '午'],
    najia_inner: ['辰', '寅', '子'],
  },
  '坤': {
    name: '坤',
    lines: [0, 0, 0],
    wuxing: '土',
    direction: '西南',
    nature: '地',
    najia_outer: ['酉', '亥', '丑'],
    najia_inner: ['未', '巳', '卯'],
  },
  '震': {
    name: '震',
    lines: [1, 0, 0],
    wuxing: '木',
    direction: '东',
    nature: '雷',
    najia_outer: ['戌', '申', '午'],
    najia_inner: ['辰', '寅', '子'],
  },
  '巽': {
    name: '巽',
    lines: [0, 1, 1],
    wuxing: '木',
    direction: '东南',
    nature: '风',
    najia_outer: ['酉', '亥', '丑'],
    najia_inner: ['未', '巳', '卯'],
  },
  '坎': {
    name: '坎',
    lines: [0, 1, 0],
    wuxing: '水',
    direction: '北',
    nature: '水',
    najia_outer: ['戌', '申', '午'],
    najia_inner: ['辰', '寅', '子'],
  },
  '离': {
    name: '离',
    lines: [1, 0, 1],
    wuxing: '火',
    direction: '南',
    nature: '火',
    najia_outer: ['巳', '未', '酉'],
    najia_inner: ['卯', '丑', '亥'],
  },
  '艮': {
    name: '艮',
    lines: [0, 0, 1],
    wuxing: '土',
    direction: '东北',
    nature: '山',
    najia_outer: ['寅', '子', '戌'],
    najia_inner: ['申', '午', '辰'],
  },
  '兑': {
    name: '兑',
    lines: [1, 1, 0],
    wuxing: '金',
    direction: '西',
    nature: '泽',
    najia_outer: ['未', '酉', '亥'],
    najia_inner: ['巳', '卯', '丑'],
  },
};

export const trigramList: TrigramName[] = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'];

export function getTrigramByName(name: TrigramName): TrigramData {
  return trigrams[name];
}
