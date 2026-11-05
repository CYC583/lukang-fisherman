import { getSite } from "@/lib/content";

/** Large destination CTAs — Facebook + Pixnet. */
export function HeroCta() {
  const site = getSite();
  return (
    <div className="flex w-full max-w-sm flex-col gap-2.5">
      <a
        href={site.facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center font-bold"
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
        className="flex items-center justify-center font-bold"
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
  );
}
