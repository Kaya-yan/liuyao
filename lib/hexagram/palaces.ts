import { Palace, PalacePosition, TrigramName } from '@/types/hexagram';

/**
 * 八宫系统
 * 每宫8卦，排列顺序：本宫 → 一世 → 二世 → 三世 → 四世 → 五世 → 游魂 → 归魂
 *
 * 世爻位置规则：
 * 本宫=6(上爻), 一世=1(初爻), 二世=2, 三世=3, 四世=4, 五世=5, 游魂=4, 归魂=3
 *
 * 应爻 = 世爻对冲：初↔四, 二↔五, 三↔上
 */

const SHI_POSITIONS: Record<PalacePosition, number> = {
  '本宫': 6,
  '一世': 1,
  '二世': 2,
  '三世': 3,
  '四世': 4,
  '五世': 5,
  '游魂': 4,
  '归魂': 3,
};

function getYingLine(shiLine: number): number {
  return shiLine <= 3 ? shiLine + 3 : shiLine - 3;
}

function makeHexagram(
  id: number,
  name: string,
  position: PalacePosition
) {
  const shi = SHI_POSITIONS[position];
  return {
    hexagramId: id,
    name,
    position,
    shiLine: shi,
    yingLine: getYingLine(shi),
  };
}

export const palaces: Palace[] = [
  // 乾宫（金）
  {
    name: '乾宫',
    master: '乾',
    wuxing: '金',
    tianganPair: ['甲', '壬'],
    hexagrams: [
      makeHexagram(1, '乾为天', '本宫'),
      makeHexagram(44, '天风姤', '一世'),
      makeHexagram(33, '天山遁', '二世'),
      makeHexagram(12, '天地否', '三世'),
      makeHexagram(20, '风地观', '四世'),
      makeHexagram(23, '山地剥', '五世'),
      makeHexagram(35, '火地晋', '游魂'),
      makeHexagram(14, '火天大有', '归魂'),
    ],
  },
  // 坎宫（水）
  {
    name: '坎宫',
    master: '坎',
    wuxing: '水',
    tianganPair: ['戊', '戊'],
    hexagrams: [
      makeHexagram(29, '坎为水', '本宫'),
      makeHexagram(60, '水泽节', '一世'),
      makeHexagram(3, '水雷屯', '二世'),
      makeHexagram(63, '水火既济', '三世'),
      makeHexagram(49, '泽火革', '四世'),
      makeHexagram(55, '雷火丰', '五世'),
      makeHexagram(36, '地火明夷', '游魂'),
      makeHexagram(7, '地水师', '归魂'),
    ],
  },
  // 艮宫（土）
  {
    name: '艮宫',
    master: '艮',
    wuxing: '土',
    tianganPair: ['丙', '丙'],
    hexagrams: [
      makeHexagram(52, '艮为山', '本宫'),
      makeHexagram(22, '山火贲', '一世'),
      makeHexagram(26, '山天大畜', '二世'),
      makeHexagram(41, '山泽损', '三世'),
      makeHexagram(38, '火泽睽', '四世'),
      makeHexagram(10, '天泽履', '五世'),
      makeHexagram(61, '风泽中孚', '游魂'),
      makeHexagram(53, '风山渐', '归魂'),
    ],
  },
  // 震宫（木）
  {
    name: '震宫',
    master: '震',
    wuxing: '木',
    tianganPair: ['庚', '庚'],
    hexagrams: [
      makeHexagram(51, '震为雷', '本宫'),
      makeHexagram(16, '雷地豫', '一世'),
      makeHexagram(40, '雷水解', '二世'),
      makeHexagram(32, '雷风恒', '三世'),
      makeHexagram(46, '地风升', '四世'),
      makeHexagram(48, '水风井', '五世'),
      makeHexagram(28, '泽风大过', '游魂'),
      makeHexagram(17, '泽雷随', '归魂'),
    ],
  },
  // 巽宫（木）
  {
    name: '巽宫',
    master: '巽',
    wuxing: '木',
    tianganPair: ['辛', '辛'],
    hexagrams: [
      makeHexagram(57, '巽为风', '本宫'),
      makeHexagram(9, '风天小畜', '一世'),
      makeHexagram(37, '风火家人', '二世'),
      makeHexagram(42, '风雷益', '三世'),
      makeHexagram(25, '天雷无妄', '四世'),
      makeHexagram(21, '火雷噬嗑', '五世'),
      makeHexagram(27, '山雷颐', '游魂'),
      makeHexagram(18, '山风蛊', '归魂'),
    ],
  },
  // 离宫（火）
  {
    name: '离宫',
    master: '离',
    wuxing: '火',
    tianganPair: ['己', '己'],
    hexagrams: [
      makeHexagram(30, '离为火', '本宫'),
      makeHexagram(56, '火山旅', '一世'),
      makeHexagram(50, '火风鼎', '二世'),
      makeHexagram(64, '火水未济', '三世'),
      makeHexagram(4, '山水蒙', '四世'),
      makeHexagram(59, '风水涣', '五世'),
      makeHexagram(6, '天水讼', '游魂'),
      makeHexagram(13, '天火同人', '归魂'),
    ],
  },
  // 坤宫（土）
  {
    name: '坤宫',
    master: '坤',
    wuxing: '土',
    tianganPair: ['乙', '癸'],
    hexagrams: [
      makeHexagram(2, '坤为地', '本宫'),
      makeHexagram(24, '地雷复', '一世'),
      makeHexagram(19, '地泽临', '二世'),
      makeHexagram(11, '地天泰', '三世'),
      makeHexagram(34, '雷天大壮', '四世'),
      makeHexagram(43, '泽天夬', '五世'),
      makeHexagram(5, '水天需', '游魂'),
      makeHexagram(8, '水地比', '归魂'),
    ],
  },
  // 兑宫（金）
  {
    name: '兑宫',
    master: '兑',
    wuxing: '金',
    tianganPair: ['丁', '丁'],
    hexagrams: [
      makeHexagram(58, '兑为泽', '本宫'),
      makeHexagram(47, '泽水困', '一世'),
      makeHexagram(45, '泽地萃', '二世'),
      makeHexagram(31, '泽山咸', '三世'),
      makeHexagram(39, '水山蹇', '四世'),
      makeHexagram(15, '地山谦', '五世'),
      makeHexagram(62, '雷山小过', '游魂'),
      makeHexagram(54, '雷泽归妹', '归魂'),
    ],
  },
];

