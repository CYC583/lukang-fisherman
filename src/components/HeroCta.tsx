import { getSite } from "@/lib/content";

export function HeroCta() {
  const site = getSite();
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <a
        href={site.facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full rounded-full bg-[var(--color-gold)] px-6 py-4 text-center text-lg font-bold tracking-widest text-[var(--color-indigo)] shadow-md transition active:scale-95"
      >
        {site.primaryCta}
      </a>
      <a
        href="#story"
        className="block w-full rounded-full border border-[var(--color-indigo)]/40 px-6 py-3 text-center tracking-widest text-[var(--color-indigo)] transition active:scale-95"
      >
        {site.storyCta}
      </a>
    </div>
  );
}
