"use client";

import { getSite } from "@/lib/content";
import { setSfxEnabled, sfx } from "@/lib/sfx";
import { useSound } from "./SoundContext";

/** First screen: silent until custom button. Japanese fishing-program gate. */
export function SoundGate() {
  const { soundOn, choose } = useSound();
  const site = getSite();
  if (soundOn !== null) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={site.soundPrompt}
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-[var(--color-indigo)] px-8"
    >
      <div className="mb-14 flex flex-col items-center gap-5 text-center">
        <p className="mag-label">ISOFISHING · TAIWAN</p>
        <p
          className="font-bold leading-none text-[var(--color-gold)]"
          style={{
            writingMode: "vertical-rl",
            letterSpacing: "0.42em",
            fontSize: "clamp(2.75rem, 11vw, 3.6rem)",
            fontFamily: "var(--font-display)",
          }}
        >
          {site.title}
        </p>
        <div className="mag-rule mt-2" aria-hidden />
      </div>

      <button
        type="button"
        onClick={() => {
          setSfxEnabled(true);
          sfx.confirm();
          choose(true);
        }}
        className="w-full max-w-xs font-bold transition active:opacity-90"
        style={{
          minHeight: 56,
          background: "var(--color-gold)",
          color: "var(--color-indigo)",
          fontFamily: "var(--font-display)",
          fontSize: "1rem",
          letterSpacing: "0.22em",
        }}
      >
        {site.soundYes}
      </button>

      <button
        type="button"
        onClick={() => {
          setSfxEnabled(false);
          choose(false);
        }}
        className="mt-6 min-h-[44px] px-4 text-[var(--color-paper)]/55 underline underline-offset-4 transition active:opacity-80"
        style={{
          fontSize: "0.8125rem",
          letterSpacing: "0.22em",
          fontFamily: "var(--font-display)",
        }}
      >
        {site.soundNo}
      </button>
    </div>
  );
}
