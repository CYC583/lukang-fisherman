"use client";

import { useEffect, useRef } from "react";
import { getSite } from "@/lib/content";
import { sfx } from "@/lib/sfx";
import { useSoundOptional } from "./SoundContext";

/**
 * Magazine title page — paper-white + mist-gold.
 * First actions: large Facebook + Pixnet. Story/map CTAs secondary.
 * No finger/gyro parallax. No icon row.
 */
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
    const id = window.setInterval(() => sfx.wave(), 12000);
    return () => window.clearInterval(id);
  }, [soundOn]);

  const tap = () => {
    if (soundOn === true) sfx.tap();
  };

  return (
    <section
      id="cover"
      aria-label="扉頁"
      className="relative flex min-h-dvh w-full snap-start flex-col items-center justify-center overflow-hidden bg-[var(--color-indigo)]"
    >
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <video
          ref={videoRef}
          src="/media/cover-loop.mp4"
          poster="/media/hero-cover.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full scale-[1.04] object-cover opacity-[0.48]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(11,28,44,0.55) 0%, rgba(11,28,44,0.28) 42%, rgba(11,28,44,0.62) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 38%, rgba(247,244,237,0.14) 0%, transparent 58%)",
            animation: "mistShift 9s ease-in-out infinite",
          }}
        />
      </div>

      <div
        className="relative z-10 mx-auto flex w-[min(92vw,22.5rem)] flex-col items-center px-7 py-9 text-center"
        style={{
          background: "rgba(247,244,237,0.92)",
          border: "1px solid rgba(197,160,89,0.55)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.35) inset",
        }}
      >
        <p className="mag-label mb-6">{site.eyebrow}</p>

        <h1
          className="mag-title leading-none text-[var(--color-charcoal)]"
          style={{ fontSize: "clamp(2.35rem, 11vw, 2.85rem)" }}
        >
          {site.title}
        </h1>

        <div className="mag-rule my-5" aria-hidden />

        <p
          className="mb-7 font-semibold leading-[1.55] text-[var(--color-charcoal)]"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.25rem, 5.8vw, 1.5rem)",
            letterSpacing: "0.08em",
            maxWidth: "16em",
          }}
        >
          {site.tagline}
        </p>

        {/* Big destination CTAs — FB + Pixnet first */}
        <div className="flex w-full flex-col gap-2.5">
          <a
            href={site.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={tap}
            data-testid="cta-facebook"
            className="flex w-full items-center justify-center font-bold transition active:opacity-90"
            style={{
              minHeight: 56,
              background: "var(--color-gold)",
              color: "var(--color-indigo)",
              fontSize: "1rem",
              letterSpacing: "0.22em",
              fontFamily: "var(--font-display)",
            }}
          >
            {site.primaryCta}
          </a>
          <a
            href={site.pixnetUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={tap}
            data-testid="cta-pixnet"
            className="flex w-full items-center justify-center font-bold transition active:opacity-90"
            style={{
              minHeight: 56,
              background: "var(--color-indigo)",
              color: "var(--color-paper)",
              fontSize: "1rem",
              letterSpacing: "0.22em",
              fontFamily: "var(--font-display)",
            }}
          >
            {site.secondaryCta}
          </a>
        </div>

        {/* Quiet secondary — map + story, not dates */}
        <div className="mt-5 flex w-full flex-col gap-2">
          <a
            href="#map"
            onClick={tap}
            className="flex w-full items-center justify-center transition active:opacity-90"
            style={{
              minHeight: 44,
              border: "1px solid rgba(197,160,89,0.75)",
              color: "var(--color-charcoal)",
              background: "transparent",
              fontSize: "0.8125rem",
              letterSpacing: "0.28em",
              fontFamily: "var(--font-display)",
            }}
          >
            {site.mapCta}
          </a>
          <a
            href="#gear"
            onClick={tap}
            className="flex w-full items-center justify-center transition active:opacity-90"
            style={{
              minHeight: 40,
              color: "rgba(26,26,26,0.55)",
              fontSize: "0.75rem",
              letterSpacing: "0.28em",
              fontFamily: "var(--font-display)",
            }}
          >
            {site.storyCta}
          </a>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-7 left-0 right-0 flex justify-center" aria-hidden>
        <span
          className="block h-8 w-px"
          style={{ background: "linear-gradient(180deg, transparent, rgba(197,160,89,0.7))" }}
        />
      </div>
    </section>
  );
}
