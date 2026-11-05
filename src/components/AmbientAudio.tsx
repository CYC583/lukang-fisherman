"use client";

import { useEffect, useRef } from "react";
import { MuteToggle } from "./MuteToggle";
import { useSound } from "./SoundContext";

export const AMBIENT_SRC = "/media/bgm-doc.m4a";
const COVER_VOLUME = 0.36;
const LOG_VOLUME = 0.22;

/** Documentary BGM after opener ends. Soft under cover; softer in logbook. */
export function AmbientAudio({ src = AMBIENT_SRC }: { src?: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const { soundOn, introDone, toggle } = useSound();

  useEffect(() => {
    const a = ref.current;
    if (!a || soundOn === null) return;

    const applyVolume = () => {
      const y = window.scrollY || 0;
      const vh = window.innerHeight || 1;
      a.volume = y > vh * 0.55 ? LOG_VOLUME : COVER_VOLUME;
    };

    if (soundOn && introDone) {
      applyVolume();
      const p = a.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
      window.addEventListener("scroll", applyVolume, { passive: true });
      return () => window.removeEventListener("scroll", applyVolume);
    }

    a.pause();
  }, [soundOn, introDone]);

  return (
    <>
      <audio ref={ref} src={src} loop preload="auto" data-testid="ambient-audio" />
      {soundOn !== null && <MuteToggle muted={!soundOn} onToggle={toggle} />}
    </>
  );
}
