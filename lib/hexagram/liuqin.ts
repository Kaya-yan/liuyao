import { LiuQinType, WuxingElement, NajiaLine } from '@/types/hexagram';
import { shengs, kes } from '@/lib/engine/wuxing';

/**
 * 六亲计算
 * 根据爻的五行与宫五行的生克关系确定六亲
 *
 * 同我 → 兄弟
 * 生我 → 父母
 * 我生 → 子孙
 * 克我 → 官鬼
 * 我克 → 妻财
 */
export function calculateLiuqin(
  palaceWuxing: WuxingElement,
  lineWuxing: WuxingElement
): LiuQinType {
  if (lineWuxing === palaceWuxing) return '兄弟';
  if (shengs(lineWuxing, palaceWuxing)) return '父母';
  if (shengs(palaceWuxing, lineWuxing)) return '子孙';
  if (kes(lineWuxing, palaceWuxing)) return '官鬼';
  return '妻财';
}

/** 计算一卦的六亲 */
export function calculateAllLiuqin(
  palaceWuxing: WuxingElement,
  najiaLines: NajiaLine[]
): LiuQinType[] {
  return najiaLines.map(line => calculateLiuqin(palaceWuxing, line.wuxing));
}
