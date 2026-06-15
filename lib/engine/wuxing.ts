import { WuxingElement } from '@/types/hexagram';

// 五行相生：金生水、水生木、木生火、火生土、土生金
const SHENG_CYCLE: Record<WuxingElement, WuxingElement> = {
  '金': '水',
  '水': '木',
  '木': '火',
  '火': '土',
  '土': '金',
};

// 五行相克：金克木、木克土、土克水、水克火、火克金
const KE_CYCLE: Record<WuxingElement, WuxingElement> = {
  '金': '木',
  '木': '土',
  '土': '水',
  '水': '火',
  '火': '金',
};

// 十二地支五行对应
const DIZHI_WUXING: Record<string, WuxingElement> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

// 十天干五行对应
const TIANGAN_WUXING: Record<string, WuxingElement> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火',
  '戊': '土', '己': '土', '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

/** a 生 b？ */
export function shengs(a: WuxingElement, b: WuxingElement): boolean {
  return SHENG_CYCLE[a] === b;
}

/** a 克 b？ */
export function kes(a: WuxingElement, b: WuxingElement): boolean {
  return KE_CYCLE[a] === b;
}

/** 地支转五行 */
export function dizhiToWuxing(dizhi: string): WuxingElement {
  return DIZHI_WUXING[dizhi] || '土';
}

/** 天干转五行 */
export function tianganToWuxing(tiangan: string): WuxingElement {
  return TIANGAN_WUXING[tiangan] || '土';
}

/** 获取五行关系描述 */
export function getWuxingRelation(
  self: WuxingElement,
  other: WuxingElement
): '生我' | '克我' | '我生' | '我克' | '同我' {
  if (self === other) return '同我';
  if (shengs(other, self)) return '生我';
  if (shengs(self, other)) return '我生';
  if (kes(other, self)) return '克我';
  return '我克';
}

/** 五行名称列表 */
export const WUXING_LIST: WuxingElement[] = ['金', '木', '水', '火', '土'];
