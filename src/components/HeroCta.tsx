import { getSite } from "@/lib/content";

/** Dual CTAs — primary story (#logbook), secondary FB only. */
export function HeroCta() {
  const site = getSite();
  return (
    <div className="flex w-full max-w-sm flex-col gap-2.5">
      <a
        href="#logbook"
        className="flex items-center justify-center font-bold"
        style={{
          minHeight: 52,
          background: "var(--color-gold)",
          color: "var(--color-indigo)",
          fontSize: "0.9375rem",
          letterSpacing: "0.28em",
          fontFamily: "var(--font-display)",
        }}
      >
        {site.primaryCta}
      </a>
      <a
        href={site.facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center"
        style={{
          minHeight: 48,
          border: "1px solid rgba(197,160,89,0.75)",
          color: "var(--color-indigo)",
          fontSize: "0.875rem",
          letterSpacing: "0.28em",
          fontFamily: "var(--font-display)",
        }}
      >
        {site.secondaryCta}
      </a>
    </div>
  );
}
