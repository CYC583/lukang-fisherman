"use client";

import { useSoundOptional } from "./SoundContext";

/**
 * Post–SoundGate micro-glow: warmer when sound on, cool dim when muted.
 * Decorative only — not parallax / not stats.
 */
export function SoundAura() {
  const { soundOn, introDone } = useSoundOptional();
  if (soundOn === null || !introDone) return null;

  const on = soundOn === true;
  return (
    <div
      aria-hidden
      data-testid="sound-aura"
      data-sound={on ? "on" : "off"}
      className="pointer-events-none fixed inset-0 z-[5]"
      style={{
        background: on
          ? "radial-gradient(ellipse at 50% 0%, rgba(197,160,89,0.14) 0%, transparent 42%), radial-gradient(ellipse at 80% 100%, rgba(127,184,168,0.08) 0%, transparent 40%)"
          : "radial-gradient(ellipse at 50% 0%, rgba(11,28,44,0.18) 0%, transparent 50%)",
        mixBlendMode: on ? "screen" : "multiply",
        opacity: on ? 1 : 0.55,
        transition: "opacity 700ms ease, background 900ms ease",
      }}
    />
  );
}
