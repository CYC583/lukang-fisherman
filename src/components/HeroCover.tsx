"use client";

import { useEffect, useRef } from "react";
import { getSite } from "@/lib/content";
import { sfx } from "@/lib/sfx";
import { useSoundOptional } from "./SoundContext";

/** Paper-white mist-gold cover. Soft loop under UI. Big dual CTAs. Native scroll only. */
export function HeroCover() {
  const site = getSite();
  const { soundOn } = useSoundOptional();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, []);

  useEffect(() => {
    if (soundOn !== true) return;
    sfx.wave();
    const id = window.setInterval(() => sfx.wave(), 9000);
    return () => window.clearInterval(id);
  }, [soundOn]);

  const tap = () => {
    if (soundOn === true) sfx.tap();
  };

  return (
    <section
      id="cover"
      aria-label="封面"
      className="relative flex min-h-dvh w-full snap-start flex-col items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={videoRef}
          src="/media/cover-loop.mp4"
          poster="/media/hero-cover.jpg"
          aria-label="霧中海岸"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full scale-105 object-cover blur-[1.5px]"
        />
      </div>

      {/* Mist paper panel */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(244,241,234,0.18)_0%,rgba(11,28,44,0.55)_55%,rgba(11,28,44,0.82)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-indigo)]/35 via-transparent to-[var(--color-indigo)]/75" />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center px-6 py-16 text-center">
        <p className="mb-5 text-[10px] tracking-[0.55em] text-[var(--color-gold)]/90">ISOFISHING · TAIWAN</p>

        <h1
          className="font-bold leading-none text-[var(--color-gold)]"
          style={{
            writingMode: "vertical-rl",
            letterSpacing: "0.35em",
            fontSize: "clamp(2.75rem, 12vw, 3.75rem)",
            textShadow: "0 2px 28px rgba(11,28,44,0.6)",
          }}
        >
          {site.title}
        </h1>

        <p className="mt-5 text-[11px] tracking-[0.45em] text-[var(--color-paper)]/85">{site.subtitle}</p>

        {/* Gold hairline */}
        <div className="my-8 h-12 w-px bg-[var(--color-gold)]/85" aria-hidden />

        <p className="mb-8 max-w-[14rem] text-[12px] leading-relaxed tracking-[0.18em] text-[var(--color-paper)]/80">
          {site.tagline}
        </p>

        {/* Dual CTAs — primary story anchor, secondary FB only */}
        <div className="flex w-full flex-col gap-3">
          <a
            href="#logbook"
            onClick={tap}
            className="flex min-h-[56px] w-full items-center justify-center rounded-full bg-[var(--color-gold)] px-6 text-center text-base font-bold tracking-[0.28em] text-[var(--color-indigo)] shadow-[0_10px_32px_rgba(198,167,94,0.4)] transition active:scale-[0.98]"
          >
            {site.primaryCta}
          </a>
          <a
            href={site.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={tap}
            className="flex min-h-[52px] w-full items-center justify-center rounded-full border border-[var(--color-gold)]/75 bg-[var(--color-paper)]/10 px-6 text-center text-sm tracking-[0.28em] text-[var(--color-paper)] backdrop-blur-sm transition active:scale-[0.98]"
          >
            {site.secondaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}
