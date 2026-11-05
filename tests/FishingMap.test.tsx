import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { FishingMap } from "@/components/FishingMap";
import { SoundProvider } from "@/components/SoundContext";

afterEach(cleanup);

vi.mock("react-globe.gl", () => {
  const React = require("react");
  const Mock = React.forwardRef(function MockGlobe(
    props: { onGlobeReady?: () => void },
    ref: unknown,
  ) {
    React.useEffect(() => {
      const api = {
        pointOfView: vi.fn(() => ({ lat: 23.7, lng: 121, altitude: 1.85 })),
        controls: () => ({
          autoRotate: true,
          autoRotateSpeed: 0.3,
          enableDamping: true,
          dampingFactor: 0.08,
          minDistance: 100,
          maxDistance: 500,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }),
        width: vi.fn(),
        height: vi.fn(),
      };
      if (typeof ref === "function") ref(api);
      else if (ref && typeof ref === "object") (ref as { current: unknown }).current = api;
      props.onGlobeReady?.();
    }, [props, ref]);
    return React.createElement("div", { "data-testid": "mock-globe" });
  });
  return { default: Mock };
});

describe("FishingMap", () => {
  it("renders globe section, tide, species drawer, spot chips", async () => {
    render(
      <SoundProvider>
        <FishingMap />
      </SoundProvider>,
    );
    expect(screen.getByRole("heading", { name: "釣場地球" })).toBeTruthy();
    expect(screen.getByTestId("fishing-map")).toBeTruthy();
    expect(screen.getByTestId("tide-strip")).toBeTruthy();
    expect(screen.getByTestId("species-drawer-toggle")).toBeTruthy();

    fireEvent.click(screen.getByTestId("species-drawer-toggle"));
    expect(screen.getByTestId("species-drawer")).toBeTruthy();

    const chip = screen.getByRole("button", { name: "澎湖南海 · 東嶼坪豬母塭" });
    expect(chip).toBeTruthy();
    fireEvent.click(chip);
    await waitFor(() => {
      expect(screen.getByTestId("spot-detail")).toBeTruthy();
    });
    expect(screen.getByTestId("spot-detail").textContent).toMatch(/黃雞魚/);
    expect(screen.getByTestId("spot-original")).toHaveAttribute(
      "href",
      expect.stringContaining("pixnet.net"),
    );
  });
});
