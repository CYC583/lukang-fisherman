import { getSite } from "@/lib/content";

export function SiteFooter() {
  const site = getSite();
  return (
    <footer className="border-t border-[var(--color-gold)]/40 px-6 py-10 text-center text-sm tracking-widest text-[var(--color-indigo)]/70">
      <p>{site.footerCredit}</p>
    </footer>
  );
}
