/**
 * 真太阳时计算
 * 基于经度修正 + 时差方程（Spencer, 1971）
 */

/** 获取一年中的第几天 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * 时差方程（Equation of Time）
 * Spencer 近似公式，精度约1-2分钟
 * 返回值单位：分钟
 */
function equationOfTime(dayOfYear: number): number {
  const B = (2 * Math.PI * (dayOfYear - 81)) / 365;
  return (
    9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B)
  );
}

/**
 * 计算真太阳时
 * @param localTime 北京时间（本地时间）
 * @param longitude 当地经度（东经为正）
 * @returns 真太阳时
 */
export function calculateTrueSolarTime(
  localTime: Date,
  longitude: number
): Date {
  // 1. 经度时差修正（北京时间基于东经120度）
  const longitudeOffset = (longitude - 120) * 4; // 每度4分钟

  // 2. 时差方程修正
  const dayOfYear = getDayOfYear(localTime);
  const eot = equationOfTime(dayOfYear);

  // 3. 合并修正
  const totalOffsetMinutes = longitudeOffset + eot;

  return new Date(localTime.getTime() + totalOffsetMinutes * 60 * 1000);
}

/**
 * 获取时辰索引（0-11）
 * 子时(23-1)=0, 丑时(1-3)=1, 寅时(3-5)=2, ...
 */
export function getShichenIndex(hour: number, minute: number): number {
  // 23:00-00:59 → 子时(0)
  // 01:00-02:59 → 丑时(1)
  // ...
  const adjustedHour = (hour + 1) % 24;
  return Math.floor(adjustedHour / 2);
}

/** 时辰名称 */
export const SHICHEN_NAMES = [
  '子', '丑', '寅', '卯', '辰', '巳',
  '午', '未', '申', '酉', '戌', '亥',
];

/** 时辰对应时间段描述 */
export const SHICHEN_RANGES = [
  '23:00-01:00', '01:00-03:00', '03:00-05:00',
  '05:00-07:00', '07:00-09:00', '09:00-11:00',
  '11:00-13:00', '13:00-15:00', '15:00-17:00',
  '17:00-19:00', '19:00-21:00', '21:00-23:00',
];
