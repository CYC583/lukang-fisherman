import type { ReactNode } from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { SiteFooter } from "@/components/SiteFooter";
import { IntroOverlay } from "@/components/IntroOverlay";
import { SoundProvider } from "@/components/SoundContext";
import { FbShowcase } from "@/components/FbShowcase";

afterEach(cleanup);

function wrap(ui: ReactNode) {
  return <SoundProvider>{ui}</SoundProvider>;
}

describe("Film opener", () => {
  beforeEach(() => {
    window.HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve()) as never;
    window.HTMLMediaElement.prototype.pause = vi.fn();
  });

  it("plays hard-cut montage and skip works once", () => {
    const onDone = vi.fn();
    const { container } = render(wrap(<IntroOverlay onDone={onDone} />));
    expect(container.querySelector('video[src="/media/opener-montage.mp4"]')).toBeTruthy();
    fireEvent.click(screen.getByText("略過"));
    fireEvent.click(screen.getByText("略過"));
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});

describe("FbShowcase replaces the star map on the page", () => {
  it("is the 粉專現場 showcase, not the star map / gear wall", () => {
    render(wrap(<FbShowcase />));
    expect(screen.getByRole("heading", { name: "粉專現場 · 展示廊" })).toBeTruthy();
    expect(screen.queryByText("釣場航跡 · 磯路星圖")).toBeNull();
    expect(screen.queryByText("裝備牆")).toBeNull();
    expect(screen.queryByText("出海日誌")).toBeNull();
  });
});

describe("SiteFooter", () => {
  it("shows exact credit", () => {
    render(<SiteFooter />);
    expect(screen.getByText("製作人：愛爸爸的女兒C")).toBeTruthy();
  });
});
