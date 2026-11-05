import { getSite } from "@/lib/content";

/** Dual CTAs — primary story (#logbook), secondary FB only. */
export function HeroCta() {
  const site = getSite();
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <a
        href="#logbook"
        className="flex min-h-[56px] items-center justify-center rounded-full bg-[var(--color-gold)] px-6 text-[17px] font-bold tracking-[0.28em] text-[var(--color-indigo)]"
      >
        {site.primaryCta}
      </a>
      <a
        href={site.facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-[52px] items-center justify-center rounded-full border border-[var(--color-gold)]/75 px-6 text-base tracking-[0.28em] text-[var(--color-indigo)]"
      >
        {site.secondaryCta}
      </a>
    </div>
  );
}
