import { describe, it, expect } from "vitest";
import { getSite, getStories } from "@/lib/content";

describe("content", () => {
  it("exposes required CTAs and credit", () => {
    const site = getSite();
    expect(site.title).toBe("鹿港漁人");
    expect(site.primaryCta).toBe("加入鹿港漁人");
    expect(site.storyCta).toBe("看漁人故事");
    expect(site.footerCredit).toBe("製作人：愛爸爸的女兒C");
  });

  it("has at least three story chapters", () => {
    expect(getStories().length).toBeGreaterThanOrEqual(3);
  });
});
