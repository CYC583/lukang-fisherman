import { SoundProvider } from "@/components/SoundContext";
import { SoundGate } from "@/components/SoundGate";
import { IntroGate } from "@/components/IntroOverlay";
import { HeroCover } from "@/components/HeroCover";
import { StoryCinema } from "@/components/StoryCinema";
import { SeaLogbook } from "@/components/SeaLogbook";
import { SeasonStats } from "@/components/SeasonStats";
import { SpeciesGuide } from "@/components/SpeciesGuide";
import { GuessWeight } from "@/components/GuessWeight";
import { MemoryPostcards } from "@/components/MemoryPostcards";
import { AmbientAudio } from "@/components/AmbientAudio";
import { SiteFooter } from "@/components/SiteFooter";

export default function Home() {
  return (
    <SoundProvider>
      <main className="min-h-dvh bg-[var(--color-paper)] text-[var(--color-indigo)]">
        <SoundGate />
        <IntroGate />
        <HeroCover />
        <StoryCinema />
        <SeaLogbook />
        <SeasonStats />
        <SpeciesGuide />
        <GuessWeight />
        <MemoryPostcards />
        <SiteFooter />
        <AmbientAudio />
      </main>
    </SoundProvider>
  );
}
