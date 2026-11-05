import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getSpots } from "@/lib/content";

type Ring = [number, number][];
const coast = JSON.parse(
  readFileSync(join(process.cwd(), "public/media/globe/taiwan-coast.geojson"), "utf8"),
) as { features: { geometry: { coordinates: Ring[][] } }[] };
const rings: Ring[] = coast.features.flatMap((f) => f.geometry.coordinates.map((p) => p[0]));

/** km to the nearest coastline segment (equirectangular, fine at this scale). */
function coastKm(lat: number, lng: number) {
  const k = Math.cos((lat * Math.PI) / 180);
  let best = Infinity;
  for (const r of rings) {
    for (let i = 0; i < r.length - 1; i++) {
      const ax = (r[i][0] - lng) * k, ay = r[i][1] - lat;
      const bx = (r[i + 1][0] - lng) * k, by = r[i + 1][1] - lat;
      const dx = bx - ax, dy = by - ay;
      const L = dx * dx + dy * dy;
      const t = L === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / L));
      best = Math.min(best, Math.hypot(ax + t * dx, ay + t * dy));
    }
  }
  return best * 111;
}

describe("coastline overlay", () => {
  it("every ring is clockwise (d3/three-globe convention) — CCW rings would fill the whole globe", () => {
    for (const r of rings) {
      let a = 0;
      for (let i = 0; i < r.length - 1; i++) a += r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1];
      expect(a).toBeLessThanOrEqual(0);
    }
  });
});

describe("globe pins sit on the Taiwan / Penghu shoreline", () => {
  const spots = getSpots();
  it("every pin is within 2 km of the drawn coastline (offshore reefs ≤ 2.5 km)", () => {
    for (const s of spots) {
      const limit = /三仙/.test(s.name) ? 2.5 : 2;
      expect([s.id, coastKm(s.lat, s.lng) < limit]).toEqual([s.id, true]);
    }
  });

  it("named places land where they really are", () => {
    const by = (re: RegExp) => spots.filter((s) => re.test(s.name));
    for (const s of by(/蘇澳/)) {
      // 三仙礁 is off 南方澳 (~24.6N), not 東澳 / not 台東三仙台
      expect(s.lat).toBeGreaterThan(24.55);
      expect(s.lat).toBeLessThan(24.65);
    }
    for (const s of by(/東嶼坪|澎湖/)) {
      expect(s.lng).toBeGreaterThan(119.49);
      expect(s.lng).toBeLessThan(119.54);
    }
    for (const s of by(/布袋|好美/)) {
      expect(s.lat).toBeGreaterThan(23.34);
      expect(s.lat).toBeLessThan(23.4);
      expect(s.lng).toBeLessThan(120.15);
    }
    for (const s of by(/鹿港/)) expect(s.lng).toBeLessThan(120.42);
    for (const s of by(/烏石鼻/)) expect(s.lng).toBeGreaterThan(121.845);
    for (const s of by(/下罟子/)) expect(s.lng).toBeLessThan(121.39);
  });
});
