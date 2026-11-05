import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { RouteConstellation } from "@/components/RouteConstellation";
import { SoundProvider } from "@/components/SoundContext";
import { getSpots } from "@/lib/content";
import { ACTIVE_EVENT, FLY_EVENT, buildRouteGraph, routeEdges } from "@/lib/routes";

afterEach(cleanup);

const wrap = () =>
  render(
    <SoundProvider>
      <RouteConstellation />
    </SoundProvider>,
  );

describe("route graph (derived from spots.json)", () => {
  it("is a spanning tree over all 22 spots, every edge shares a real species", () => {
    const spots = getSpots();
    const g = buildRouteGraph(spots);
    expect(g.nodes).toHaveLength(spots.length);
    expect(g.edges).toHaveLength(spots.length - 1);
    const byId = new Map(spots.map((s) => [s.id, s]));
    for (const e of g.edges) {
      const a = byId.get(e.a)!;
      const b = byId.get(e.b)!;
      expect(e.shared.length).toBeGreaterThan(0);
      for (const sp of e.shared) {
        expect(a.species).toContain(sp);
        expect(b.species).toContain(sp);
      }
    }
    expect(byId.get(g.rootId)!.name).toMatch(/鹿港/);
    expect(routeEdges(spots)).toHaveLength(spots.length - 1);
  });
});

describe("RouteConstellation", () => {
  it("renders a star per spot and tap → asks the globe to fly + shows caption/outbound", () => {
    const fly = vi.fn();
    window.addEventListener(FLY_EVENT, fly);
    wrap();
    const spots = getSpots();
    const target = spots.find((s) => s.name.includes("三仙尖礁"))!;
    expect(screen.getAllByRole("button", { name: /^星點 / })).toHaveLength(spots.length);
    fireEvent.click(screen.getByTestId(`route-node-${target.id}`));
    expect(fly).toHaveBeenCalledTimes(1);
    expect((fly.mock.calls[0][0] as CustomEvent).detail).toEqual({ id: target.id, scroll: true });
    expect(screen.getByTestId("route-caption").textContent).toMatch(/三仙尖礁/);
    expect(screen.getByTestId("route-original")).toHaveAttribute("href", target.postUrl);
    window.removeEventListener(FLY_EVENT, fly);
  });

  it("tapping a route segment flies to its far end and names the shared species", () => {
    const fly = vi.fn();
    window.addEventListener(FLY_EVENT, fly);
    wrap();
    const g = buildRouteGraph(getSpots());
    const e = g.edges.find((x) => x.kind === "species") ?? g.edges[0];
    fireEvent.click(screen.getByTestId(`route-edge-${e.id}`));
    expect((fly.mock.calls[0][0] as CustomEvent).detail.id).toBe(e.b);
    expect(screen.getByTestId("route-caption").textContent).toContain(e.shared[0]);
    window.removeEventListener(FLY_EVENT, fly);
  });

  it("follows the globe's active pin", () => {
    wrap();
    const s = getSpots()[0];
    act(() => {
      window.dispatchEvent(new CustomEvent(ACTIVE_EVENT, { detail: { id: s.id } }));
    });
    expect(screen.getByTestId(`route-node-${s.id}`).getAttribute("data-on")).toBe("1");
  });
});
