import type { ReactNode } from "react";
import { useEffect } from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AmbientAudio } from "@/components/AmbientAudio";
import { SoundProvider, useSound } from "@/components/SoundContext";

function ChooseSound({ on }: { on: boolean }) {
  const { choose } = useSound();
  useEffect(() => {
    choose(on);
  }, [choose, on]);
  return null;
}

function wrap(ui: ReactNode, soundOn: boolean) {
  return (
    <SoundProvider>
      <ChooseSound on={soundOn} />
      {ui}
    </SoundProvider>
  );
}

describe("AmbientAudio", () => {
  afterEach(cleanup);
  let play: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    play = vi.fn(() => Promise.resolve());
    window.HTMLMediaElement.prototype.play = play as never;
    window.HTMLMediaElement.prototype.pause = vi.fn();
  });

  it("does not play until sound gate chooses on", () => {
    render(
      <SoundProvider>
        <AmbientAudio />
      </SoundProvider>,
    );
    expect(play).not.toHaveBeenCalled();
  });

  it("plays wave ambient after gate yes, and can mute again", () => {
    render(wrap(<AmbientAudio />, true));
    expect(play).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "關閉配樂" }));
    expect(screen.getByRole("button", { name: "開啟配樂" })).toBeTruthy();
  });
});
