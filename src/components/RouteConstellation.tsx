"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { getSpots, spotOriginalUrl, type Spot } from "@/lib/content";
import {
  ACTIVE_EVENT,
  ROUTE_BANDS,
  VIEW_H,
  VIEW_W,
  buildRouteGraph,
  project,
  requestGlobeFly,
  type ActiveDetail,
  type RouteEdge,
} from "@/lib/routes";
import { sfx } from "@/lib/sfx";
import { useSoundOptional } from "./SoundContext";

const GOLD = "#C5A059";
const INDIGO = "#0B1C2C";

/** Deterministic faint starfield (no Math.random → no hydration mismatch). */
function stars(n: number) {
  const out: { x: number; y: number; r: number; o: number }[] = [];
  let seed = 20261106;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  for (let i = 0; i < n; i++) {
    out.push({ x: rnd() * VIEW_W, y: rnd() * VIEW_H, r: 0.3 + rnd() * 0.8, o: 0.12 + rnd() * 0.35 });
  }
  return out;
}

/**
 * 釣場航跡 · 磯路星圖 — mist-gold route constellation under the globe.
 * Edges are derived from spots.json (shared species, nearest-first MST, rooted at 鹿港).
 * Tap a star or a route segment → the globe above runs its cinematic fly to that pin.
 */
