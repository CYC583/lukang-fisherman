"use client";

import { useEffect, useRef, useState } from "react";
import { SkipIntro } from "./SkipIntro";
import { useSound } from "./SoundContext";

const OPENER_SRC = "/media/opener-montage.mp4";

/** Hard-cut film trailer. No mid-film captions — cover owns the attitude line. */
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
