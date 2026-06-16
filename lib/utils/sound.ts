'use client';

/**
 * 音效和触觉反馈工具
 * 使用 Web Audio API 生成音效，navigator.vibrate 提供触觉反馈
 */

interface WindowWithWebkitAudio extends Window {
  AudioContext: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
}

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const win = window as unknown as WindowWithWebkitAudio;
    const AudioCtxClass = win.AudioContext ?? win.webkitAudioContext;
    if (!AudioCtxClass) return null;
    try {
      audioCtx = new AudioCtxClass();
    } catch {
      return null;
    }
  }
  // Resume if suspended (required after user gesture)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * 铜钱落地音效 - 短促清脆的金属碰撞声
 */
export function playCoinSound(): void {
  const ctx = getAudioCtx();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 主音 - 金属碰撞
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'triangle';
  osc1.frequency.setValueAtTime(1200, now);
  osc1.frequency.exponentialRampToValueAtTime(800, now + 0.05);
  gain1.gain.setValueAtTime(0.3, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.15);

  // 高频泛音
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(2400, now);
  osc2.frequency.exponentialRampToValueAtTime(1600, now + 0.03);
  gain2.gain.setValueAtTime(0.15, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now);
  osc2.stop(now + 0.08);

  // 触觉反馈
  if (navigator.vibrate) {
    navigator.vibrate(30);
  }
}

/**
 * 卦成铃声 - 悠长的钟声
 */
export function playBellSound(): void {
  const ctx = getAudioCtx();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 主音 - 钟声基频
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(528, now);
  gain1.gain.setValueAtTime(0.4, now);
  gain1.gain.exponentialRampToValueAtTime(0.2, now + 0.5);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 2.0);

  // 泛音 - 三度
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(660, now);
  gain2.gain.setValueAtTime(0.15, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now);
  osc2.stop(now + 1.5);

  // 泛音 - 五度
  const osc3 = ctx.createOscillator();
  const gain3 = ctx.createGain();
  osc3.type = 'sine';
  osc3.frequency.setValueAtTime(792, now);
  gain3.gain.setValueAtTime(0.08, now);
  gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
  osc3.connect(gain3);
  gain3.connect(ctx.destination);
  osc3.start(now);
  osc3.stop(now + 1.0);

  // 触觉反馈 - 长振动
  if (navigator.vibrate) {
    navigator.vibrate([100, 50, 100]);
  }
}

/**
 * 轻微触觉反馈（无音效）
 */
export function hapticLight(): void {
  if (navigator.vibrate) {
    navigator.vibrate(15);
  }
}
