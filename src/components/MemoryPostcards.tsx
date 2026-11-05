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
    <section id="memories" aria-label="紀念貼圖" className="snap-start bg-[var(--color-seafoam)]/10 px-5 pb-6 pt-14">
      <div className="mx-auto mb-8 max-w-md text-center">
        <p className="mb-2 text-[10px] tracking-[0.45em] text-[var(--color-gold)]">MEMORIES · 紀念小卡</p>
        <h2 className="text-2xl font-bold tracking-[0.25em] text-[var(--color-indigo)]">認識鹿港漁人</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-indigo)]/70">
          就算還沒點進粉專，也能從這些公開釣行瞬間，感覺到他是誰。
        </p>
      </div>

      <div className="mx-auto grid max-w-md gap-6">
        {memories.map((m, i) => (
          <figure
            key={m.id}
            className="relative overflow-hidden rounded-[1.35rem] border-2 border-[var(--color-gold)]/40 bg-[var(--color-paper)] shadow-[0_14px_40px_rgba(11,28,44,0.1)]"
            style={{ transform: `rotate(${i % 2 === 0 ? -1.1 : 1.3}deg)` }}
          >
            <span className="absolute left-3 top-3 z-10 rounded-full bg-[var(--color-gold)] px-3 py-1.5 text-[10px] font-bold tracking-widest text-[var(--color-indigo)] shadow">
              {m.badge}
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.image} alt={m.title} className="aspect-[4/5] w-full object-cover" loading="lazy" />
            <figcaption className="relative space-y-2 px-4 py-4">
              <h3 className="text-lg font-bold tracking-widest text-[var(--color-indigo)]">{m.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--color-indigo)]/75">{m.blurb}</p>
              <p className="text-[9px] tracking-widest text-[var(--color-seafoam)]">{m.credit}</p>
              <div
                aria-hidden
                className="absolute -bottom-3 -right-3 h-12 w-12 rotate-12 rounded-full border-2 border-dashed border-[var(--color-seafoam)]/70 bg-[var(--color-seafoam)]/20"
              />
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mx-auto mt-12 flex max-w-sm flex-col items-center gap-4 px-2 pb-10 text-center">
        <p className="text-sm tracking-[0.3em] text-[var(--color-gold)]">― 釣行，未完待續 ―</p>
        <a
          href={site.facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={tap}
          className="flex min-h-[56px] w-full items-center justify-center rounded-full bg-[var(--color-indigo)] px-6 text-base font-bold tracking-[0.28em] text-[var(--color-paper)] shadow-md transition active:scale-[0.98]"
        >
          {site.secondaryCta}
        </a>
      </div>
    </section>
  );
}
