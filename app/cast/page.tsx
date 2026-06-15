'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDivinationStore } from '@/stores/divination';
import { YaoValue } from '@/types/hexagram';
import { CastingMethod } from '@/types/divination';
import { createEntropyData, castCoins, generateSeed } from '@/lib/engine/entropy';
import { calculateBazi, getDayTiangan } from '@/lib/engine/bazi';
import { calculateTrueSolarTime } from '@/lib/engine/solar-time';
import { generateHexagram } from '@/lib/engine/hexagram-generator';
import { generateInterpretation } from '@/lib/engine/interpretation';
import { hashString } from '@/lib/utils/cn';

type CastStatus = 'selecting' | 'preparing' | 'casting' | 'done';

const LINE_NAMES = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];

function getYaoTypeName(value: YaoValue): string {
  switch (value) {
    case 6: return '老阴 ▇╌▇';
    case 7: return '少阳 ▇▇▇';
    case 8: return '少阴 ▇╌▇';
    case 9: return '老阳 ▇▇▇';
  }
}

function isChangingYao(value: YaoValue): boolean {
  return value === 6 || value === 9;
}

export default function CastPage() {
  const router = useRouter();
  const store = useDivinationStore();

  const [method, setMethod] = useState<CastingMethod | null>(null);
  const [status, setStatus] = useState<CastStatus>('selecting');
  const [currentLine, setCurrentLine] = useState(0);
  const [lines, setLines] = useState<YaoValue[]>([]);
  const [coinResults, setCoinResults] = useState<[number, number, number] | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const isAnimatingRef = useRef(false);
  const [showResult, setShowResult] = useState(false);
  const [lastLineInfo, setLastLineInfo] = useState<{ name: string; type: string; isChanging: boolean } | null>(null);
  const linesRef = useRef<YaoValue[]>([]);
  const pendingTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // 太极图相关
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const lastAngleRef = useRef(0);
  const isDraggingRef = useRef(false);
  const velocityRef = useRef(0);
  const lastTimeRef = useRef(0);
  const accumulatedRotationRef = useRef(0);
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; r: number; o: number }[]>([]);

  // Detect mobile synchronously to avoid stale state timing issue
  const isMobileRef = useRef(typeof window !== 'undefined' && (window.innerWidth < 768 || 'ontouchstart' in window));

  useEffect(() => {
    if (!method) {
      setMethod(isMobileRef.current ? 'coin' : 'taiji');
    }
  }, [method]);

  // Clean up pending timers on unmount
  useEffect(() => {
    return () => {
      pendingTimers.current.forEach(clearTimeout);
    };
  }, []);

  // 太极图Canvas
  useEffect(() => {
    if (method !== 'taiji' || status !== 'casting') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const size = Math.min(window.innerWidth - 32, 400);
      canvas.width = size;
      canvas.height = size;
    };
    resize();

    particlesRef.current = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2 + 1,
      o: Math.random() * 0.3 + 0.1,
    }));

    const drawTaiji = (rotation: number) => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(cx, cy) * 0.55;
      ctx.clearRect(0, 0, w, h);

      const t = Date.now() / 1000;
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        const opacity = p.o + Math.sin(t + p.x * 0.01) * 0.1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 168, 67, ${Math.max(0.05, opacity)})`;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(cx, cy, r + 15, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(212, 168, 67, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      const baguaSymbols = ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'];
      ctx.font = '14px serif';
      ctx.fillStyle = 'rgba(212, 168, 67, 0.4)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2) / 8 + rotation * 0.3;
        ctx.fillText(baguaSymbols[i], cx + Math.cos(angle) * (r + 25), cy + Math.sin(angle) * (r + 25));
      }

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      ctx.beginPath(); ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2); ctx.fillStyle = '#f5f0e8'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, r, Math.PI / 2, -Math.PI / 2); ctx.fillStyle = '#1a1a2e'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, -r / 2, r / 2, Math.PI / 2, -Math.PI / 2); ctx.fillStyle = '#1a1a2e'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, r / 2, r / 2, -Math.PI / 2, Math.PI / 2); ctx.fillStyle = '#f5f0e8'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, -r / 2, r / 6, 0, Math.PI * 2); ctx.fillStyle = '#1a1a2e'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, r / 2, r / 6, 0, Math.PI * 2); ctx.fillStyle = '#f5f0e8'; ctx.fill();
      ctx.restore();
    };

    let animId: number;
    const animate = () => {
      if (!isDraggingRef.current) {
        rotationRef.current += velocityRef.current;
        velocityRef.current *= 0.98;
        if (Math.abs(velocityRef.current) < 0.001) velocityRef.current = 0;
      }
      drawTaiji(rotationRef.current);
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, [method, status]);

  const handleTaijiPointerDown = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    lastAngleRef.current = Math.atan2(e.clientY - (rect.top + rect.height / 2), e.clientX - (rect.left + rect.width / 2));
    lastTimeRef.current = Date.now();
    velocityRef.current = 0;
  }, []);

  const handleTaijiPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const angle = Math.atan2(e.clientY - (rect.top + rect.height / 2), e.clientX - (rect.left + rect.width / 2));
    let delta = angle - lastAngleRef.current;
    if (delta > Math.PI) delta -= 2 * Math.PI;
    if (delta < -Math.PI) delta += 2 * Math.PI;

    rotationRef.current += delta;
    accumulatedRotationRef.current += Math.abs(delta);
    lastAngleRef.current = angle;

    const now = Date.now();
    const dt = now - lastTimeRef.current;
    if (dt > 0) velocityRef.current = delta / dt * 16;
    lastTimeRef.current = now;

    if (accumulatedRotationRef.current >= 2.09 && linesRef.current.length < 6 && !isAnimatingRef.current) {
      accumulatedRotationRef.current = 0;
      generateOneLineRef.current();
    }
  }, []);

  const handleTaijiPointerUp = useCallback(() => { isDraggingRef.current = false; }, []);

  // Use refs for store values to avoid stale closures
  const storeRef = useRef(store);
  storeRef.current = store;

  const generateOneLine = useCallback(() => {
    const lineIndex = linesRef.current.length;
    if (lineIndex >= 6 || isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    setIsAnimating(true);
    const s = storeRef.current;
    const entropy = createEntropyData(
      hashString(s.birthDateTime?.toISOString() || ''),
      s.latitude,
      s.longitude
    );
    entropy.timestampMs = Date.now() + lineIndex;
    entropy.touchAngle = rotationRef.current;
    entropy.touchDuration = accumulatedRotationRef.current;

    const seed = generateSeed(entropy);
    const lineValue = castCoins(seed, lineIndex);

    const timer = setTimeout(() => {
      linesRef.current = [...linesRef.current, lineValue.value];
      setLines([...linesRef.current]);
      setCoinResults(lineValue.coins);
      setCurrentLine(linesRef.current.length);
      setLastLineInfo({
        name: LINE_NAMES[linesRef.current.length - 1],
        type: getYaoTypeName(lineValue.value),
        isChanging: isChangingYao(lineValue.value),
      });
      isAnimatingRef.current = false;
      setIsAnimating(false);

      if (linesRef.current.length === 6) {
        const finishTimer = setTimeout(() => finishCasting(linesRef.current), 1200);
        pendingTimers.current.push(finishTimer);
      }
    }, 600);
    pendingTimers.current.push(timer);
  }, []); // No deps — uses refs for everything

  const generateOneLineRef = useRef(generateOneLine);
  generateOneLineRef.current = generateOneLine;

  const handleCoinShake = useCallback(() => {
    if (linesRef.current.length >= 6 || isAnimatingRef.current) return;
    generateOneLineRef.current();
  }, []);

  const finishCasting = (allLines: YaoValue[]) => {
    const s = storeRef.current;
    const result = generateHexagram(allLines);
    const solarTime = calculateTrueSolarTime(
      s.birthDateTime || new Date(),
      s.longitude || 120
    );
    const bazi = calculateBazi(solarTime);
    const dayTiangan = getDayTiangan(bazi);

    const interpretation = generateInterpretation({
      hexagram: result.benGua,
      bianGua: result.bianGua,
      lines: allLines,
      changingLines: result.changingLines,
      category: s.category || 'zonghe',
      gender: s.gender || 'male',
      bazi,
      dayTiangan,
    });

    s.setResults(result.benGua, result.bianGua, bazi);
    s.setInterpretation(interpretation);
    allLines.forEach((v, i) => {
      s.addLine({
        value: v,
        isYang: v === 7 || v === 9,
        isChanging: v === 6 || v === 9,
        lineIndex: i,
      });
    });

    setStatus('done');
    setShowResult(true);
    const navTimer = setTimeout(() => router.push('/result'), 2000);
    pendingTimers.current.push(navTimer);
  };

  const renderLine = (value: YaoValue | undefined, index: number, isActive: boolean) => {
    const isYang = value === 7 || value === 9;
    const isChanging = value === 6 || value === 9;

    return (
      <div
        key={index}
        className={`flex items-center justify-center gap-1 h-4 transition-all duration-500 ${
          isActive ? 'animate-line-appear' : ''
        } ${isChanging ? 'animate-pulse-glow rounded' : ''}`}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        {value === undefined ? (
          <div className="flex gap-2">
            <div className="w-10 h-1 bg-[#2a2a3e] rounded" />
            <div className="w-10 h-1 bg-[#2a2a3e] rounded" />
          </div>
        ) : isYang ? (
          <div className={`w-24 h-1.5 rounded ${isChanging ? 'bg-gold' : 'bg-[#d4a843]'}`} />
        ) : (
          <div className="flex gap-3">
            <div className={`w-9 h-1.5 rounded ${isChanging ? 'bg-gold' : 'bg-[#d4a843]'}`} />
            <div className={`w-9 h-1.5 rounded ${isChanging ? 'bg-gold' : 'bg-[#d4a843]'}`} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-[#0a0a14] via-[#0f0f1a] to-[#0a0a14]">
      {/* 选择起卦方式 */}
      {status === 'selecting' && (
        <div className="glass-card p-8 w-full max-w-md animate-fade-in text-center">
          <h2 className="text-xl font-serif text-gold mb-2">选择起卦方式</h2>
          <p className="text-xs text-[#706850] mb-6">不同方式采集不同维度的熵值，卦象由天地人三才共同感应</p>

          <div className="space-y-4">
            <button
              onClick={() => { setMethod('coin'); setStatus('preparing'); }}
              className="w-full glass-card p-5 flex items-center gap-4 text-left transition-all hover:scale-[1.02] hover:border-gold/40"
            >
              <span className="text-3xl">🪙</span>
              <div>
                <div className="font-medium text-foreground">摇铜钱</div>
                <div className="text-xs text-[#706850]">模拟三枚铜钱投掷，以手气感召天意</div>
              </div>
            </button>

            <button
              onClick={() => { setMethod('taiji'); setStatus('preparing'); }}
              className="w-full glass-card p-5 flex items-center gap-4 text-left transition-all hover:scale-[1.02] hover:border-gold/40"
            >
              <span className="text-3xl">☯</span>
              <div>
                <div className="font-medium text-foreground">太极图旋转</div>
                <div className="text-xs text-[#706850]">转动太极图，以旋转之气感召卦象</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* 静心准备 */}
      {status === 'preparing' && (
        <div className="glass-card p-8 w-full max-w-md animate-fade-in text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gold/5 flex items-center justify-center animate-pulse-glow">
              <span className="text-3xl">☯</span>
            </div>
            <h2 className="text-xl font-serif text-gold mb-3">请静心</h2>
            <p className="text-sm text-[#a09880] leading-relaxed mb-2">
              在心中默念您想问的事情
            </p>
            <p className="text-xs text-[#605040]">
              心诚则灵，意念专一方能感召天意
            </p>
          </div>
          <button
            onClick={() => setStatus('casting')}
            className="btn-primary w-full py-3"
          >
            我已准备好了
          </button>
        </div>
      )}

      {/* 起卦中 */}
      {status === 'casting' && (
        <div className="w-full max-w-md animate-fade-in text-center">
          {/* 进度 */}
          <div className="mb-6">
            <div className="text-sm text-[#a09880] mb-2">
              {currentLine < 6 ? `第 ${currentLine + 1} 爻 / 共 6 爻` : '卦成！'}
            </div>
            <div className="flex justify-center gap-1">
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className={`w-8 h-1 rounded-full transition-all ${
                    i < currentLine ? 'bg-gold' : 'bg-[#1a1a2e]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 卦象预览 */}
          <div className="glass-card p-6 mb-4 flex flex-col items-center gap-2">
            {Array.from({ length: 6 }, (_, i) => {
              const reversedIndex = 5 - i;
              return renderLine(lines[reversedIndex], reversedIndex, lines[reversedIndex] !== undefined);
            })}
          </div>

          {/* 最新一爻信息 */}
          {lastLineInfo && currentLine > 0 && currentLine <= 6 && (
            <div className={`glass-card px-4 py-2 mb-6 text-center animate-fade-in ${
              lastLineInfo.isChanging ? 'border-gold/30' : ''
            }`}>
              <span className="text-xs text-[#807060]">{lastLineInfo.name}</span>
              <span className="text-xs text-[#3a3a4e] mx-2">·</span>
              <span className={`text-xs ${lastLineInfo.isChanging ? 'text-gold' : 'text-[#a09880]'}`}>
                {lastLineInfo.type}
              </span>
              {lastLineInfo.isChanging && (
                <>
                  <span className="text-xs text-[#3a3a4e] mx-2">·</span>
                  <span className="text-xs text-gold">此为变爻，将生变化</span>
                </>
              )}
            </div>
          )}

          {/* 铜钱模式 */}
          {method === 'coin' && currentLine < 6 && (
            <div className="space-y-4">
              {coinResults && (
                <div className="flex justify-center gap-4 mb-4 animate-fade-in">
                  {coinResults.map((coin, i) => (
                    <div
                      key={i}
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-serif border-2 transition-all ${
                        isAnimating
                          ? 'animate-coin-flip border-gold/50 bg-[#1a1a2e]'
                          : coin === 3
                          ? 'border-gold bg-gradient-to-br from-gold-light to-gold-dark text-[#0a0a14]'
                          : 'border-[#4a4a5e] bg-[#1a1a2e] text-[#706850]'
                      }`}
                    >
                      {isAnimating ? '?' : coin === 3 ? '字' : '花'}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleCoinShake}
                disabled={isAnimating}
                className="btn-primary w-full py-4 text-lg disabled:opacity-50"
              >
                {isAnimating ? '摇卦中...' : '摇一摇'}
              </button>
              <p className="text-xs text-[#605040]">点击按钮或摇动手机</p>
            </div>
          )}

          {/* 太极图模式 */}
          {method === 'taiji' && currentLine < 6 && (
            <div className="space-y-4">
              <canvas
                ref={canvasRef}
                className="mx-auto cursor-grab active:cursor-grabbing touch-none"
                onPointerDown={handleTaijiPointerDown}
                onPointerMove={handleTaijiPointerMove}
                onPointerUp={handleTaijiPointerUp}
                onPointerLeave={handleTaijiPointerUp}
              />
              <p className="text-xs text-[#605040]">拖拽旋转太极图，每转120°生成一爻</p>

              <button
                onClick={generateOneLine}
                disabled={isAnimating}
                className="btn-ghost w-full py-3 text-sm disabled:opacity-50"
              >
                点击直接生成
              </button>
            </div>
          )}

          {/* 卦成动画 */}
          {showResult && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a14]/95 animate-fade-in">
              <div className="text-center">
                {/* 依次点亮六爻 */}
                <div className="flex flex-col items-center gap-2 mb-6">
                  {Array.from({ length: 6 }, (_, i) => {
                    const reversedIndex = 5 - i;
                    const v = lines[reversedIndex];
                    const isYang = v === 7 || v === 9;
                    const isChanging = v === 6 || v === 9;
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-2"
                        style={{
                          opacity: 0,
                          animation: `fade-in 0.4s ease-out ${i * 0.15 + 0.3}s forwards`,
                        }}
                      >
                        <span className="text-[10px] text-[#605040] w-6 text-right">{LINE_NAMES[reversedIndex]}</span>
                        {isYang ? (
                          <div className={`w-20 h-1 rounded ${isChanging ? 'bg-gold' : 'bg-[#d4a843]'}`} />
                        ) : (
                          <div className="flex gap-1.5">
                            <div className={`w-8 h-1 rounded ${isChanging ? 'bg-gold' : 'bg-[#d4a843]'}`} />
                            <div className={`w-8 h-1 rounded ${isChanging ? 'bg-gold' : 'bg-[#d4a843]'}`} />
                          </div>
                        )}
                        {isChanging && (
                          <span className="text-[10px] text-gold">变</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div
                  className="text-4xl font-serif text-gold mb-3 animate-pulse-glow"
                  style={{ opacity: 0, animation: 'fade-in 0.6s ease-out 1.2s forwards' }}
                >
                  卦成
                </div>
                <div
                  className="text-sm text-[#a09880]"
                  style={{ opacity: 0, animation: 'fade-in 0.4s ease-out 1.5s forwards' }}
                >
                  正在推演纳甲六亲...
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
