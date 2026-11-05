"use client";

import { useEffect, useRef } from "react";
import { MuteToggle } from "./MuteToggle";
import { useSound } from "./SoundContext";

export const AMBIENT_SRC = "/media/ambient.mp3";
const TARGET_VOLUME = 0.38;

/** Ocean/wave bed. Plays with cover after sound-gate YES; silent if NO. */
export function AmbientAudio({ src = AMBIENT_SRC }: { src?: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const { soundOn, toggle } = useSound();

  useEffect(() => {
    const a = ref.current;
    if (!a || soundOn === null) return;
    a.volume = TARGET_VOLUME;
    if (soundOn) {
      a.currentTime = 0;
      const p = a.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } else {
      a.pause();
      a.currentTime = 0;
    }
  }, [soundOn]);

  return (
    <>
      <audio ref={ref} src={src} loop preload="auto" data-testid="ambient-audio" />
      {soundOn !== null && <MuteToggle muted={!soundOn} onToggle={toggle} />}
    </>
  );
}
