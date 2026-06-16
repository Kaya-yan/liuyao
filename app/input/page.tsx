'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDivinationStore } from '@/stores/divination';
import { CategoryType, GenderType } from '@/types/divination';
import DatePicker from '@/components/DatePicker';

const CATEGORIES: { key: CategoryType; icon: string; label: string; desc: string; detail: string }[] = [
  { key: 'caiyun', icon: '💰', label: '财运', desc: '钱的事，赚得到吗、守得住吗', detail: '取妻财为用神' },
  { key: 'zhengyuan', icon: '💕', label: '正缘', desc: '感情的事，对的人在哪里', detail: '男取妻财、女取官鬼为用神' },
  { key: 'shiye', icon: '🏛', label: '事业', desc: '工作的事，该不该跳槽、能不能升', detail: '取官鬼为用神' },
  { key: 'jiankang', icon: '🏥', label: '健康', desc: '身体的事，哪里需要注意', detail: '取子孙为用神' },
  { key: 'zonghe', icon: '☯', label: '综合', desc: '说不清具体问什么，就是想看看', detail: '取父母为用神' },
];

const SHICHEN_OPTIONS = [
  { value: 'unknown', label: '不确定 / 忘了' },
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

const QUESTION_SUGGESTIONS: Record<CategoryType, string[]> = {
  caiyun: ['最近适合投资吗？', '今年的财运怎么样？', '这笔钱能赚到吗？'],
  zhengyuan: ['我的正缘什么时候来？', '我和TA有结果吗？', '最近会遇到对的人吗？'],
  shiye: ['该不该跳槽？', '今年能升职吗？', '这个项目该不该接？'],
  jiankang: ['最近身体要注意什么？', '这个病能好吗？', '需要去做个检查吗？'],
  zonghe: ['最近运势怎么样？', '这件事会顺利吗？', '我该怎么选择？'],
};

export default function InputPage() {
  const router = useRouter();
  const store = useDivinationStore();
  const [step, setStep] = useState(0);
  const [birthDate, setBirthDate] = useState('');
  const [shichen, setShichen] = useState('11');
  const [gender, setGender] = useState<GenderType | null>(null);
  const [category, setCategory] = useState<CategoryType | null>(null);
  const [question, setQuestion] = useState('');

  const handleBirthNext = () => {
    if (!birthDate) return;
    const date = new Date(birthDate);
    if (shichen !== 'unknown') {
      date.setHours(parseInt(shichen), 0, 0, 0);
    } else {
      date.setHours(12, 0, 0, 0);
    }
    store.setBirthDateTime(date);
    setStep(1);
  };

  const handleCategoryGenderNext = () => {
    if (!gender || !category) return;
    store.setGender(gender);
    store.setCategory(category);
    setStep(2);
  };

  const handleQuestionNext = () => {
    if (question.trim()) {
      store.setQuestion(question.trim());
    }
    router.push('/location');
  };

  const formatBirthConfirm = () => {
    if (!birthDate) return '';
    const d = new Date(birthDate);
    const shichenName = shichen === 'unknown'
      ? '时辰不确定'
      : (SHICHEN_OPTIONS.find(s => s.value === shichen)?.label.split(' ')[0] || '');
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${shichenName}`;
  };

  const suggestedQuestions = category ? QUESTION_SUGGESTIONS[category] : [];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-[#0a0a14] via-[#0f0f1a] to-[#0a0a14]">
      {/* 步骤指示 */}
      <div className="flex items-center gap-3 mb-10">
        {['生辰', '类别', '提问'].map((label, i) => (
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
          {step > 1 && category && (
            <>
              <span className="text-[#3a3a4e]">·</span>
              <span className="text-[#a09880]">{CATEGORIES.find(c => c.key === category)?.label}</span>
            </>
          )}
        </div>
      )}

      {/* Step 0: 生辰输入 */}
      {step === 0 && (
        <div className="glass-card p-8 w-full max-w-md animate-fade-in">
          <h2 className="text-xl font-serif text-gold mb-2 text-center">请输入您的生辰</h2>
          <p className="text-xs text-[#706850] text-center mb-6 leading-relaxed">
            出生时间用来排八字，不需要精确到分钟，大概时间段就行
          </p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm text-[#a09880] mb-3">出生日期</label>
              <DatePicker
                value={birthDate}
                onChange={setBirthDate}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label htmlFor="birth-shichen" className="block text-sm text-[#a09880] mb-2">出生时辰</label>
              <select
                id="birth-shichen"
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
              {shichen === 'unknown' ? (
                <p className="text-[10px] text-gold/60 mt-1.5">
                  没关系，系统会按午时估算，对整体结果影响不大
                </p>
              ) : (
                <p className="text-[10px] text-[#504838] mt-1.5">
                  记不清的话选"不确定"也可以
                </p>
              )}
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

      {/* Step 1: 性别 + 类别 */}
      {step === 1 && (
        <div className="glass-card p-8 w-full max-w-md animate-fade-in">
          <h2 className="text-xl font-serif text-gold mb-2 text-center">你是？想问什么？</h2>
          <p className="text-xs text-[#706850] text-center mb-6 leading-relaxed">
            选好性别和方向，系统会针对性地分析
          </p>

          {/* 性别 */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { key: 'male' as GenderType, label: '男', symbol: '⚊', desc: '阳刚之气' },
              { key: 'female' as GenderType, label: '女', symbol: '⚋', desc: '阴柔之美' },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setGender(opt.key)}
                className={`glass-card py-3 px-4 text-center transition-transform hover:scale-105 ${
                  gender === opt.key ? 'selected-ring' : 'hover:border-gold/40'
                }`}
              >
                <div className="text-2xl mb-1">{opt.symbol}</div>
                <div className="text-base font-serif text-foreground">{opt.label}</div>
                <div className="text-[10px] text-[#706850]">{opt.desc}</div>
              </button>
            ))}
          </div>

          {/* 类别 */}
          <div className="space-y-2.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={`w-full glass-card p-3.5 flex items-center gap-3 text-left transition-transform hover:scale-[1.02] ${
                  category === cat.key ? 'selected-ring' : 'hover:border-gold/40'
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{cat.label}</div>
                  <div className="text-xs text-[#706850]">{cat.desc}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(0)} className="btn-ghost flex-1 py-3">
              返回
            </button>
            <button
              onClick={handleCategoryGenderNext}
              disabled={!gender || !category}
              className="btn-primary flex-1 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              下一步
            </button>
          </div>
        </div>
      )}

      {/* Step 2: 具体问题 */}
      {step === 2 && (
        <div className="glass-card p-8 w-full max-w-md animate-fade-in">
          <h2 className="text-xl font-serif text-gold mb-2 text-center">你想问什么？</h2>
          <p className="text-xs text-[#706850] text-center mb-6 leading-relaxed">
            把你心里的困惑说出来，卦象会更有针对性。不写也行，直接跳过。
          </p>

          <div className="space-y-4">
            <label htmlFor="question-input" className="visually-hidden">你想问的问题</label>
            <textarea
              id="question-input"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={suggestedQuestions[0] || '比如：这件事会顺利吗？'}
              maxLength={200}
              rows={3}
              aria-describedby="question-hint"
              className="w-full px-4 py-3 bg-[#0a0a14] border border-dark-border rounded-lg text-foreground focus:border-gold focus:outline-none transition-colors resize-none text-sm leading-relaxed"
            />
            <div id="question-hint" className="text-right text-[10px] text-[#504838]">
              {question.length}/200
            </div>

            {/* 快捷问题 */}
            {suggestedQuestions.length > 0 && (
              <div>
                <div className="text-xs text-[#605040] mb-2">或者试试这些问题：</div>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuestion(q)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        question === q
                          ? 'border-gold/40 bg-gold/10 text-gold'
                          : 'border-dark-border text-[#706850] hover:border-gold/20 hover:text-[#a09880]'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-8">
            <button onClick={() => setStep(1)} className="btn-ghost flex-1 py-3">
              返回
            </button>
            <button
              onClick={handleQuestionNext}
              className="btn-primary flex-1 py-3"
            >
              {question.trim() ? '下一步' : '跳过，直接起卦'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
