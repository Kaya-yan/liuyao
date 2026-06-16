import { BaziPillar, Bazi } from '@/types/divination';
import { getShichenIndex } from './solar-time';

/**
 * 八字（四柱）计算
 * 年柱、月柱、日柱、时柱的天干地支
 */

const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/** 获取儒略日数 */
function toJulianDayNumber(date: Date): number {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return (
    d +
    Math.floor((153 * mm + 2) / 5) +
    365 * yy +
    Math.floor(yy / 4) -
    Math.floor(yy / 100) +
    Math.floor(yy / 400) -
    32045
  );
}

/**
 * 年柱
 * 以立春为年界，立春前属上一年
 * 简化处理：近似立春日期为2月4日
 */
function getYearPillar(year: number, month: number, day: number): BaziPillar {
  // 简化：2月4日前算上一年
  let actualYear = year;
  if (month < 2 || (month === 2 && day < 4)) {
    actualYear = year - 1;
  }

  const tianganIndex = ((actualYear - 4) % 10 + 10) % 10;
  const dizhiIndex = ((actualYear - 4) % 12 + 12) % 12;
  return {
    tiangan: TIANGAN[tianganIndex],
    dizhi: DIZHI[dizhiIndex],
  };
}

/**
 * 月柱
 * 月支由节气决定
 * 月干由年干推算（五虎遁月法）
 */
function getMonthPillar(yearTiangan: string, year: number, month: number, day: number): BaziPillar {
  // 节气近似日期（简化版）
  // 按时间顺序排列，每个节气标志着一个月的开始
  // 子月是唯一跨年的月份：大雪(12月) → 小寒(1月)
  const JIEQI = [
    { month: 1, day: 6 },   // 小寒 → 丑月
    { month: 2, day: 4 },   // 立春 → 寅月
    { month: 3, day: 6 },   // 惊蛰 → 卯月
    { month: 4, day: 5 },   // 清明 → 辰月
    { month: 5, day: 6 },   // 立夏 → 巳月
    { month: 6, day: 6 },   // 芒种 → 午月
    { month: 7, day: 7 },   // 小暑 → 未月
    { month: 8, day: 7 },   // 立秋 → 申月
    { month: 9, day: 8 },   // 白露 → 酉月
    { month: 10, day: 8 },  // 寒露 → 戌月
    { month: 11, day: 7 },  // 立冬 → 亥月
    { month: 12, day: 7 },  // 大雪 → 子月
  ];
  // 丑月=0, 寅月=1, 卯月=2, ..., 亥月=10, 子月=11
  // 但地支映射需要子月=10, 丑月=11, 寅月=0, ...
  // 所以 jieqiIndex 到地支的映射是 (jieqiIndex + 11) % 12 ... 不对
  // 用更直接的方式：根据节气直接确定地支

  const currentDate = new Date(year, month - 1, day);
  let dizhiMonthIndex: number; // 0=寅, 1=卯, ..., 10=子, 11=丑

  if (month === 1 && day < JIEQI[0].day) {
    // 1月小寒之前：子月（上一年大雪后）
    dizhiMonthIndex = 10;
  } else if (month === 12 && day >= JIEQI[11].day) {
    // 12月大雪之后：子月
    dizhiMonthIndex = 10;
  } else {
    // 从小寒开始，找到当前日期所在的节气区间
    // 默认：如果在小寒和立春之间，是丑月
    dizhiMonthIndex = 11; // 丑月（小寒后默认）
    for (let i = JIEQI.length - 1; i >= 0; i--) {
      const j = JIEQI[i];
      const jDate = new Date(year, j.month - 1, j.day);
      if (currentDate >= jDate) {
        // i=0(小寒)→丑月(11), i=1(立春)→寅月(0), i=2(惊蛰)→卯月(1), ...
        dizhiMonthIndex = (i + 11) % 12;
        break;
      }
    }
  }

  // jieqiMonth 用于五虎遁月法的偏移计算
  // 寅月=0, 卯月=1, ..., 子月=10, 丑月=11
  const jieqiMonth = dizhiMonthIndex;

  // 子月（大雪~小寒期间）跨年，月干需按上一年年干推算
  const isZiyue = dizhiMonthIndex === 10;
  let yearTianganForMonth = yearTiangan;
  if (isZiyue) {
    const prevYearTianganIndex = (TIANGAN.indexOf(yearTiangan) - 1 + 10) % 10;
    yearTianganForMonth = TIANGAN[prevYearTianganIndex];
  }

  // 月支：寅月=地支第2位(index=2)
  const dizhiIndex = (jieqiMonth + 2) % 12;

  // 月干由年干推算（五虎遁月法）
  // 甲己→丙寅起, 乙庚→戊寅起, 丙辛→庚寅起, 丁壬→壬寅起, 戊癸→甲寅起
  const yearTgIndex = TIANGAN.indexOf(yearTianganForMonth);
  const monthTgBases = [2, 4, 6, 8, 0]; // 甲己→丙(2), 乙庚→戊(4), ...
  const monthTgBase = monthTgBases[yearTgIndex % 5];
  const tianganIndex = (monthTgBase + jieqiMonth) % 10;

  return {
    tiangan: TIANGAN[tianganIndex],
    dizhi: DIZHI[dizhiIndex],
  };
}

/**
 * 日柱
 * 基于儒略日数计算干支序数
 */
function getDayPillar(date: Date): BaziPillar {
  const jdn = toJulianDayNumber(date);
  const ganzhiIndex = ((jdn + 9) % 60 + 60) % 60;
  return {
    tiangan: TIANGAN[ganzhiIndex % 10],
    dizhi: DIZHI[ganzhiIndex % 12],
  };
}

/**
 * 时柱
 * 时干由日干推算（五鼠遁时法）
 */
function getHourPillar(dayTiangan: string, hour: number, minute: number): BaziPillar {
  const shichenIndex = getShichenIndex(hour, minute);
  const dizhi = DIZHI[shichenIndex];

  // 五鼠遁时法
  // 甲己→甲子起, 乙庚→丙子起, 丙辛→戊子起, 丁壬→庚子起, 戊癸→壬子起
  const dayTgIndex = TIANGAN.indexOf(dayTiangan);
  const hourTgBases = [0, 2, 4, 6, 8]; // 甲己→甲(0), 乙庚→丙(2), ...
  const hourTgBase = hourTgBases[dayTgIndex % 5];
  const tiangan = TIANGAN[(hourTgBase + shichenIndex) % 10];

  return { tiangan, dizhi };
}

/**
 * 计算完整八字
 * @param date 真太阳时
 */
export function calculateBazi(date: Date): Bazi {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();

  const yearPillar = getYearPillar(year, month, day);
  const monthPillar = getMonthPillar(yearPillar.tiangan, year, month, day);
  const dayPillar = getDayPillar(date);
  const hourPillar = getHourPillar(dayPillar.tiangan, hour, minute);

  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
  };
}

/** 获取日干 */
export function getDayTiangan(bazi: Bazi): string {
  return bazi.day.tiangan;
}
