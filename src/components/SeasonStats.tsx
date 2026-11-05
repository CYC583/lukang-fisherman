"use client";

import { useEffect, useRef, useState } from "react";
import { getStats } from "@/lib/content";

function CountUp({ to, active }: { to: number; active: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1100;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, active]);
  return <span>{n}</span>;
}

/** 本季戰績 — count-up stats (brag, not shop). */
export function SeasonStats() {
  const data = getStats();
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setActive(true);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} id="stats" className="bg-[var(--color-indigo)] px-5 py-14 text-[var(--color-paper)]">
      <div className="mx-auto mb-8 max-w-md text-center">
        <p className="mb-2 text-[10px] tracking-[0.45em] text-[var(--color-gold)]">SEASON · 戰績</p>
        <h2 className="text-2xl font-bold tracking-[0.25em]">{data.seasonLabel}</h2>
      </div>
      <ul className="mx-auto grid max-w-md gap-4">
        {data.items.map((it) => (
          <li key={it.id} className="rounded-2xl border border-[var(--color-gold)]/35 bg-white/5 px-5 py-4 backdrop-blur">
            <p className="text-[11px] tracking-[0.3em] text-[var(--color-seafoam)]">{it.label}</p>
            <p className="mt-1 text-3xl font-bold tracking-wider text-[var(--color-gold)]">
              <CountUp to={it.value} active={active} />
              <span className="ml-1 text-base font-normal tracking-widest text-[var(--color-paper)]/85">{it.suffix}</span>
            </p>
            <p className="mt-1 text-[10px] tracking-wider text-white/45">{it.hint}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
