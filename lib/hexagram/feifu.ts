import { HexagramData, LiuQinType, NajiaLine } from '@/types/hexagram';
import { calculateNajia } from './najia';
import { calculateAllLiuqin } from './liuqin';
import { palaces } from './palaces';
import { getHexagramById } from './data';

/**
 * 飞伏分析
 * 当卦中不见用神时，需查伏卦（本宫首卦）中对应爻位的五行
 *
 * 飞伏原理：
 * - 每个非本宫卦都有一个"伏卦"，即该宫的本宫卦（首卦）
 * - 伏卦的六爻中，与本卦缺失的六亲对应的爻称为"伏神"
 * - 本卦中与伏神同爻位的爻称为"飞神"
 * - 飞神与伏神的生克关系影响吉凶判断
 */

export interface FeifuInfo {
  /** 伏神的六亲 */
  fuLiuqin: LiuQinType;
  /** 伏神所在的爻位 (0-5) */
  fuYaoIndex: number;
  /** 伏神的纳甲 */
  fuNajia: NajiaLine;
  /** 飞神的六亲 */
  feiLiuqin: LiuQinType;
  /** 飞神的纳甲 */
  feiNajia: NajiaLine;
  /** 飞伏关系描述 */
  relation: string;
}

/**
 * 查找卦中缺失的六亲在伏卦中的位置
 * @param hexagram 本卦
 * @param targetLiuqin 要查找的六亲（用神）
 * @returns 飞伏信息，如果用神已在卦中则返回 null
 */
export function findFeifu(hexagram: HexagramData, targetLiuqin: LiuQinType): FeifuInfo | null {
  const palace = palaces[hexagram.palaceId];
  const najia = calculateNajia(hexagram);
  const liuqin = calculateAllLiuqin(palace.wuxing, najia);

  // 如果用神已在卦中出现，不需要看飞伏
  if (liuqin.includes(targetLiuqin)) {
    return null;
  }

  // 获取伏卦（本宫首卦）
  const fuHexagramId = hexagram.fuHexagramId;
  if (!fuHexagramId) {
    // 本宫卦没有伏卦（用神一定在卦中，因为本宫卦六亲齐全）
    return null;
  }

  const fuHexagram = getHexagramById(fuHexagramId);
  if (!fuHexagram) return null;

  // 在伏卦中找到目标六亲所在的爻位
  const fuNajia = calculateNajia(fuHexagram);
  const fuLiuqin = calculateAllLiuqin(palace.wuxing, fuNajia);
  const fuYaoIndex = fuLiuqin.indexOf(targetLiuqin);

  if (fuYaoIndex < 0) {
    // 理论上不会发生：本宫卦六亲应齐全
    return null;
  }

  const fuLine = fuNajia[fuYaoIndex];
  const feiLine = najia[fuYaoIndex];
  const feiLiuqin = liuqin[fuYaoIndex];

  // 飞伏关系
  const relation = getFeifuRelation(fuLine.wuxing, feiLine.wuxing);

  return {
    fuLiuqin: targetLiuqin,
    fuYaoIndex,
    fuNajia: fuLine,
    feiLiuqin,
    feiNajia: feiLine,
    relation,
  };
}

/**
 * 判断飞神与伏神的五行关系
 */
function getFeifuRelation(fuWuxing: string, feiWuxing: string): string {
  if (fuWuxing === feiWuxing) return '飞伏比和';

  const shengMap: Record<string, string> = {
    '金': '水', '水': '木', '木': '火', '火': '土', '土': '金',
  };
  const keMap: Record<string, string> = {
    '金': '木', '木': '土', '土': '水', '水': '火', '火': '金',
  };

  // 伏生飞：伏神生飞神，泄气，不利
  if (shengMap[fuWuxing] === feiWuxing) return '伏生飞，伏神泄气';
  // 飞生伏：飞神生伏神，得助，有利
  if (shengMap[feiWuxing] === fuWuxing) return '飞生伏，伏神得助';
  // 飞克伏：飞神克伏神，受制，不利
  if (keMap[feiWuxing] === fuWuxing) return '飞克伏，伏神受制';
  // 伏克飞：伏神克飞神，出暴，可出但有阻
  if (keMap[fuWuxing] === feiWuxing) return '伏克飞，伏神出暴';

  return '';
}

/**
 * 查找卦中所有缺失的六亲
 */
export function findMissingLiuqin(hexagram: HexagramData): LiuQinType[] {
  const palace = palaces[hexagram.palaceId];
  const najia = calculateNajia(hexagram);
  const liuqin = calculateAllLiuqin(palace.wuxing, najia);
  const allLiuqin: LiuQinType[] = ['父母', '兄弟', '子孙', '妻财', '官鬼'];
  return allLiuqin.filter(lq => !liuqin.includes(lq));
}
