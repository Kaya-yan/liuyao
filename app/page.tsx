'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import IntroAnimation from '@/components/IntroAnimation';

const FLOW_STEPS = [
  { icon: '壹', label: '输入生辰', desc: '排定四柱八字' },
  { icon: '贰', label: '定位校准', desc: '修正真太阳时' },
  { icon: '叁', label: '起卦', desc: '摇铜钱或转太极' },
  { icon: '肆', label: '推演解读', desc: '纳甲六亲六神全息分析' },
];

export default function LandingPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [introComplete, setIntroComplete] = useState(false);
  const [contentReady, setContentReady] = useState(false);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
    requestAnimationFrame(() => setContentReady(true));
  }, []);

  useEffect(() => {
    if (!introComplete) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: { x: number; y: number; vx: number; vy: number; r: number; o: number; phase: number }[] = [];
    const count = window.innerWidth < 768 ? 25 : 50;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 1,
        o: Math.random() * 0.4 + 0.1,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = Date.now() / 1000;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        const opacity = p.o + Math.sin(t + p.phase) * 0.15;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 168, 67, ${Math.max(0.05, opacity)})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [introComplete]);

  return (
    <>
      {!introComplete && <IntroAnimation onComplete={handleIntroComplete} />}

      <div
        className={`relative min-h-screen flex flex-col items-center justify-center overflow-hidden transition-opacity duration-1000 ${
          contentReady ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <canvas ref={canvasRef} className="fixed inset-0 z-0" />
        <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#0a0a14] via-[#0f0f1a] to-[#0a0a14]" />

        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          {/* 太极图 */}
          <div className="relative mb-8">
            <div className="w-32 h-32 md:w-40 md:h-40 animate-taiji">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <circle cx="100" cy="100" r="98" fill="none" stroke="rgba(212,168,67,0.3)" strokeWidth="1" />
                <path d="M100,2 A98,98 0 0,1 100,198 A49,49 0 0,0 100,100 A49,49 0 0,1 100,2" fill="#f5f0e8" />
                <path d="M100,198 A98,98 0 0,1 100,2 A49,49 0 0,1 100,100 A49,49 0 0,0 100,198" fill="#1a1a2e" />
                <circle cx="100" cy="50" r="12" fill="#1a1a2e" />
                <circle cx="100" cy="150" r="12" fill="#f5f0e8" />
                <circle cx="100" cy="100" r="98" fill="none" stroke="rgba(212,168,67,0.15)" strokeWidth="8" />
              </svg>
            </div>
            <div className="absolute inset-0 rounded-full bg-gold/5 blur-3xl scale-150" />
          </div>

          {/* 标题 */}
          <h1
            className="text-4xl md:text-6xl font-serif font-bold text-gold-gradient mb-4 tracking-wider animate-fade-in"
            style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
          >
            天机六爻
          </h1>
          <p
            className="text-base md:text-lg text-[#a09880] mb-2 font-light tracking-widest animate-fade-in"
            style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
          >
            古老的智慧，为你照亮前路
          </p>

          {/* 历史锚点 */}
          <p
            className="text-xs text-[#605040] mb-10 max-w-md animate-fade-in"
            style={{ animationDelay: '0.5s', animationFillMode: 'both' }}
          >
            源自西汉京房纳甲体系 · 以《卜筮正宗》为理论根基 · 历经两千年验证
          </p>

          {/* 开始按钮 */}
          <button
            onClick={() => router.push('/input')}
            className="btn-mystical btn-primary px-12 py-4 text-lg animate-fade-in"
            style={{ animationDelay: '0.7s', animationFillMode: 'both' }}
          >
            开始占卜
          </button>

          {/* 流程预览 */}
          <div
            className="mt-12 animate-fade-in"
            style={{ animationDelay: '0.9s', animationFillMode: 'both' }}
          >
            <div className="flex items-center gap-0 mb-8">
              {FLOW_STEPS.map((step, i) => (
                <div key={step.label} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full border border-gold/20 bg-gold/5 flex items-center justify-center">
                      <span className="text-xs font-serif text-gold">{step.icon}</span>
                    </div>
                    <div className="mt-2 text-xs text-[#a09880] font-medium">{step.label}</div>
                    <div className="text-[10px] text-[#605040] mt-0.5">{step.desc}</div>
                  </div>
                  {i < FLOW_STEPS.length - 1 && (
                    <div className="w-8 md:w-12 h-px bg-gradient-to-r from-gold/20 to-gold/10 mx-1 mt-[-20px]" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 权威特色卡片 */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl animate-fade-in"
            style={{ animationDelay: '1.1s', animationFillMode: 'both' }}
          >
            {[
              { icon: '☰', title: '64卦 · 384爻', desc: '完整卜筮正宗体系，纳甲六亲六神全息推演' },
              { icon: '◈', title: '真太阳时校准', desc: '经度修正 + 时差方程，精确到分钟的八字排盘' },
              { icon: '☯', title: '多源熵值融合', desc: '时间戳 · 地理坐标 · 交互数据 · 生辰哈希' },
            ].map((item) => (
              <div key={item.title} className="glass-card p-4 text-center">
                <div className="text-2xl text-gold mb-2">{item.icon}</div>
                <div className="text-sm font-medium text-[#e8e0d0] mb-1">{item.title}</div>
                <div className="text-xs text-[#807060] leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
