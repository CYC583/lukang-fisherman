"use client";

import { useMemo, useState } from "react";
import { getLogbook } from "@/lib/content";

const ALL = "全部";

/** 出海日誌 — timeline cards with optional tag filters. */
export function SeaLogbook() {
  const entries = getLogbook();
  const tags = useMemo(() => {
    const s = new Set<string>();
    entries.forEach((e) => e.tags.forEach((t) => s.add(t)));
    return [ALL, ...Array.from(s)];
  }, [entries]);
  const [filter, setFilter] = useState(ALL);
  const shown = filter === ALL ? entries : entries.filter((e) => e.tags.includes(filter));

  return (
    <section id="logbook" className="bg-[var(--color-paper)] px-5 py-14">
      <div className="mx-auto mb-6 max-w-md text-center">
        <p className="mb-2 text-[10px] tracking-[0.45em] text-[var(--color-gold)]">LOGBOOK · 出海日誌</p>
        <h2 className="text-2xl font-bold tracking-[0.25em] text-[var(--color-indigo)]">出海日誌</h2>
        <p className="mt-2 text-sm text-[var(--color-indigo)]/65">日期 · 地點 · 魚種 · 一張圖 · 一句話</p>
      </div>

      <div className="mx-auto mb-6 flex max-w-md flex-wrap justify-center gap-2">
        {tags.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilter(t)}
            className={`rounded-full px-3 py-1.5 text-[11px] tracking-widest transition ${
              filter === t
                ? "bg-[var(--color-indigo)] text-[var(--color-paper)]"
                : "border border-[var(--color-indigo)]/25 text-[var(--color-indigo)]/70"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <ol className="mx-auto flex max-w-md flex-col gap-5">
        {shown.map((e) => (
          <li
            key={e.id}
            className="overflow-hidden rounded-2xl border border-[var(--color-gold)]/30 bg-white shadow-[0_10px_30px_rgba(11,28,44,0.06)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={e.image} alt={e.species} className="aspect-[16/10] w-full object-cover" loading="lazy" />
            <div className="space-y-1.5 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2 text-[10px] tracking-widest text-[var(--color-gold)]">
                <span>{e.date}</span>
                <span aria-hidden>·</span>
                <span>{e.place}</span>
              </div>
              <p className="text-lg font-bold tracking-widest text-[var(--color-indigo)]">{e.species}</p>
              <p className="text-sm leading-relaxed text-[var(--color-indigo)]/75">{e.line}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {e.tags.map((t) => (
                  <span key={t} className="rounded-full bg-[var(--color-seafoam)]/20 px-2 py-0.5 text-[10px] tracking-wider text-[var(--color-indigo)]/70">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
