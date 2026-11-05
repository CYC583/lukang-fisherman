"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { getSpots } from "@/lib/content";
import { requestGlobeFly } from "@/lib/globeBus";
import {
  filterShowcase,
  getShowcase,
  showcaseView,
  type ShowcaseCategoryKey,
  type ShowcaseItem,
} from "@/lib/showcase";
import { sfx } from "@/lib/sfx";
import { useSoundOptional } from "./SoundContext";

const GOLD = "#C5A059";
const INDIGO = "#0B1C2C";
type Filter = ShowcaseCategoryKey | "all";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * 粉專現場 · 展示廊 — cinematic showcase of 鹿港漁人 FB highlights
 * (實釣成就 · 離島視覺 · 現場 Reel). Stage card + filmstrip rail, chip filter with a sliding
 * gold rule, swipe / arrows, tilt-on-pointer, staggered entrance, and 「在地球上看」 hand-off
 * to the 釣場地球 above.
 */
export function FbShowcase() {
  const sc = getShowcase();
  const { items, categories } = useMemo(() => showcaseView(sc), [sc]);
  const spotIds = useMemo(() => new Set(getSpots().map((s) => s.id)), []);
  const { soundOn } = useSoundOptional();
  const rootRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLUListElement>(null);
  const chipRowRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number; id: number } | null>(null);
  const [inView, setInView] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const list = useMemo(() => filterShowcase(items, filter), [items, filter]);
  const [selId, setSelId] = useState(items[0]?.id ?? "");
  const [dir, setDir] = useState<1 | -1>(1);
  const [rule, setRule] = useState<{ x: number; w: number }>({ x: 0, w: 0 });
  const sel: ShowcaseItem | undefined = list.find((i) => i.id === selId) ?? list[0];
  const idx = sel ? list.indexOf(sel) : 0;

  const tap = useCallback(() => {
    if (soundOn === true) sfx.tap();
  }, [soundOn]);

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
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* sliding gold rule under the active chip */
  useEffect(() => {
    const row = chipRowRef.current;
    if (!row) return;
    const btn = row.querySelector<HTMLElement>(`[data-filter="${filter}"]`);
    if (btn) setRule({ x: btn.offsetLeft, w: btn.offsetWidth });
  }, [filter, categories.length]);

  /* keep the selected frame centred in the filmstrip */
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || !sel) return;
    const card = rail.querySelector<HTMLElement>(`[data-card-id="${sel.id}"]`);
    if (!card || typeof rail.scrollTo !== "function") return;
    const left = card.offsetLeft - rail.clientWidth / 2 + card.offsetWidth / 2;
    rail.scrollTo({ left, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [sel]);

  const select = useCallback(
    (id: string) => {
      const next = list.findIndex((i) => i.id === id);
      setDir(next >= idx ? 1 : -1);
      setSelId(id);
      tap();
    },
    [idx, list, tap],
  );

  const step = useCallback(
    (d: 1 | -1) => {
      if (list.length < 2) return;
      const n = (idx + d + list.length) % list.length;
      setDir(d);
      setSelId(list[n].id);
      tap();
    },
    [idx, list, tap],
  );

  const pickFilter = (f: Filter) => {
    tap();
    setFilter(f);
    const first = filterShowcase(items, f)[0];
    if (first) {
      setDir(1);
      setSelId(first.id);
    }
  };

  /* swipe + tilt on the stage */
  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    swipe.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = stageRef.current;
    if (!el || prefersReducedMotion() || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--tx", `${(-py * 5).toFixed(2)}deg`);
    el.style.setProperty("--ty", `${(px * 6).toFixed(2)}deg`);
    el.style.setProperty("--gx", `${((px + 0.5) * 100).toFixed(1)}%`);
  };
  const onLeave = () => {
    const el = stageRef.current;
    if (!el) return;
    el.style.setProperty("--tx", "0deg");
    el.style.setProperty("--ty", "0deg");
  };
  const onUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy) * 1.3) step(dx < 0 ? 1 : -1);
  };

  const seeOnGlobe = (spotId: string) => {
    tap();
    if (soundOn === true) sfx.confirm();
    requestGlobeFly(spotId, true);
  };

  return (
    <section
      id="showcase"
      ref={rootRef}
      aria-label={sc.title}
      data-testid="fb-showcase"
      data-in={inView ? "1" : "0"}
      className="lf-show relative w-full snap-start overflow-hidden"
      style={{
        paddingTop: "4.5rem",
        paddingBottom: "4rem",
        backgroundColor: "#04070c",
        backgroundImage:
          "radial-gradient(ellipse at 50% 0%, #142a40 0%, #08121c 48%, #04070c 100%)",
        color: "#F7F4ED",
      }}
    >
      <div className="lf-show-mist" aria-hidden />

      <header className="lf-show-head relative z-10 mx-auto mb-6 max-w-md px-6 text-center">
        <p className="mag-label mb-3" style={{ color: GOLD }}>
          {sc.eyebrow}
        </p>
        <h2
          className="mag-title"
          style={{
            fontSize: "clamp(1.5rem, 6vw, 1.85rem)",
            color: "#F7F4ED",
            textShadow: "0 0 30px rgba(197,160,89,0.28)",
          }}
        >
          {sc.title}
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
          style={{ fontSize: "0.8125rem", letterSpacing: "0.08em", maxWidth: "22em", color: "rgba(247,244,237,0.6)" }}
        >
          {sc.lede}
        </p>
      </header>

      {/* chips */}
      <div className="relative z-10 mx-auto mb-5 flex max-w-lg justify-center px-4">
        <div ref={chipRowRef} className="lf-show-chips relative flex gap-1" role="tablist" aria-label="展示分類">
          {([{ key: "all", label: "全部", en: "ALL" }, ...categories] as { key: Filter; label: string; en: string }[]).map(
            (c) => {
              const on = filter === c.key;
              const n = filterShowcase(items, c.key).length;
              return (
                <button
                  key={c.key}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  data-filter={c.key}
                  onClick={() => pickFilter(c.key)}
                  className="lf-press lf-show-chip"
                  data-on={on ? "1" : "0"}
                >
                  <span>{c.label}</span>
                  <span className="lf-show-chip-n">{pad(n)}</span>
                </button>
              );
            },
          )}
          <span
            className="lf-show-rule"
            aria-hidden
            style={{ transform: `translateX(${rule.x}px)`, width: rule.w }}
          />
        </div>
      </div>

      {/* stage */}
      {sel && (
        <div className="relative z-10 mx-auto w-full max-w-lg px-4">
          <div
            ref={stageRef}
            className="lf-show-stage"
            data-testid="showcase-stage"
            data-kind={sel.kind}
            onPointerDown={onDown}
            onPointerUp={onUp}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
          >
            <article
              key={sel.id}
              className="lf-show-card"
              data-dir={dir}
              aria-live="polite"
              aria-label={sel.title}
            >
              <div className="lf-show-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sel.image}
                  alt={sel.title}
                  draggable={false}
                  style={{ objectPosition: sel.imagePosition ?? "center" } as CSSProperties}
                />
                <span className="lf-show-glare" aria-hidden />
                <span className="lf-show-shade" aria-hidden />
                {sel.kind === "reel" && (
                  <span className="lf-show-play" aria-hidden>
                    <svg viewBox="0 0 24 24" width="22" height="22">
                      <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
                    </svg>
                  </span>
                )}
                <span className="lf-show-corner tl" aria-hidden />
                <span className="lf-show-corner tr" aria-hidden />
                <span className="lf-show-corner bl" aria-hidden />
                <span className="lf-show-corner br" aria-hidden />
                <div className="lf-show-top">
                  <span className="lf-show-badge">{sel.kicker}</span>
                  <span className="lf-show-count">
                    {pad(idx + 1)} <i>/</i> {pad(list.length)}
                  </span>
                </div>
                <div className="lf-show-caption">
                  <p className="lf-show-meta">
                    {categories.find((c) => c.key === sel.category)?.label}
                    {sel.date ? <> · {sel.date.replaceAll("-", ".")}</> : null}
                  </p>
                  <h3 className="lf-show-title">{sel.title}</h3>
                  {sel.stats.length > 0 && (
                    <div className="lf-show-stats">
                      {sel.stats.map((s) => (
                        <span key={s.label}>
                          <b>{s.value}</b>
                          {s.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="lf-show-body">
                <p className="lf-show-text">{sel.body}</p>
                {sel.note && <p className="lf-show-note">※ {sel.note}</p>}
                <ul className="lf-show-tags" aria-label="標籤">
                  {sel.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={sel.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={tap}
                    data-testid="showcase-original"
                    className="lf-press inline-flex items-center justify-center font-bold"
                    style={{
                      minHeight: 42,
                      paddingInline: "1.1rem",
                      background: GOLD,
                      color: INDIGO,
                      fontFamily: "var(--font-display)",
                      fontSize: "0.6875rem",
                      letterSpacing: "0.22em",
                    }}
                  >
                    {sel.linkLabel} ↗
                  </a>
                  {sel.spotId && spotIds.has(sel.spotId) && (
                    <button
                      type="button"
                      data-testid="showcase-globe"
                      onClick={() => seeOnGlobe(sel.spotId!)}
                      className="lf-press lf-show-globe inline-flex items-center justify-center gap-2"
                    >
                      <span className="lf-show-globe-dot" aria-hidden />
                      在地球上看
                    </button>
                  )}
                  {sel.secondaryUrl && (
                    <a
                      href={sel.secondaryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={tap}
                      className="lf-press inline-flex items-center justify-center"
                      style={{
                        minHeight: 42,
                        paddingInline: "0.9rem",
                        color: "rgba(247,244,237,0.55)",
                        fontFamily: "var(--font-display)",
                        fontSize: "0.6875rem",
                        letterSpacing: "0.2em",
                      }}
                    >
                      {sel.secondaryLabel ?? "更多"} ↗
                    </a>
                  )}
                </div>
              </div>
            </article>

            {list.length > 1 && (
              <>
                <button type="button" aria-label="上一則" className="lf-press lf-show-arrow prev" onClick={() => step(-1)}>
                  ‹
                </button>
                <button type="button" aria-label="下一則" className="lf-press lf-show-arrow next" onClick={() => step(1)}>
                  ›
                </button>
              </>
            )}
          </div>

          <div className="lf-show-progress" aria-hidden>
            <span style={{ width: `${((idx + 1) / Math.max(1, list.length)) * 100}%` }} />
          </div>
        </div>
      )}

      {/* filmstrip */}
      <ul
        ref={railRef}
        className="lf-show-rail relative z-10 mx-auto mt-5 flex max-w-lg gap-3 overflow-x-auto px-4 pb-2"
        aria-label="展示清單"
        data-testid="showcase-rail"
      >
        {list.map((it, i) => {
          const on = sel?.id === it.id;
          return (
            <li key={`${filter}-${it.id}`} className="lf-show-thumb-wrap shrink-0" style={{ "--i": i } as CSSProperties}>
              <button
                type="button"
                data-card-id={it.id}
                aria-pressed={on}
                aria-label={it.title}
                onClick={() => select(it.id)}
                className="lf-show-thumb"
                data-on={on ? "1" : "0"}
                data-kind={it.kind}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.image} alt="" loading="lazy" draggable={false} style={{ objectPosition: it.imagePosition ?? "center" }} />
                <span className="lf-show-thumb-shade" aria-hidden />
                {it.kind === "reel" && <span className="lf-show-thumb-reel">REEL</span>}
                <span className="lf-show-thumb-title">{it.title}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="relative z-10 mx-auto mt-6 flex max-w-lg flex-col items-center gap-2 px-6 text-center">
        <a
          href={sc.pageUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={tap}
          data-testid="showcase-page"
          className="lf-press inline-flex items-center justify-center"
          style={{
            minHeight: 44,
            paddingInline: "1.4rem",
            border: "1px solid rgba(197,160,89,0.7)",
            color: GOLD,
            fontFamily: "var(--font-display)",
            fontSize: "0.75rem",
            letterSpacing: "0.26em",
          }}
        >
          看完整粉專 ↗
        </a>
        <p style={{ fontSize: "0.625rem", letterSpacing: "0.1em", color: "rgba(247,244,237,0.32)" }}>
          {sc.snapshotNote}
        </p>
      </div>
    </section>
  );
}
