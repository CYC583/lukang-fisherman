"use client";

import { setSfxEnabled, sfx } from "@/lib/sfx";

export function MuteToggle({ muted, onToggle }: { muted: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (muted) {
          setSfxEnabled(true);
          sfx.tap();
        } else {
          sfx.tap();
        }
        onToggle();
      }}
      aria-pressed={!muted}
      aria-label={muted ? "開啟配樂" : "關閉配樂"}
      className="fixed bottom-4 right-4 z-[60] flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-gold)] bg-[var(--color-paper)]/90 text-xl text-[var(--color-indigo)] shadow-md backdrop-blur"
    >
      <span aria-hidden>{muted ? "🔇" : "🔊"}</span>
    </button>
  );
}
