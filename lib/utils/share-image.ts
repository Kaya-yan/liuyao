'use client';

/**
 * 分享图片生成工具
 * 使用 Canvas API 生成可保存的分享图片
 */

interface ShareImageData {
  hexagramName: string;
  hexagramSymbol: string;
  palaceName: string;
  archetype: string;
  verdict: string;
  category: string;
  question?: string;
}

/**
 * 生成分享图片并返回 Blob
 */
export async function generateShareImage(data: ShareImageData): Promise<Blob | null> {
  if (typeof window === 'undefined') return null;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // 设置画布尺寸
  const width = 750;
  const height = 1000;
  canvas.width = width;
  canvas.height = height;

  // 背景
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#0a0a14');
  gradient.addColorStop(0.5, '#0f0f1a');
  gradient.addColorStop(1, '#0a0a14');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 装饰边框
  ctx.strokeStyle = 'rgba(212, 168, 67, 0.15)';
  ctx.lineWidth = 1;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  // 角落装饰
  const cornerSize = 20;
  const corners = [
    [30, 30], [width - 30, 30], [30, height - 30], [width - 30, height - 30]
  ];
  ctx.strokeStyle = 'rgba(212, 168, 67, 0.3)';
  ctx.lineWidth = 2;
  corners.forEach(([x, y]) => {
    ctx.beginPath();
    const dx = x < width / 2 ? 1 : -1;
    const dy = y < height / 2 ? 1 : -1;
    ctx.moveTo(x, y + dy * cornerSize);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dx * cornerSize, y);
    ctx.stroke();
  });

  // 标题
  ctx.fillStyle = 'rgba(212, 168, 67, 0.5)';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('天 机 六 爻', width / 2, 70);

  // 分隔线
  ctx.strokeStyle = 'rgba(212, 168, 67, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 60, 90);
  ctx.lineTo(width / 2 + 60, 90);
  ctx.stroke();

  // 卦象符号
  ctx.fillStyle = 'rgba(212, 168, 67, 0.1)';
  ctx.font = '200px serif';
  ctx.textAlign = 'center';
  ctx.fillText(data.hexagramSymbol, width / 2, 320);

  // 卦名
  ctx.fillStyle = '#d4a843';
  ctx.font = 'bold 48px serif';
  ctx.textAlign = 'center';
  ctx.fillText(data.hexagramName, width / 2, 380);

  // 宫名和类别
  ctx.fillStyle = '#706850';
  ctx.font = '16px sans-serif';
  ctx.fillText(`${data.palaceName} · ${data.category}`, width / 2, 410);

  // 身份标签
  ctx.fillStyle = 'rgba(212, 168, 67, 0.8)';
  ctx.font = '20px serif';
  ctx.fillText(data.archetype, width / 2, 460);

  // 分隔线
  ctx.strokeStyle = 'rgba(212, 168, 67, 0.1)';
  ctx.beginPath();
  ctx.moveTo(100, 490);
  ctx.lineTo(width - 100, 490);
  ctx.stroke();

  // 判词
  ctx.fillStyle = '#a09880';
  ctx.font = '18px serif';
  wrapText(ctx, data.verdict, width / 2, 540, width - 160, 28);

  // 问题
  if (data.question) {
    ctx.fillStyle = '#605040';
    ctx.font = 'italic 14px serif';
    ctx.fillText(`"${data.question}"`, width / 2, 640);
  }

  // 底部
  ctx.fillStyle = '#3a3a3a';
  ctx.font = '12px sans-serif';
  ctx.fillText('卦象所示，仅供参考 · 命由己造，福自我求', width / 2, height - 80);

  // 底部二维码区域提示
  ctx.fillStyle = '#2a2a2a';
  ctx.font = '10px sans-serif';
  ctx.fillText('扫码体验 · 天机六爻', width / 2, height - 50);

  // 转换为 Blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png');
  });
}

/**
 * 文本自动换行
 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
  const chars = text.split('');
  let line = '';
  let currentY = y;

  for (let i = 0; i < chars.length; i++) {
    const testLine = line + chars[i];
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, currentY);
      line = chars[i];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}

/**
 * 下载分享图片
 */
export async function downloadShareImage(data: ShareImageData): Promise<void> {
  const blob = await generateShareImage(data);
  if (!blob) return;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `天机六爻_${data.hexagramName}_${Date.now()}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 分享图片（优先使用系统分享，否则下载）
 */
export async function shareImage(data: ShareImageData): Promise<void> {
  const blob = await generateShareImage(data);
  if (!blob) return;

  // 尝试使用系统分享
  if (navigator.share && navigator.canShare) {
    const file = new File([blob], `天机六爻_${data.hexagramName}.png`, { type: 'image/png' });
    const shareData = {
      title: `天机六爻 · ${data.hexagramName}`,
      text: data.verdict,
      files: [file],
    };

    if (navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // 用户取消或不支持，降级到下载
      }
    }
  }

  // 降级：下载图片
  await downloadShareImage(data);
}
