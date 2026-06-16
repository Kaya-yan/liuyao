'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getHistory, deleteHistory, clearHistory, formatHistoryTime, getCategoryLabel, HistoryRecord } from '@/lib/utils/history';

export default function HistoryPage() {
  const router = useRouter();
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setRecords(getHistory());
  }, []);

  const handleDelete = (id: string) => {
    deleteHistory(id);
    setRecords(getHistory());
  };

  const handleClearAll = () => {
    clearHistory();
    setRecords([]);
    setShowConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a14] via-[#0f0f1a] to-[#0a0a14] px-4 py-8">
      <div className="max-w-lg mx-auto">
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif text-gold">占卜记录</h1>
            <p className="text-xs text-[#605040] mt-1">共 {records.length} 条记录</p>
          </div>
          <div className="flex gap-2">
            {records.length > 0 && (
              <button
                onClick={() => setShowConfirm(true)}
                className="text-xs text-[#605040] hover:text-crimson-light px-3 py-1.5 rounded border border-dark-border hover:border-crimson/30 transition-colors min-h-[24px]"
                aria-label="清空所有占卜记录"
              >
                清空
              </button>
            )}
            <button
              onClick={() => router.push('/')}
              className="text-xs text-gold/60 hover:text-gold px-3 py-1.5 rounded border border-gold/20 hover:border-gold/40 transition-colors"
            >
              返回首页
            </button>
          </div>
        </div>

        {/* 清空确认 */}
        {showConfirm && (
          <div className="glass-card p-4 mb-6 border border-crimson/20">
            <p className="text-sm text-[#a09880] mb-3">确定要清空所有记录吗？此操作不可恢复。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn-ghost flex-1 py-2 text-sm"
              >
                取消
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-2 text-sm bg-crimson/20 text-crimson-light rounded hover:bg-crimson/30 transition-colors"
              >
                确认清空
              </button>
            </div>
          </div>
        )}

        {/* 记录列表 */}
        {records.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-4 opacity-30">📭</div>
            <p className="text-sm text-[#706850] mb-4">还没有占卜记录</p>
            <button
              onClick={() => router.push('/input')}
              className="btn-primary px-6 py-2 text-sm"
            >
              开始占卜
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <div
                key={record.id}
                className="glass-card p-4 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{record.hexagramSymbol}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-foreground">{record.hexagramName}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gold/10 text-gold">
                          {getCategoryLabel(record.category)}
                        </span>
                      </div>
                      <div className="text-xs text-[#706850] mt-1">
                        {record.archetype}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#504838]">
                      {formatHistoryTime(record.timestamp)}
                    </span>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="opacity-0 group-hover:opacity-100 text-[#504838] hover:text-crimson-light transition-all p-1 min-w-[24px] min-h-[24px] flex items-center justify-center"
                      aria-label={`删除${record.hexagramName}的记录`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* 判词 */}
                <p className="text-xs text-[#807060] mt-2 leading-relaxed">
                  {record.verdict}
                </p>

                {/* 问题 */}
                {record.question && (
                  <p className="text-xs text-[#605040] mt-1 italic">
                    问：{record.question}
                  </p>
                )}

                {/* 八字 */}
                <div className="flex items-center gap-3 mt-2 pt-2 border-t border-dark-border">
                  <span className="text-[10px] text-[#504838]">八字</span>
                  <span className="text-[10px] text-[#706850] font-mono">
                    {record.bazi.year} {record.bazi.month} {record.bazi.day} {record.bazi.hour}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