export function RouteConstellation() {
  const spots = getSpots();
  const graph = useMemo(() => buildRouteGraph(spots), [spots]);
  const byId = useMemo(() => new Map(graph.nodes.map((n) => [n.spot.id, n])), [graph]);
  const sky = useMemo(() => stars(70), []);
  const { soundOn } = useSoundOptional();
  const rootRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [edgeId, setEdgeId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.18 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // globe → constellation sync (pin taps / chips on the globe highlight the star here)
  useEffect(() => {
    const onActive = (e: Event) => {
      const id = (e as CustomEvent<ActiveDetail>).detail?.id ?? null;
      setSelectedId(id);
      setEdgeId((cur) => {
        if (!cur || !id) return id ? cur : null;
        const [a, b] = cur.split("~");
        return a === id || b === id ? cur : null;
      });
    };
    window.addEventListener(ACTIVE_EVENT, onActive);
    return () => window.removeEventListener(ACTIVE_EVENT, onActive);
  }, []);

  const tap = useCallback(() => {
    if (soundOn === true) sfx.tap();
  }, [soundOn]);

  const flyTo = useCallback(
    (id: string, edge: RouteEdge | null) => {
      tap();
      setSelectedId(id);
      setEdgeId(edge ? edge.id : null);
      requestGlobeFly(id, true);
    },
    [tap],
  );

  const focusId = hoverId ?? selectedId;
  const linked = useMemo(() => {
    const set = new Set<string>();
    if (!focusId) return set;
    for (const e of graph.edges) {
      if (e.a === focusId || e.b === focusId) {
        set.add(e.a);
        set.add(e.b);
      }
    }
    return set;
  }, [focusId, graph]);

  const selected: Spot | null = selectedId ? (byId.get(selectedId)?.spot ?? null) : null;
  const selectedNode = selectedId ? byId.get(selectedId) : undefined;
  const edge = edgeId ? graph.edges.find((e) => e.id === edgeId) : undefined;
  const original = selected ? spotOriginalUrl(selected) : null;
  const root = byId.get(graph.rootId);

  const onKey = (fn: () => void) => (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  };

  return (
    <section
      id="routes"
      ref={rootRef}
      aria-label="釣場航跡 · 磯路星圖"
      data-testid="route-constellation"
      data-in={inView ? "1" : "0"}
      className="lf-routes relative w-full snap-start overflow-hidden"
      style={{
        paddingTop: "3rem",
        paddingBottom: "3rem",
        background: "radial-gradient(ellipse at 50% 30%, #0f2033 0%, #070e16 58%, #04070c 100%)",
      }}
    >
      <header className="relative z-10 mx-auto mb-4 max-w-md px-6 text-center">
        <p className="mag-label mb-3" style={{ color: GOLD }}>
          ROUTES · 航跡
        </p>
        <h2
          className="mag-title"
          style={{
            fontSize: "clamp(1.4rem, 5.6vw, 1.75rem)",
            color: "#F7F4ED",
            textShadow: "0 0 24px rgba(197,160,89,0.22)",
          }}
        >
          釣場航跡 · 磯路星圖
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
          從鹿港出發，同區相連、同魚種跨海牽線。點星點或航段，地球跟著飛。
        </p>
      </header>

      <div className="relative z-10 mx-auto w-full max-w-lg px-4">
        <div
          className="lf-routes-board relative"
          style={{
            border: "1px solid rgba(197,160,89,0.4)",
            background: "radial-gradient(ellipse at 55% 45%, rgba(19,37,58,0.9) 0%, rgba(5,10,16,0.95) 75%)",
            boxShadow: "0 0 32px rgba(197,160,89,0.08), 0 24px 60px rgba(0,0,0,0.45)",
          }}
        >
          <span className="lf-globe-corner lf-globe-corner--tl" aria-hidden />
          <span className="lf-globe-corner lf-globe-corner--tr" aria-hidden />
          <span className="lf-globe-corner lf-globe-corner--bl" aria-hidden />
          <span className="lf-globe-corner lf-globe-corner--br" aria-hidden />

          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="block w-full"
            role="group"
            aria-label="磯路星圖：點星點飛向地球釣點"
            data-focus={focusId ? "1" : "0"}
          >
            <defs>
              <radialGradient id="lfStarHalo">
                <stop offset="0%" stopColor="rgba(240,208,137,0.75)" />
                <stop offset="100%" stopColor="rgba(197,160,89,0)" />
              </radialGradient>
              <linearGradient id="lfRouteGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(240,208,137,0.95)" />
                <stop offset="100%" stopColor="rgba(197,160,89,0.55)" />
              </linearGradient>
              <filter id="lfRouteGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.6" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* graticule */}
            <g className="lf-routes-grid" aria-hidden>
              {[23, 24, 25].map((lat) => {
                const { y } = project(lat, 120);
                return (
                  <g key={`lat${lat}`}>
                    <line x1={8} x2={VIEW_W - 8} y1={y} y2={y} />
                    <text x={10} y={y - 3}>
                      {lat}°N
                    </text>
                  </g>
                );
              })}
              {[120, 121, 122].map((lng) => {
                const { x } = project(24, lng);
                return (
                  <g key={`lng${lng}`}>
                    <line y1={8} y2={VIEW_H - 8} x1={x} x2={x} />
                    <text x={x + 3} y={VIEW_H - 10}>
                      {lng}°E
                    </text>
                  </g>
                );
              })}
            </g>

            <g aria-hidden>
              {sky.map((s, i) => (
                <circle
                  key={i}
                  className="lf-routes-sky"
                  cx={s.x}
                  cy={s.y}
                  r={s.r}
                  style={{ opacity: s.o, animationDelay: `${(i % 9) * -0.7}s` }}
                />
              ))}
            </g>

            {/* band labels */}
            <g className="lf-routes-bands" aria-hidden>
              {ROUTE_BANDS.map((b) => {
                const p = project(b.lat, b.lng);
                return (
                  <text
                    key={b.key}
                    x={p.x + b.lx}
                    y={p.y + b.ly}
                    textAnchor={b.anchor}
                    data-on={selectedNode?.band.key === b.key ? "1" : "0"}
                  >
                    <tspan>{b.label}</tspan>
                    <tspan x={p.x + b.lx} dy="10" className="lf-routes-band-en">
                      {b.en}
                    </tspan>
                  </text>
                );
              })}
            </g>

            {/* routes */}
            <g>
              {graph.edges.map((e) => {
                const hot = !!focusId && (e.a === focusId || e.b === focusId);
                const picked = edgeId === e.id;
                const delay = 120 + e.order * 85;
                return (
                  <g
                    key={e.id}
                    className="lf-route"
                    data-kind={e.kind}
                    data-hot={hot ? "1" : "0"}
                    data-picked={picked ? "1" : "0"}
                    data-dim={focusId && !hot ? "1" : "0"}
                    style={{ ["--d" as string]: `${delay}ms`, ["--flow" as string]: `${Math.max(2.4, e.length / 26)}s` }}
                  >
                    <path className="lf-route-base" d={e.d} pathLength={1} />
                    <path className="lf-route-draw" d={e.d} pathLength={1} filter="url(#lfRouteGlow)" />
                    <path className="lf-route-flow" d={e.d} pathLength={1} />
                    <path
                      className="lf-route-hit"
                      d={e.d}
                      role="button"
                      tabIndex={0}
                      aria-label={`航段 ${byId.get(e.a)?.spot.name} 到 ${byId.get(e.b)?.spot.name}（${e.shared.join("、")}）`}
                      data-testid={`route-edge-${e.id}`}
                      onClick={() => flyTo(e.b, e)}
                      onKeyDown={onKey(() => flyTo(e.b, e))}
                    />
                  </g>
                );
              })}
            </g>

            {/* stars */}
            <g>
              {graph.nodes.map((n) => {
                const on = selectedId === n.spot.id;
                const rel = linked.has(n.spot.id);
                const isRoot = n.spot.id === graph.rootId;
                return (
                  <g
                    key={n.spot.id}
                    className="lf-star"
                    role="button"
                    tabIndex={0}
                    aria-label={`星點 ${n.spot.name}`}
                    aria-pressed={on}
                    data-testid={`route-node-${n.spot.id}`}
                    data-on={on ? "1" : "0"}
                    data-rel={rel && !on ? "1" : "0"}
                    data-dim={focusId && !rel && !on ? "1" : "0"}
                    data-root={isRoot ? "1" : "0"}
                    transform={`translate(${n.x.toFixed(1)} ${n.y.toFixed(1)})`}
                    style={{ ["--d" as string]: `${200 + n.depth * 160}ms` }}
                    onClick={() => flyTo(n.spot.id, null)}
                    onKeyDown={onKey(() => flyTo(n.spot.id, null))}
                    onPointerEnter={(ev) => {
                      if (ev.pointerType === "mouse") setHoverId(n.spot.id);
                    }}
                    onPointerLeave={() => setHoverId(null)}
                  >
                    <g className="lf-star-body">
                      <circle className="lf-star-hit" r={13} />
                      <circle className="lf-star-halo" r={11} fill="url(#lfStarHalo)" />
                      <circle className="lf-star-ring" r={6.5} />
                      <circle className="lf-star-core" r={isRoot ? 3.6 : 2.7} />
                    </g>
                  </g>
                );
              })}
            </g>

            {root && (
              <g
                className="lf-routes-root"
                transform={`translate(${root.x.toFixed(1)} ${root.y.toFixed(1)})`}
                aria-hidden
              >
                <text x={0} y={-17} textAnchor="middle">
                  鹿港 · 起點
                </text>
              </g>
            )}
          </svg>

          <p
            className="pointer-events-none absolute bottom-2 right-3"
            style={{
              fontSize: "0.5rem",
              letterSpacing: "0.22em",
              color: "rgba(247,244,237,0.3)",
              fontFamily: "var(--font-display)",
            }}
          >
            ━ 同區　┅ 同魚種跨區
          </p>
        </div>

        <div className="lf-routes-caption mt-4" data-testid="route-caption" aria-live="polite">
          {selected ? (
            <article
              key={`${selected.id}-${edgeId ?? ""}`}
              className="lf-routes-card"
              style={{
                border: "1px solid rgba(197,160,89,0.45)",
                background: "rgba(7,14,22,0.78)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                padding: "0.9rem 1rem 1rem",
              }}
            >
              {edge && (
                <p
                  className="mb-2"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.5625rem",
                    letterSpacing: "0.24em",
                    color: "rgba(197,160,89,0.85)",
                  }}
                >
                  {byId.get(edge.a)?.band.label} → {byId.get(edge.b)?.band.label}
                  <span className="mx-2 opacity-40">·</span>
                  共同魚種 {edge.shared.join("、")}
                </p>
              )}
              <p className="mag-label mb-1" style={{ color: GOLD }}>
                {selectedNode?.band.label}
                <span className="mx-2 opacity-40">·</span>
                {selected.season}
              </p>
              <h3
                className="mag-title"
                style={{ fontSize: "1rem", letterSpacing: "0.16em", color: "#F7F4ED" }}
              >
                {selected.name}
              </h3>
              <p
                className="mt-1"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.8125rem",
                  letterSpacing: "0.12em",
                  color: GOLD,
                }}
              >
                {selected.species.join(" · ")}
              </p>
              <p
                className="lf-routes-summary mt-2 leading-relaxed"
                style={{ fontSize: "0.8125rem", letterSpacing: "0.04em", color: "rgba(247,244,237,0.68)" }}
              >
                {selected.summary}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {original && (
                  <a
                    href={original}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={tap}
                    data-testid="route-original"
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
                    {selected.sourcePlatform === "pixnet" ? "看痞客邦原文" : "看粉專原文"}
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => flyTo(selected.id, edge ?? null)}
                  className="lf-press inline-flex items-center justify-center"
                  style={{
                    minHeight: 40,
                    paddingInline: "1rem",
                    border: "1px solid rgba(197,160,89,0.55)",
                    color: GOLD,
                    fontFamily: "var(--font-display)",
                    fontSize: "0.6875rem",
                    letterSpacing: "0.22em",
                  }}
                >
                  在地球上看 ↑
                </button>
              </div>
            </article>
          ) : (
            <p
              className="text-center"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.6875rem",
                letterSpacing: "0.22em",
                color: "rgba(247,244,237,0.45)",
              }}
            >
              點一顆星，地球飛過去。
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
