import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-[#0a0a14] via-[#0f0f1a] to-[#0a0a14]">
      <div className="text-center">
        <div className="text-6xl mb-4 opacity-30">☰</div>
        <h2 className="text-xl font-serif text-gold mb-2">此路不通</h2>
        <p className="text-sm text-[#a09880] mb-6">
          卦象未显，此页面不存在
        </p>
        <Link
          href="/"
          className="btn-primary inline-block px-8 py-3 min-h-[44px]"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
