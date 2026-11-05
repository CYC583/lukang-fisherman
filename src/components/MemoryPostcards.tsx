"use client";

import { getMemories, getSite } from "@/lib/content";
import { sfx } from "@/lib/sfx";
import { useSoundOptional } from "./SoundContext";

/** Cute memorial sticker / postcard cards from curated public FB posts. */
export function MemoryPostcards() {
  const memories = getMemories();
  const site = getSite();
  const { soundOn } = useSoundOptional();
  const tap = () => {
    if (soundOn === true) sfx.tap();
  };

  return (
    <section
      id="memories"
      aria-label="紀念貼圖"
      className="bg-[var(--color-paper)] px-5 pb-6 pt-14"
    >
      <div className="mx-auto mb-8 max-w-md text-center">
        <p className="mb-2 text-[10px] tracking-[0.45em] text-[var(--color-gold)]">MEMORIES · 紀念小卡</p>
        <h2 className="text-2xl font-bold tracking-[0.25em] text-[var(--color-indigo)]">認識鹿港漁人</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-indigo)]/70">
          就算還沒點進粉專，也能從這些公開釣行瞬間，感覺到他是誰。
        </p>
      </div>

      <div className="mx-auto grid max-w-md gap-5">
        {memories.map((m, i) => (
          <figure
            key={m.id}
            className="relative overflow-hidden rounded-2xl border border-[var(--color-gold)]/35 bg-white shadow-[0_12px_40px_rgba(11,28,44,0.08)]"
            style={{ transform: `rotate(${i % 2 === 0 ? -1.2 : 1.4}deg)` }}
          >
            {/* sticker badge */}
            <span className="absolute left-3 top-3 z-10 rounded-full bg-[var(--color-gold)] px-3 py-1 text-[10px] font-bold tracking-widest text-[var(--color-indigo)] shadow">
              {m.badge}
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={m.image}
              alt={m.title}
              className="aspect-[4/5] w-full object-cover"
              loading="lazy"
            />
            <figcaption className="space-y-2 px-4 py-4">
              <h3 className="text-lg font-bold tracking-widest text-[var(--color-indigo)]">{m.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--color-indigo)]/75">{m.blurb}</p>
              <p className="text-[9px] tracking-widest text-[var(--color-seafoam)]">{m.credit}</p>
            </figcaption>
            {/* cute corner sticker accent */}
            <div
              aria-hidden
              className="absolute -bottom-2 -right-2 h-14 w-14 rotate-12 rounded-full border-2 border-dashed border-[var(--color-seafoam)]/60 bg-[var(--color-seafoam)]/15"
            />
          </figure>
        ))}
      </div>

      <div className="mx-auto mt-12 flex max-w-sm flex-col items-center gap-4 px-2 pb-8 text-center">
        <p className="text-sm tracking-[0.3em] text-[var(--color-gold)]">― 釣行，未完待續 ―</p>
        <a
          href={site.facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={tap}
          className="block w-full rounded-full bg-[var(--color-indigo)] px-6 py-4 text-center text-base font-bold tracking-[0.28em] text-[var(--color-paper)] shadow-md transition active:scale-95"
        >
          {site.afterStoryCta}
        </a>
        <a
          href={site.facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={tap}
          className="text-xs tracking-widest text-[var(--color-indigo)]/60 underline underline-offset-4"
        >
          {site.primaryCta} → Facebook
        </a>
      </div>
    </section>
  );
}
