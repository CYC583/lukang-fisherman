import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { HeroCta } from "@/components/HeroCta";
import { HeroCover } from "@/components/HeroCover";
import { SoundProvider } from "@/components/SoundContext";

afterEach(cleanup);

describe("HeroCta", () => {
  it("primary story anchor and FB secondary only", () => {
    render(<HeroCta />);
    expect(screen.getByRole("link", { name: "看漁人故事" })).toHaveAttribute("href", "#logbook");
    const fb = screen.getByRole("link", { name: "看更多出海日常" });
    expect(fb).toHaveAttribute("href", expect.stringContaining("facebook.com"));
  });
});

describe("HeroCover", () => {
  beforeEach(() => {
    window.HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve()) as never;
    window.HTMLMediaElement.prototype.pause = vi.fn();
  });

  it("paper panel cover with dual CTAs and soft loop (no triple nav)", () => {
    const { container } = render(
      <SoundProvider>
        <HeroCover />
      </SoundProvider>,
    );
    expect(screen.getByRole("heading", { name: "鹿港漁人" })).toBeTruthy();
    expect(screen.getByText("磯上十幾年。海不等人。")).toBeTruthy();
    expect(screen.getByRole("link", { name: "看漁人故事" })).toHaveAttribute("href", "#logbook");
    expect(screen.getByRole("link", { name: "看更多出海日常" })).toHaveAttribute(
      "href",
      expect.stringContaining("facebook.com"),
    );
    expect(screen.queryByText("磯釣系列")).toBeNull();
    expect(container.querySelector('video[src="/media/cover-loop.mp4"]')).toBeTruthy();
  });
});
