import { IntroGate } from "@/components/IntroOverlay";
import { HeroCta } from "@/components/HeroCta";
import { getSite } from "@/lib/content";

export default function Home() {
  const site = getSite();
  return (
    <main className="min-h-dvh bg-[var(--color-paper)] text-[var(--color-indigo)]">
      <IntroGate />
      <section className="flex min-h-dvh flex-col items-center justify-center gap-8 p-6">
        <h1 className="text-4xl font-bold tracking-[0.3em]">{site.title}</h1>
        <div className="h-px w-16 bg-[var(--color-gold)]" />
        <HeroCta />
      </section>
    </main>
  );
}
