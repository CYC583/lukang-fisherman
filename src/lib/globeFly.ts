/**
 * Pure camera-choreography helpers for the 釣場地球 globe.
 * One continuous 3-stage flight: LIFT → ARC PAN → DIVE (+ soft settle).
 * Kept framework-free so it can be unit-tested and driven by rAF.
 */

export type Pov = { lat: number; lng: number; altitude: number };
export type FlyPhase = "idle" | "lift" | "pan" | "dive" | "settled";

/**
 * Idle / home POV — locked on Taiwan island (+ Penghu) so the whole island fills the stage.
 * Tuned by @390 screenshots: Taiwan 21.9–25.3°N sits inside the frame with Penghu on the left.
 */
export const TAIWAN_POV: Pov = { lat: 23.66, lng: 120.76, altitude: 0.1 };
/** Altitude the camera settles at above a selected spot (close enough that the pin reads on its shore). */
export const DIVE_ALTITUDE = 0.04;
/** Lowest altitude any flight frame may reach. */
export const MIN_ALTITUDE = 0.028;
/** Phase boundaries on normalised time t∈[0,1]. */
export const PHASE_LIFT_END = 0.3;
export const PHASE_PAN_END = 0.62;

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
/** Gentle overshoot (s≈0.55 → ~3% past target) for the dive settle. */
export const easeOutBack = (t: number, s = 0.55) => {
  const c3 = s + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
};

const RAD = Math.PI / 180;

function toVec(lat: number, lng: number): [number, number, number] {
  const la = lat * RAD;
  const lo = lng * RAD;
  return [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)];
}

/** Great-circle angular distance in degrees. */
export function angularDistance(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const [x1, y1, z1] = toVec(a.lat, a.lng);
  const [x2, y2, z2] = toVec(b.lat, b.lng);
  const dot = Math.max(-1, Math.min(1, x1 * x2 + y1 * y2 + z1 * z2));
  return Math.acos(dot) / RAD;
}

/** Spherical interpolation along the great circle (shortest path, no lng wrap jumps). */
export function slerpLatLng(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
  p: number,
): { lat: number; lng: number } {
  const va = toVec(a.lat, a.lng);
  const vb = toVec(b.lat, b.lng);
  const dot = Math.max(-1, Math.min(1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2]));
  const omega = Math.acos(dot);
  let v: [number, number, number];
  if (omega < 1e-6) {
    v = vb;
  } else {
    const so = Math.sin(omega);
    const k1 = Math.sin((1 - p) * omega) / so;
    const k2 = Math.sin(p * omega) / so;
    v = [k1 * va[0] + k2 * vb[0], k1 * va[1] + k2 * vb[1], k1 * va[2] + k2 * vb[2]];
  }
  const lat = Math.atan2(v[2], Math.hypot(v[0], v[1])) / RAD;
  const lng = Math.atan2(v[1], v[0]) / RAD;
  return { lat, lng };
}

/** Flight duration scales with distance — short hops stay snappy, long hauls breathe. */
export function flyDuration(from: Pov, to: { lat: number; lng: number }) {
  const d = angularDistance(from, to);
  return Math.round(Math.min(2800, Math.max(1500, 1500 + d * 16)));
}

/** Peak altitude for the lift stage: higher for longer journeys, capped. */
export function peakAltitude(from: Pov, to: { lat: number; lng: number }, target = DIVE_ALTITUDE) {
  const d = angularDistance(from, to);
  const base = Math.max(from.altitude, target);
  // in-island hops lift just enough to read the coastline; long hauls climb to see the globe
  return Math.min(3.1, base + 0.12 + d * 0.035 + (d / 180) * 1.6);
}

export function phaseAt(t: number): FlyPhase {
  if (t >= 1) return "settled";
  if (t < PHASE_LIFT_END) return "lift";
  if (t < PHASE_PAN_END) return "pan";
  return "dive";
}

/**
 * Camera POV at normalised time t.
 * - lift  (0 → .30): rise to peak with ease-out (accelerates off the surface)
 * - pan   (.10 → .85): great-circle travel, ease-in-out cubic (overlaps lift/dive → no stalls)
 * - dive  (.62 → 1): drop to dive altitude with a soft overshoot settle
 */
export function flyFrame(from: Pov, to: { lat: number; lng: number }, t: number, target = DIVE_ALTITUDE): Pov {
  const tt = clamp01(t);
  const peak = peakAltitude(from, to, target);
  const p = easeInOutCubic(clamp01((tt - 0.1) / 0.75));
  const { lat, lng } = slerpLatLng(from, to, p);
  let altitude: number;
  if (tt < PHASE_LIFT_END) {
    altitude = from.altitude + (peak - from.altitude) * easeOutCubic(tt / PHASE_LIFT_END);
  } else if (tt < PHASE_PAN_END) {
    // hover at the top with a whisper of float so it never feels frozen
    const u = (tt - PHASE_LIFT_END) / (PHASE_PAN_END - PHASE_LIFT_END);
    altitude = peak + Math.sin(u * Math.PI) * 0.04;
  } else {
    const u = (tt - PHASE_PAN_END) / (1 - PHASE_PAN_END);
    altitude = peak + (target - peak) * easeOutBack(u);
    // keep the settle overshoot proportional to the close-up altitude (never skims the sea)
    if (altitude < target) altitude = target - Math.min(target * 0.22, target - altitude);
  }
  return { lat, lng, altitude: Math.max(MIN_ALTITUDE, altitude) };
}

/** Pull-back used when the detail panel closes. */
export function pullBackFrame(from: Pov, t: number, target = 1.85): Pov {
  const e = easeInOutSine(clamp01(t));
  return { lat: from.lat, lng: from.lng, altitude: from.altitude + (target - from.altitude) * e };
}

/** Glide home: great-circle back to the Taiwan lock while easing altitude (used on close / idle resume). */
export function homeFrame(from: Pov, t: number, home: Pov = TAIWAN_POV): Pov {
  const e = easeInOutSine(clamp01(t));
  const { lat, lng } = slerpLatLng(from, home, e);
  return { lat, lng, altitude: from.altitude + (home.altitude - from.altitude) * e };
}

/**
 * Idle "breathing" around the Taiwan lock — replaces auto-rotate so pins never drift
 * off toward the East China Sea. Tiny figure-eight sway; amp∈[0,1] fades it in/out.
 */
export function idleSway(timeMs: number, amp = 1, home: Pov = TAIWAN_POV): Pov {
  const s = timeMs / 1000;
  return {
    lat: home.lat + Math.sin(s * 0.23) * 0.07 * amp,
    lng: home.lng + Math.sin(s * 0.17 + 1.1) * 0.11 * amp,
    altitude: home.altitude + Math.sin(s * 0.29) * 0.004 * amp,
  };
}
