import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { HeroCta } from "@/components/HeroCta";
import { HeroCover } from "@/components/HeroCover";
import { SoundProvider } from "@/components/SoundContext";

afterEach(cleanup);

describe("HeroCta", () => {
  it("large Facebook and Pixnet CTAs", () => {
    render(<HeroCta />);
    const fb = screen.getByRole("link", { name: "Facebook 粉專" });
    expect(fb).toHaveAttribute("href", expect.stringContaining("facebook.com"));
    const pix = screen.getByRole("link", { name: "痞客邦部落格" });
    expect(pix).toHaveAttribute("href", expect.stringContaining("pixnet.net"));
  });
});

describe("HeroCover", () => {
  beforeEach(() => {
    window.HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve()) as never;
    window.HTMLMediaElement.prototype.pause = vi.fn();
  });

  it("paper plate with big FB + Pixnet first (no date dump)", () => {
    const { container } = render(
      <SoundProvider>
        <HeroCover />
      </SoundProvider>,
    );
    expect(screen.getByRole("heading", { name: "鹿港漁人" })).toBeTruthy();
    expect(screen.getByText("磯上十幾年。潮汐不等人。")).toBeTruthy();
    expect(screen.getByTestId("cta-facebook")).toHaveAttribute(
      "href",
      expect.stringContaining("facebook.com"),
    );
    expect(screen.getByTestId("cta-pixnet")).toHaveAttribute(
      "href",
      expect.stringContaining("pixnet.net"),
    );
    expect(screen.getByRole("link", { name: "打開釣場地球" })).toHaveAttribute("href", "#map");
    expect(screen.getByRole("link", { name: "看裝備牆" })).toHaveAttribute("href", "#gear");
    expect(screen.queryByText("磯釣系列")).toBeNull();
    expect(screen.queryByText("釣友會想傳的幾張")).toBeNull();
    expect(container.querySelector('video[src="/media/cover-loop.mp4"]')).toBeTruthy();
  });
});
