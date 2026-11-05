import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { HeroCta } from "@/components/HeroCta";
import { HeroCover } from "@/components/HeroCover";
import { SoundProvider } from "@/components/SoundContext";

afterEach(cleanup);

describe("HeroCta", () => {
  it("shows FB primary and story secondary", () => {
    render(<HeroCta />);
    const join = screen.getByRole("link", { name: "看更多出海日常" });
    expect(join).toHaveAttribute("href", expect.stringContaining("facebook.com"));
    expect(join).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: "看漁人故事" })).toHaveAttribute("href", "#story");
  });
});

describe("HeroCover", () => {
  it("animated magazine cover with two CTAs and looping video (no triple bottom nav)", () => {
    const { container } = render(
      <SoundProvider>
        <HeroCover />
      </SoundProvider>,
    );
    expect(screen.getByRole("heading", { name: "鹿港漁人" })).toBeTruthy();
    expect(screen.getByText("LUKANG FISHERMAN")).toBeTruthy();
    expect(screen.getByRole("link", { name: "看更多出海日常" })).toHaveAttribute(
      "href",
      expect.stringContaining("facebook.com"),
    );
    expect(screen.getByRole("link", { name: "看漁人故事" })).toHaveAttribute("href", "#story");
    expect(screen.queryByText("磯釣系列")).toBeNull();
    expect(container.querySelector('video[src="/media/dad-cover-cinematic.mp4"]')).toBeTruthy();
  });
});
