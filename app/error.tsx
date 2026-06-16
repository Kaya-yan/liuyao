'use client';

export default function ErrorPage({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-[#0a0a14] via-[#0f0f1a] to-[#0a0a14]">
      <div className="text-center">
        <div className="text-5xl mb-4">☯</div>
        <h2 className="text-xl font-serif text-gold mb-2">卦象出现了偏差</h2>
        <p className="text-sm text-[#a09880] mb-6">
          天机运转偶有不顺，请稍后再试
        </p>
        <button
          onClick={reset}
          className="btn-primary px-8 py-3 min-h-[44px]"
        >
          重新推演
        </button>
      </div>
    </div>
  );
}
