"use client";

import { useEffect, useRef, useState } from "react";
import { SkipIntro } from "./SkipIntro";
import { useSound } from "./SoundContext";

const OPENER_SRC = "/media/opener-montage.mp4";

/** Hard-cut film trailer. No PPT captions. Audio only after sound gate. */
export function IntroOverlay({ onDone }: { onDone: () => void }) {
  const { soundOn, markIntroDone } = useSound();
  const [leaving, setLeaving] = useState(false);
  const [showLine, setShowLine] = useState(false);
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
    // Attitude line only after climax (~13.6s) — never in first 5s
    const lineTimer = window.setTimeout(() => setShowLine(true), 14000);
    return () => window.clearTimeout(lineTimer);
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
      {showLine && (
        <div className="pointer-events-none absolute inset-x-0 bottom-20 flex justify-center px-8">
          <p className="text-center text-[20px] font-semibold tracking-[0.08em] text-[#F4F1EA] drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
            磯上十年。海不等人。
          </p>
        </div>
      )}
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
