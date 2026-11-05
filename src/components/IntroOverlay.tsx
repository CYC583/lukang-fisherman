"use client";

import { useEffect, useRef, useState } from "react";
import { SkipIntro } from "./SkipIntro";

const DURATION_MS = 2800;

export function IntroOverlay({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    onDone();
  };

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      finish();
      return;
    }
    const fade = setTimeout(() => setLeaving(true), DURATION_MS - 500);
    const end = setTimeout(finish, DURATION_MS);
    return () => {
      clearTimeout(fade);
      clearTimeout(end);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      role="dialog"
      aria-label="開場"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[var(--color-paper)] text-[var(--color-indigo)] transition-opacity duration-500 ${leaving ? "opacity-0" : "opacity-100"}`}
    >
      <SkipIntro onSkip={finish} />
      <svg width="160" height="40" viewBox="0 0 160 40" aria-hidden className="animate-pulse">
        <path d="M0 20 Q20 5 40 20 T80 20 T120 20 T160 20" fill="none" stroke="var(--color-gold)" strokeWidth="1.5" />
      </svg>
      <p className="text-3xl font-bold tracking-[0.4em] animate-[fadeIn_1.2s_ease-out]">鹿港漁人</p>
      <div className="h-px w-12 bg-[var(--color-gold)]" />
    </div>
  );
}

export function IntroGate() {
  const [show, setShow] = useState(true);
  return show ? <IntroOverlay onDone={() => setShow(false)} /> : null;
}
