import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { FbShowcase } from "@/components/FbShowcase";
import { SoundProvider } from "@/components/SoundContext";
import { getShowcase, showcaseView } from "@/lib/showcase";
import { getSpots } from "@/lib/content";
import { FLY_EVENT } from "@/lib/globeBus";

afterEach(cleanup);

const wrap = () =>
  render(
    <SoundProvider>
      <FbShowcase />
    </SoundProvider>,
  );

describe("showcase.json", () => {
  it("only real FB outbound links, local images that exist, valid spot links, no 比賽 framing", () => {
    const sc = getShowcase();
    const spotIds = new Set(getSpots().map((s) => s.id));
    expect(sc.items.length).toBeGreaterThanOrEqual(6);
    for (const it of sc.items) {
      expect(it.postUrl).toMatch(/^https:\/\/www\.facebook\.com\//);
      expect(it.image.startsWith("/media/")).toBe(true);
      expect(() => readFileSync(join(process.cwd(), "public", it.image))).not.toThrow();
      if (it.spotId) expect(spotIds.has(it.spotId)).toBe(true);
      expect(it.title).not.toMatch(/比賽|賽事/);
    }
    expect(sc.categories.map((c) => c.label)).not.toContain("比賽");
    expect(showcaseView(sc).items[0].featured).toBe(true);
  });
});

describe("FbShowcase", () => {
  it("renders stage + rail, filters by chip, arrows step, globe hand-off fires fly event", () => {
    const fly = vi.fn();
    window.addEventListener(FLY_EVENT, fly as EventListener);
    wrap();
    expect(screen.getByRole("heading", { name: "粉專現場 · 展示廊" })).toBeTruthy();
    const stage = screen.getByTestId("showcase-stage");
    expect(within(stage).getByRole("heading", { level: 3 }).textContent).toBe("澎湖離島 · 火山岩與藍海");
    expect(screen.getByTestId("showcase-original")).toHaveAttribute("target", "_blank");

    fireEvent.click(screen.getByTestId("showcase-globe"));
    expect(fly).toHaveBeenCalledTimes(1);
    expect((fly.mock.calls[0][0] as CustomEvent).detail.id).toBe("fb-02PwVphQ");

    fireEvent.click(screen.getByRole("tab", { name: /現場 Reel/ }));
    const rail = screen.getByTestId("showcase-rail");
    const reels = getShowcase().items.filter((i) => i.category === "reel");
    expect(within(rail).getAllByRole("button")).toHaveLength(reels.length);
    expect(stage.getAttribute("data-kind")).toBe("reel");
    expect(screen.getByTestId("showcase-original").getAttribute("href")).toMatch(/facebook\.com\/reel\//);

    const before = within(stage).getByRole("heading", { level: 3 }).textContent;
    fireEvent.click(screen.getByRole("button", { name: "下一則" }));
    expect(within(stage).getByRole("heading", { level: 3 }).textContent).not.toBe(before);

    fireEvent.click(within(rail).getByRole("button", { name: reels[reels.length - 1].title }));
    expect(within(stage).getByRole("heading", { level: 3 }).textContent).toBe(reels[reels.length - 1].title);
    window.removeEventListener(FLY_EVENT, fly as EventListener);
  });
});
