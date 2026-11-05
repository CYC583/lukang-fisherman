"use client";

import { getSite } from "@/lib/content";

/** Magazine-cover hero matching the approved 紙白＋霧金 mockup. */
export function HeroCover() {
  const site = getSite();
  return (
    <section
      aria-label="封面"
      className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden"
    >
      {/* Full-bleed cover photo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/media/hero-cover.jpg"
        alt="鹿港漁人礁岩海岸"
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
      />
      {/* Soft paper wash + vignette so gold type pops */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-indigo)]/45 via-[var(--color-indigo)]/25 to-[var(--color-indigo)]/70" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(11,28,44,0.55)_100%)]" />

      <div className="relative z-10 flex max-w-sm flex-col items-center px-6 py-16 text-center">
        {/* Vertical gold title block — magazine spine feel */}
        <div className="flex flex-col items-center gap-5">
          <p className="text-[10px] tracking-[0.55em] text-[var(--color-gold)]/90">ISOFISHING · TAIWAN</p>
          <h1
            className="font-bold leading-none text-[var(--color-gold)]"
            style={{
              writingMode: "vertical-rl",
              letterSpacing: "0.35em",
              fontSize: "clamp(2.75rem, 12vw, 3.75rem)",
              textShadow: "0 2px 24px rgba(11,28,44,0.55)",
            }}
          >
            {site.title}
          </h1>
          <p className="text-[11px] tracking-[0.45em] text-[var(--color-paper)]/85">{site.subtitle}</p>
        </div>

        {/* Gold line / wave zone → TWO CTAs (no bottom triple icons) */}
        <div className="mt-10 flex w-full flex-col items-center gap-3">
          <div className="mb-2 h-10 w-px bg-[var(--color-gold)]/80" aria-hidden />
          <a
            href={site.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-full bg-[var(--color-gold)] px-6 py-4 text-center text-base font-bold tracking-[0.28em] text-[var(--color-indigo)] shadow-[0_8px_28px_rgba(198,167,94,0.35)] transition active:scale-95"
          >
            {site.primaryCta}
          </a>
          <a
            href="#story"
            className="block w-full rounded-full border border-[var(--color-gold)]/70 bg-[var(--color-paper)]/10 px-6 py-3.5 text-center text-sm tracking-[0.28em] text-[var(--color-paper)] backdrop-blur-sm transition active:scale-95"
          >
            {site.storyCta}
          </a>
        </div>
      </div>

      {/* Soft seafoam wave hint at bottom — decorative only, not a 3-button nav */}
      <svg
        className="pointer-events-none absolute bottom-0 left-0 w-full opacity-40"
        viewBox="0 0 400 48"
        preserveAspectRatio="none"
        aria-hidden
        height="36"
      >
        <path
          d="M0 30 Q50 10 100 28 T200 28 T300 28 T400 28 V48 H0 Z"
          fill="var(--color-seafoam)"
        />
      </svg>
    </section>
  );
}
