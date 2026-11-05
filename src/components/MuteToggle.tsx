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
      className="fixed bottom-5 right-5 z-[60] flex h-11 w-11 items-center justify-center backdrop-blur-sm"
      style={{
        border: "1px solid rgba(197,160,89,0.65)",
        background: "rgba(247,244,237,0.92)",
        color: "var(--color-indigo)",
        fontSize: "0.875rem",
        letterSpacing: "0.08em",
      }}
    >
      <span aria-hidden style={{ fontFamily: "var(--font-display)", fontSize: "0.7rem", letterSpacing: "0.12em" }}>
        {muted ? "靜" : "音"}
      </span>
    </button>
  );
}
