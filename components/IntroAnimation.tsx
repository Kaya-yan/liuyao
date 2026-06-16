'use client';

import { useState, useEffect } from 'react';

interface IntroAnimationProps {
  onComplete: () => void;
}

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [phase, setPhase] = useState(0);
  // phase 0: black screen with faint particles
  // phase 1: taiji scales in with glow
  // phase 2: title reveals
  // phase 3: subtitle fades up
  // phase 4: fade out → landing page

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(4), 2600),
      setTimeout(() => onComplete(), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#06060a] transition-opacity duration-1000 ${
        phase >= 4 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="dialog"
      aria-label="开场动画"
    >
      {/* 背景微光 */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full transition-opacity transition-transform duration-[3000ms] ease-out ${
            phase >= 1 ? 'bg-gold/[0.03] scale-100' : 'bg-gold/0 scale-0'
          }`}
          style={{ filter: 'blur(80px)' }}
        />
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full transition-opacity transition-transform duration-[2000ms] ease-out delay-500 ${
            phase >= 1 ? 'bg-crimson/[0.04] scale-100' : 'bg-crimson/0 scale-0'
          }`}
          style={{ filter: 'blur(60px)' }}
        />
      </div>

      {/* 太极图 */}
      <div className="relative mb-10">
        {/* 光晕 */}
        <div
          className={`absolute inset-0 rounded-full transition-opacity transition-transform duration-[2000ms] ease-out ${
            phase >= 1 ? 'scale-[3] opacity-0' : 'scale-0 opacity-0'
          }`}
          style={{
            background: 'radial-gradient(circle, rgba(201,168,76,0.3) 0%, transparent 70%)',
          }}
        />

        {/* 太极主体 */}
        <div
          className={`relative w-28 h-28 md:w-36 md:h-36 transition-opacity transition-transform duration-[1500ms] ease-out ${
            phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
          style={{ animation: phase >= 1 ? 'taiji-spin 20s linear infinite' : 'none' }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden="true">
            {/* 外圈光晕 */}
            <circle cx="100" cy="100" r="98" fill="none" stroke="rgba(201,168,76,0.15)" strokeWidth="2" />
            {/* 阳鱼 */}
            <path d="M100,2 A98,98 0 0,1 100,198 A49,49 0 0,0 100,100 A49,49 0 0,1 100,2" fill="#f5f0e8" />
            {/* 阴鱼 */}
            <path d="M100,198 A98,98 0 0,1 100,2 A49,49 0 0,1 100,100 A49,49 0 0,0 100,198" fill="#1a1a2e" />
            {/* 阳中之阴 */}
            <circle cx="100" cy="50" r="12" fill="#1a1a2e" />
            {/* 阴中之阳 */}
            <circle cx="100" cy="150" r="12" fill="#f5f0e8" />
          </svg>
        </div>
      </div>

      {/* 标题 */}
      <h1
        className={`text-4xl md:text-6xl font-serif font-bold text-gold-gradient mb-4 transition-opacity duration-[1800ms] ease-out ${
          phase >= 2 ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          letterSpacing: phase >= 2 ? '0.2em' : '0.8em',
          filter: phase >= 2 ? 'blur(0)' : 'blur(8px)',
        }}
      >
        天机六爻
      </h1>

      {/* 分隔线 */}
      <div
        className={`h-px mb-4 bg-gradient-to-r from-transparent via-gold/30 to-transparent transition-opacity transition-all duration-[1200ms] ease-out ${
          phase >= 2 ? 'w-40 opacity-100' : 'w-0 opacity-0'
        }`}
      />

      {/* 副标题 */}
      <p
        className={`text-sm md:text-base text-[#a09880] tracking-[0.3em] font-light transition-opacity transition-transform duration-[1200ms] ease-out ${
          phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        古法推演 · 洞悉天机
      </p>

      {/* 跳过按钮 */}
      <button
        onClick={onComplete}
        className={`absolute bottom-8 right-8 text-xs text-[#504838] hover:text-[#807060] transition-all duration-500 px-4 py-2 rounded-full border border-[#2a2a3e] hover:border-[#504838] ${
          phase >= 1 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        跳过
      </button>
    </div>
  );
}
