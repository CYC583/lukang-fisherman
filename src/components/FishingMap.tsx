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
import { sfx } from "@/lib/sfx";
import { useSoundOptional } from "./SoundContext";

type MarkerDatum = Spot & { active: boolean };
type GlobeComponent = ComponentType<GlobeProps & { ref?: React.Ref<GlobeMethods> }>;

const GOLD = "#C5A059";
const INDIGO = "#0B1C2C";
const TAIWAN_POV = { lat: 23.7, lng: 121.0, altitude: 1.85 };

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
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
 * Cinematic multi-stage fly · mist-gold arcs · species drawer · tide strip.
 */
export function FishingMap() {
  const spots = getSpots();
  const atlas = useMemo(() => getSpeciesAtlas(spots), [spots]);
  const { soundOn } = useSoundOptional();
  const [Globe, setGlobe] = useState<GlobeComponent | null>(null);
  const globeRef = useRef<GlobeMethods | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const flyGen = useRef(0);
  const [size, setSize] = useState({ w: 360, h: 440 });
  const [active, setActive] = useState<Spot | null>(null);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [focusSpecies, setFocusSpecies] = useState<SpeciesAtlasEntry | null>(null);
  const interacting = useRef(false);
  const resumeTimer = useRef<number | null>(null);

  const tap = useCallback(() => {
    if (soundOn === true) sfx.tap();
  }, [soundOn]);

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

  const markers = useMemo<MarkerDatum[]>(
    () => spots.map((s) => ({ ...s, active: active?.id === s.id })),
    [spots, active],
  );

  const rings = useMemo(
    () =>
      spots.map((s) => ({
        lat: s.lat,
        lng: s.lng,
        maxR: s.id === active?.id ? 4.5 : 2.2,
        propagationSpeed: s.id === active?.id ? 2.8 : 1.5,
        repeatPeriod: s.id === active?.id ? 850 : 1700,
      })),
    [spots, active],
  );

  const arcs = useMemo(() => {
    if (!active) return [];
    return relatedSpots(active, spots)
      .slice(0, 8)
      .map((other) => ({
        startLat: active.lat,
        startLng: active.lng,
        endLat: other.lat,
        endLng: other.lng,
        color: ["rgba(197,160,89,0.65)", "rgba(197,160,89,0.08)"] as [string, string],
      }));
  }, [active, spots]);

  /** Multi-layer cinematic fly — ease out → arc pan → dive in. */
  const cinematicFly = useCallback(async (spot: Spot) => {
    const g = globeRef.current;
    if (!g) return;
    const gen = ++flyGen.current;
    const controls = g.controls();
    controls.autoRotate = false;

    const cur = g.pointOfView();
    const lift = Math.max((cur.altitude ?? 1.9) + 0.55, 2.45);

    g.pointOfView(
      { lat: cur.lat, lng: cur.lng, altitude: lift },
      520,
    );
    await wait(500);
    if (gen !== flyGen.current) return;

    g.pointOfView(
      { lat: spot.lat, lng: spot.lng, altitude: 2.2 },
      980,
    );
    await wait(960);
    if (gen !== flyGen.current) return;

    g.pointOfView(
      { lat: spot.lat, lng: spot.lng, altitude: 1.28 },
      1180,
    );
  }, []);

  const selectSpot = useCallback(
    (spot: Spot) => {
      setActive(spot);
      tap();
      void cinematicFly(spot);
    },
    [cinematicFly, tap],
  );

  useEffect(() => {
    if (!Globe || !ready) return;
    const g = globeRef.current;
    if (!g) return;
    const controls = g.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.32;
    controls.enableDamping = true;
    controls.dampingFactor = 0.085;
    controls.minDistance = 110;
    controls.maxDistance = 500;

    const clearResume = () => {
      if (resumeTimer.current != null) {
        window.clearTimeout(resumeTimer.current);
        resumeTimer.current = null;
      }
    };
    const onStart = () => {
      interacting.current = true;
      controls.autoRotate = false;
      clearResume();
    };
    const onEnd = () => {
      interacting.current = false;
      clearResume();
      resumeTimer.current = window.setTimeout(() => {
        if (!interacting.current) controls.autoRotate = true;
      }, 7000);
    };
    controls.addEventListener("start", onStart);
    controls.addEventListener("end", onEnd);
    return () => {
      controls.removeEventListener("start", onStart);
      controls.removeEventListener("end", onEnd);
      clearResume();
    };
  }, [Globe, ready]);

  const htmlElement = useCallback(
    (d: object) => {
      const spot = d as MarkerDatum;
      const el = document.createElement("button");
      el.type = "button";
      el.className = spot.active ? "lf-globe-pin is-active" : "lf-globe-pin";
      el.setAttribute("aria-label", spot.name);
      el.innerHTML = `<span class="lf-globe-pin-ring"></span><span class="lf-globe-pin-core"></span>`;
      el.style.pointerEvents = "auto";
      el.style.cursor = "pointer";
      el.onclick = (e) => {
        e.stopPropagation();
        selectSpot(spot);
      };
      return el;
    },
    [selectSpot],
  );

  const original = active ? spotOriginalUrl(active) : null;
  const soundLit = soundOn === true;

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
          href="#gear"
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
          裝備牆
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
          className="relative overflow-hidden"
          style={{
            border: "1px solid rgba(197,160,89,0.45)",
            boxShadow: soundLit
              ? "0 0 0 1px rgba(11,28,44,0.5) inset, 0 0 56px rgba(197,160,89,0.2), 0 24px 60px rgba(0,0,0,0.45)"
              : "0 0 0 1px rgba(11,28,44,0.5) inset, 0 0 32px rgba(197,160,89,0.08), 0 24px 60px rgba(0,0,0,0.45)",
            background: "radial-gradient(ellipse at 50% 45%, #0f1c2c 0%, #050a10 70%)",
            transition: "box-shadow 800ms ease",
          }}
        >
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
                htmlElementsData={markers}
                htmlLat="lat"
                htmlLng="lng"
                htmlAltitude={0.012}
                htmlElement={htmlElement}
                htmlElementVisibilityModifier={(el, isVisible) => {
                  (el as HTMLElement).style.opacity = isVisible ? "1" : "0";
                  (el as HTMLElement).style.pointerEvents = isVisible ? "auto" : "none";
                }}
                ringsData={rings}
                ringColor={() => "rgba(197,160,89,0.55)"}
                ringMaxRadius="maxR"
                ringPropagationSpeed="propagationSpeed"
                ringRepeatPeriod="repeatPeriod"
                arcsData={arcs}
                arcColor="color"
                arcDashLength={0.45}
                arcDashGap={0.3}
                arcDashAnimateTime={2800}
                arcStroke={0.45}
                arcAltitudeAutoScale={0.35}
                pointsData={markers}
                pointLat="lat"
                pointLng="lng"
                pointAltitude={0.004}
                pointRadius={(d) => ((d as MarkerDatum).active ? 0.55 : 0.3)}
                pointColor={() => GOLD}
                pointsMerge={false}
                onGlobeReady={() => {
                  const g = globeRef.current;
                  if (!g) return;
                  g.pointOfView(TAIWAN_POV, 0);
                  setReady(true);
                }}
              />
            ) : null}
          </div>

          {!ready && (
            <div
              className="absolute inset-0 flex items-center justify-center"
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
          )}

          <p
            className="pointer-events-none absolute bottom-2 left-0 right-0 text-center"
            style={{
              fontSize: "0.5625rem",
              letterSpacing: "0.22em",
              color: "rgba(247,244,237,0.28)",
              fontFamily: "var(--font-display)",
            }}
          >
            DRAG · PINCH · TAP PIN
          </p>
        </div>

        <ul
          className="mt-4 flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
          aria-label="釣點快捷"
        >
          {spots.map((s) => {
            const on = active?.id === s.id;
            return (
              <li key={s.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => selectSpot(s)}
                  className="whitespace-nowrap transition active:opacity-90"
                  style={{
                    minHeight: 36,
                    paddingInline: "0.9rem",
                    border: on
                      ? "1px solid var(--color-gold)"
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

      {active && (
        <aside
          className="relative z-10 mx-auto mt-5 w-full max-w-lg px-4"
          aria-live="polite"
          data-testid="spot-detail"
        >
          <article
            className="overflow-hidden lf-glass-card"
            style={{
              background: "rgba(247,244,237,0.08)",
              border: "1px solid rgba(197,160,89,0.5)",
              backdropFilter: "blur(18px) saturate(1.2)",
              WebkitBackdropFilter: "blur(18px) saturate(1.2)",
              boxShadow: "0 18px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04) inset",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.image}
              alt={active.name}
              className="h-44 w-full object-cover"
              style={{ objectPosition: "center 35%" }}
            />
            <div className="px-5 py-4">
              <p className="mag-label mb-2" style={{ color: GOLD }}>
                {active.region}
                <span className="mx-2 opacity-40">·</span>
                {active.season}
              </p>
              <h3
                className="mag-title"
                style={{
                  fontSize: "1.125rem",
                  letterSpacing: "0.18em",
                  color: "#F7F4ED",
                }}
              >
                {active.name}
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
                {active.species.join(" · ")}
              </p>
              <p
                className="mt-3 leading-relaxed"
                style={{
                  fontSize: "0.875rem",
                  letterSpacing: "0.04em",
                  color: "rgba(247,244,237,0.72)",
                }}
              >
                {active.summary}
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
                來源：{active.source}（信心：{active.confidence}）
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
                    className="inline-flex items-center justify-center font-bold transition active:opacity-90"
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
                    {active.sourcePlatform === "pixnet" ? "看痞客邦原文" : "看粉專原文"}
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    tap();
                    setActive(null);
                  }}
                  className="inline-flex items-center justify-center transition active:opacity-90"
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
