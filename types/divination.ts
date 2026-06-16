import { HexagramData, YaoLine, LiuQinType, LiuShenType, NajiaLine } from './hexagram';

export type CategoryType = 'caiyun' | 'zhengyuan' | 'shiye' | 'jiankang' | 'zonghe';

export type GenderType = 'male' | 'female';

export type CastingMethod = 'coin' | 'taiji';

export type DivinationStep = 'landing' | 'input' | 'location' | 'cast' | 'result';

export interface EntropyData {
  timestampMs: number;
  geoLat: number | null;
  geoLng: number | null;
  touchStartX: number;
  touchStartY: number;
  touchEndX: number;
  touchEndY: number;
  touchAngle: number;
  touchSpeed: number;
  touchDuration: number;
  devicePixelRatio: number;
  screenWidth: number;
  screenHeight: number;
  motionX: number | null;
  motionY: number | null;
  motionZ: number | null;
  birthDatetimeHash: number;
}

export interface BaziPillar {
  tiangan: string;
  dizhi: string;
}

export interface Bazi {
  year: BaziPillar;
  month: BaziPillar;
  day: BaziPillar;
  hour: BaziPillar;
}

export interface NajiaResult {
  lines: NajiaLine[];
}

export interface LiuqinResult {
  lines: LiuQinType[];
}

export interface LiushenResult {
  lines: LiuShenType[];
}

export interface DivinationContext {
  birthDateTime: Date;
  gender: GenderType;
  category: CategoryType;
  latitude: number | null;
  longitude: number | null;
  castingMethod: CastingMethod;
  lines: YaoLine[];
  entropyData: EntropyData;
  bazi: Bazi;
  benGua: HexagramData;
  bianGua: HexagramData | null;
  najia: NajiaResult;
  liuqin: LiuqinResult;
  liushen: LiushenResult;
  dayTiangan: string;
}

export interface DivinationState {
  // 用户输入
  birthDateTime: Date | null;
  gender: GenderType | null;
  category: CategoryType | null;
  question: string | null;

  // 位置
  latitude: number | null;
  longitude: number | null;

  // 起卦
  castingMethod: CastingMethod | null;
  lines: YaoLine[];
  entropyData: EntropyData | null;

  // 计算结果
  benGua: HexagramData | null;
  bianGua: HexagramData | null;
  bazi: Bazi | null;
  interpretation: string | null;

  // 流程控制
  currentStep: DivinationStep;

  // Actions
  setBirthDateTime: (date: Date) => void;
  setGender: (gender: GenderType) => void;
  setCategory: (category: CategoryType) => void;
  setQuestion: (question: string) => void;
  setLocation: (lat: number, lng: number) => void;
  setCastingMethod: (method: CastingMethod) => void;
  addLine: (line: YaoLine) => void;
  setEntropyData: (data: EntropyData) => void;
  setResults: (benGua: HexagramData, bianGua: HexagramData | null, bazi: Bazi) => void;
  setInterpretation: (text: string) => void;
  setStep: (step: DivinationStep) => void;
  softReset: () => void;
  reset: () => void;
}
