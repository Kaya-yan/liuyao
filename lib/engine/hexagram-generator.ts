import { YaoValue, HexagramData, TrigramName } from '@/types/hexagram';
import { EntropyData } from '@/types/divination';
import { generateSixLines } from './entropy';
import { getHexagramById } from '@/lib/hexagram/data';
import { findPalaceInfo, findHexagramId } from '@/lib/hexagram/palaces';
import { trigramList } from '@/lib/hexagram/trigrams';

/**
 * 卦象生成器
 * 从熵值生成完整的卦象数据
 */

/** 从六爻值获取上下卦 */
function getTrigramsFromLines(
  lines: YaoValue[]
): { upper: TrigramName; lower: TrigramName } {
  // 初爻到上爻 → 下卦(lines[0-2]) + 上卦(lines[3-5])
  const toBit = (v: YaoValue) => (v === 7 || v === 9) ? 1 : 0;
  const lowerBits = [toBit(lines[0]), toBit(lines[1]), toBit(lines[2])];
  const upperBits = [toBit(lines[3]), toBit(lines[4]), toBit(lines[5])];

  const bitsToTrigram = (bits: number[]): TrigramName => {
    const trigramLines: [number, number, number] = [bits[0], bits[1], bits[2]];
    const index = trigramLines[0] + trigramLines[1] * 2 + trigramLines[2] * 4;
    // 乾(111)=7, 兑(110)=6, 离(101)=5, 震(100)=4, 巽(011)=3, 坎(010)=2, 艮(001)=1, 坤(000)=0
    const trigramMap: TrigramName[] = ['坤', '艮', '坎', '巽', '震', '离', '兑', '乾'];
    return trigramMap[index];
  };

  return {
    upper: bitsToTrigram(upperBits),
    lower: bitsToTrigram(lowerBits),
  };
}

/** 根据6个爻值查找对应的卦 */
function findHexagramByLines(lines: YaoValue[]): HexagramData | undefined {
  const { upper, lower } = getTrigramsFromLines(lines);
  const id = findHexagramId(upper, lower);
  return getHexagramById(id);
}

/**
 * 从爻值计算变卦
 * 变爻：老阴(6)→阳(7), 老阳(9)→阴(8)
 */
function getChangingLines(lines: YaoValue[]): number[] {
  return lines
    .map((v, i) => (v === 6 || v === 9) ? i : -1)
    .filter(i => i >= 0);
}

/** 计算变卦的爻值 */
function getBianGuaLines(lines: YaoValue[]): YaoValue[] {
  return lines.map(v => {
    if (v === 6) return 7; // 老阴→少阳
    if (v === 9) return 8; // 老阳→少阴
    return v; // 不变
  }) as YaoValue[];
}

/**
 * 生成完整卦象
 * @param linesOrEntropy 预生成的6爻值，或熵值数据（会从中重新生成6爻）
 */
export function generateHexagram(linesOrEntropy: YaoValue[] | EntropyData): {
  lines: YaoValue[];
  benGua: HexagramData;
  bianGua: HexagramData | null;
  changingLines: number[];
} {
  const lines = Array.isArray(linesOrEntropy)
    ? linesOrEntropy
    : generateSixLines(linesOrEntropy);

  const benGua = findHexagramByLines(lines);
  const changingLines = getChangingLines(lines);

  let bianGua: HexagramData | null = null;
  if (changingLines.length > 0) {
    const bianLines = getBianGuaLines(lines);
    bianGua = findHexagramByLines(bianLines) || null;
  }

  if (!benGua) {
    throw new Error(`无法找到对应的卦象: [${lines.join(',')}]`);
  }

  return {
    lines,
    benGua,
    bianGua,
    changingLines,
  };
}
