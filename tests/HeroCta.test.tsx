import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { HeroCta } from "@/components/HeroCta";
import { HeroCover } from "@/components/HeroCover";

afterEach(cleanup);

describe("HeroCta", () => {
  it("shows join fan page as primary and story as secondary", () => {
    render(<HeroCta />);
    const join = screen.getByRole("link", { name: "加入鹿港漁人" });
    expect(join).toHaveAttribute("href", expect.stringContaining("facebook.com"));
    expect(join).toHaveAttribute("target", "_blank");
    expect(join).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: "看漁人故事" })).toHaveAttribute("href", "#story");
  });
});

describe("HeroCover", () => {
  it("magazine cover has vertical title energy and only two CTAs (no triple bottom nav)", () => {
    const { container } = render(<HeroCover />);
    expect(screen.getByRole("heading", { name: "鹿港漁人" })).toBeTruthy();
    expect(screen.getByText("LUKANG FISHERMAN")).toBeTruthy();
    expect(screen.getByRole("link", { name: "加入鹿港漁人" })).toHaveAttribute(
      "href",
      expect.stringContaining("facebook.com"),
    );
    expect(screen.getByRole("link", { name: "看漁人故事" })).toHaveAttribute("href", "#story");
    expect(screen.queryByText("磯釣系列")).toBeNull();
    expect(screen.queryByText("工藝細節")).toBeNull();
    expect(screen.queryByText("鹿港故事")).toBeNull();
    expect(container.querySelector('img[src="/media/hero-cover.jpg"]')).toBeTruthy();
  });
});
