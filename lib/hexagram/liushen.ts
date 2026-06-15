import { LiuShenType } from '@/types/hexagram';

/**
 * 六神计算
 * 根据日干确定初爻对应的六神，然后依次排列
 *
 * 甲乙 → 青龙起
 * 丙丁 → 朱雀起
 * 戊   → 勾陈起
 * 己   → 螣蛇起
 * 庚辛 → 白虎起
 * 壬癸 → 玄武起
 */

const LIUSHEN_ORDER: LiuShenType[] = ['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武'];

const RIGAN_TO_START: Record<string, number> = {
  '甲': 0, '乙': 0,
  '丙': 1, '丁': 1,
  '戊': 2,
  '己': 3,
  '庚': 4, '辛': 4,
  '壬': 5, '癸': 5,
};

/** 根据日干计算六爻六神 */
export function calculateLiushen(dayTiangan: string): LiuShenType[] {
  const startIndex = RIGAN_TO_START[dayTiangan] ?? 0;
  return Array.from({ length: 6 }, (_, i) =>
    LIUSHEN_ORDER[(startIndex + i) % 6]
  );
}

/** 六神含义 */
export const LIUSHEN_MEANINGS: Record<LiuShenType, string> = {
  '青龙': '主喜庆、财禄、贵人',
  '朱雀': '主文书、口舌、信息',
  '勾陈': '主田土、牢狱、迟滞',
  '螣蛇': '主惊恐、怪异、虚惊',
  '白虎': '主凶丧、血光、疾病',
  '玄武': '主盗贼、暗昧、欺诈',
};