/** 根据卦ID查找所属宫和宫内信息 */
export function findPalaceInfo(hexagramId: number): {
  palaceIndex: number;
  palace: Palace;
  hexagramInfo: Palace['hexagrams'][number];
} | null {
  for (let i = 0; i < palaces.length; i++) {
    const palace = palaces[i];
    const hexInfo = palace.hexagrams.find(h => h.hexagramId === hexagramId);
    if (hexInfo) {
      return { palaceIndex: i, palace, hexagramInfo: hexInfo };
    }
  }
  return null;
}

/**
 * 根据上下卦查找卦ID
 * 直接使用上下卦名称组合查找，避免二进制编码冲突
 */
const HEXAGRAM_LOOKUP: Record<string, number> = {
  '乾乾': 1,   '坤坤': 2,   '坎震': 3,   '艮坎': 4,
  '坎乾': 5,   '乾坎': 6,   '坤坎': 7,   '坎坤': 8,
  '巽乾': 9,   '乾兑': 10,  '坤乾': 11,  '乾坤': 12,
  '乾离': 13,  '离乾': 14,  '坤艮': 15,  '震坤': 16,
  '兑震': 17,  '艮巽': 18,  '坤兑': 19,  '巽坤': 20,
  '离震': 21,  '艮离': 22,  '艮坤': 23,  '坤震': 24,
  '乾震': 25,  '艮乾': 26,  '艮震': 27,  '兑巽': 28,
  '坎坎': 29,  '离离': 30,  '兑艮': 31,  '震巽': 32,
  '乾艮': 33,  '震乾': 34,  '离坤': 35,  '坤离': 36,
  '巽离': 37,  '离兑': 38,  '坎艮': 39,  '震坎': 40,
  '艮兑': 41,  '巽震': 42,  '兑乾': 43,  '乾巽': 44,
  '兑坤': 45,  '坤巽': 46,  '兑坎': 47,  '坎巽': 48,
  '兑离': 49,  '离巽': 50,  '震震': 51,  '艮艮': 52,
  '巽艮': 53,  '震兑': 54,  '震离': 55,  '离艮': 56,
  '巽巽': 57,  '兑兑': 58,  '巽坎': 59,  '坎兑': 60,
  '巽兑': 61,  '震艮': 62,  '坎离': 63,  '离坎': 64,
};

export function findHexagramId(upperTrigram: TrigramName, lowerTrigram: TrigramName): number {
  const key = upperTrigram + lowerTrigram;
  return HEXAGRAM_LOOKUP[key] || 1;
}
