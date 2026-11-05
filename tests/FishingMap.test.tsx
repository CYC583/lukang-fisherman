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

    await screen.findByTestId("mock-globe");
    const chip = screen.getByRole("button", { name: "澎湖南海 · 東嶼坪豬母塭" });
    expect(chip).toBeTruthy();
    fireEvent.click(chip);
    // panel is gated on the camera settling — not shown mid-flight
    expect(screen.queryByTestId("spot-detail")).toBeNull();
    expect(screen.getByTestId("fly-hud").getAttribute("data-visible")).toBe("1");
    await waitFor(
      () => {
        expect(screen.getByTestId("spot-detail")).toBeTruthy();
      },
      { timeout: 5000 },
    );
    expect(screen.getByTestId("fly-hud").getAttribute("data-phase")).toBe("settled");
    expect(screen.getByTestId("spot-detail").getAttribute("data-state")).toBe("in");
    expect(screen.getByTestId("globe-focus")).toBeTruthy();
    expect(screen.getByTestId("spot-detail").textContent).toMatch(/黃雞魚/);
    expect(screen.getByTestId("spot-original")).toHaveAttribute(
      "href",
      expect.stringContaining("pixnet.net"),
    );
  }, 10000);

  it("switching spots exits the old panel, re-flies, then shows the new one; close collapses", async () => {
    render(
      <SoundProvider>
        <FishingMap />
      </SoundProvider>,
    );
    await screen.findByTestId("mock-globe");
    fireEvent.click(screen.getByRole("button", { name: "澎湖南海 · 東嶼坪豬母塭" }));
    await waitFor(() => expect(screen.getByTestId("spot-detail")).toBeTruthy(), { timeout: 5000 });

    fireEvent.click(screen.getByRole("button", { name: "蘇澳 · 三仙尖礁" }));
    expect(screen.getByTestId("spot-detail").getAttribute("data-state")).toBe("out");
    await waitFor(() => expect(screen.queryByTestId("spot-detail")).toBeNull(), { timeout: 2000 });
    await waitFor(
      () => expect(screen.getByTestId("spot-detail").textContent).toMatch(/三仙尖礁/),
      { timeout: 5000 },
    );

    fireEvent.click(screen.getByTestId("spot-close"));
    expect(screen.getByTestId("spot-detail").getAttribute("data-state")).toBe("out");
    await waitFor(() => expect(screen.queryByTestId("spot-detail")).toBeNull(), { timeout: 2000 });
    expect(screen.getByTestId("fly-hud").getAttribute("data-visible")).toBe("0");
  }, 15000);
});
