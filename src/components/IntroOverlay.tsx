"use client";

import { useEffect, useRef, useState } from "react";
import { SkipIntro } from "./SkipIntro";
import { useSound } from "./SoundContext";

const OPENER_SRC = "/media/opener-montage.mp4";

/** Movie-grade hard-cut trailer. No PPT text carousel. Starts after sound gate. */
export function IntroOverlay({ onDone }: { onDone: () => void }) {
  const { soundOn, markIntroDone } = useSound();
  const [leaving, setLeaving] = useState(false);
  const done = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    markIntroDone();
    setLeaving(true);
    onDone();
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    // Mute only if she chose silent enter; otherwise play with baked BGM
    v.muted = soundOn !== true;
    v.volume = soundOn === true ? 1 : 0;
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, [soundOn]);

  return (
    <div
      role="dialog"
      aria-label="電影開場"
      className={`fixed inset-0 z-[70] overflow-hidden bg-black transition-opacity duration-500 ${leaving ? "opacity-0" : "opacity-100"}`}
    >
      <SkipIntro onSkip={finish} />
      <video
        ref={videoRef}
        src={OPENER_SRC}
        poster="/media/hero-cover.jpg"
        playsInline
        preload="auto"
        onEnded={finish}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Max one short gold line — appears briefly near settle */}
      <div className="pointer-events-none absolute inset-x-0 bottom-16 flex justify-center px-8">
        <p className="text-center text-[11px] tracking-[0.4em] text-[var(--color-gold)]/90 drop-shadow">
          磯釣，是與海的靜默對話。
        </p>
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
