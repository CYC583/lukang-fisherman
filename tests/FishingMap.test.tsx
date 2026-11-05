import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { FishingMap } from "@/components/FishingMap";
import { SoundProvider } from "@/components/SoundContext";

afterEach(cleanup);

vi.mock("leaflet", () => {
  const map = {
    remove: vi.fn(),
    flyTo: vi.fn(),
    getZoom: vi.fn(() => 7),
    fitBounds: vi.fn(),
  };
  const marker = {
    addTo: vi.fn(function (this: unknown) {
      return this;
    }),
    on: vi.fn(function (this: unknown) {
      return this;
    }),
    off: vi.fn(function (this: unknown) {
      return this;
    }),
    remove: vi.fn(),
  };
  return {
    default: {
      map: vi.fn(() => map),
      tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
      marker: vi.fn(() => marker),
      divIcon: vi.fn(() => ({})),
      control: { zoom: vi.fn(() => ({ addTo: vi.fn() })) },
      latLngBounds: vi.fn(() => ({ pad: vi.fn(() => ({})) })),
    },
  };
});

vi.mock("leaflet/dist/leaflet.css", () => ({}));

describe("FishingMap", () => {
  it("renders map section and spot chips", async () => {
    render(
      <SoundProvider>
        <FishingMap />
      </SoundProvider>,
    );
    expect(screen.getByRole("heading", { name: "釣點地圖" })).toBeTruthy();
    expect(screen.getByTestId("fishing-map")).toBeTruthy();
    expect(screen.getByRole("button", { name: "澎湖南海 · 東嶼坪豬母塭" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "澎湖南海 · 東嶼坪豬母塭" }));
    await waitFor(() => {
      expect(screen.getByTestId("spot-detail")).toBeTruthy();
    });
    expect(screen.getByTestId("spot-detail").textContent).toMatch(/黃雞魚/);
  });
});
