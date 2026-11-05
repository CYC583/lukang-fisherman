"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import type { GlobeMethods, GlobeProps } from "react-globe.gl";
import {
  getSpots,
  getSpeciesAtlas,
  relatedSpots,
  spotOriginalUrl,
  type Spot,
  type SpeciesAtlasEntry,
} from "@/lib/content";
import {
  angularDistance,
  easeOutCubic,
  flyDuration,
  flyFrame,
  homeFrame,
  idleSway,
  phaseAt,
  TAIWAN_POV,
  type FlyPhase,
  type Pov,
} from "@/lib/globeFly";
import { FLY_EVENT, announceGlobeActive, type FlyDetail } from "@/lib/globeBus";
import { sfx } from "@/lib/sfx";
import { useSoundOptional } from "./SoundContext";

type CoastFeature = { type: "Feature"; properties: Record<string, unknown>; geometry: object };
type GlobeComponent = ComponentType<GlobeProps & { ref?: React.Ref<GlobeMethods> }>;
type ArcDatum = {
  key: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: [string, string];
  initialGap: number;
};
type PanelState = "in" | "out";

const GOLD = "#C5A059";
const INDIGO = "#0B1C2C";
const INTRO_FROM: Pov = { lat: 19.5, lng: 114.5, altitude: 2.6 };
/** Idle sway amplitude target (replaces auto-rotate: the camera stays locked on Taiwan). */
const IDLE_SWAY = 1;
const HOME_GLIDE_MS = 1500;
/** Idle wait after a drag/pinch before the camera glides home to the Taiwan lock. */
export const RESUME_DELAY_MS = 5200;
const ARC_POOL = 8;
const PANEL_OUT_MS = 240;
const ROTATE_GAIN = 1.35;
const ZOOM_GAIN = 1.45;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

const raf: (cb: (t: number) => void) => number =
  typeof window !== "undefined" && typeof window.requestAnimationFrame === "function"
    ? (cb) => window.requestAnimationFrame(cb)
    : (cb) => setTimeout(() => cb(Date.now()), 16) as unknown as number;
const caf: (id: number) => void =
  typeof window !== "undefined" && typeof window.cancelAnimationFrame === "function"
    ? (id) => window.cancelAnimationFrame(id)
    : (id) => clearTimeout(id);

