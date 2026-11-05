"use client";

import { getLogbook, getSite } from "@/lib/content";
import { sfx } from "@/lib/sfx";
import { useSound } from "./SoundContext";

/** Catch-log album — full-bleed photos, not a soft list. */
export function SeaLogbook() {
  const entries = getLogbook();
  const site = getSite();
  const { soundOn } = useSound();

  return (
    <section id="logbook" className="scroll-mt-0 snap-start bg-[var(--color-paper)] px-0 py-12">
      <div className="mx-auto mb-10 max-w-md px-5 text-center">
        <p className="mb-2 text-[11px] tracking-[0.4em]" style={{ color: "#C5A059" }}>
          LOGBOOK
        </p>
        <h2 className="text-2xl font-bold tracking-[0.28em] text-[var(--color-indigo)]">出海日誌</h2>
      </div>

      <ol className="mx-auto flex max-w-md flex-col" style={{ gap: 64 }}>
        {entries.map((e, i) => (
          <li key={e.id} className="w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={e.image}
              alt={e.species}
              className="w-full object-cover"
              style={{ height: "min(78vw, 420px)" }}
              loading={i < 2 ? "eager" : "lazy"}
            />
            <div className="space-y-1.5 px-5 pt-4">
              <p className="text-[11px] tracking-[0.28em]" style={{ color: "#C5A059" }}>
                {e.date} · {e.place}
              </p>
              <p className="text-lg font-bold tracking-[0.18em] text-[var(--color-indigo)]">{e.species}</p>
              <p className="text-[14px] leading-relaxed text-[var(--color-indigo)]/80">{e.line}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mx-auto mt-14 max-w-sm px-5 pb-4">
        <a
          href={site.facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            if (soundOn === true) sfx.tap();
          }}
          className="flex w-full items-center justify-center rounded-full font-bold tracking-[0.22em] transition active:scale-[0.98]"
          style={{ minHeight: 52, background: "#0B1C2C", color: "#F4F1EA" }}
        >
          {site.secondaryCta}
        </a>
      </div>
    </section>
  );
}
