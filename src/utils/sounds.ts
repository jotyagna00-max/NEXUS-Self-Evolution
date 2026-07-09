let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch { return null; }
  }
  return audioCtx;
}

const SOUND_ENABLED_KEY = 'nexus_sounds_enabled';
export function isSoundEnabled(): boolean {
  return localStorage.getItem(SOUND_ENABLED_KEY) !== 'false';
}
export function setSoundEnabled(v: boolean) {
  localStorage.setItem(SOUND_ENABLED_KEY, String(v));
}

function tone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.08) {
  const ctx = getCtx();
  if (!ctx || !isSoundEnabled()) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export const sounds = {
  taskComplete: () => { tone(523, 0.15, 'sine', 0.06); setTimeout(() => tone(784, 0.2, 'sine', 0.05), 80); },
  questComplete: () => { tone(523, 0.1, 'triangle', 0.07); setTimeout(() => tone(659, 0.1, 'triangle', 0.07), 80); setTimeout(() => tone(784, 0.25, 'triangle', 0.06), 160); },
  levelUp: () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.15, 'sine', 0.06), i * 80)); },
  achievement: () => { tone(880, 0.1, 'sine', 0.07); setTimeout(() => tone(1108, 0.15, 'sine', 0.06), 100); setTimeout(() => tone(1318, 0.3, 'sine', 0.05), 200); },
  penalty: () => { tone(200, 0.3, 'sawtooth', 0.05); },
  click: () => { tone(400, 0.03, 'sine', 0.03); },
  notification: () => { tone(660, 0.08, 'sine', 0.04); setTimeout(() => tone(880, 0.1, 'sine', 0.03), 60); },
};
