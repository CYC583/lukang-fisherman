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
      if (it.kind === "reel") {
        expect(it.video).toMatch(/^\/media\/fb\/showcase\/reel_\d+\.mp4$/);
        expect(() => readFileSync(join(process.cwd(), "public", it.video!))).not.toThrow();
      }
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

  it("reel stage exposes play control + video; play reveals player", () => {
    wrap();
    fireEvent.click(screen.getByRole("tab", { name: /現場 Reel/ }));
    const stage = screen.getByTestId("showcase-stage");
    expect(stage.getAttribute("data-kind")).toBe("reel");

    const video = screen.getByTestId("showcase-video") as HTMLVideoElement;
    expect(video.tagName).toBe("VIDEO");
    expect(video.getAttribute("playsinline")).not.toBeNull();
    const src = video.getAttribute("src") || video.src;
    expect(src).toMatch(/\/media\/fb\/showcase\/reel_\d+\.mp4/);
    const poster = video.getAttribute("poster") || "";
    expect(poster).toMatch(/\/media\/fb\/showcase\//);

    const play = screen.getByTestId("showcase-play");
    expect(play.tagName).toBe("BUTTON");
    expect(play).toHaveAttribute("aria-label", "播放 Reel");

    // mock play/pause since jsdom HTMLMediaElement is stubby
    video.play = vi.fn().mockResolvedValue(undefined);
    video.pause = vi.fn();

    fireEvent.click(play);
    expect(video.play).toHaveBeenCalled();
    // onPlay handler may not fire from mocked play — simulate it
    fireEvent.play(video);
    expect(stage.getAttribute("data-playing")).toBe("1");
    expect(screen.queryByTestId("showcase-play")).toBeNull();
    expect(video.controls).toBe(true);

    // switching cards pauses
    fireEvent.click(screen.getByRole("button", { name: "下一則" }));
    expect(screen.getByTestId("showcase-stage").getAttribute("data-playing")).toBe("0");
    expect(screen.getByTestId("showcase-play")).toBeTruthy();
  });
});
