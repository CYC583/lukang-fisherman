"use client";
import { useEffect, useRef, useState } from "react";
import { MuteToggle } from "./MuteToggle";

export const AMBIENT_SRC = "/media/ambient.mp3";
const TARGET_VOLUME = 0.35;

/** Muted by default; plays only after the user taps the toggle (autoplay-policy safe). */
export function AmbientAudio({ src = AMBIENT_SRC }: { src?: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    a.volume = TARGET_VOLUME;
    if (muted) {
      a.pause();
    } else {
      const p = a.play();
      if (p && typeof p.catch === "function") p.catch(() => setMuted(true));
    }
  }, [muted]);

  return (
    <>
      <audio ref={ref} src={src} loop preload="none" data-testid="ambient-audio" />
      <MuteToggle muted={muted} onToggle={() => setMuted((m) => !m)} />
    </>
  );
}
