"use client";

import { useEffect, useRef } from "react";
import { MuteToggle } from "./MuteToggle";
import { useSound } from "./SoundContext";

export const AMBIENT_SRC = "/media/ambient.mp3";
const TARGET_VOLUME = 0.32;

/** Plays after SoundGate chooses 「開啟聲音」; stays muted if user picked 先靜音. */
export function AmbientAudio({ src = AMBIENT_SRC }: { src?: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const { soundOn, toggle } = useSound();

  useEffect(() => {
    const a = ref.current;
    if (!a || soundOn === null) return;
    a.volume = TARGET_VOLUME;
    if (soundOn) {
      const p = a.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } else {
      a.pause();
    }
  }, [soundOn]);

  return (
    <>
      <audio ref={ref} src={src} loop preload="auto" data-testid="ambient-audio" />
      {soundOn !== null && (
        <MuteToggle muted={!soundOn} onToggle={toggle} />
      )}
    </>
  );
}
