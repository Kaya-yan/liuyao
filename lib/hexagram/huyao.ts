import { HexagramData, TrigramName } from '@/types/hexagram';
import { findHexagramId } from './palaces';
import { getHexagramById } from './data';

/**
 * 互卦计算
 *
 * 互卦取本卦二三四爻为下卦，三四五爻为上卦（去初上，用中间四爻）
 * 互卦代表事情的过程和中间阶段
 */
export function calculateHugua(hexagram: HexagramData): HexagramData | null {
  const lines = hexagram.lines;

  // 下卦：二爻(lines[1])、三爻(lines[2])、四爻(lines[3])
  // 上卦：三爻(lines[2])、四爻(lines[3])、五爻(lines[4])
  const lowerLines = [lines[1], lines[2], lines[3]];
  const upperLines = [lines[2], lines[3], lines[4]];

  const lowerTrigram = bitsToTrigram(lowerLines);
  const upperTrigram = bitsToTrigram(upperLines);

  const id = findHexagramId(upperTrigram, lowerTrigram);
  return getHexagramById(id) || null;
}

function bitsToTrigram(bits: number[]): TrigramName {
  const index = bits[0] + bits[1] * 2 + bits[2] * 4;
  const trigramMap: TrigramName[] = ['坤', '艮', '坎', '巽', '震', '离', '兑', '乾'];
  return trigramMap[index];
}
