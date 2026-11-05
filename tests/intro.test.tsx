import { render, screen, fireEvent } from "@testing-library/react";
import { vi, it, expect } from "vitest";
import { IntroOverlay } from "@/components/IntroOverlay";

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
