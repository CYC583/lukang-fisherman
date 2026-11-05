import { describe, it, expect } from "vitest";
import { FACEBOOK_URL, PIXNET_URL, BLOG_URL } from "@/lib/urls";

describe("urls", () => {
  it("points to Facebook fan page and Pixnet blog", () => {
    expect(FACEBOOK_URL).toBe(
      "https://www.facebook.com/people/%E9%B9%BF%E6%B8%AF%E6%BC%81%E4%BA%BA/100063821466190/",
    );
    expect(decodeURIComponent(FACEBOOK_URL)).toContain("鹿港漁人");
    expect(PIXNET_URL).toBe("https://nokia1301471980.pixnet.net/blog");
    expect(BLOG_URL).toBe(PIXNET_URL);
  });
});