/** Drive a normalised 0→1 tween on rAF; resolves false if superseded. */
function tween(
  duration: number,
  onFrame: (t: number) => void,
  alive: () => boolean,
): Promise<boolean> {
  return new Promise((resolve) => {
    const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
    const step = () => {
      if (!alive()) return resolve(false);
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      const t = duration <= 0 ? 1 : Math.min(1, (now - t0) / duration);
      onFrame(t);
      if (t >= 1) resolve(true);
      else raf(step);
    };
    raf(step);
  });
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/** Related spots worth an arc: shared species, de-duplicated by location. */
export function arcTargets(active: Spot, spots: Spot[]): Spot[] {
  const seen = new Set<string>();
  const out: Spot[] = [];
  for (const s of relatedSpots(active, spots)) {
    if (angularDistance(active, s) < 0.02) continue;
    const k = `${s.lat.toFixed(2)},${s.lng.toFixed(2)}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(s);
    if (out.length >= ARC_POOL) break;
  }
  return out;
}

/** Decorative Taipei tide strip — tech feel, not a stats wall. */
function TideStrip() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  if (!now) {
    return (
      <div
        className="lf-tide mx-auto mb-4 w-full max-w-lg px-4"
        data-testid="tide-strip"
        aria-label="潮汐時刻"
      />
    );
  }

  // Approximate lunar-ish phase from local hour (Taipei box clock)
  const h = now.getHours() + now.getMinutes() / 60;
  const tide = (Math.sin(((h - 4) / 12) * Math.PI) + 1) / 2; // 0..1
  const rising = Math.cos(((h - 4) / 12) * Math.PI) >= 0;
  const label = rising ? "漲潮傾向" : "退潮傾向";
  const timeLabel = now.toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div
      className="lf-tide mx-auto mb-4 w-full max-w-lg px-4"
      data-testid="tide-strip"
      aria-label={`潮汐時刻 ${timeLabel} ${label}`}
    >
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{
          border: "1px solid rgba(197,160,89,0.35)",
          background: "rgba(7,14,22,0.65)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="flex items-center gap-2">
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.5625rem",
              letterSpacing: "0.32em",
              color: GOLD,
            }}
          >
            TIDE
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.6875rem",
              letterSpacing: "0.16em",
              color: "rgba(247,244,237,0.75)",
            }}
          >
            {timeLabel}
          </span>
          <span
            style={{
              fontSize: "0.625rem",
              letterSpacing: "0.14em",
              color: "rgba(247,244,237,0.4)",
            }}
          >
            · {label}
          </span>
        </div>
        <span
          style={{
            fontSize: "0.5625rem",
            letterSpacing: "0.2em",
            color: "rgba(197,160,89,0.55)",
            fontFamily: "var(--font-display)",
          }}
        >
          裝飾示意
        </span>
      </div>
      <svg viewBox="0 0 320 28" className="mt-1 w-full" aria-hidden>
        <defs>
          <linearGradient id="lfTideFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(197,160,89,0.35)" />
            <stop offset="100%" stopColor="rgba(197,160,89,0.02)" />
          </linearGradient>
        </defs>
        <path
          d={`M0 18 Q40 ${18 - tide * 12} 80 16 T160 ${14 + (1 - tide) * 8} T240 ${16 - tide * 10} T320 17 L320 28 L0 28 Z`}
          fill="url(#lfTideFill)"
        />
        <path
          d={`M0 18 Q40 ${18 - tide * 12} 80 16 T160 ${14 + (1 - tide) * 8} T240 ${16 - tide * 10} T320 17`}
          fill="none"
          stroke="rgba(197,160,89,0.7)"
          strokeWidth="1.2"
        />
        <circle cx={40 + tide * 240} cy={16 - tide * 6} r="2.4" fill={GOLD} />
      </svg>
    </div>
  );
}

/**
 * Competition-grade interactive 3D fishing globe (react-globe.gl).
 * rAF-driven 3-stage fly (lift → arc pan → dive + settle) · drawn/morphing mist-gold arcs ·
 * related-spot pulse · camera-timed detail panel · soft auto-rotate · tuned drag/pinch.
 */
export function FishingMap() {
  const spots = getSpots();
  const atlas = useMemo(() => getSpeciesAtlas(spots), [spots]);
  const { soundOn } = useSoundOptional();
  const [Globe, setGlobe] = useState<GlobeComponent | null>(null);
  const globeRef = useRef<GlobeMethods | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLUListElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const flyGen = useRef(0);
  const [size, setSize] = useState({ w: 360, h: 440 });
  const [active, setActive] = useState<Spot | null>(null);
  const activeRef = useRef<Spot | null>(null);
  const [panelSpot, setPanelSpot] = useState<Spot | null>(null);
  const [panelState, setPanelState] = useState<PanelState>("in");
  const [flyPhase, setFlyPhase] = useState<FlyPhase>("idle");
  const phaseRef = useRef<FlyPhase>("idle");
  const [focusKey, setFocusKey] = useState(0);
  const [arcs, setArcs] = useState<ArcDatum[]>([]);
  const arcsCount = useRef(0);
  useEffect(() => {
    arcsCount.current = arcs.length;
  }, [arcs.length]);
  const arcPool = useRef<ArcDatum[]>(
    Array.from({ length: ARC_POOL }, (_, i) => ({
      key: `arc-${i}`,
      startLat: 0,
      startLng: 0,
      endLat: 0,
      endLng: 0,
      color: ["rgba(240,208,137,0.85)", "rgba(197,160,89,0.06)"],
      initialGap: (i * 0.23) % 1,
    })),
  );
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [focusSpecies, setFocusSpecies] = useState<SpeciesAtlasEntry | null>(null);
  const interacting = useRef(false);
  const resumeTimer = useRef<number | null>(null);
  const rotateTarget = useRef(0);
  const rotateSpeed = useRef(0);
  const [coast, setCoast] = useState<CoastFeature[]>([]);
  const pinEls = useRef(new Map<string, HTMLElement>());
  const selectRef = useRef<(s: Spot) => void>(() => {});

  const tap = useCallback(() => {
    if (soundOn === true) sfx.tap();
  }, [soundOn]);
  const soundRef = useRef(soundOn);
  useEffect(() => {
    soundRef.current = soundOn;
  }, [soundOn]);

  /* Crisp Taiwan + Penghu coastline (NE 10m + OSM islets) — the 2K raster alone blurs to a blob. */
  useEffect(() => {
    let cancelled = false;
    if (typeof fetch !== "function") return;
    fetch("/media/globe/taiwan-coast.geojson")
      .then((r) => (r.ok ? r.json() : null))
      .then((fc: { features?: CoastFeature[] } | null) => {
        if (!cancelled && fc?.features) setCoast(fc.features);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void import("react-globe.gl").then((mod) => {
      if (!cancelled) setGlobe(() => mod.default as unknown as GlobeComponent);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const w = Math.max(280, Math.floor(rect.width));
      const h = Math.max(340, Math.floor(Math.min(window.innerHeight * 0.64, 500)));
      setSize({ w, h });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("orientationchange", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  const related = useMemo(
    () => (active ? new Set(arcTargets(active, spots).map((s) => s.id)) : new Set<string>()),
    [active, spots],
  );

  const rings = useMemo(
    () =>
      spots.map((s, i) => {
        const on = s.id === active?.id;
        const rel = related.has(s.id);
        return {
          lat: s.lat,
          lng: s.lng,
          maxR: on ? 0.5 : rel ? 0.32 : 0.22,
          propagationSpeed: on ? 0.55 : rel ? 0.36 : 0.2,
          repeatPeriod: on ? 820 : rel ? 1250 : 1900 + (i % 5) * 160,
          strength: on ? 1 : rel ? 0.75 : active ? 0.25 : 0.5,
        };
      }),
    [spots, active, related],
  );

  const setPhase = useCallback((p: FlyPhase) => {
    if (phaseRef.current === p) return;
    phaseRef.current = p;
    setFlyPhase(p);
  }, []);

  const clearResume = useCallback(() => {
    if (resumeTimer.current != null) {
      window.clearTimeout(resumeTimer.current);
      resumeTimer.current = null;
    }
  }, []);

  /** Hard-stop the spin (camera is about to be choreographed or grabbed). */
  const haltRotate = useCallback(() => {
    clearResume();
    rotateTarget.current = 0;
    rotateSpeed.current = 0;
    const g = globeRef.current;
    if (g) g.controls().autoRotate = false;
  }, [clearResume]);

  /**
   * After `delay`: glide home to the Taiwan lock, then ease the idle sway in.
   * (No auto-rotate — spinning walked the pins off toward the East China Sea.)
   */
  const scheduleResume = useCallback(
    (delay: number) => {
      clearResume();
      resumeTimer.current = window.setTimeout(() => {
        if (interacting.current || activeRef.current) return;
        const g = globeRef.current;
        if (!g || prefersReducedMotion()) {
          if (g) g.pointOfView(TAIWAN_POV, 0);
          return;
        }
        const cur = g.pointOfView();
        const from: Pov = {
          lat: cur.lat ?? TAIWAN_POV.lat,
          lng: cur.lng ?? TAIWAN_POV.lng,
          altitude: cur.altitude ?? TAIWAN_POV.altitude,
        };
        const gen = flyGen.current;
        const far =
          angularDistance(from, TAIWAN_POV) > 0.02 ||
          Math.abs(from.altitude - TAIWAN_POV.altitude) > 0.004;
        void tween(
          far ? HOME_GLIDE_MS : 0,
          (t) => g.pointOfView(homeFrame(from, t), 0),
          () => gen === flyGen.current && !interacting.current && !activeRef.current,
        ).then((ok) => {
          if (ok) rotateTarget.current = IDLE_SWAY;
        });
      }, delay);
    },
    [clearResume],
  );

  /** Arcs: staged draw-in (rise from flat) on first select; morph pool objects on switch. */
  const showArcs = useCallback((spot: Spot, gen: number, morph: boolean) => {
    const targets = arcTargets(spot, getSpots());
    const pool = arcPool.current;
    targets.forEach((t, i) => {
      const a = pool[i];
      a.startLat = spot.lat;
      a.startLng = spot.lng;
      a.endLat = t.lat;
      a.endLng = t.lng;
    });
    const list = pool.slice(0, targets.length);
    if (morph || prefersReducedMotion()) {
      setArcs([...list]);
      return;
    }
    list.forEach((_, i) => {
      window.setTimeout(() => {
        if (gen !== flyGen.current) return;
        setArcs(list.slice(0, i + 1));
      }, i * 95);
    });
  }, []);

  /** Collapse arcs into their origin pin, then drop them. */
  const collapseArcs = useCallback((gen: number) => {
    setArcs((cur) => {
      cur.forEach((a) => {
        a.endLat = a.startLat;
        a.endLng = a.startLng;
      });
      return [...cur];
    });
    window.setTimeout(() => {
      if (gen === flyGen.current) setArcs([]);
    }, 720);
  }, []);

  const revealPanel = useCallback(
    (spot: Spot) => {
      setPanelSpot(spot);
      setPanelState("in");
      setFocusKey((k) => k + 1);
      if (soundRef.current === true) sfx.confirm();
      window.setTimeout(() => {
        // Peek the panel (top ~190px) instead of jumping to it — the settled globe stays on stage.
        const el = panelRef.current;
        if (!el || typeof window.scrollBy !== "function") return;
        const vh = window.innerHeight || 800;
        const top = el.getBoundingClientRect().top;
        const peek = Math.min(190, vh * 0.26);
        if (top > vh - peek) {
          window.scrollBy({ top: top - (vh - peek), behavior: prefersReducedMotion() ? "auto" : "smooth" });
        }
      }, 320);
    },
    [],
  );

  /** rAF cinematic: one continuous lift → great-circle pan → dive with soft overshoot settle. */
  const cinematicFly = useCallback(
    async (spot: Spot, gen: number) => {
      const g = globeRef.current;
      if (!g) {
        setPhase("settled");
        revealPanel(spot);
        return;
      }
      const cur = g.pointOfView();
      const from: Pov = {
        lat: cur.lat ?? TAIWAN_POV.lat,
        lng: cur.lng ?? TAIWAN_POV.lng,
        altitude: cur.altitude ?? TAIWAN_POV.altitude,
      };
      const reduced = prefersReducedMotion();
      const duration = reduced ? 420 : flyDuration(from, spot);
      let arcsShown = false;
      const morph = arcsCount.current > 0;
      if (morph) {
        showArcs(spot, gen, true);
        arcsShown = true;
      }
      setPhase("lift");
      const done = await tween(
        duration,
        (t) => {
          g.pointOfView(flyFrame(from, spot, t), 0);
          const ph = phaseAt(t);
          if (ph !== "settled") setPhase(ph);
          if (!arcsShown && t >= 0.6) {
            arcsShown = true;
            showArcs(spot, gen, false);
          }
        },
        () => gen === flyGen.current,
      );
      if (!done) return;
      if (!arcsShown) showArcs(spot, gen, false);
      setPhase("settled");
      revealPanel(spot);
    },
    [revealPanel, setPhase, showArcs],
  );

  const selectSpot = useCallback(
    (spot: Spot) => {
      const gen = ++flyGen.current;
      const switching = panelSpot != null;
      activeRef.current = spot;
      setActive(spot);
      tap();
      haltRotate();
      if (switching) {
        setPanelState("out");
        void wait(PANEL_OUT_MS).then(() => {
          if (gen === flyGen.current && phaseRef.current !== "settled") setPanelSpot(null);
        });
      }
      void cinematicFly(spot, gen);
    },
    [cinematicFly, haltRotate, panelSpot, tap],
  );
  useEffect(() => {
    selectRef.current = selectSpot;
  }, [selectSpot]);

  const closeSpot = useCallback(() => {
    const gen = ++flyGen.current;
    tap();
    setPanelState("out");
    collapseArcs(gen);
    activeRef.current = null;
    setPhase("idle");
    window.setTimeout(() => {
      if (gen !== flyGen.current) return;
      setPanelSpot(null);
      setActive(null);
    }, PANEL_OUT_MS + 40);
    const g = globeRef.current;
    if (g) {
      const cur = g.pointOfView();
      const from: Pov = {
        lat: cur.lat ?? TAIWAN_POV.lat,
        lng: cur.lng ?? TAIWAN_POV.lng,
        altitude: cur.altitude ?? TAIWAN_POV.altitude,
      };
      void tween(
        prefersReducedMotion() ? 0 : 1250,
        (t) => g.pointOfView(homeFrame(from, t), 0),
        () => gen === flyGen.current,
      ).then((ok) => {
        if (ok) scheduleResume(1200);
      });
    }
  }, [collapseArcs, scheduleResume, setPhase, tap]);

  /* Pin DOM is created once; state is reflected through classes (no element churn → no flicker). */
  useEffect(() => {
    pinEls.current.forEach((el, id) => {
      el.classList.toggle("is-active", active?.id === id);
      el.classList.toggle("is-related", related.has(id));
      el.classList.toggle("is-dim", !!active && active.id !== id && !related.has(id));
    });
  }, [active, related]);

  /* 展示廊 / other sections → globe: fly on request (scroll the stage into view first if needed). */
  useEffect(() => {
    const onFly = (e: Event) => {
      const detail = (e as CustomEvent<FlyDetail>).detail;
      const spot = getSpots().find((s) => s.id === detail?.id);
      if (!spot) return;
      const shell = shellRef.current;
      if (detail.scroll && shell && typeof shell.scrollIntoView === "function") {
        const r = shell.getBoundingClientRect();
        const vh = window.innerHeight || 800;
        const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
        if (visible < r.height * 0.6) {
          shell.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
        }
      }
      selectRef.current(spot);
    };
    window.addEventListener(FLY_EVENT, onFly);
    return () => window.removeEventListener(FLY_EVENT, onFly);
  }, []);

  useEffect(() => {
    announceGlobeActive(active?.id ?? null);
  }, [active]);

  /* Keep the active chip centred in its rail without moving the page. */
  useEffect(() => {
    const rail = chipsRef.current;
    if (!rail || !active) return;
    const chip = rail.querySelector<HTMLElement>(`[data-spot-id="${CSS.escape(active.id)}"]`);
    if (!chip) return;
    const left = chip.offsetLeft - rail.clientWidth / 2 + chip.offsetWidth / 2;
    if (typeof rail.scrollTo === "function") rail.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  /* Controls feel: inertia, gains, soft auto-rotate ramp, user-wins-over-flight. */
  useEffect(() => {
    if (!Globe || !ready) return;
    const g = globeRef.current;
    if (!g) return;
    const controls = g.controls();
    controls.enableDamping = true;
    controls.dampingFactor = 0.06; // longer inertial glide after a flick
    controls.minDistance = 102.4;
    controls.autoRotate = false;
    controls.maxDistance = 500;
    controls.enablePan = false;
    const tune = () => {
      const alt = g.pointOfView().altitude ?? TAIWAN_POV.altitude;
      // globe.gl rescales speeds on every change; re-apply our gains after it
      controls.rotateSpeed = alt * 0.3 * ROTATE_GAIN;
      controls.zoomSpeed = Math.sqrt(alt) * 0.5 * ZOOM_GAIN;
    };
    tune();

    let loop = 0;
    let swayT0 = -1;
    const tick = (now: number) => {
      const target = rotateTarget.current;
      // critically-damped-ish approach: ~1.6s to fade the idle sway in / out
      rotateSpeed.current += (target - rotateSpeed.current) * 0.028;
      if (Math.abs(target - rotateSpeed.current) < 0.002) rotateSpeed.current = target;
      controls.autoRotate = false;
      if (rotateSpeed.current > 0.003 && !interacting.current && !activeRef.current) {
        if (swayT0 < 0) swayT0 = now;
        g.pointOfView(idleSway(now - swayT0, rotateSpeed.current), 0);
      } else if (rotateSpeed.current <= 0.003) {
        swayT0 = -1;
      }
      loop = raf(tick);
    };
    loop = raf(tick);

    const onStart = () => {
      interacting.current = true;
      haltRotate();
      const p = phaseRef.current;
      if (p === "lift" || p === "pan" || p === "dive") {
        // user grabbed the globe mid-flight → hand control back, still reveal the spot
        flyGen.current += 1;
        const spot = activeRef.current;
        setPhase("settled");
        if (spot) {
          showArcs(spot, flyGen.current, true);
          revealPanel(spot);
        }
      }
    };
    const onEnd = () => {
      interacting.current = false;
      scheduleResume(RESUME_DELAY_MS);
    };
    controls.addEventListener("change", tune);
    controls.addEventListener("start", onStart);
    controls.addEventListener("end", onEnd);
    return () => {
      caf(loop);
      controls.removeEventListener("change", tune);
      controls.removeEventListener("start", onStart);
      controls.removeEventListener("end", onEnd);
      clearResume();
    };
  }, [Globe, ready, clearResume, haltRotate, revealPanel, scheduleResume, setPhase, showArcs]);

  const htmlElement = useCallback((d: object) => {
    const spot = d as Spot;
    const idx = getSpots().findIndex((s) => s.id === spot.id);
    const el = document.createElement("button");
    el.type = "button";
    el.className = "lf-globe-pin";
    el.dataset.spotId = spot.id;
    el.setAttribute("aria-label", spot.name);
    el.style.setProperty("--lf-pin-delay", `${(idx % 7) * -0.34}s`);
    el.innerHTML =
      '<span class="lf-globe-pin-body"><span class="lf-globe-pin-halo"></span><span class="lf-globe-pin-ring"></span><span class="lf-globe-pin-core"></span></span>';
    el.style.pointerEvents = "auto";
    el.style.cursor = "pointer";
    el.onclick = (e) => {
      e.stopPropagation();
      selectRef.current(spot);
    };
    const cur = activeRef.current;
    if (cur?.id === spot.id) el.classList.add("is-active");
    pinEls.current.set(spot.id, el);
    return el;
  }, []);

  const startIntro = useCallback(() => {
    const g = globeRef.current;
    if (!g) return;
    if (prefersReducedMotion()) {
      g.pointOfView(TAIWAN_POV, 0);
      return;
    }
    const gen = flyGen.current;
    g.pointOfView(INTRO_FROM, 0);
    void tween(
      2300,
      (t) => {
        const e = easeOutCubic(t);
        g.pointOfView(
          {
            lat: INTRO_FROM.lat + (TAIWAN_POV.lat - INTRO_FROM.lat) * e,
            lng: INTRO_FROM.lng + (TAIWAN_POV.lng - INTRO_FROM.lng) * e,
            altitude: INTRO_FROM.altitude + (TAIWAN_POV.altitude - INTRO_FROM.altitude) * e,
          },
          0,
        );
      },
      () => gen === flyGen.current && !interacting.current,
    ).then(() => {
      if (!activeRef.current) scheduleResume(900);
    });
  }, [scheduleResume]);

  const original = panelSpot ? spotOriginalUrl(panelSpot) : null;
  const soundLit = soundOn === true;
  const flying = flyPhase === "lift" || flyPhase === "pan" || flyPhase === "dive";

  return (
    <section
      id="map"
      aria-label="釣場地球"
      className="relative flex min-h-dvh w-full snap-start flex-col overflow-hidden"
      data-sound-lit={soundLit ? "1" : "0"}
      style={{
        paddingTop: "3.25rem",
        paddingBottom: "2.5rem",
        background:
          "radial-gradient(ellipse at 50% 28%, #13253a 0%, #070e16 55%, #04070c 100%)",
        boxShadow: soundLit
          ? "inset 0 0 80px rgba(197,160,89,0.08)"
          : "inset 0 0 60px rgba(0,0,0,0.35)",
        transition: "box-shadow 800ms ease",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(rgba(197,160,89,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(197,160,89,0.18) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at 50% 40%, black 20%, transparent 72%)",
        }}
      />

      <header className="relative z-10 mx-auto mb-3 max-w-md px-6 text-center">
        <p className="mag-label mb-3" style={{ color: GOLD }}>
          GLOBE · 航跡
        </p>
        <h2
          className="mag-title"
          style={{
            fontSize: "clamp(1.5rem, 6vw, 1.85rem)",
            color: "#F7F4ED",
            textShadow: soundLit
              ? "0 0 36px rgba(197,160,89,0.4)"
              : "0 0 20px rgba(197,160,89,0.18)",
            transition: "text-shadow 800ms ease",
          }}
        >
          釣場地球
        </h2>
        <div
          className="mx-auto mt-5"
          aria-hidden
          style={{
            height: 1,
            width: "2.75rem",
            background: "linear-gradient(90deg, transparent, #C5A059, transparent)",
          }}
        />
        <p
          className="mx-auto mt-4 leading-relaxed"
          style={{
            fontSize: "0.8125rem",
            letterSpacing: "0.1em",
            maxWidth: "22em",
            color: "rgba(247,244,237,0.55)",
          }}
        >
          手指轉動、捏放縮放。點霧金標記，飛向該場，看釣了什麼。
        </p>
        <p
          className="mt-2"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.625rem",
            letterSpacing: "0.28em",
            color: "rgba(197,160,89,0.7)",
          }}
        >
          {spots.length} 釣點 · 立體互動
        </p>
      </header>

      <TideStrip />

      <div className="relative z-10 mx-auto mb-3 flex w-full max-w-lg justify-center gap-2 px-4">
        <button
          type="button"
          data-testid="species-drawer-toggle"
          onClick={() => {
            tap();
            setDrawerOpen((v) => !v);
          }}
          className="transition active:opacity-90"
          style={{
            minHeight: 40,
            paddingInline: "1.1rem",
            border: "1px solid rgba(197,160,89,0.55)",
            background: drawerOpen ? "rgba(197,160,89,0.2)" : "rgba(7,14,22,0.7)",
            color: GOLD,
            fontFamily: "var(--font-display)",
            fontSize: "0.6875rem",
            letterSpacing: "0.22em",
            backdropFilter: "blur(8px)",
          }}
        >
          {drawerOpen ? "收合圖鑑" : "魚種圖鑑"}
        </button>
        <a
          href="#showcase"
          onClick={tap}
          className="inline-flex items-center transition active:opacity-90"
          style={{
            minHeight: 40,
            paddingInline: "1.1rem",
            border: "1px solid rgba(247,244,237,0.22)",
            color: "rgba(247,244,237,0.7)",
            fontFamily: "var(--font-display)",
            fontSize: "0.6875rem",
            letterSpacing: "0.22em",
          }}
        >
          粉專現場
        </a>
      </div>

      {drawerOpen && (
        <div
          className="relative z-20 mx-auto mb-4 w-full max-w-lg px-4"
          data-testid="species-drawer"
        >
          <div
            style={{
              border: "1px solid rgba(197,160,89,0.4)",
              background: "rgba(7,14,22,0.88)",
              backdropFilter: "blur(16px)",
              maxHeight: "14rem",
              overflowY: "auto",
              padding: "0.75rem",
            }}
          >
            <p
              className="mb-2 px-1"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.625rem",
                letterSpacing: "0.28em",
                color: "rgba(197,160,89,0.75)",
              }}
            >
              點魚種 → 列出釣點 → 飛地球
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {atlas.map((entry) => {
                const on = focusSpecies?.name === entry.name;
                return (
                  <li key={entry.name}>
                    <button
                      type="button"
                      onClick={() => {
                        tap();
                        setFocusSpecies(on ? null : entry);
                      }}
                      style={{
                        minHeight: 32,
                        paddingInline: "0.7rem",
                        border: on
                          ? "1px solid var(--color-gold)"
                          : "1px solid rgba(247,244,237,0.15)",
                        background: on ? "rgba(197,160,89,0.22)" : "transparent",
                        color: on ? GOLD : "rgba(247,244,237,0.8)",
                        fontFamily: "var(--font-display)",
                        fontSize: "0.6875rem",
                        letterSpacing: "0.12em",
                      }}
                    >
                      {entry.name}
                      <span style={{ opacity: 0.45, marginLeft: 6 }}>{entry.count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {focusSpecies && (
              <ul className="mt-3 flex flex-col gap-1.5 border-t border-[rgba(197,160,89,0.25)] pt-3">
                {focusSpecies.spots.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setDrawerOpen(false);
                        selectSpot(s);
                      }}
                      className="flex w-full items-center justify-between text-left transition active:opacity-90"
                      style={{
                        minHeight: 40,
                        paddingInline: "0.65rem",
                        color: "#F7F4ED",
                        fontFamily: "var(--font-display)",
                        fontSize: "0.75rem",
                        letterSpacing: "0.12em",
                        background: "rgba(197,160,89,0.06)",
                        border: "1px solid rgba(197,160,89,0.2)",
                      }}
                    >
                      <span>{s.name}</span>
                      <span style={{ color: GOLD, fontSize: "0.625rem", letterSpacing: "0.2em" }}>
                        飛向
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="relative z-10 mx-auto w-full max-w-lg px-4">
        <div
          ref={shellRef}
          className="lf-globe-shell relative overflow-hidden"
          data-fly-phase={flyPhase}
          style={{
            border: "1px solid rgba(197,160,89,0.45)",
            boxShadow: soundLit
              ? "0 0 0 1px rgba(11,28,44,0.5) inset, 0 0 56px rgba(197,160,89,0.2), 0 24px 60px rgba(0,0,0,0.45)"
              : "0 0 0 1px rgba(11,28,44,0.5) inset, 0 0 32px rgba(197,160,89,0.08), 0 24px 60px rgba(0,0,0,0.45)",
            background: "radial-gradient(ellipse at 50% 45%, #0f1c2c 0%, #050a10 70%)",
            transition: "box-shadow 800ms ease",
          }}
        >
          <span className="lf-globe-breath" aria-hidden />
          <span className="lf-globe-corner lf-globe-corner--tl" aria-hidden />
          <span className="lf-globe-corner lf-globe-corner--tr" aria-hidden />
          <span className="lf-globe-corner lf-globe-corner--bl" aria-hidden />
          <span className="lf-globe-corner lf-globe-corner--br" aria-hidden />

          <div
            className="lf-globe relative w-full"
            style={{ height: size.h, minHeight: 320 }}
            role="application"
            aria-label="可互動立體釣場地球"
            data-testid="fishing-map"
          >
            {Globe ? (
              <Globe
                ref={(instance) => {
                  globeRef.current = instance;
                }}
                width={size.w}
                height={size.h}
                backgroundColor="rgba(0,0,0,0)"
                globeImageUrl="/media/globe/earth-dark.jpg"
                bumpImageUrl="/media/globe/earth-topology.png"
                atmosphereColor={GOLD}
                atmosphereAltitude={0.22}
                showAtmosphere
                animateIn
                enablePointerInteraction
                htmlElementsData={spots}
                htmlLat="lat"
                htmlLng="lng"
                htmlAltitude={0.0015}
                htmlElement={htmlElement}
                htmlTransitionDuration={0}
                htmlElementVisibilityModifier={(el, isVisible) => {
                  const h = el as HTMLElement;
                  h.style.opacity = isVisible ? "1" : "0";
                  h.style.pointerEvents = isVisible ? "auto" : "none";
                }}
                ringsData={rings}
                ringColor={(d: object) => {
                  const s = (d as { strength: number }).strength;
                  return (t: number) => `rgba(222,186,116,${(1 - t) * 0.8 * s})`;
                }}
                ringMaxRadius="maxR"
                ringPropagationSpeed="propagationSpeed"
                ringRepeatPeriod="repeatPeriod"
                arcsData={arcs}
                arcStartLat="startLat"
                arcStartLng="startLng"
                arcEndLat="endLat"
                arcEndLng="endLng"
                arcColor="color"
                arcDashLength={0.62}
                arcDashGap={0.22}
                arcDashInitialGap="initialGap"
                arcDashAnimateTime={2600}
                arcStroke={0.012}
                arcAltitudeAutoScale={0.25}
                arcsTransitionDuration={900}
                pointsData={spots}
                pointLat="lat"
                pointLng="lng"
                pointAltitude={(d) =>
                  (d as Spot).id === active?.id ? 0.004 : related.has((d as Spot).id) ? 0.0025 : 0.0015
                }
                pointRadius={(d) =>
                  (d as Spot).id === active?.id ? 0.03 : related.has((d as Spot).id) ? 0.022 : 0.016
                }
                pointColor={(d) =>
                  active && (d as Spot).id !== active.id && !related.has((d as Spot).id)
                    ? "rgba(197,160,89,0.45)"
                    : GOLD
                }
                pointsMerge={false}
                polygonsData={coast}
                polygonGeoJsonGeometry="geometry"
                polygonCapColor={() => "rgba(197,160,89,0.16)"}
                polygonSideColor={() => "rgba(197,160,89,0.08)"}
                polygonStrokeColor={() => "rgba(222,186,116,0.9)"}
                polygonAltitude={0.0008}
                polygonCapCurvatureResolution={0.5}
                polygonsTransitionDuration={0}
                pointsTransitionDuration={650}
                onGlobeReady={() => {
                  setReady(true);
                  startIntro();
                }}
              />
            ) : null}
          </div>

          <div
            className="lf-globe-loading absolute inset-0 flex items-center justify-center"
            data-ready={ready ? "1" : "0"}
            aria-hidden={ready}
            style={{
              background: "rgba(5,10,16,0.88)",
              fontFamily: "var(--font-display)",
              letterSpacing: "0.28em",
              fontSize: "0.75rem",
              color: "rgba(247,244,237,0.65)",
            }}
          >
            載入地球…
          </div>

          {focusKey > 0 && active && flyPhase === "settled" && (
            <span
              key={focusKey}
              className="lf-globe-focus"
              data-testid="globe-focus"
              aria-hidden
            >
              <span className="lf-globe-focus-ring" />
              <span className="lf-globe-focus-tick" />
            </span>
          )}

          <div
            className="lf-fly-hud pointer-events-none absolute left-3 top-3 z-[3]"
            data-testid="fly-hud"
            data-phase={flyPhase}
            data-visible={active ? "1" : "0"}
            aria-hidden
          >
            <div className="lf-fly-hud-steps">
              {(["lift", "pan", "dive"] as const).map((p, i) => {
                const cur = ["lift", "pan", "dive"].indexOf(flyPhase);
                const state =
                  flyPhase === "settled" || (cur > -1 && i < cur) ? "done" : i === cur ? "on" : "off";
                return (
                  <span key={p} className="lf-fly-hud-step" data-state={state}>
                    {p === "lift" ? "LIFT" : p === "pan" ? "ARC" : "DIVE"}
                  </span>
                );
              })}
            </div>
            {active && (
              <p className="lf-fly-hud-name">
                {flying ? "→ " : ""}
                {active.name}
              </p>
            )}
            {active && flyPhase === "settled" && (
              <p className="lf-fly-hud-coord">
                {active.lat.toFixed(3)}°N · {active.lng.toFixed(3)}°E
                {arcs.length > 0 ? ` · ${arcs.length} ARC` : ""}
              </p>
            )}
          </div>

          <p className="sr-only" aria-live="polite">
            {active && flying ? `飛向 ${active.name}` : ""}
          </p>

          <p
            className="pointer-events-none absolute bottom-2 left-0 right-0 text-center"
            style={{
              fontSize: "0.5625rem",
              letterSpacing: "0.22em",
              color: "rgba(247,244,237,0.28)",
              fontFamily: "var(--font-display)",
            }}
          >
            TAIWAN LOCK · DRAG · PINCH · TAP PIN
          </p>
        </div>

        <ul
          ref={chipsRef}
          className="mt-4 flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
          aria-label="釣點快捷"
        >
          {spots.map((s) => {
            const on = active?.id === s.id;
            const rel = related.has(s.id);
            return (
              <li key={s.id} className="shrink-0">
                <button
                  type="button"
                  data-spot-id={s.id}
                  onClick={() => selectSpot(s)}
                  className="lf-chip whitespace-nowrap"
                  data-on={on ? "1" : "0"}
                  data-related={rel ? "1" : "0"}
                  style={{
                    minHeight: 36,
                    paddingInline: "0.9rem",
                    border: on
                      ? "1px solid var(--color-gold)"
                      : rel
                        ? "1px solid rgba(197,160,89,0.45)"
                        : "1px solid rgba(247,244,237,0.18)",
                    background: on ? "rgba(197,160,89,0.22)" : "rgba(7,14,22,0.55)",
                    color: on ? GOLD : "rgba(247,244,237,0.78)",
                    fontFamily: "var(--font-display)",
                    fontSize: "0.6875rem",
                    letterSpacing: "0.18em",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {s.name}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {panelSpot && (
        <aside
          ref={panelRef}
          className="lf-panel relative z-10 mx-auto mt-5 w-full max-w-lg px-4"
          aria-live="polite"
          data-testid="spot-detail"
          data-state={panelState}
          style={{ scrollMarginBottom: 16 }}
        >
          <article
            key={panelSpot.id}
            className="overflow-hidden lf-glass-card"
            style={{
              background: "rgba(247,244,237,0.08)",
              border: "1px solid rgba(197,160,89,0.5)",
              backdropFilter: "blur(18px) saturate(1.2)",
              WebkitBackdropFilter: "blur(18px) saturate(1.2)",
              boxShadow: "0 18px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04) inset",
            }}
          >
            <div className="lf-panel-media overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={panelSpot.image}
                alt={panelSpot.name}
                className="h-44 w-full object-cover"
                style={{ objectPosition: "center 35%" }}
              />
            </div>
            <div className="lf-panel-body px-5 py-4">
              <p className="mag-label mb-2" style={{ color: GOLD }}>
                {panelSpot.region}
                <span className="mx-2 opacity-40">·</span>
                {panelSpot.season}
              </p>
              <h3
                className="mag-title"
                style={{
                  fontSize: "1.125rem",
                  letterSpacing: "0.18em",
                  color: "#F7F4ED",
                }}
              >
                {panelSpot.name}
              </h3>
              <p
                style={{
                  marginTop: "0.5rem",
                  fontFamily: "var(--font-display)",
                  fontSize: "0.875rem",
                  letterSpacing: "0.14em",
                  color: GOLD,
                }}
              >
                {panelSpot.species.join(" · ")}
              </p>
              <p
                className="mt-3 leading-relaxed"
                style={{
                  fontSize: "0.875rem",
                  letterSpacing: "0.04em",
                  color: "rgba(247,244,237,0.72)",
                }}
              >
                {panelSpot.summary}
              </p>
              <p
                className="mt-3"
                style={{
                  fontSize: "0.625rem",
                  letterSpacing: "0.08em",
                  lineHeight: 1.5,
                  color: "rgba(247,244,237,0.35)",
                }}
              >
                來源：{panelSpot.source}（信心：{panelSpot.confidence}）
                {arcs.length > 0 ? ` · 淡金弧連 ${arcs.length} 相關場` : ""}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {original && (
                  <a
                    href={original}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={tap}
                    data-testid="spot-original"
                    className="lf-press inline-flex items-center justify-center font-bold"
                    style={{
                      minHeight: 40,
                      paddingInline: "1rem",
                      background: GOLD,
                      color: INDIGO,
                      fontFamily: "var(--font-display)",
                      fontSize: "0.6875rem",
                      letterSpacing: "0.22em",
                    }}
                  >
                    {panelSpot.sourcePlatform === "pixnet" ? "看痞客邦原文" : "看粉專原文"}
                  </a>
                )}
                <button
                  type="button"
                  data-testid="spot-close"
                  onClick={closeSpot}
                  className="lf-press inline-flex items-center justify-center"
                  style={{
                    minHeight: 40,
                    paddingInline: "1rem",
                    color: "rgba(247,244,237,0.4)",
                    fontFamily: "var(--font-display)",
                    fontSize: "0.6875rem",
                    letterSpacing: "0.22em",
                  }}
                >
                  收合
                </button>
              </div>
            </div>
          </article>
        </aside>
      )}
    </section>
  );
}
