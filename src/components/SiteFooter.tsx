import { getSite } from "@/lib/content";

export function SiteFooter() {
  const site = getSite();
  return (
    <footer
      className="px-6 py-12 text-center"
      style={{
        background: "#070e16",
        borderTop: "1px solid rgba(197,160,89,0.28)",
        fontFamily: "var(--font-display)",
        fontSize: "0.75rem",
        letterSpacing: "0.32em",
        color: "rgba(247,244,237,0.55)",
      }}
    >
      <p>{site.footerCredit}</p>
    </footer>
  );
}
