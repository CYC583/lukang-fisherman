import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HeroCta } from "@/components/HeroCta";

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
