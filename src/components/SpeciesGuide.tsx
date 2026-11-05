"use client";

import { useState } from "react";
import { getSpecies } from "@/lib/content";

/** 魚種圖鑑 — tap for photo + short intro (brag, no buy). */
export function SpeciesGuide() {
  const list = getSpecies();
  const [open, setOpen] = useState<string | null>(list[0]?.id ?? null);
  const current = list.find((s) => s.id === open) ?? list[0];

  return (
    <section id="species" className="bg-[var(--color-paper)] px-5 py-14">
      <div className="mx-auto mb-6 max-w-md text-center">
        <p className="mb-2 text-[10px] tracking-[0.45em] text-[var(--color-gold)]">FIELD GUIDE · 圖鑑</p>
        <h2 className="text-2xl font-bold tracking-[0.25em] text-[var(--color-indigo)]">魚種圖鑑</h2>
      </div>
      <div className="mx-auto flex max-w-md flex-wrap justify-center gap-2">
        {list.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setOpen(s.id)}
            className={`rounded-full px-4 py-2 text-sm tracking-widest transition ${
              open === s.id
                ? "bg-[var(--color-gold)] text-[var(--color-indigo)]"
                : "border border-[var(--color-indigo)]/30 text-[var(--color-indigo)]"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>
      {current && (
        <figure className="mx-auto mt-6 max-w-md overflow-hidden rounded-2xl border border-[var(--color-gold)]/30 bg-white shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.image} alt={current.name} className="aspect-[4/5] w-full object-cover" />
          <figcaption className="space-y-2 px-4 py-4">
            <p className="text-[10px] tracking-[0.35em] text-[var(--color-gold)]">{current.aka}</p>
            <h3 className="text-xl font-bold tracking-widest text-[var(--color-indigo)]">{current.name}</h3>
            <p className="text-sm leading-relaxed text-[var(--color-indigo)]/75">{current.blurb}</p>
          </figcaption>
        </figure>
      )}
    </section>
  );
}
