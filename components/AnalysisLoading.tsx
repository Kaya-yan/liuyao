'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useDivinationStore } from '@/stores/divination';
import { calculateNajia } from '@/lib/hexagram/najia';
import { calculateAllLiuqin } from '@/lib/hexagram/liuqin';
import { calculateLiushen } from '@/lib/hexagram/liushen';
import { palaces } from '@/lib/hexagram/palaces';

interface AnalysisStep {
  icon: string;
  label: string;
  detail: string;
  computed?: string;
  duration: number;
}

interface AnalysisLoadingProps {
  onComplete: () => void;
}

export default function AnalysisLoading({ onComplete }: AnalysisLoadingProps) {
  const store = useDivinationStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);

  // Compute real intermediate values
  const computedSteps = useMemo((): AnalysisStep[] => {
    const bazi = store.bazi;
    const hexagram = store.benGua;

    const baziStr = bazi
      ? `${bazi.year.tiangan}${bazi.year.dizhi}年 ${bazi.month.tiangan}${bazi.month.dizhi}月 ${bazi.day.tiangan}${bazi.day.dizhi}日 ${bazi.hour.tiangan}${bazi.hour.dizhi}时`
      : '';

    let najiaStr = '';
    let liuqinStr = '';
    let liushenStr = '';
    let shiYingStr = '';

    if (hexagram) {
      const palace = palaces[hexagram.palaceId];
      const najia = calculateNajia(hexagram);
      const liuqin = calculateAllLiuqin(palace.wuxing, najia);

      najiaStr = `${palace.name}属${palace.wuxing}`;
      liuqinStr = liuqin.join(' · ');

      if (bazi) {
        const liushen = calculateLiushen(bazi.day.tiangan);
        liushenStr = liushen.join(' · ');
      }

      shiYingStr = `世在第${hexagram.shiYao}爻，应在第${hexagram.yingYao}爻`;
    }

    return [
      {
        icon: '八字',
        label: '推算四柱八字',
        detail: '根据出生时辰排定年月日时四柱',
        computed: baziStr,
        duration: 700,
      },
      {
        icon: '纳甲',
        label: '排布纳甲',
        detail: '依卦宫分配天干地支',
        computed: najiaStr,
        duration: 600,
      },
      {
        icon: '六亲',
        label: '确定六亲',
        detail: '五行生克关系推演',
        computed: liuqinStr || undefined,
        duration: 500,
      },
      {
        icon: '六神',
        label: '排布六神',
        detail: '据日干起六神',
        computed: liushenStr || undefined,
        duration: 500,
      },
      {
        icon: '解读',
        label: '综合解读',
        detail: '卦象、动爻、变卦综合分析',
        computed: shiYingStr || undefined,
        duration: 700,
      },
    ];
  }, [store.bazi, store.benGua]);

  const totalDuration = computedSteps.reduce((sum, s) => sum + s.duration, 0);

  // Use refs to prevent animation restart on callback/data changes
  const stepsRef = useRef(computedSteps);
  const totalRef = useRef(totalDuration);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    stepsRef.current = computedSteps;
    totalRef.current = totalDuration;
    onCompleteRef.current = onComplete;
  }, [computedSteps, totalDuration, onComplete]);

  useEffect(() => {
    let stepIndex = 0;
    let elapsed = 0;
    const interval = 50;
    let completionTimer: ReturnType<typeof setTimeout> | null = null;

    const timer = setInterval(() => {
      elapsed += interval;
      const steps = stepsRef.current;
      const total = totalRef.current;
      const cumulative = steps.slice(0, stepIndex + 1).reduce((s, st) => s + st.duration, 0);

      if (elapsed >= cumulative && stepIndex < steps.length - 1) {
        setCompletedSteps(prev => [...prev, stepIndex]);
        stepIndex++;
        setCurrentStep(stepIndex);
      }

      setProgress(Math.min(1, elapsed / total));

      if (elapsed >= total) {
        clearInterval(timer);
        setCompletedSteps(prev => [...prev, stepIndex]);
        completionTimer = setTimeout(() => onCompleteRef.current(), 600);
      }
    }, interval);

    return () => {
      clearInterval(timer);
      if (completionTimer) clearTimeout(completionTimer);
    };
  }, []); // Empty deps — runs once, uses refs for up-to-date values

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#06060a]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gold/[0.02]"
          style={{ filter: 'blur(80px)' }}
        />
      </div>

      <div className="relative w-full max-w-sm px-6">
        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="text-3xl mb-3 motion-safe:animate-taiji inline-block">
            <svg viewBox="0 0 200 200" className="w-12 h-12">
              <path d="M100,2 A98,98 0 0,1 100,198 A49,49 0 0,0 100,100 A49,49 0 0,1 100,2" fill="#f5f0e8" />
              <path d="M100,198 A98,98 0 0,1 100,2 A49,49 0 0,1 100,100 A49,49 0 0,0 100,198" fill="#1a1a2e" />
              <circle cx="100" cy="50" r="12" fill="#1a1a2e" />
              <circle cx="100" cy="150" r="12" fill="#f5f0e8" />
            </svg>
          </div>
          <h2 className="text-lg font-serif text-gold tracking-wider">卦象推演中</h2>
          <p className="text-xs text-[#807060] mt-1">基于卜筮正宗体系 · 纳甲六亲六神全息推演</p>
        </div>

        {/* 进度条 */}
        <div className="mb-8">
          <div className="h-1 bg-[#1a1a2e] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold-dark via-gold to-gold-light rounded-full transition-[width] duration-300 ease-out"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="text-right text-xs text-[#706850] mt-1">
            {Math.round(progress * 100)}%
          </div>
        </div>

        {/* 步骤列表 */}
        <div className="space-y-2">
          {computedSteps.map((step, i) => {
            const isCompleted = completedSteps.includes(i);
            const isCurrent = i === currentStep && !isCompleted;

            return (
              <div
                key={i}
                className={`flex items-start gap-3 py-2.5 px-3 rounded-lg transition-opacity transition-colors duration-500 ${
                  isCurrent
                    ? 'bg-gold/[0.06] border border-gold/10'
                    : isCompleted
                    ? 'opacity-60'
                    : 'opacity-30'
                }`}
              >
                {/* 图标 */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 transition-colors duration-500 ${
                    isCompleted
                      ? 'bg-gold/20 text-gold'
                      : isCurrent
                      ? 'bg-gold/10 text-gold border border-gold/20'
                      : 'bg-[#1a1a2e] text-[#706850]'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-xs">{step.icon}</span>
                  )}
                </div>

                {/* 文字 */}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm transition-colors duration-300 ${
                    isCurrent ? 'text-foreground' : isCompleted ? 'text-[#807060]' : 'text-[#706850]'
                  }`}>
                    {step.label}
                  </div>
                  {isCurrent && (
                    <div className="text-xs text-[#807060] mt-0.5">
                      {step.detail}
                    </div>
                  )}
                  {/* Show computed value when step completes */}
                  {isCompleted && step.computed && (
                    <div className="text-xs text-gold/60 mt-0.5 font-mono truncate">
                      {step.computed}
                    </div>
                  )}
                </div>

                {/* 加载指示器 */}
                {isCurrent && (
                  <div className="flex gap-1 mt-1.5">
                    {[0, 1, 2].map(d => (
                      <div
                        key={d}
                        className="w-1 h-1 rounded-full bg-gold"
                        style={{ animation: `analysis-dot-pulse 1.4s ease-in-out ${d * 0.2}s infinite` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
