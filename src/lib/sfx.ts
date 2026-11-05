/** Procedural SFX. Hard-gated: silent until setEnabled(true); mute path is always silent. */

let ctx: AudioContext | null = null;
let enabled = false;

export function setSfxEnabled(on: boolean) {
  enabled = on;
  if (!on && ctx && ctx.state !== "closed") {
    try {
      /* leave context; just stop new voices */
    } catch {
      /* ignore */
    }
  }
}

export function isSfxEnabled() {
  return enabled;
}

function ac(): AudioContext | null {
  if (!enabled || typeof window === "undefined") return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  freq: number,
  dur: number,
  type: OscillatorType,
  gain = 0.08,
  sweepTo?: number,
  delay = 0,
) {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (sweepTo != null) {
    o.frequency.exponentialRampToValueAtTime(Math.max(1, sweepTo), t0 + dur);
  }
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain), t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.03);
}

function noiseBurst(
  dur: number,
  gain = 0.05,
  lowpass = 900,
  delay = 0,
  highpass = 80,
) {
  const c = ac();
  if (!c) return;
  const n = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, n, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) {
    const env = Math.pow(1 - i / n, 1.4);
    data[i] = (Math.random() * 2 - 1) * env;
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const g = c.createGain();
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = lowpass;
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = highpass;
  const t0 = c.currentTime + delay;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain), t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(hp);
  hp.connect(lp);
  lp.connect(g);
  g.connect(c.destination);
  src.start(t0);
  src.stop(t0 + dur + 0.04);
}

/** Soft looping wash for cover / sea bed accents. */
function waveWash(intensity = 0.045) {
  noiseBurst(0.55, intensity * 0.9, 700, 0, 60);
  noiseBurst(0.4, intensity * 0.55, 1400, 0.12, 120);
  tone(90, 0.5, "sine", intensity * 0.35, 55);
}

export const sfx = {
  /** Soft UI tap */
  tap() {
    tone(920, 0.045, "sine", 0.035);
    tone(1380, 0.03, "triangle", 0.018, undefined, 0.018);
  },
  /** Positive confirm / gate YES */
  confirm() {
    tone(480, 0.09, "triangle", 0.055);
    tone(720, 0.12, "sine", 0.04, undefined, 0.05);
    tone(960, 0.1, "sine", 0.025, undefined, 0.1);
  },
  /** Rod cast — whoosh + low line */
  cast() {
    tone(220, 0.32, "sawtooth", 0.04, 55);
    tone(160, 0.28, "triangle", 0.03, 48, 0.04);
    noiseBurst(0.3, 0.07, 1600, 0, 200);
    noiseBurst(0.18, 0.035, 2800, 0.08, 400);
  },
  /** Hook set — sharp click + bright ping */
  hook() {
    tone(520, 0.08, "square", 0.04);
    tone(780, 0.14, "sine", 0.045, undefined, 0.04);
    tone(1170, 0.1, "triangle", 0.028, undefined, 0.09);
    noiseBurst(0.12, 0.035, 2200, 0, 300);
  },
  /** Water splash / near-miss */
  splash() {
    noiseBurst(0.38, 0.08, 1100, 0, 70);
    noiseBurst(0.22, 0.045, 2400, 0.06, 180);
    tone(140, 0.28, "sine", 0.028, 42);
  },
  /** Cover / sea wave accent */
  wave() {
    waveWash(0.05);
  },
  /** Opener cinematic swell after gate YES */
  opener() {
    tone(110, 0.7, "sine", 0.04, 70);
    tone(165, 0.55, "triangle", 0.03, 90, 0.08);
    noiseBurst(0.65, 0.055, 800, 0.05, 50);
    noiseBurst(0.4, 0.03, 1600, 0.25, 100);
    tone(330, 0.35, "sine", 0.022, undefined, 0.35);
  },
};
