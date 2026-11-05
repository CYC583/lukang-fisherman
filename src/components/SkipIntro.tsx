"use client";

import { sfx } from "@/lib/sfx";
import { useSoundOptional } from "./SoundContext";

export function SkipIntro({ onSkip }: { onSkip: () => void }) {
  const { soundOn } = useSoundOptional();
  return (
    <button
      type="button"
      onClick={() => {
        if (soundOn === true) sfx.tap();
        onSkip();
      }}
      className="absolute right-5 top-5 z-10 transition active:opacity-80"
      style={{
        minHeight: 36,
        paddingInline: "1rem",
        border: "1px solid rgba(197,160,89,0.75)",
        color: "var(--color-gold)",
        background: "rgba(11,28,44,0.35)",
        fontFamily: "var(--font-display)",
        fontSize: "0.75rem",
        letterSpacing: "0.28em",
      }}
    >
      略過
    </button>
  );
}
