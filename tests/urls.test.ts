import { describe, it, expect } from "vitest";
import { FACEBOOK_URL } from "@/lib/urls";

describe("urls", () => {
  it("points only to the public Facebook fan page", () => {
    expect(FACEBOOK_URL).toBe(
      "https://www.facebook.com/people/%E9%B9%BF%E6%B8%AF%E6%BC%81%E4%BA%BA/100063821466190/",
    );
    expect(decodeURIComponent(FACEBOOK_URL)).toContain("鹿港漁人");
    expect(FACEBOOK_URL).not.toMatch(/pixnet/i);
  });
});
