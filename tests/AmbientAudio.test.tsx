import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AmbientAudio } from "@/components/AmbientAudio";

describe("AmbientAudio", () => {
  afterEach(cleanup);
  let play: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    play = vi.fn(() => Promise.resolve());
    window.HTMLMediaElement.prototype.play = play as never;
    window.HTMLMediaElement.prototype.pause = vi.fn();
  });
  it("is muted by default and does not autoplay", () => {
    render(<AmbientAudio />);
    expect(screen.getByRole("button", { name: "開啟配樂" })).toBeTruthy();
    expect(play).not.toHaveBeenCalled();
  });
  it("plays only after tap, and can mute again", () => {
    render(<AmbientAudio />);
    fireEvent.click(screen.getByRole("button", { name: "開啟配樂" }));
    expect(play).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "關閉配樂" }));
    expect(screen.getByRole("button", { name: "開啟配樂" })).toBeTruthy();
  });
});
