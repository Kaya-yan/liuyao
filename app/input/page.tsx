'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDivinationStore } from '@/stores/divination';
import { CategoryType, GenderType } from '@/types/divination';

const CATEGORIES: { key: CategoryType; icon: string; label: string; desc: string; yongshen: string }[] = [
  { key: 'caiyun', icon: '💰', label: '财运', desc: '取妻财为用神，分析财爻旺衰与世爻关系', yongshen: '妻财' },
  { key: 'zhengyuan', icon: '💕', label: '正缘', desc: '男取妻财、女取官鬼为用神，看桃花与合冲', yongshen: '妻财/官鬼' },
  { key: 'shiye', icon: '🏛', label: '事业', desc: '取官鬼为用神，分析官爻与世爻的生克关系', yongshen: '官鬼' },
  { key: 'jiankang', icon: '🏥', label: '健康', desc: '取子孙为用神，看卦中忌神与用神的旺衰', yongshen: '子孙' },
  { key: 'zonghe', icon: '☯', label: '综合', desc: '取父母为用神，综合分析世爻与各爻关系', yongshen: '父母' },
];

const SHICHEN_OPTIONS = [
  { value: '23', label: '子时 (23:00-01:00)' },
  { value: '1', label: '丑时 (01:00-03:00)' },
  { value: '3', label: '寅时 (03:00-05:00)' },
  { value: '5', label: '卯时 (05:00-07:00)' },
  { value: '7', label: '辰时 (07:00-09:00)' },
  { value: '9', label: '巳时 (09:00-11:00)' },
  { value: '11', label: '午时 (11:00-13:00)' },
  { value: '13', label: '未时 (13:00-15:00)' },
  { value: '15', label: '申时 (15:00-17:00)' },
  { value: '17', label: '酉时 (17:00-19:00)' },
  { value: '19', label: '戌时 (19:00-21:00)' },
  { value: '21', label: '亥时 (21:00-23:00)' },
];

