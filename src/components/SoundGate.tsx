"use client";

import { getSite } from "@/lib/content";
import { setSfxEnabled, sfx } from "@/lib/sfx";
import { useSound } from "./SoundContext";

export function SoundGate() {
  const { soundOn, choose } = useSound();
  const site = getSite();
  if (soundOn !== null) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={site.soundPrompt}
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-8 bg-[var(--color-indigo)]/85 px-6 backdrop-blur-md"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <svg width="72" height="24" viewBox="0 0 160 40" aria-hidden className="opacity-90">
          <path
            d="M0 20 Q20 5 40 20 T80 20 T120 20 T160 20"
            fill="none"
            stroke="var(--color-gold)"
            strokeWidth="1.5"
          />
        </svg>
        <p className="text-2xl font-bold tracking-[0.35em] text-[var(--color-paper)]">{site.title}</p>
        <p className="mt-2 text-sm tracking-[0.25em] text-[var(--color-gold)]">{site.soundPrompt}</p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <button
          type="button"
          onClick={() => {
            setSfxEnabled(true);
            sfx.confirm();
            sfx.splash();
            choose(true);
          }}
          className="rounded-full bg-[var(--color-gold)] px-6 py-4 text-center text-base font-bold tracking-[0.3em] text-[var(--color-indigo)] shadow-lg transition active:scale-95"
        >
          {site.soundYes}
        </button>
        <button
          type="button"
          onClick={() => {
            setSfxEnabled(false);
            choose(false);
          }}
          className="rounded-full border border-[var(--color-paper)]/50 bg-transparent px-6 py-3.5 text-center text-sm tracking-[0.3em] text-[var(--color-paper)] transition active:scale-95"
        >
          {site.soundNo}
        </button>
      </div>
      <p className="text-[10px] tracking-[0.2em] text-[var(--color-paper)]/50">之後右下角還可以開關</p>
    </div>
  );
}
