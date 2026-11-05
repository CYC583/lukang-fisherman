import { describe, it, expect } from "vitest";
import { getSite, getStories, getMemories, getLogbook } from "@/lib/content";

describe("content", () => {
  it("exposes hard CTAs and credit", () => {
    const site = getSite();
    expect(site.title).toBe("鹿港漁人");
    expect(site.primaryCta).toBe("看漁人故事");
    expect(site.secondaryCta).toBe("看更多出海日常");
    expect(site.tagline).toMatch(/磯上十年/);
    expect(site.footerCredit).toBe("製作人：愛爸爸的女兒C");
    expect(site.facebookUrl).toContain("facebook.com");
  });

  it("has opener montage + album log + memorials", () => {
    expect(getStories()[0].media?.src).toContain("opener-montage");
    expect(getLogbook().length).toBeGreaterThanOrEqual(3);
    expect(getMemories().length).toBeGreaterThanOrEqual(3);
  });
});
