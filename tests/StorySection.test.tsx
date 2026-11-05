import type { ReactNode } from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { StorySection } from "@/components/StorySection";
import { MemoryPostcards } from "@/components/MemoryPostcards";
import { SeaLogbook } from "@/components/SeaLogbook";
import { SiteFooter } from "@/components/SiteFooter";
import { SoundProvider } from "@/components/SoundContext";

afterEach(cleanup);

function wrap(ui: ReactNode) {
  return <SoundProvider>{ui}</SoundProvider>;
}

describe("StorySection", () => {
  beforeEach(() => {
    window.HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve()) as never;
    window.HTMLMediaElement.prototype.pause = vi.fn();
  });

  it("has #story anchor and cast can be skipped", () => {
    const { container } = render(wrap(<StorySection />));
    expect(container.querySelector("#story")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "略過拋竿" }));
    expect(screen.getByText("師傅幫你甩了——上鉤！")).toBeTruthy();
  });

  it("renders cinematic video media", () => {
    const { container } = render(wrap(<StorySection />));
    expect(container.querySelector('video[src="/media/dad-cover-cinematic.mp4"]')).toBeTruthy();
  });
});

describe("SeaLogbook", () => {
  it("shows logbook cards and filters", () => {
    render(<SeaLogbook />);
    expect(screen.getByText("出海日誌")).toBeTruthy();
    expect(screen.getAllByText("黑鯛").length).toBeGreaterThanOrEqual(1);
    fireEvent.click(screen.getByRole("button", { name: "夜釣" }));
  });
});

describe("MemoryPostcards", () => {
  it("FB CTA only after memorial cards", () => {
    render(<MemoryPostcards />);
    expect(screen.getByText("認識鹿港漁人")).toBeTruthy();
    const cta = screen.getByRole("link", { name: "看更多出海日常" });
    expect(cta).toHaveAttribute("href", expect.stringContaining("facebook.com"));
    expect(cta.getAttribute("href")).not.toMatch(/pixnet/i);
  });
});

describe("SiteFooter", () => {
  it("shows exact credit", () => {
    render(<SiteFooter />);
    expect(screen.getByText("製作人：愛爸爸的女兒C")).toBeTruthy();
  });
});
