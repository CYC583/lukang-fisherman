"use client";

import { getSite } from "@/lib/content";
import { setSfxEnabled, sfx } from "@/lib/sfx";
import { useSound } from "./SoundContext";

/** First screen: silent until she taps our custom button. */
export function SoundGate() {
  const { soundOn, choose } = useSound();
  const site = getSite();
  if (soundOn !== null) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={site.soundPrompt}
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-[var(--color-indigo)] px-6"
    >
      <div className="mb-12 flex flex-col items-center gap-4 text-center">
        <p
          className="font-bold leading-none text-[var(--color-gold)]"
          style={{
            writingMode: "vertical-rl",
            letterSpacing: "0.35em",
            fontSize: "clamp(2.85rem, 12vw, 3.85rem)",
          }}
        >
          {site.title}
        </p>
        <p className="text-[10px] tracking-[0.45em] text-[var(--color-paper)]/60">{site.subtitle}</p>
      </div>

      <button
        type="button"
        onClick={() => {
          setSfxEnabled(true);
          sfx.confirm();
          choose(true);
        }}
        className="min-h-[56px] w-full max-w-xs rounded-full bg-[var(--color-gold)] px-8 py-5 text-center text-lg font-bold tracking-[0.18em] text-[var(--color-indigo)] shadow-[0_12px_40px_rgba(198,167,94,0.45)] transition active:scale-[0.98]"
      >
        {site.soundYes}
      </button>

      <button
        type="button"
        onClick={() => {
          setSfxEnabled(false);
          choose(false);
        }}
        className="mt-5 min-h-[44px] px-4 text-xs tracking-[0.3em] text-[var(--color-paper)]/55 underline underline-offset-4"
      >
        {site.soundNo}
      </button>
    </div>
  );
}
