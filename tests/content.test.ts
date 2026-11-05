import { describe, it, expect } from "vitest";
import { getSite, getStories, getMemories, getLogbook, getSpots, getGear, getSpeciesAtlas } from "@/lib/content";

describe("content", () => {
  it("exposes hard CTAs and credit", () => {
    const site = getSite();
    expect(site.title).toBe("鹿港漁人");
    expect(site.primaryCta).toBe("Facebook 粉專");
    expect(site.secondaryCta).toBe("痞客邦部落格");
    expect(site.mapCta).toBe("打開釣場地球");
    expect(site.tagline).toBe("磯上十幾年。潮汐不等人。");
    expect(site.footerCredit).toBe("製作人：愛爸爸的女兒C");
    expect(site.facebookUrl).toContain("facebook.com");
    expect(site.pixnetUrl).toContain("pixnet.net");
    expect(site.soundYes).toMatch(/開啟聲音/);
  });

  it("has opener montage + album log + editorial memories + spots", () => {
    expect(getStories()[0].media?.src).toContain("opener-montage");
    expect(getLogbook().length).toBeGreaterThanOrEqual(3);
    expect(getMemories().length).toBeGreaterThanOrEqual(3);
    expect(getMemories().every((m) => m.title.length > 0)).toBe(true);
    expect(getSpots().length).toBeGreaterThanOrEqual(1);
    expect(getSpots().every((s) => typeof s.lat === "number" && typeof s.lng === "number")).toBe(
      true,
    );
    expect(
      getSpots().every(
        (s) =>
          (s.sourcePlatform === "facebook" || s.sourcePlatform === "pixnet") &&
          typeof s.postUrl === "string" &&
          typeof s.image === "string",
      ),
    ).toBe(true);
  });

  it("kiroku images do not duplicate logbook images", () => {
    const logImgs = new Set(getLogbook().map((e) => e.image));
    const memImgs = getMemories().map((m) => m.image);
    for (const img of memImgs) {
      expect(logImgs.has(img)).toBe(false);
    }
    expect(new Set(memImgs).size).toBe(memImgs.length);
  });

  it("gear wall + species atlas from spots", () => {
    expect(getGear().length).toBeGreaterThanOrEqual(4);
    expect(getGear().some((g) => /SUNLINE/i.test(g.name + g.brand))).toBe(true);
    const atlas = getSpeciesAtlas();
    expect(atlas.length).toBeGreaterThanOrEqual(3);
    expect(atlas.every((e) => e.spots.length >= 1)).toBe(true);
  });
});
