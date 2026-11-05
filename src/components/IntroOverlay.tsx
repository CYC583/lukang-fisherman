"use client";

import { useEffect, useRef, useState } from "react";
import { SkipIntro } from "./SkipIntro";
import { useSound } from "./SoundContext";

const DURATION_MS = 5200;

/** Fullscreen ad-film opener (dawn sea) after sound choice — skippable. */
export function IntroOverlay({ onDone }: { onDone: () => void }) {
  const { soundOn } = useSound();
  const [leaving, setLeaving] = useState(false);
  const done = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    onDone();
  };

  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.muted = soundOn !== true;
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      finish();
      return;
    }
    const fade = setTimeout(() => setLeaving(true), DURATION_MS - 600);
    const end = setTimeout(finish, DURATION_MS);
    return () => {
      clearTimeout(fade);
      clearTimeout(end);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundOn]);

  return (
    <div
      role="dialog"
      aria-label="開場短片"
      className={`fixed inset-0 z-[70] flex flex-col items-center justify-end overflow-hidden bg-black transition-opacity duration-500 ${leaving ? "opacity-0" : "opacity-100"}`}
    >
      <SkipIntro onSkip={finish} />
      <video
        ref={videoRef}
        src="/media/dad-cover-cinematic.mp4"
        poster="/media/hero-cover.jpg"
        autoPlay
        muted={soundOn !== true}
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      <div className="relative z-10 px-6 pb-16 text-center">
        <p className="mb-2 text-[10px] tracking-[0.5em] text-[var(--color-gold)]">OPENING · 出海</p>
        <p className="text-2xl font-bold tracking-[0.35em] text-[var(--color-paper)]">鹿港漁人</p>
        <div className="mx-auto mt-4 h-px w-10 bg-[var(--color-gold)]" />
      </div>
    </div>
  );
}

export function IntroGate() {
  const { soundOn } = useSound();
  const [show, setShow] = useState(true);
  if (soundOn === null) return null;
  if (!show) return null;
  return <IntroOverlay onDone={() => setShow(false)} />;
}
