import { SoundProvider } from "@/components/SoundContext";
import { SoundGate } from "@/components/SoundGate";
import { IntroGate } from "@/components/IntroOverlay";
import { HeroCover } from "@/components/HeroCover";
import { FishingMap } from "@/components/FishingMap";
import { FbShowcase } from "@/components/FbShowcase";
import { SoundAura } from "@/components/SoundAura";
import { AmbientAudio } from "@/components/AmbientAudio";
import { SiteFooter } from "@/components/SiteFooter";

export default function Home() {
  return (
    <SoundProvider>
      <main className="min-h-dvh snap-y snap-mandatory bg-[var(--color-paper)] text-[var(--color-indigo)]">
        <SoundGate />
        <IntroGate />
        <SoundAura />
        <HeroCover />
        <FishingMap />
        <FbShowcase />
        <SiteFooter />
        <AmbientAudio />
      </main>
    </SoundProvider>
  );
}
