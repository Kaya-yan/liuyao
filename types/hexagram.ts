export type WuxingElement = '金' | '木' | '水' | '火' | '土';

export type TrigramName = '乾' | '兑' | '离' | '震' | '巽' | '坎' | '艮' | '坤';

export type LiuQinType = '父母' | '兄弟' | '子孙' | '妻财' | '官鬼';

export type LiuShenType = '青龙' | '朱雀' | '勾陈' | '螣蛇' | '白虎' | '玄武';

export type PalacePosition = '本宫' | '一世' | '二世' | '三世' | '四世' | '五世' | '游魂' | '归魂';

export type YaoValue = 6 | 7 | 8 | 9; // 6=老阴, 7=少阳, 8=少阴, 9=老阳

export type LineType = 'yang' | 'yin'; // 阳爻/阴爻

export interface TrigramData {
  name: TrigramName;
  lines: [number, number, number]; // 从下到上, 1=阳, 0=阴
  wuxing: WuxingElement;
  direction: string;
  nature: string;
  // 纳甲地支分配（从下到上三爻）
  najia_outer: [string, string, string]; // 外卦（上卦）
  najia_inner: [string, string, string]; // 内卦（下卦）
}

export interface PalaceHexagram {
  hexagramId: number;
  name: string;
  position: PalacePosition;
  shiLine: number;  // 世爻位置 1-6
  yingLine: number; // 应爻位置 1-6
}

export interface Palace {
  name: string;
  master: TrigramName;
  wuxing: WuxingElement;
  tianganPair: [string, string]; // [外卦天干, 内卦天干]
  hexagrams: PalaceHexagram[];
}

export interface HexagramData {
  id: number; // 1-64
  name: string; // "乾为天"
  shortName: string; // "乾"
  symbol: string; // Unicode 卦象符号
  upperTrigram: TrigramName;
  lowerTrigram: TrigramName;
  lines: [number, number, number, number, number, number]; // 初爻到上爻, 1=阳, 0=阴
  guaCi: string; // 卦辞
  tuan: string; // 彖辞
  xiang: string; // 象辞
  yaoCi: [string, string, string, string, string, string]; // 六爻爻辞
  palaceId: number; // 所属宫 0-7
  palacePosition: PalacePosition;
  shiYao: number; // 世爻位置 1-6
  yingYao: number; // 应爻位置 1-6
  fuHexagramId: number | null; // 伏卦ID
}

export interface NajiaLine {
  tiangan: string;
  dizhi: string;
  wuxing: WuxingElement;
}

export interface YaoLine {
  value: YaoValue;
  isYang: boolean; // 阳爻=true
  isChanging: boolean; // 是否变爻
  lineIndex: number; // 0-5
}
