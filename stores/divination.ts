import { create } from 'zustand';
import { DivinationState, CategoryType, GenderType, CastingMethod, EntropyData, Bazi, DivinationStep } from '@/types/divination';
import { YaoLine } from '@/types/hexagram';
import { HexagramData } from '@/types/hexagram';

export const useDivinationStore = create<DivinationState>((set) => ({
  // 初始状态
  birthDateTime: null,
  gender: null,
  category: null,
  latitude: null,
  longitude: null,
  castingMethod: null,
  lines: [],
  entropyData: null,
  benGua: null,
  bianGua: null,
  bazi: null,
  interpretation: null,
  currentStep: 'landing',

  // Actions
  setBirthDateTime: (date: Date) => set({ birthDateTime: date }),
  setGender: (gender: GenderType) => set({ gender }),
  setCategory: (category: CategoryType) => set({ category }),
  setLocation: (lat: number, lng: number) => set({ latitude: lat, longitude: lng }),
  setCastingMethod: (method: CastingMethod) => set({ castingMethod: method }),
  addLine: (line: YaoLine) => set((state) => ({ lines: [...state.lines, line] })),
  setEntropyData: (data: EntropyData) => set({ entropyData: data }),
  setResults: (benGua: HexagramData, bianGua: HexagramData | null, bazi: Bazi) =>
    set({ benGua, bianGua, bazi }),
  setInterpretation: (text: string) => set({ interpretation: text }),
  setStep: (step: DivinationStep) => set({ currentStep: step }),
  reset: () =>
    set({
      birthDateTime: null,
      gender: null,
      category: null,
      latitude: null,
      longitude: null,
      castingMethod: null,
      lines: [],
      entropyData: null,
      benGua: null,
      bianGua: null,
      bazi: null,
      interpretation: null,
      currentStep: 'landing',
    }),
}));
