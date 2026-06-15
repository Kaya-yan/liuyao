import { HexagramData, NajiaLine, WuxingElement } from '@/types/hexagram';
import { trigrams } from './trigrams';
import { palaces } from './palaces';
import { dizhiToWuxing } from '@/lib/engine/wuxing';

/**
 * 纳甲计算
 * 根据卦的上下卦所属宫，分配天干地支到六爻
 */
export function calculateNajia(hexagram: HexagramData): NajiaLine[] {
  const palace = palaces[hexagram.palaceId];
  const upperTrigram = trigrams[hexagram.upperTrigram];
  const lowerTrigram = trigrams[hexagram.lowerTrigram];

  // 宫的天干配对 [外卦天干, 内卦天干]
  const [outerTiangan, innerTiangan] = palace.tianganPair;

  return [
    // 初爻（下卦第一爻）
    { tiangan: innerTiangan, dizhi: lowerTrigram.najia_inner[0], wuxing: dizhiToWuxing(lowerTrigram.najia_inner[0]) },
    // 二爻（下卦第二爻）
    { tiangan: innerTiangan, dizhi: lowerTrigram.najia_inner[1], wuxing: dizhiToWuxing(lowerTrigram.najia_inner[1]) },
    // 三爻（下卦第三爻）
    { tiangan: innerTiangan, dizhi: lowerTrigram.najia_inner[2], wuxing: dizhiToWuxing(lowerTrigram.najia_inner[2]) },
    // 四爻（上卦第一爻）
    { tiangan: outerTiangan, dizhi: upperTrigram.najia_outer[0], wuxing: dizhiToWuxing(upperTrigram.najia_outer[0]) },
    // 五爻（上卦第二爻）
    { tiangan: outerTiangan, dizhi: upperTrigram.najia_outer[1], wuxing: dizhiToWuxing(upperTrigram.najia_outer[1]) },
    // 上爻（上卦第三爻）
    { tiangan: outerTiangan, dizhi: upperTrigram.najia_outer[2], wuxing: dizhiToWuxing(upperTrigram.najia_outer[2]) },
  ];
}
