/**
 * 空亡（旬空）计算
 *
 * 空亡原理：
 * 天干10个，地支12个，每10个地支为一旬（配10天干），
 * 旬中剩余的2个地支即为"空亡"。
 *
 * 以日柱的干支确定所属旬，旬中未配天干的2个地支即为空亡。
 * 空亡影响：用神空亡则事难成，世爻空亡则自身无力，忌神空亡则凶象减轻。
 */

const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * 根据日柱天干地支计算空亡的两个地支
 * @param dayTiangan 日干
 * @param dayDizhi 日支
 * @returns 空亡的两个地支
 */
export function calculateKongwang(dayTiangan: string, dayDizhi: string): [string, string] {
  const tgIndex = TIANGAN.indexOf(dayTiangan);
  const dzIndex = DIZHI.indexOf(dayDizhi);

  if (tgIndex < 0 || dzIndex < 0) {
    return ['戌', '亥']; // 默认
  }

  // 计算旬首：日干支在六十甲子中的序数
  // 旬首 = 天干序数对应的地支起点
  // 甲子旬：甲子→癸酉，空戌亥
  // 甲戌旬：甲戌→癸未，空申酉
  // 甲申旬：甲申→癸巳，空午未
  // 甲午旬：甲午→癸卯，空辰巳
  // 甲辰旬：甲辰→癸丑，空寅卯
  // 甲寅旬：甲寅→癸亥，空子丑
  //
  // 规律：旬首地支 = (日支序数 - 日干序数 + 12) % 12
  // 空亡地支 = 旬首地支之后的第10和第11个地支
  const xunShouDzIndex = ((dzIndex - tgIndex) % 12 + 12) % 12;
  const kong1Index = (xunShouDzIndex + 10) % 12;
  const kong2Index = (xunShouDzIndex + 11) % 12;

  return [DIZHI[kong1Index], DIZHI[kong2Index]];
}

/**
 * 判断某个地支是否空亡
 */
export function isKongwang(dizhi: string, kongwang: [string, string]): boolean {
  return dizhi === kongwang[0] || dizhi === kongwang[1];
}

/**
 * 获取空亡的描述文本
 */
export function getKongwangText(kongwang: [string, string]): string {
  return `${kongwang[0]}${kongwang[1]}空亡`;
}
