import { EntropyData } from '@/types/divination';
import { YaoValue } from '@/types/hexagram';

/**
 * 多源熵值采集与卦象生成
 * 融合时间戳、地理位置、触摸交互、设备信息等多个熵源
 * 确保即使用户随便一划，每次结果都不同
 */

/** Mulberry32 PRNG — 纯前端32位伪随机数生成器 */
function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a 哈希 */
function fnv1aHash(bytes: number[]): number {
  let hash = 0x811c9dc5;
  for (const byte of bytes) {
    hash ^= byte & 0xff;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

/** 将数字转为字节数组 */
function numberToBytes(n: number): number[] {
  const bytes: number[] = [];
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, n);
  for (let i = 0; i < 8; i++) {
    bytes.push(view.getUint8(i));
  }
  return bytes;
}

/** 字符串哈希 */
function hashString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

/** 将熵值数据序列化为字节数组 */
function serializeEntropy(entropy: EntropyData): number[] {
  const bytes: number[] = [];
  bytes.push(...numberToBytes(entropy.timestampMs));
  if (entropy.geoLat !== null) bytes.push(...numberToBytes(entropy.geoLat));
  if (entropy.geoLng !== null) bytes.push(...numberToBytes(entropy.geoLng));
  bytes.push(...numberToBytes(entropy.touchStartX));
  bytes.push(...numberToBytes(entropy.touchStartY));
  bytes.push(...numberToBytes(entropy.touchEndX));
  bytes.push(...numberToBytes(entropy.touchEndY));
  bytes.push(...numberToBytes(entropy.touchAngle));
  bytes.push(...numberToBytes(entropy.touchSpeed));
  bytes.push(...numberToBytes(entropy.touchDuration));
  bytes.push(...numberToBytes(entropy.devicePixelRatio));
  bytes.push(...numberToBytes(entropy.screenWidth));
  bytes.push(...numberToBytes(entropy.screenHeight));
  if (entropy.motionX !== null) bytes.push(...numberToBytes(entropy.motionX));
  if (entropy.motionY !== null) bytes.push(...numberToBytes(entropy.motionY));
  if (entropy.motionZ !== null) bytes.push(...numberToBytes(entropy.motionZ));
  bytes.push(...numberToBytes(entropy.birthDatetimeHash));
  return bytes;
}

/** 从熵值生成种子 */
export function generateSeed(entropy: EntropyData): number {
  const bytes = serializeEntropy(entropy);
  return fnv1aHash(bytes);
}

/**
 * 从种子生成一爻
 * 概率分布：老阴(6) 1/8, 少阳(7) 3/8, 少阴(8) 3/8, 老阳(9) 1/8
 */
export function seedToLine(seed: number, lineIndex: number): YaoValue {
  const rng = mulberry32(seed + lineIndex * 0x9e3779b9);
  const r = rng();
  if (r < 0.125) return 6; // 老阴（变爻）
  if (r < 0.5) return 7; // 少阳
  if (r < 0.875) return 8; // 少阴
  return 9; // 老阳（变爻）
}

/**
 * 从种子生成六爻
 */
export function generateSixLines(entropy: EntropyData): YaoValue[] {
  const seed = generateSeed(entropy);
  return Array.from({ length: 6 }, (_, i) => seedToLine(seed, i));
}

/** 摇铜钱：模拟三枚铜钱投掷 */
export function castCoins(
  seed: number,
  lineIndex: number
): { value: YaoValue; coins: [number, number, number] } {
  const rng = mulberry32(seed + lineIndex * 0x9e3779b9);
  const c1 = rng() < 0.5 ? 3 : 2; // 正面=3(阳)，反面=2(阴)
  const c2 = rng() < 0.5 ? 3 : 2;
  const c3 = rng() < 0.5 ? 3 : 2;
  const sum = (c1 + c2 + c3) as YaoValue;
  return { value: sum, coins: [c1, c2, c3] };
}

/** 创建初始熵值数据 */
export function createEntropyData(
  birthDatetimeHash: number,
  geoLat: number | null = null,
  geoLng: number | null = null
): EntropyData {
  return {
    timestampMs: Date.now(),
    geoLat,
    geoLng,
    touchStartX: 0,
    touchStartY: 0,
    touchEndX: 0,
    touchEndY: 0,
    touchAngle: 0,
    touchSpeed: 0,
    touchDuration: 0,
    devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
    screenWidth: typeof window !== 'undefined' ? window.screen.width : 1920,
    screenHeight: typeof window !== 'undefined' ? window.screen.height : 1080,
    motionX: null,
    motionY: null,
    motionZ: null,
    birthDatetimeHash,
  };
}
