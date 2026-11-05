import { describe, it, expect } from "vitest";
import { getSite, getStories, getMemories } from "@/lib/content";

describe("content", () => {
  it("exposes required CTAs and credit", () => {
    const site = getSite();
    expect(site.title).toBe("鹿港漁人");
    expect(site.primaryCta).toBe("加入鹿港漁人");
    expect(site.storyCta).toBe("看漁人故事");
    expect(site.footerCredit).toBe("製作人：愛爸爸的女兒C");
    expect(site.afterStoryCta).toContain("粉專");
    expect(site.facebookUrl).toContain("facebook.com");
    expect(site.facebookUrl).not.toMatch(/pixnet/i);
  });

  it("has cinematic story chapters with narration lines", () => {
    const stories = getStories();
    expect(stories.length).toBeGreaterThanOrEqual(3);
    for (const s of stories) {
      expect(s.narration.length).toBeGreaterThanOrEqual(2);
      expect(s.media?.src).toBeTruthy();
    }
  });

  it("has memorial postcard memories from public FB media", () => {
    const mem = getMemories();
    expect(mem.length).toBeGreaterThanOrEqual(3);
    for (const m of mem) {
      expect(m.image).toMatch(/^\/media\/fb\//);
      expect(m.blurb.length).toBeGreaterThan(8);
    }
  });
});
