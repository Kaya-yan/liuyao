'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDivinationStore } from '@/stores/divination';
import { calculateNajia } from '@/lib/hexagram/najia';
import { calculateAllLiuqin } from '@/lib/hexagram/liuqin';
import { calculateLiushen, LIUSHEN_MEANINGS } from '@/lib/hexagram/liushen';
import { palaces } from '@/lib/hexagram/palaces';
import { getDayTiangan } from '@/lib/engine/bazi';
import { generateStructuredInterpretation, StructuredInterpretation } from '@/lib/engine/interpretation';
import { LiuShenType } from '@/types/hexagram';
import AnalysisLoading from '@/components/AnalysisLoading';
import { saveHistory, generateHistoryId, HistoryRecord } from '@/lib/utils/history';
import { shareImage } from '@/lib/utils/share-image';
import { CATEGORY_LABELS } from '@/lib/constants';
import QRCode from '@/components/QRCode';

// ===== 术语解释 =====
const TERM_EXPLANATIONS: Record<string, string> = {
  '六亲': '卦中各爻与卦宫五行的生克关系，分为父母、兄弟、子孙、妻财、官鬼。',
  '六神': '据日干排布的六种神煞，反映事物的不同侧面。',
  '纳甲': '将天干地支分配到卦中各爻，源自西汉京房。',
  '世爻': '代表求测者自身的爻位。',
  '应爻': '代表所问之事或对方的爻位。',
};

