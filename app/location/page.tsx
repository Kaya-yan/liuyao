'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDivinationStore } from '@/stores/divination';
import { calculateTrueSolarTime, getShichenIndex } from '@/lib/engine/solar-time';

export default function LocationPage() {
  const router = useRouter();
  const store = useDivinationStore();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'denied'>('idle');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [solarDiff, setSolarDiff] = useState<{ beijing: string; solar: string; diff: string; shichenChanged: boolean } | null>(null);

  const computeSolarDiff = (lat: number, lng: number) => {
    const birthDate = store.birthDateTime || new Date();
    const beijingTime = new Date(birthDate);
    const solarTime = calculateTrueSolarTime(beijingTime, lng);

    const fmt = (d: Date) => {
      const h = d.getHours();
      const m = d.getMinutes();
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    const diffMs = solarTime.getTime() - beijingTime.getTime();
    const diffMin = Math.round(diffMs / 60000);
    const diffStr = diffMin >= 0 ? `+${diffMin}分钟` : `${diffMin}分钟`;

    const beijingShichen = getShichenIndex(beijingTime.getHours(), beijingTime.getMinutes());
    const solarShichen = getShichenIndex(solarTime.getHours(), solarTime.getMinutes());

    setSolarDiff({
      beijing: fmt(beijingTime),
      solar: fmt(solarTime),
      diff: diffStr,
      shichenChanged: beijingShichen !== solarShichen,
    });
  };

  const requestLocation = () => {
    setStatus('loading');
    if (!navigator.geolocation) {
      setStatus('denied');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCoords({ lat, lng });
        store.setLocation(lat, lng);
        computeSolarDiff(lat, lng);
        setStatus('success');
      },
      () => {
        setStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleSkip = () => {
    store.setLocation(39.9, 116.4);
    router.push('/cast');
  };

  const handleNext = () => {
    router.push('/cast');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-[#0a0a14] via-[#0f0f1a] to-[#0a0a14]">
      {/* 步骤指示 */}
      <div className="flex items-center gap-3 mb-10">
        {['生辰', '性别', '类别', '定位'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i === 3 ? 'bg-gold text-[#0a0a14]' : 'bg-gold/30 text-gold'
              }`}
            >
              ✓
            </div>
            <span className={`text-xs ${i === 3 ? 'text-gold' : 'text-[#605040]'}`}>
              {label}
            </span>
            {i < 3 && <div className="w-8 h-px bg-gold/40" />}
          </div>
        ))}
      </div>

      <div className="glass-card p-8 w-full max-w-md animate-fade-in text-center">
        {/* 定位图标 */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center">
          <svg className="w-10 h-10 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        <h2 className="text-xl font-serif text-gold mb-3">获取您的位置</h2>
        <p className="text-sm text-[#a09880] mb-6 leading-relaxed">
          系统将根据您的经度计算<span className="text-gold">真太阳时</span>——即太阳实际经过当地子午线的时间。
          不同经度与北京时间存在分钟级差异，直接影响八字排盘中时柱的准确性。
        </p>

        {status === 'idle' && (
          <div className="space-y-3">
            <button onClick={requestLocation} className="btn-primary w-full py-3">
              允许获取位置
            </button>
            <button onClick={handleSkip} className="btn-ghost w-full py-3 text-sm">
              使用北京时间（东经120°）
            </button>
          </div>
        )}

        {status === 'loading' && (
          <div className="py-8">
            <div className="w-12 h-12 mx-auto border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            <p className="text-sm text-[#a09880] mt-4">正在获取位置...</p>
          </div>
        )}

        {status === 'success' && coords && (
          <div className="animate-fade-in">
            {/* 定位结果 */}
            <div className="glass-card p-4 mb-4">
              <div className="text-xs text-[#706850] mb-1">当前位置</div>
              <div className="text-sm text-foreground">
                北纬 {coords.lat.toFixed(4)}° · 东经 {coords.lng.toFixed(4)}°
              </div>
            </div>

            {/* 真太阳时换算 */}
            {solarDiff && (
              <div className="glass-card p-4 mb-6 border border-gold/10">
                <div className="text-xs text-gold mb-3">真太阳时换算</div>
                <div className="flex items-center justify-center gap-3 text-sm">
                  <div className="text-center">
                    <div className="text-[10px] text-[#605040] mb-1">北京时间</div>
                    <div className="text-foreground font-mono">{solarDiff.beijing}</div>
                  </div>
                  <svg className="w-5 h-5 text-gold/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                  <div className="text-center">
                    <div className="text-[10px] text-[#605040] mb-1">真太阳时</div>
                    <div className="text-gold font-mono">{solarDiff.solar}</div>
                  </div>
                </div>
                <div className="text-xs text-[#807060] mt-2">
                  修正 {solarDiff.diff}
                  {solarDiff.shichenChanged && (
                    <span className="text-gold ml-1">（时辰已变更）</span>
                  )}
                </div>
              </div>
            )}

            <button onClick={handleNext} className="btn-primary w-full py-3">
              继续起卦
            </button>
          </div>
        )}

        {status === 'denied' && (
          <div className="animate-fade-in">
            <p className="text-sm text-[#a09880] mb-4">
              将使用北京时间（东经120°）进行计算，对大部分地区影响在数分钟以内。
            </p>
            <button onClick={handleSkip} className="btn-primary w-full py-3">
              继续起卦
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
