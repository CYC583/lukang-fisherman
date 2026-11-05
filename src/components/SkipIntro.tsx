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
      className="absolute right-5 top-5 rounded-full border border-[var(--color-gold)] px-4 py-1.5 text-sm tracking-[0.2em] text-[var(--color-gold)] transition hover:bg-[var(--color-gold)] hover:text-[var(--color-paper)]"
    >
      略過
    </button>
  );
}
