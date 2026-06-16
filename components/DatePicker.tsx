'use client';

import { useState, useMemo, useRef, useEffect } from 'react';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  max?: string;
}

type SelectMode = 'year' | 'month' | 'day';

const MONTH_NAMES = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

export default function DatePicker({ value, onChange, max }: DatePickerProps) {
  const [mode, setMode] = useState<SelectMode>('year');
  const [selectedYear, setSelectedYear] = useState<number | null>(() => {
    if (value) return parseInt(value.split('-')[0]);
    return null;
  });
  const [selectedMonth, setSelectedMonth] = useState<number | null>(() => {
    if (value) return parseInt(value.split('-')[1]) - 1;
    return null;
  });

  const currentYear = new Date().getFullYear();
  const maxYear = max ? parseInt(max.split('-')[0]) : currentYear;
  const minYear = 1940;

  // Decade tabs for quick jump
  const decades = useMemo(() => {
    const list: { label: string; start: number; end: number }[] = [];
    const startDecade = Math.floor(minYear / 10) * 10;
    const endDecade = Math.floor(maxYear / 10) * 10;
    for (let d = endDecade; d >= startDecade; d -= 10) {
      const s = Math.max(d, minYear);
      const e = Math.min(d + 9, maxYear);
      list.push({ label: `${s}-${e}`, start: s, end: e });
    }
    return list;
  }, [maxYear]);

  const [activeDecade, setActiveDecade] = useState(0);

  // Generate years for current decade (youngest first)
  const years = useMemo(() => {
    const dec = decades[activeDecade];
    if (!dec) return [];
    const list: number[] = [];
    for (let y = dec.end; y >= dec.start; y--) {
      list.push(y);
    }
    return list;
  }, [decades, activeDecade]);

  // Generate days for selected month
  const daysInMonth = useMemo(() => {
    if (selectedYear === null || selectedMonth === null) return 31;
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  const parsedDay = value ? parseInt(value.split('-')[2]) : null;

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setMode('month');
  };

  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month);
    setMode('day');
  };

  const handleDaySelect = (day: number) => {
    if (selectedYear === null || selectedMonth === null) return;
    const mm = String(selectedMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${selectedYear}-${mm}-${dd}`);
  };

  const handleBack = () => {
    if (mode === 'day') setMode('month');
    else if (mode === 'month') setMode('year');
  };

  const displayLabel = () => {
    if (selectedYear !== null && selectedMonth !== null && mode === 'day') {
      return `${selectedYear}年${selectedMonth + 1}月`;
    }
    if (selectedYear !== null && mode === 'month') {
      return `${selectedYear}年`;
    }
    return '选择出生年份';
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    const selected = scrollRef.current.querySelector('[data-selected="true"]');
    if (selected) selected.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [mode]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        {mode !== 'year' ? (
          <button
            type="button"
            onClick={handleBack}
            className="text-xs text-gold/70 hover:text-gold transition-colors flex items-center gap-1 min-h-[32px]"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            返回
          </button>
        ) : <div />}
        <span className="text-sm text-[#c0b090] font-medium">{displayLabel()}</span>
        <div />
      </div>

      {/* Decade tabs (only in year mode) */}
      {mode === 'year' && (
        <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {decades.map((dec, i) => (
            <button
              key={dec.label}
              type="button"
              onClick={() => setActiveDecade(i)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs transition-all min-h-[32px] ${
                i === activeDecade
                  ? 'bg-gold/20 text-gold border border-gold/40'
                  : 'bg-[#0a0a14] text-[#706850] border border-dark-border hover:border-gold/20'
              }`}
            >
              {dec.label}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div
        ref={scrollRef}
        className="max-h-[240px] overflow-y-auto pr-1"
        style={{ scrollbarWidth: 'thin' }}
      >
        {mode === 'year' && (
          <div className="grid grid-cols-4 gap-2">
            {years.map((year) => {
              const isSelected = year === selectedYear;
              return (
                <button
                  key={year}
                  type="button"
                  data-selected={isSelected}
                  onClick={() => handleYearSelect(year)}
                  className={`py-3 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
                    isSelected
                      ? 'bg-gold/20 text-gold border border-gold/40'
                      : 'bg-[#0a0a14] text-[#c0b090] border border-dark-border hover:border-gold/30 hover:text-foreground'
                  }`}
                >
                  {year}
                </button>
              );
            })}
          </div>
        )}

        {mode === 'month' && (
          <div className="grid grid-cols-3 gap-2">
            {MONTH_NAMES.map((name, i) => {
              const isSelected = i === selectedMonth;
              return (
                <button
                  key={i}
                  type="button"
                  data-selected={isSelected}
                  onClick={() => handleMonthSelect(i)}
                  className={`py-3 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
                    isSelected
                      ? 'bg-gold/20 text-gold border border-gold/40'
                      : 'bg-[#0a0a14] text-[#c0b090] border border-dark-border hover:border-gold/30 hover:text-foreground'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        )}

        {mode === 'day' && (
          <div className="grid grid-cols-7 gap-1.5">
            {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
              <div key={d} className="text-center text-[10px] text-[#605040] py-1">{d}</div>
            ))}
            {selectedYear !== null && selectedMonth !== null &&
              Array.from({ length: new Date(selectedYear, selectedMonth, 1).getDay() }, (_, i) => (
                <div key={`empty-${i}`} />
              ))
            }
            {days.map((day) => {
              const isSelected = day === parsedDay;
              let isDisabled = false;
              if (max && selectedYear !== null && selectedMonth !== null) {
                const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                isDisabled = dateStr > max;
              }
              return (
                <button
                  key={day}
                  type="button"
                  data-selected={isSelected}
                  disabled={isDisabled}
                  onClick={() => handleDaySelect(day)}
                  className={`py-2.5 rounded-lg text-sm font-medium transition-all min-h-[40px] ${
                    isDisabled
                      ? 'opacity-20 cursor-not-allowed'
                      : isSelected
                      ? 'bg-gold/20 text-gold border border-gold/40'
                      : 'bg-[#0a0a14] text-[#c0b090] border border-dark-border hover:border-gold/30 hover:text-foreground'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Current selection display */}
      {value && (
        <div className="mt-3 text-center text-sm text-gold font-serif">
          {value.split('-')[0]}年{parseInt(value.split('-')[1])}月{parseInt(value.split('-')[2])}日
        </div>
      )}
    </div>
  );
}