export default function InputPage() {
  const router = useRouter();
  const store = useDivinationStore();
  const [step, setStep] = useState(0);
  const [birthDate, setBirthDate] = useState('');
  const [shichen, setShichen] = useState('11');
  const [gender, setGender] = useState<GenderType | null>(null);
  const [category, setCategory] = useState<CategoryType | null>(null);

  const handleBirthNext = () => {
    if (!birthDate) return;
    const date = new Date(birthDate);
    date.setHours(parseInt(shichen), 0, 0, 0);
    store.setBirthDateTime(date);
    setStep(1);
  };

  const handleGenderNext = () => {
    if (!gender) return;
    store.setGender(gender);
    setStep(2);
  };

  const handleCategoryNext = () => {
    if (!category) return;
    store.setCategory(category);
    router.push('/location');
  };

  const formatBirthConfirm = () => {
    if (!birthDate) return '';
    const d = new Date(birthDate);
    const shichenName = SHICHEN_OPTIONS.find(s => s.value === shichen)?.label.split(' ')[0] || '';
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${shichenName}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-[#0a0a14] via-[#0f0f1a] to-[#0a0a14]">
      {/* 步骤指示 */}
      <div className="flex items-center gap-3 mb-10">
        {['生辰', '性别', '类别'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                i === step
                  ? 'bg-gold text-[#0a0a14]'
                  : i < step
                  ? 'bg-gold/30 text-gold'
                  : 'bg-[#1a1a2e] text-[#504838]'
              }`}
            >
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-xs ${i === step ? 'text-gold' : 'text-[#605040]'}`}>
              {label}
            </span>
            {i < 2 && <div className={`w-8 h-px ${i < step ? 'bg-gold/40' : 'bg-[#1a1a2e]'}`} />}
          </div>
        ))}
      </div>

      {/* 已确认信息摘要 */}
      {step > 0 && (
        <div className="glass-card px-4 py-2 mb-6 text-xs text-[#807060] flex items-center gap-2 animate-fade-in">
          <span className="text-gold/60">已记录</span>
          <span className="text-[#a09880]">{formatBirthConfirm()}</span>
          {step > 1 && gender && (
            <>
              <span className="text-[#3a3a4e]">·</span>
              <span className="text-[#a09880]">{gender === 'male' ? '男（阳）' : '女（阴）'}</span>
            </>
          )}
        </div>
      )}

      {/* Step 0: 生辰输入 */}
      {step === 0 && (
        <div className="glass-card p-8 w-full max-w-md animate-fade-in">
          <h2 className="text-xl font-serif text-gold mb-2 text-center">请输入您的生辰</h2>
          <p className="text-xs text-[#706850] text-center mb-6 leading-relaxed">
            出生时辰用于排定四柱八字，是六爻分析中确定用神与六亲关系的基础
          </p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm text-[#a09880] mb-2">出生日期</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-[#0a0a14] border border-dark-border rounded-lg text-foreground focus:border-gold focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-[#a09880] mb-2">出生时辰</label>
              <select
                value={shichen}
                onChange={(e) => setShichen(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a14] border border-dark-border rounded-lg text-foreground focus:border-gold focus:outline-none transition-colors"
              >
                {SHICHEN_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-[#504838] mt-1.5">
                时辰对应日柱天干，决定日元五行属性
              </p>
            </div>
          </div>

          <button
            onClick={handleBirthNext}
            disabled={!birthDate}
            className="btn-primary mt-8 w-full py-3 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            下一步
          </button>
        </div>
      )}

      {/* Step 1: 性别选择 */}
      {step === 1 && (
        <div className="glass-card p-8 w-full max-w-md animate-fade-in">
          <h2 className="text-xl font-serif text-gold mb-2 text-center">请选择性别</h2>
          <p className="text-xs text-[#706850] text-center mb-6 leading-relaxed">
            性别影响用神取法——男以妻财为用神看感情，女以官鬼为用神看感情
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'male' as GenderType, label: '男', symbol: '⚊', desc: '阳 · 妻财为用' },
              { key: 'female' as GenderType, label: '女', symbol: '⚋', desc: '阴 · 官鬼为用' },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setGender(opt.key)}
                className={`glass-card p-6 text-center transition-all hover:scale-105 ${
                  gender === opt.key ? 'selected-ring' : 'hover:border-gold/40'
                }`}
              >
                <div className="text-3xl mb-2">{opt.symbol}</div>
                <div className="text-lg font-serif text-foreground">{opt.label}</div>
                <div className="text-xs text-[#706850]">{opt.desc}</div>
              </button>
            ))}
          </div>

          <div className="flex gap-3 mt-8">
            <button onClick={() => setStep(0)} className="btn-ghost flex-1 py-3">
              返回
            </button>
            <button
              onClick={handleGenderNext}
              disabled={!gender}
              className="btn-primary flex-1 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              下一步
            </button>
          </div>
        </div>
      )}

      {/* Step 2: 问题类别 */}
      {step === 2 && (
        <div className="glass-card p-8 w-full max-w-md animate-fade-in">
          <h2 className="text-xl font-serif text-gold mb-2 text-center">想问什么？</h2>
          <p className="text-xs text-[#706850] text-center mb-6 leading-relaxed">
            不同问题对应不同的用神，用神是卦象分析的核心切入点
          </p>

          <div className="space-y-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={`w-full glass-card p-4 flex items-center gap-4 text-left transition-all hover:scale-[1.02] ${
                  category === cat.key ? 'selected-ring' : 'hover:border-gold/40'
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground">{cat.label}</div>
                  <div className="text-xs text-[#706850] leading-relaxed">{cat.desc}</div>
                </div>
                <div className="text-[10px] text-gold/40 shrink-0">
                  用神：{cat.yongshen}
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-3 mt-8">
            <button onClick={() => setStep(1)} className="btn-ghost flex-1 py-3">
              返回
            </button>
            <button
              onClick={handleCategoryNext}
              disabled={!category}
              className="btn-primary flex-1 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              下一步
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
