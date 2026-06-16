'use client';

import { useState, useEffect } from 'react';

interface QRCodeProps {
  size?: number;
  className?: string;
}

/**
 * 二维码组件
 * 使用外部 API 生成，失败时显示文字降级
 */
export default function QRCode({ size = 60, className = '' }: QRCodeProps) {
  const [origin, setOrigin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  if (!origin || error) {
    // 降级：显示文字
    return (
      <div
        className={`flex items-center justify-center bg-[#1a1a2e] rounded ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-[8px] text-[#504838] text-center leading-tight">
          天机<br />六爻
        </span>
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(origin)}&bgcolor=0a0a14&color=4a4a4a&margin=2`}
      alt="扫码体验天机六爻"
      width={size}
      height={size}
      className={`opacity-60 ${className}`}
      loading="lazy"
      decoding="async"
      onError={() => setError(true)}
    />
  );
}
