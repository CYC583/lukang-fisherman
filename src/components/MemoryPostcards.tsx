"use client";

import { useState } from "react";
import { getMemories, getSite } from "@/lib/content";
import { sfx } from "@/lib/sfx";
import { useSoundOptional } from "./SoundContext";

/** Respect / envy memorial cards — tap to expand shareable still. Not a love wall. */
export function MemoryPostcards() {
  const memories = getMemories();
  const site = getSite();
  const { soundOn } = useSoundOptional();
  const [open, setOpen] = useState<string | null>(null);
  const tap = () => {
    if (soundOn === true) sfx.tap();
  };

  return (
    <section id="memories" aria-label="紀念小卡" className="snap-start bg-[var(--color-indigo)] px-5 py-14 text-[var(--color-paper)]">
      <div className="mx-auto mb-8 max-w-md text-center">
        <p className="mb-2 text-[11px] tracking-[0.4em]" style={{ color: "#C5A059" }}>
          FIELD NOTES
        </p>
        <h2 className="text-2xl font-bold tracking-[0.25em]">釣友會想傳的幾張</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-paper)]/65">
          公開釣行。點開可全螢幕看。
        </p>
      </div>

      <div className="mx-auto grid max-w-md gap-5">
        {memories.map((m) => {
          const expanded = open === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                tap();
                setOpen(expanded ? null : m.id);
              }}
              className="overflow-hidden rounded-2xl border text-left transition"
              style={{ borderColor: "rgba(197,160,89,0.4)", background: "#0f2436" }}
            >
              <span
                className="absolute m-3 rounded-full px-3 py-1 text-[10px] font-bold tracking-widest"
                style={{ background: "#C5A059", color: "#0B1C2C", position: "relative" }}
              >
                {m.badge}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.image}
                alt={m.title}
                className="w-full object-cover"
                style={{ aspectRatio: expanded ? "9 / 16" : "4 / 5", maxHeight: expanded ? 640 : undefined }}
                loading="lazy"
              />
              <div className="space-y-1.5 px-4 py-4">
                <h3 className="text-lg font-bold tracking-[0.18em]">{m.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--color-paper)]/70">{m.blurb}</p>
                <p className="text-[10px] tracking-widest text-[var(--color-paper)]/35">
                  {expanded ? "點一下收合" : "點開全螢幕"} · {m.credit}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mx-auto mt-12 flex max-w-sm flex-col items-center gap-4 px-2 pb-8 text-center">
        <a
          href={site.facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={tap}
          className="flex w-full items-center justify-center rounded-full font-bold tracking-[0.22em] transition active:scale-[0.98]"
          style={{ minHeight: 56, background: "#C5A059", color: "#0B1C2C" }}
        >
          {site.secondaryCta}
        </a>
      </div>
    </section>
  );
}
