import type { ReactNode } from "react";
import { useEffect } from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AmbientAudio } from "@/components/AmbientAudio";
import { SoundProvider, useSound } from "@/components/SoundContext";

function ChooseSound({ on, intro = true }: { on: boolean; intro?: boolean }) {
  const { choose, markIntroDone } = useSound();
  useEffect(() => {
    choose(on);
    if (intro) markIntroDone();
  }, [choose, markIntroDone, on, intro]);
  return null;
}

function wrap(ui: ReactNode, soundOn: boolean, intro = true) {
  return (
    <SoundProvider>
      <ChooseSound on={soundOn} intro={intro} />
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

  it("plays documentary BGM after gate yes + intro done, and can mute", () => {
    render(wrap(<AmbientAudio />, true, true));
    expect(play).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "關閉配樂" }));
    expect(screen.getByRole("button", { name: "開啟配樂" })).toBeTruthy();
  });

  it("waits for intro before ambient", () => {
    render(wrap(<AmbientAudio />, true, false));
    expect(play).not.toHaveBeenCalled();
  });
});