function TermTip({ term }: { term: string }) {
  const [show, setShow] = useState(false);
  const explanation = TERM_EXPLANATIONS[term];
  if (!explanation) return <span>{term}</span>;
  return (
    <span className="relative inline-block">
      <span
        className="text-gold/70 border-b border-dashed border-gold/20 cursor-help"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
      >
        {term}
      </span>
      {show && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 glass-card text-xs text-[#a09880] leading-relaxed shadow-lg">
          {explanation}
          <span className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[#101018] border-r border-b border-dark-border rotate-45 -mt-1" />
        </span>
      )}
    </span>
  );
}

// ===== 可折叠区块 =====
function Collapse({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = `collapse-${title.replace(/\s/g, '-')}`;
  return (
    <div className="mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-2 px-1 text-left group min-h-[32px]"
        aria-expanded={open}
        aria-controls={contentId}
      >
        <span className="text-xs text-[#605040] group-hover:text-[#807060] transition-colors">{title}</span>
        <svg className={`w-3.5 h-3.5 text-[#403828] transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      <div
        id={contentId}
        role="region"
        className={`transition-all duration-500 ease-in-out overflow-hidden ${open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        {children}
      </div>
    </div>
  );
}

// ===== 结果页 =====
export default function ResultPage() {
  const router = useRouter();
  const store = useDivinationStore();
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!store.benGua) router.push('/');
  }, [store.benGua, router]);

  const handleAnalysisComplete = useCallback(() => {
    setLoading(false);
    requestAnimationFrame(() => {
      setShowContent(true);
      setTimeout(() => setRevealed(true), 600);
    });
  }, []);

  // ===== 计算数据（所有 hooks 在 early return 之前） =====
  const calcData = useMemo(() => {
    if (!store.benGua || !store.bazi) return null;
    const hexagram = store.benGua;
    const palace = palaces[hexagram.palaceId];
    const najia = calculateNajia(hexagram);
    const liuqin = calculateAllLiuqin(palace.wuxing, najia);
    const liushen = calculateLiushen(store.bazi.day.tiangan);
    const dayTiangan = getDayTiangan(store.bazi);
    return { hexagram, palace, najia, liuqin, liushen, dayTiangan };
  }, [store.benGua, store.bazi]);

  const interp = useMemo((): StructuredInterpretation | null => {
    if (!calcData || !store.bazi) return null;
    return generateStructuredInterpretation({
      hexagram: calcData.hexagram,
      bianGua: store.bianGua,
      lines: store.lines.map(l => l.value),
      changingLines: store.lines.filter(l => l.isChanging).map(l => l.lineIndex),
      category: store.category || 'zonghe',
      gender: store.gender || 'male',
      bazi: store.bazi,
      dayTiangan: calcData.dayTiangan,
      question: store.question || undefined,
    });
  }, [calcData, store.bianGua, store.lines, store.category, store.gender, store.bazi, store.question]);

  // 保存历史记录
  useEffect(() => {
    if (!interp || !store.benGua || !store.bazi) return;
    // 只在首次加载时保存，避免重复
    const hasSaved = sessionStorage.getItem('liuyao_saved');
    if (hasSaved) return;

    const record: HistoryRecord = {
      id: generateHistoryId(),
      timestamp: Date.now(),
      category: store.category || 'zonghe',
      gender: store.gender || 'male',
      question: store.question,
      hexagramName: store.benGua.name,
      hexagramSymbol: store.benGua.symbol,
      palaceName: palaces[store.benGua.palaceId].name,
      archetype: interp.archetype,
      verdict: interp.verdict,
      bazi: {
        year: `${store.bazi.year.tiangan}${store.bazi.year.dizhi}`,
        month: `${store.bazi.month.tiangan}${store.bazi.month.dizhi}`,
        day: `${store.bazi.day.tiangan}${store.bazi.day.dizhi}`,
        hour: `${store.bazi.hour.tiangan}${store.bazi.hour.dizhi}`,
      },
    };
    saveHistory(record);
    sessionStorage.setItem('liuyao_saved', '1');
  }, [interp, store.benGua, store.bazi, store.category, store.gender, store.question]);

  if (!store.benGua || !calcData) return null;
  if (loading) return <AnalysisLoading onComplete={handleAnalysisComplete} />;

  const { hexagram, palace, najia, liuqin, liushen } = calcData;
  if (!interp) return null;

  const changingLines = store.lines.filter(l => l.isChanging);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a14] via-[#0f0f1a] to-[#0a0a14] px-4 py-8">
      <div className="max-w-lg mx-auto">

        {/* ===== 卦象揭幕 ===== */}
        <div className={`text-center mb-8 transition-opacity transition-transform duration-1000 ${showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
          <div className="text-6xl mb-4" style={{ filter: revealed ? 'none' : 'blur(4px)', transition: 'filter 1s ease-out' }}>
            {hexagram.symbol}
          </div>
          <h1 className="text-3xl font-serif text-gold-gradient mb-1">{hexagram.name}</h1>
          <div className="text-sm text-[#706850] mb-3">
            {palace.name} · {CATEGORY_LABELS[store.category || 'zonghe']}
          </div>
          {/* 身份标签 */}
          <div className="inline-block glass-card px-5 py-2 border border-gold/15">
            <span className="text-gold font-serif text-lg tracking-wider">{interp.archetype}</span>
          </div>
        </div>

        {/* ===== 一句话判词 ===== */}
        <div className={`glass-card p-5 mb-6 border-l-2 border-gold/40 transition-opacity transition-transform duration-700 delay-200 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-base text-foreground font-serif leading-relaxed text-center">
            {interp.verdict}
          </p>
        </div>

        {/* ===== 此卦暗示（人格洞察） ===== */}
        <div className={`mb-6 transition-opacity transition-transform duration-700 delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-gold/40 rounded-full" />
            <span className="text-xs text-gold tracking-widest">此卦暗示</span>
          </div>
          <div className="space-y-2">
            {interp.personality.map((trait, i) => (
              <div key={i} className="glass-card px-4 py-3 text-sm text-[#c0b8a0] leading-relaxed" style={{ animationDelay: `${i * 0.15}s` }}>
                {trait}
              </div>
            ))}
          </div>
        </div>

        {/* ===== 卦象解读（叙事体） ===== */}
        <div className={`mb-6 transition-opacity transition-transform duration-700 delay-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Collapse title="卦象启示（详细解读）">
            <div className="glass-card p-5 space-y-4 mb-3">
              {interp.narrative.map((para, i) => (
                <p key={i} className="text-sm text-[#c0b8a0] leading-relaxed font-serif">
                  {para}
                </p>
              ))}
            </div>
          </Collapse>
        </div>

        {/* ===== 行动指南 ===== */}
        <div className={`mb-6 transition-opacity transition-transform duration-700 delay-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-gold/40 rounded-full" />
            <span className="text-xs text-gold tracking-widest">行动指南</span>
          </div>
          <div className="space-y-2">
            {interp.advice.map((adv, i) => (
              <div key={i} className="glass-card px-4 py-3 flex items-start gap-3">
                <span className="text-gold/40 text-xs mt-0.5 shrink-0">{String.fromCharCode(0x2776 + i)}</span>
                <span className="text-sm text-[#c0b8a0] leading-relaxed">{adv}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ===== 结语（Peak-End Rule：最强的一句话放在最后） ===== */}
        <div className={`mb-8 transition-opacity transition-transform duration-700 delay-900 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="glass-card p-6 text-center border border-gold/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.03] to-transparent" aria-hidden="true" />
            <p className="relative text-base text-gold font-serif leading-relaxed">
              {interp.closing}
            </p>
          </div>
        </div>

        {/* ===== 分享卡片区域 ===== */}
        <div className={`mb-8 transition-opacity transition-transform duration-700 delay-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="glass-card p-6 border border-gold/15 relative overflow-hidden" id="share-card">
            {/* 装饰 */}
            <div className="absolute top-3 right-3 text-gold/10 text-6xl font-serif leading-none pointer-events-none select-none" aria-hidden="true">
              {hexagram.symbol}
            </div>
            <div className="relative">
              <div className="text-xs text-gold/50 tracking-widest mb-2">天机六爻</div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl font-serif text-gold">{hexagram.name}</span>
                <span className="text-xs text-[#706850]">{palace.name}</span>
              </div>
              <div className="text-sm text-[#a09880] font-serif mb-3 leading-relaxed">
                {interp.verdict}
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block px-2.5 py-1 rounded-full bg-gold/10 text-gold text-xs">
                  {interp.archetype}
                </span>
                <span className="inline-block px-2.5 py-1 rounded-full bg-crimson/10 text-crimson-light text-xs">
                  {CATEGORY_LABELS[store.category || 'zonghe']}
                </span>
              </div>
              {changingLines.length > 0 && (
                <div className="text-xs text-[#605040] mb-2">
                  变爻：{changingLines.map(l => ['初', '二', '三', '四', '五', '上'][l.lineIndex]).join('、')}爻
                </div>
              )}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-dark-border">
                <span className="text-[10px] text-[#3a3a3a]">扫码体验 · 天机六爻</span>
                <QRCode size={60} />
              </div>
            </div>
          </div>
        </div>

        {/* ===== 操作按钮 ===== */}
        <div className={`flex gap-3 mb-6 transition-opacity transition-transform duration-700 delay-1100 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button onClick={() => { sessionStorage.removeItem('liuyao_saved'); store.softReset(); router.push('/input'); }} className="btn-ghost flex-1 py-3 min-h-[44px]">
            再算一卦
          </button>
          <button
            onClick={async () => {
              const text = `【天机六爻】${hexagram.name} · ${interp.archetype}\n${interp.verdict}\n\n${interp.personality.join('\n')}\n\n${interp.advice.join('\n')}\n\n${interp.closing}`;
              if (typeof navigator !== 'undefined' && navigator.share) {
                try {
                  await navigator.share({ title: `天机六爻 · ${hexagram.name}`, text });
                } catch {}
              } else {
                navigator.clipboard.writeText(text).catch(() => {});
              }
            }}
            className="btn-primary flex-1 py-3 min-h-[44px]"
          >
            复制结果
          </button>
        </div>
        <div className={`flex gap-3 mb-8 transition-opacity transition-transform duration-700 delay-1150 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button
            onClick={async () => {
              try {
                await shareImage({
                  hexagramName: hexagram.name,
                  hexagramSymbol: hexagram.symbol,
                  palaceName: palace.name,
                  archetype: interp.archetype,
                  verdict: interp.verdict,
                  category: CATEGORY_LABELS[store.category || 'zonghe'],
                  question: store.question || undefined,
                });
              } catch {}
            }}
            className="btn-ghost w-full py-2.5 text-sm min-h-[44px]"
          >
            保存图片
          </button>
        </div>

        {/* ===== 详细技术数据（折叠） ===== */}
        <div className={`transition-opacity duration-700 delay-1200 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
          <Collapse title="八字信息">
            <div className="glass-card p-4 mb-3">
              <div className="grid grid-cols-4 gap-2 text-center">
                {store.bazi && [
                  { label: '年柱', value: store.bazi.year },
                  { label: '月柱', value: store.bazi.month },
                  { label: '日柱', value: store.bazi.day },
                  { label: '时柱', value: store.bazi.hour },
                ].map((p) => (
                  <div key={p.label}>
                    <div className="text-[10px] text-[#504838]">{p.label}</div>
                    <div className="text-sm text-foreground font-serif">{p.value.tiangan}{p.value.dizhi}</div>
                  </div>
                ))}
              </div>
            </div>
          </Collapse>

          <Collapse title="纳甲 · 六亲 · 六神">
            <div className="glass-card p-4 mb-3">
              <div className="flex items-center gap-2 w-full mb-2 px-1">
                <div className="w-10 text-right text-[10px] text-[#504838]"><TermTip term="六神" /></div>
                <div className="flex-1 text-center text-[10px] text-[#504838]">爻象</div>
                <div className="w-10 text-[10px] text-[#504838]"><TermTip term="六亲" /></div>
                <div className="w-14 text-[10px] text-[#504838]"><TermTip term="纳甲" /></div>
                <div className="w-6 text-center text-[10px] text-[#504838]">世应</div>
              </div>
              {Array.from({ length: 6 }, (_, i) => {
                const ri = 5 - i;
                const isYang = hexagram.lines[ri] === 1;
                const isShi = hexagram.shiYao === ri + 1;
                const isYing = hexagram.yingYao === ri + 1;
                const isCh = store.lines[ri]?.isChanging;
                const ls = liushen[ri];
                const lq = liuqin[ri];
                const na = najia[ri];
                return (
                  <div key={i} className={`flex items-center gap-2 w-full py-1 px-1 rounded ${isCh ? 'bg-gold/[0.04]' : ''}`}>
                    <div className="w-10 text-right text-xs text-[#807060]">
                      {ls && <span title={LIUSHEN_MEANINGS[ls as LiuShenType]}>{ls}</span>}
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      {isYang ? (
                        <div className={`w-16 h-1 rounded ${isCh ? 'bg-gold' : 'bg-[#d4a843]'}`} />
                      ) : (
                        <div className="flex gap-1.5">
                          <div className={`w-6 h-1 rounded ${isCh ? 'bg-gold' : 'bg-[#d4a843]'}`} />
                          <div className={`w-6 h-1 rounded ${isCh ? 'bg-gold' : 'bg-[#d4a843]'}`} />
                        </div>
                      )}
                    </div>
                    <div className="w-10 text-xs text-[#a09880]">{lq || ''}</div>
                    <div className="w-14 text-xs text-[#807060]">{na ? `${na.tiangan}${na.dizhi}` : ''}</div>
                    <div className="w-6 text-center">
                      {isShi && <span className="text-[10px] text-gold font-bold">世</span>}
                      {isYing && <span className="text-[10px] text-crimson-light font-bold">应</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Collapse>

          <Collapse title="卦辞 · 彖辞 · 象辞">
            <div className="glass-card p-4 mb-3 space-y-3">
              <div>
                <div className="text-[10px] text-gold/40 mb-1">卦辞</div>
                <p className="text-sm text-foreground leading-relaxed font-serif">{hexagram.guaCi}</p>
              </div>
              {hexagram.tuan && (
                <div>
                  <div className="text-[10px] text-gold/40 mb-1">彖辞</div>
                  <p className="text-xs text-[#a09880] leading-relaxed font-serif">{hexagram.tuan}</p>
                </div>
              )}
              <div>
                <div className="text-[10px] text-gold/40 mb-1">象辞</div>
                <p className="text-xs text-[#807060] italic">{hexagram.xiang}</p>
              </div>
            </div>
          </Collapse>

          {store.bianGua && (
            <Collapse title="变卦">
              <div className="glass-card p-4 mb-3">
                <div className="text-sm text-foreground font-serif mb-2">{store.bianGua.name}：{store.bianGua.guaCi}</div>
                <div className="flex flex-col items-center gap-1.5">
                  {Array.from({ length: 6 }, (_, i) => {
                    const ri = 5 - i;
                    const isYang = store.bianGua?.lines[ri] === 1;
                    return (
                      <div key={i} className="flex items-center justify-center">
                        {isYang ? (
                          <div className="w-16 h-1 bg-[#807060] rounded" />
                        ) : (
                          <div className="flex gap-1.5">
                            <div className="w-6 h-1 bg-[#807060] rounded" />
                            <div className="w-6 h-1 bg-[#807060] rounded" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Collapse>
          )}

          <Collapse title="原始解读">
            <div className="glass-card p-4 mb-3">
              <div className="text-xs text-[#807060] leading-relaxed whitespace-pre-line">{interp.technicalSummary}</div>
            </div>
          </Collapse>
        </div>

        {/* 底部 */}
        <p className={`text-center text-[10px] text-[#4a4a4a] mt-8 transition-opacity duration-700 delay-1300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
          卦象所示，仅供参考 · 命由己造，福自我求 · 本工具不构成任何决策建议
        </p>
      </div>
    </div>
  );
}
