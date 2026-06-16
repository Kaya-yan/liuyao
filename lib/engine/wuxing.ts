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

// ===== 五行旺相休囚死（季节强弱） =====
// 春=木旺, 夏=火旺, 四季末=土旺, 秋=金旺, 冬=水旺
// 旺>相>休>囚>死

export type WuxingStrength = '旺' | '相' | '休' | '囚' | '死';

// 季节索引：0=春(寅卯辰月), 1=夏(巳午未月), 2=秋(申酉戌月), 3=冬(亥子丑月)
const SEASON_STRENGTH: Record<number, Record<WuxingElement, WuxingStrength>> = {
  0: { '木': '旺', '火': '相', '水': '休', '金': '囚', '土': '死' }, // 春
  1: { '火': '旺', '土': '相', '木': '休', '水': '囚', '金': '死' }, // 夏
  2: { '金': '旺', '水': '相', '土': '休', '火': '囚', '木': '死' }, // 秋
  3: { '水': '旺', '木': '相', '金': '休', '土': '囚', '火': '死' }, // 冬
};

/** 根据月支判断季节索引 */
function getSeasonFromMonthDizhi(monthDizhi: string): number {
  const map: Record<string, number> = {
    '寅': 0, '卯': 0, '辰': 0, // 春
    '巳': 1, '午': 1, '未': 1, // 夏
    '申': 2, '酉': 2, '戌': 2, // 秋
    '亥': 3, '子': 3, '丑': 3, // 冬
  };
  return map[monthDizhi] ?? 0;
}

/**
 * 获取五行在某月的旺衰状态
 * @param element 要判断的五行
 * @param monthDizhi 月支
 */
export function getWuxingStrength(element: WuxingElement, monthDizhi: string): WuxingStrength {
  const season = getSeasonFromMonthDizhi(monthDizhi);
  return SEASON_STRENGTH[season][element];
}

/** 旺衰描述文本 */
const STRENGTH_TEXT: Record<WuxingStrength, string> = {
  '旺': '当令最旺',
  '相': '得令次旺',
  '休': '休囚无力',
  '囚': '受制不振',
  '死': '死绝无力',
};

/** 获取五行旺衰的描述 */
export function getWuxingStrengthText(element: WuxingElement, monthDizhi: string): string {
  const strength = getWuxingStrength(element, monthDizhi);
  return `${element}${STRENGTH_TEXT[strength]}（${monthDizhi}月）`;
}

// ===== 地支六合 =====
export const DIZHI_LIUHE: Record<string, string> = {
  '子': '丑', '丑': '子',
  '寅': '亥', '亥': '寅',
  '卯': '戌', '戌': '卯',
  '辰': '酉', '酉': '辰',
  '巳': '申', '申': '巳',
  '午': '未', '未': '午',
};

// 合化五行
export const LIUHE_WUXING: Record<string, WuxingElement> = {
  '子丑': '土', '丑子': '土',
  '寅亥': '木', '亥寅': '木',
  '卯戌': '火', '戌卯': '火',
  '辰酉': '金', '酉辰': '金',
  '巳申': '水', '申巳': '水',
  '午未': '火', '未午': '火',
};

// ===== 地支六冲 =====
export const DIZHI_LIUCHONG: Record<string, string> = {
  '子': '午', '午': '子',
  '丑': '未', '未': '丑',
  '寅': '申', '申': '寅',
  '卯': '酉', '酉': '卯',
  '辰': '戌', '戌': '辰',
  '巳': '亥', '亥': '巳',
};

// ===== 地支三合 =====
// 申子辰合水, 亥卯未合木, 寅午戌合火, 巳酉丑合金
export const DIZHI_SANHE: { group: [string, string, string]; wuxing: WuxingElement }[] = [
  { group: ['申', '子', '辰'], wuxing: '水' },
  { group: ['亥', '卯', '未'], wuxing: '木' },
  { group: ['寅', '午', '戌'], wuxing: '火' },
  { group: ['巳', '酉', '丑'], wuxing: '金' },
];

// ===== 地支三会 =====
// 寅卯辰会木, 巳午未会火, 申酉戌会金, 亥子丑会水
export const DIZHI_SANHUI: { group: [string, string, string]; wuxing: WuxingElement }[] = [
  { group: ['寅', '卯', '辰'], wuxing: '木' },
  { group: ['巳', '午', '未'], wuxing: '火' },
  { group: ['申', '酉', '戌'], wuxing: '金' },
  { group: ['亥', '子', '丑'], wuxing: '水' },
];

// ===== 地支相刑 =====
export const DIZHI_XING: Record<string, string> = {
  '子': '卯', '卯': '子', // 子卯刑（无礼之刑）
  '寅': '巳', '巳': '申', '申': '寅', // 寅巳申三刑（无恩之刑）
  '丑': '戌', '戌': '未', '未': '丑', // 丑戌未三刑（恃势之刑）
  '辰': '辰', '午': '午', '酉': '酉', '亥': '亥', // 自刑
};

// ===== 天干五合 =====
export const TIANGAN_WUHE: Record<string, { target: string; wuxing: WuxingElement }> = {
  '甲': { target: '己', wuxing: '土' },
  '己': { target: '甲', wuxing: '土' },
  '乙': { target: '庚', wuxing: '金' },
  '庚': { target: '乙', wuxing: '金' },
  '丙': { target: '辛', wuxing: '水' },
  '辛': { target: '丙', wuxing: '水' },
  '丁': { target: '壬', wuxing: '木' },
  '壬': { target: '丁', wuxing: '木' },
  '戊': { target: '癸', wuxing: '火' },
  '癸': { target: '戊', wuxing: '火' },
};

// ===== 关系查询函数 =====

/** a 和 b 六合？ */
export function isLiuhe(a: string, b: string): boolean {
  return DIZHI_LIUHE[a] === b;
}

/** a 和 b 六冲？ */
export function isLiuchong(a: string, b: string): boolean {
  return DIZHI_LIUCHONG[a] === b;
}

/** a 和 b 相刑？ */
export function isXing(a: string, b: string): boolean {
  return DIZHI_XING[a] === b;
}

/** 检查三个地支是否构成三合 */
export function checkSanhe(a: string, b: string, c: string): WuxingElement | null {
  const sorted = [a, b, c].sort().join('');
  for (const { group, wuxing } of DIZHI_SANHE) {
    if (group.slice().sort().join('') === sorted) return wuxing;
  }
  return null;
}

/** 检查三个地支是否构成三会 */
export function checkSanhui(a: string, b: string, c: string): WuxingElement | null {
  const sorted = [a, b, c].sort().join('');
  for (const { group, wuxing } of DIZHI_SANHUI) {
    if (group.slice().sort().join('') === sorted) return wuxing;
  }
  return null;
}

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
