import { describe, it, expect } from "vitest";
import { getSite, getStories, getMemories, getLogbook, getStats, getSpecies, getGuess } from "@/lib/content";

describe("content", () => {
  it("exposes required CTAs and credit", () => {
    const site = getSite();
    expect(site.title).toBe("鹿港漁人");
    expect(site.primaryCta).toBe("看更多出海日常");
    expect(site.storyCta).toBe("看漁人故事");
    expect(site.footerCredit).toBe("製作人：愛爸爸的女兒C");
    expect(site.facebookUrl).toContain("facebook.com");
    expect(site.facebookUrl).not.toMatch(/pixnet/i);
  });

  it("has cinematic stories, logbook, stats, species, guess", () => {
    expect(getStories().length).toBeGreaterThanOrEqual(3);
    expect(getLogbook().length).toBeGreaterThanOrEqual(3);
    expect(getStats().items.length).toBeGreaterThanOrEqual(2);
    expect(getSpecies().length).toBeGreaterThanOrEqual(2);
    expect(getGuess().choices.length).toBeGreaterThanOrEqual(2);
    expect(getMemories().length).toBeGreaterThanOrEqual(3);
  });
});
