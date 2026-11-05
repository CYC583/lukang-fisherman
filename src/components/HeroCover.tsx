"use client";

import { useEffect, useRef } from "react";
import { getSite } from "@/lib/content";
import { sfx } from "@/lib/sfx";
import { useSoundOptional } from "./SoundContext";

/** Cold antique-gold cover over soft-blurred sea loop. Big dual CTAs. No soft postcard vibe. */
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
    const id = window.setInterval(() => sfx.wave(), 10000);
    return () => window.clearInterval(id);
  }, [soundOn]);

  const tap = () => {
    if (soundOn === true) sfx.tap();
  };

  return (
    <section
      id="cover"
      aria-label="封面"
      className="relative flex min-h-dvh w-full snap-start flex-col items-center justify-center overflow-hidden bg-[var(--color-indigo)]"
    >
      {/* Soft-loop base: blur 12–20px, opacity ~30% under panel */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={videoRef}
          src="/media/cover-loop.mp4"
          poster="/media/hero-cover.jpg"
          aria-hidden
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-[16px]"
        />
      </div>
      <div className="absolute inset-0 bg-[var(--color-indigo)]/55" />

      {/* Paper panel — center ~55–62vh */}
      <div
        className="relative z-10 mx-5 flex w-[calc(100%-40px)] max-w-[360px] flex-col items-center rounded-[18px] border px-7 py-7 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
        style={{
          background: "rgba(252,250,245,0.88)",
          borderColor: "rgba(197,160,89,0.55)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          marginTop: "8vh",
        }}
      >
        <p
          className="mb-3 text-[12px] font-medium tracking-[0.35em]"
          style={{ color: "#C5A059" }}
        >
          {site.eyebrow}
        </p>

        <h1
          className="font-bold leading-none tracking-[0.2em]"
          style={{ color: "#1a1a1a", fontSize: "clamp(1.75rem, 8vw, 2.125rem)" }}
        >
          {site.title}
        </h1>

        <p className="mt-2 text-[11px] tracking-[0.4em]" style={{ color: "#666" }}>
          {site.subtitle}
        </p>

        <div className="my-4 h-px w-10" style={{ background: "rgba(197,160,89,0.7)" }} aria-hidden />

        {/* One attitude line — not lyric */}
        <p className="mb-6 text-[14px] leading-relaxed tracking-[0.12em]" style={{ color: "#444" }}>
          {site.tagline}
        </p>

        <div className="flex w-full flex-col gap-3">
          <a
            href="#logbook"
            onClick={tap}
            className="flex w-full items-center justify-center rounded-full font-bold tracking-[0.22em] transition active:scale-[0.98]"
            style={{
              minHeight: 54,
              background: "#C5A059",
              color: "#0B1C2C",
              fontSize: "0.95rem",
            }}
          >
            {site.primaryCta}
          </a>
          <a
            href={site.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={tap}
            className="flex w-full items-center justify-center rounded-full tracking-[0.22em] transition active:scale-[0.98]"
            style={{
              minHeight: 50,
              border: "1.5px solid rgba(197,160,89,0.85)",
              color: "#1a1a1a",
              background: "transparent",
              fontSize: "0.875rem",
            }}
          >
            {site.secondaryCta}
          </a>
        </div>
      </div>

      <div className="h-[34px]" aria-hidden />
    </section>
  );
}
