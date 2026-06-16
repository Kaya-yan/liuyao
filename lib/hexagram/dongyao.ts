import { HexagramData, YaoValue } from '@/types/hexagram';
import { dizhiToWuxing, isLiuchong } from '@/lib/engine/wuxing';
import { calculateNajia } from './najia';
import { palaces } from './palaces';

/**
 * 动爻高级分析
 * 化进/化退、反吟/伏吟
 */

// ===== 化进化退 =====

const JIN_ORDER = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
const JIN_PAIRS: Record<string, string> = {};
for (let i = 0; i < JIN_ORDER.length; i++) {
  JIN_PAIRS[JIN_ORDER[i]] = JIN_ORDER[(i + 1) % 12];
}
// 特殊：丑→寅（不是丑→寅的标准顺序，但六爻中丑化寅为进，寅化丑为退）

export interface DongYaoAnalysis {
  yaoIndex: number;
  benNajia: string; // 本爻纳甲
  bianNajia: string; // 变爻纳甲
  type: '化进' | '化退' | '化进神' | '化退神' | '普通';
  description: string;
}

/**
 * 分析动爻的化进化退
 * 化进：寅→卯, 申→酉, 丑→辰, 未→戌（同五行向前）
 * 化退：卯→寅, 酉→申, 辰→丑, 戌→未（同五行向后）
 */
export function analyzeDongYao(
  benGua: HexagramData,
  bianGua: HexagramData | null,
  changingLines: number[]
): DongYaoAnalysis[] {
  if (!bianGua || changingLines.length === 0) return [];

  const benNajia = calculateNajia(benGua);
  const bianNajia = calculateNajia(bianGua);
  const palace = palaces[benGua.palaceId];

  const results: DongYaoAnalysis[] = [];

  for (const idx of changingLines) {
    const ben = benNajia[idx];
    const bian = bianNajia[idx];
    const benDizhi = ben.dizhi;
    const bianDizhi = bian.dizhi;

    let type: DongYaoAnalysis['type'] = '普通';
    let description = '';

    if (ben.wuxing === bian.wuxing && benDizhi !== bianDizhi) {
      // 同五行变化，判断进退
      const benIdx = JIN_ORDER.indexOf(benDizhi);
      const bianIdx = JIN_ORDER.indexOf(bianDizhi);
      if (benIdx >= 0 && bianIdx >= 0) {
        // 同五行内：寅卯, 巳午, 申酉, 亥子, 辰丑戌未
        const diff = ((bianIdx - benIdx) % 12 + 12) % 12;
        if (diff === 1 || diff === 3) {
          // 向前1位或3位（如丑→辰）
          type = '化进';
          description = `${benDizhi}化${bianDizhi}，化进神，主事情向前发展，力量增强`;
        } else if (diff === 11 || diff === 9) {
          // 向后1位或3位
          type = '化退';
          description = `${benDizhi}化${bianDizhi}，化退神，主事情衰退，力量减弱`;
        }
      }
    }

    if (type === '普通') {
      // 检查是否化回头生/克
      const benWx = dizhiToWuxing(benDizhi);
      const bianWx = dizhiToWuxing(bianDizhi);
      if (benWx !== bianWx) {
        const shengMap: Record<string, string> = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' };
        const keMap: Record<string, string> = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' };
        if (shengMap[bianWx] === benWx) {
          description = `${benDizhi}化${bianDizhi}，变爻生本爻，回头生，吉`;
        } else if (keMap[bianWx] === benWx) {
          description = `${benDizhi}化${bianDizhi}，变爻克本爻，回头克，凶`;
        } else if (shengMap[benWx] === bianWx) {
          description = `${benDizhi}化${bianDizhi}，本爻生变爻，泄气`;
        } else if (keMap[benWx] === bianWx) {
          description = `${benDizhi}化${bianDizhi}，本爻克变爻，出`;
        }
      }
    }

    results.push({
      yaoIndex: idx,
      benNajia: `${ben.tiangan}${ben.dizhi}`,
      bianNajia: `${bian.tiangan}${bian.dizhi}`,
      type,
      description,
    });
  }

  return results;
}

// ===== 反吟伏吟 =====

/**
 * 反吟：本卦与变卦天克地冲（两组卦的天干相克、地支相冲）
 * 伏吟：本卦与变卦天同地同（卦变而爻不变，极端情况）
 */
export function checkFanyinFuyin(
  benGua: HexagramData,
  bianGua: HexagramData | null
): { type: '反吟' | '伏吟' | null; description: string } {
  if (!bianGua) return { type: null, description: '' };

  // 反吟：上下卦互换且相冲
  // 简化判断：本卦与变卦的上下卦名互换（如水雷屯→雷水解）
  const benUpper = benGua.upperTrigram;
  const benLower = benGua.lowerTrigram;
  const bianUpper = bianGua.upperTrigram;
  const bianLower = bianGua.lowerTrigram;

  // 伏吟：变卦与本卦完全相同（所有爻不变，但在有动爻的情况下不可能）
  // 更广义的伏吟：天干相同地支相同
  if (benUpper === bianUpper && benLower === bianLower) {
    return { type: '伏吟', description: '卦逢伏吟，主忧虑呻吟，事有反复，内心不安' };
  }

  // 反吟：上下卦互换
  if (benUpper === bianLower && benLower === bianUpper) {
    return { type: '反吟', description: '卦逢反吟，主事情反复无常，吉处藏凶，凶中带吉' };
  }

  return { type: null, description: '' };
}
