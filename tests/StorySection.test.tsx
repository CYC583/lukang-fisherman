import type { ReactNode } from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { MemoryPostcards } from "@/components/MemoryPostcards";
import { SeaLogbook } from "@/components/SeaLogbook";
import { SiteFooter } from "@/components/SiteFooter";
import { IntroOverlay } from "@/components/IntroOverlay";
import { SoundProvider } from "@/components/SoundContext";

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

describe("SeaLogbook", () => {
  it("shows album catch-log cards", () => {
    render(wrap(<SeaLogbook />));
    expect(screen.getByText("出海日誌")).toBeTruthy();
    expect(screen.getByText(/釣行/)).toBeTruthy();
    expect(screen.getAllByText("黑鯛").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/迴流一送/)).toBeTruthy();
  });
});

describe("MemoryPostcards", () => {
  it("shows Japanese editorial plates with FB + Pixnet", () => {
    render(<MemoryPostcards />);
    expect(screen.queryByText("釣友會想傳的幾張")).toBeNull();
    expect(screen.getByText("磯の記録")).toBeTruthy();
    expect(screen.getByText("西岸一線")).toBeTruthy();
    const fb = screen.getByRole("link", { name: "Facebook 粉專" });
    expect(fb).toHaveAttribute("href", expect.stringContaining("facebook.com"));
    const pix = screen.getByRole("link", { name: "痞客邦部落格" });
    expect(pix).toHaveAttribute("href", expect.stringContaining("pixnet.net"));
  });
});

describe("SiteFooter", () => {
  it("shows exact credit", () => {
    render(<SiteFooter />);
    expect(screen.getByText("製作人：愛爸爸的女兒C")).toBeTruthy();
  });
});
