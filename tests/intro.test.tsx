import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { vi, it, expect, afterEach } from "vitest";
import { IntroOverlay } from "@/components/IntroOverlay";
import { SoundGate } from "@/components/SoundGate";
import { SoundProvider, useSound } from "@/components/SoundContext";
import { useEffect } from "react";

afterEach(cleanup);

it("skip calls onDone once", () => {
  const onDone = vi.fn();
  render(<IntroOverlay onDone={onDone} />);
  fireEvent.click(screen.getByText("略過"));
  fireEvent.click(screen.getByText("略過"));
  expect(onDone).toHaveBeenCalledTimes(1);
});

it("reduced motion auto-skips", () => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as never;
  const onDone = vi.fn();
  render(<IntroOverlay onDone={onDone} />);
  expect(onDone).toHaveBeenCalled();
});

it("sound gate shows custom 開啟聲音 / 先靜音 buttons", () => {
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

it("先靜音 dismisses gate without enabling sound", () => {
  function Probe() {
    const { soundOn } = useSound();
    useEffect(() => {}, [soundOn]);
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
