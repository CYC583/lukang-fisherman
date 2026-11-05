/** Lightweight procedural SFX. No-ops when muted / SSR. */

let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
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
) {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (sweepTo != null) o.frequency.exponentialRampToValueAtTime(Math.max(1, sweepTo), t0 + dur);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

function noiseBurst(dur: number, gain = 0.05) {
  const c = ac();
  if (!c) return;
  const n = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, n, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = c.createBufferSource();
  src.buffer = buf;
  const g = c.createGain();
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 900;
  g.gain.value = gain;
  src.connect(f);
  f.connect(g);
  g.connect(c.destination);
  src.start();
}

export const sfx = {
  tap() {
    tone(880, 0.05, "sine", 0.04);
  },
  confirm() {
    tone(520, 0.08, "triangle", 0.06);
    tone(780, 0.1, "sine", 0.04);
  },
  cast() {
    tone(180, 0.35, "sawtooth", 0.05, 60);
    noiseBurst(0.28, 0.06);
  },
  hook() {
    tone(440, 0.12, "square", 0.045);
    tone(660, 0.18, "sine", 0.04);
    noiseBurst(0.15, 0.04);
  },
  splash() {
    noiseBurst(0.35, 0.07);
    tone(120, 0.25, "sine", 0.03, 40);
  },
};
