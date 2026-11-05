import { getSite } from "@/lib/content";

export function BlogCta() {
  const site = getSite();
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-4 px-6 py-16 text-center">
      <p className="text-sm tracking-[0.3em] text-[var(--color-gold)]">― 釣行，未完待續 ―</p>
      <a
        href={site.facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full rounded-full border border-[var(--color-indigo)] px-6 py-3 tracking-widest transition active:scale-95"
      >
        {site.afterStoryCta}
      </a>
    </div>
  );
}
