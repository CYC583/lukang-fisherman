import { getSite } from "@/lib/content";

export function SiteFooter() {
  const site = getSite();
  return (
    <footer
      className="border-t px-6 py-12 text-center text-[var(--color-indigo)]/55"
      style={{
        borderColor: "var(--color-gold-line)",
        fontFamily: "var(--font-display)",
        fontSize: "0.75rem",
        letterSpacing: "0.32em",
      }}
    >
      <p>{site.footerCredit}</p>
    </footer>
  );
}
