import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { vi, it, expect, afterEach, beforeEach } from "vitest";
import { IntroOverlay } from "@/components/IntroOverlay";
import { SoundGate } from "@/components/SoundGate";
import { SoundProvider, useSound } from "@/components/SoundContext";

afterEach(cleanup);
beforeEach(() => {
  window.HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve()) as never;
  window.HTMLMediaElement.prototype.pause = vi.fn();
});

it("skip calls onDone once", () => {
  const onDone = vi.fn();
  render(
    <SoundProvider>
      <IntroOverlay onDone={onDone} />
    </SoundProvider>,
  );
  fireEvent.click(screen.getByText("略過"));
  fireEvent.click(screen.getByText("略過"));
  expect(onDone).toHaveBeenCalledTimes(1);
});

it("sound gate shows custom buttons and enables sound", () => {
  function Probe() {
    const { soundOn } = useSound();
    return <span data-testid="sound">{String(soundOn)}</span>;
  }
  render(
    <SoundProvider>
      <SoundGate />
      <Probe />
    </SoundProvider>,
  );
  expect(screen.getByText("要開啟聲音嗎？")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "開啟聲音" }));
  expect(screen.getByTestId("sound").textContent).toBe("true");
});

it("先靜音 keeps audio off", () => {
  function Probe() {
    const { soundOn } = useSound();
    return <span data-testid="sound">{String(soundOn)}</span>;
  }
  render(
    <SoundProvider>
      <SoundGate />
      <Probe />
    </SoundProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "先靜音" }));
  expect(screen.getByTestId("sound").textContent).toBe("false");
});
