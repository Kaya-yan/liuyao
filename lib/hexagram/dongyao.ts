import { HexagramData } from '@/types/hexagram';
import { dizhiToWuxing } from '@/lib/engine/wuxing';
import { calculateNajia } from './najia';

/**
 * 动爻高级分析
 * 化进/化退、反吟/伏吟
 */

// ===== 化进化退 =====

// 传统六爻严格四组化进化退（卜筮正宗）
const JIN_PAIRS: Record<string, string> = {
  '寅': '卯', '申': '酉', '丑': '辰', '未': '戌', // 化进
};
const TUI_PAIRS: Record<string, string> = {
  '卯': '寅', '酉': '申', '辰': '丑', '戌': '未', // 化退
};

export interface DongYaoAnalysis {
  yaoIndex: number;
  benNajia: string; // 本爻纳甲
  bianNajia: string; // 变爻纳甲
  type: '化进' | '化退' | '普通';
  description: string;
}

/**
 * 分析动爻的化进化退
 * 严格遵循卜筮正宗，仅四组：
 * 化进：寅→卯, 申→酉, 丑→辰, 未→戌
 * 化退：卯→寅, 酉→申, 辰→丑, 戌→未
 */
export function analyzeDongYao(
  benGua: HexagramData,
  bianGua: HexagramData | null,
  changingLines: number[]
): DongYaoAnalysis[] {
  if (!bianGua || changingLines.length === 0) return [];

  const benNajia = calculateNajia(benGua);
  const bianNajia = calculateNajia(bianGua);

  const results: DongYaoAnalysis[] = [];

  for (const idx of changingLines) {
    const ben = benNajia[idx];
    const bian = bianNajia[idx];
    const benDizhi = ben.dizhi;
    const bianDizhi = bian.dizhi;

    let type: DongYaoAnalysis['type'] = '普通';
    let description = '';

    if (ben.wuxing === bian.wuxing && benDizhi !== bianDizhi) {
      // 严格匹配传统四组化进化退
      if (JIN_PAIRS[benDizhi] === bianDizhi) {
        type = '化进';
        description = `${benDizhi}化${bianDizhi}，化进神，主事情向前发展，力量增强`;
      } else if (TUI_PAIRS[benDizhi] === bianDizhi) {
        type = '化退';
        description = `${benDizhi}化${bianDizhi}，化退神，主事情衰退，力量减弱`;
      } else {
        description = `${benDizhi}化${bianDizhi}，同五行变化，${ben.wuxing}气延续`;
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
 * 反吟伏吟判断（传统六爻两种形式）
 *
 * 卦反吟：上下卦互换（如水雷屯→雷水解）
 * 爻反吟：变爻地支与本爻地支相冲（如子→午、卯→酉）
 * 伏吟：本卦与变卦纳甲地支完全相同（天同地同）
 */
export function checkFanyinFuyin(
  benGua: HexagramData,
  bianGua: HexagramData | null
): { type: '反吟' | '伏吟' | null; subType?: '卦反吟' | '爻反吟'; description: string } {
  if (!bianGua) return { type: null, description: '' };

  const benUpper = benGua.upperTrigram;
  const benLower = benGua.lowerTrigram;
  const bianUpper = bianGua.upperTrigram;
  const bianLower = bianGua.lowerTrigram;

  // 伏吟：本卦与变卦纳甲地支完全相同（天同地同）
  const benNajia = calculateNajia(benGua);
  const bianNajia = calculateNajia(bianGua);
  const allDizhiSame = benNajia.every((na, i) => na.dizhi === bianNajia[i].dizhi);
  if (allDizhiSame) {
    return { type: '伏吟', description: '卦逢伏吟，主忧虑呻吟，事有反复，内心不安' };
  }

  // 卦反吟：上下卦互换
  if (benUpper === bianLower && benLower === bianUpper) {
    return { type: '反吟', subType: '卦反吟', description: '卦逢反吟（卦位互换），主事情反复无常，吉处藏凶，凶中带吉' };
  }

  // 爻反吟：变爻地支与本爻地支相冲
  const liuchongPairs: Record<string, string> = {
    '子': '午', '午': '子', '丑': '未', '未': '丑',
    '寅': '申', '申': '寅', '卯': '酉', '酉': '卯',
    '辰': '戌', '戌': '辰', '巳': '亥', '亥': '巳',
  };
  let chongCount = 0;
  for (let i = 0; i < 6; i++) {
    if (liuchongPairs[benNajia[i].dizhi] === bianNajia[i].dizhi) {
      chongCount++;
    }
  }
  if (chongCount >= 2) {
    return { type: '反吟', subType: '爻反吟', description: `卦逢反吟（${chongCount}爻地支相冲），主事情反复，动荡不安` };
  }

  return { type: null, description: '' };
}
