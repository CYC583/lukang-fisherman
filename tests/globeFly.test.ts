import { describe, it, expect } from "vitest";
import {
  DIVE_ALTITUDE,
  angularDistance,
  flyDuration,
  flyFrame,
  peakAltitude,
  phaseAt,
  pullBackFrame,
  slerpLatLng,
} from "@/lib/globeFly";
import { arcTargets } from "@/components/FishingMap";
import { getSpots } from "@/lib/content";

const from = { lat: 23.7, lng: 121, altitude: 1.85 };
const penghu = { lat: 23.255, lng: 119.667 };

describe("globeFly choreography", () => {
  it("starts at the current POV and lands on the spot at dive altitude", () => {
    const a = flyFrame(from, penghu, 0);
    expect(a.lat).toBeCloseTo(from.lat, 5);
    expect(a.lng).toBeCloseTo(from.lng, 5);
    expect(a.altitude).toBeCloseTo(from.altitude, 5);
    const z = flyFrame(from, penghu, 1);
    expect(z.lat).toBeCloseTo(penghu.lat, 4);
    expect(z.lng).toBeCloseTo(penghu.lng, 4);
    expect(z.altitude).toBeCloseTo(DIVE_ALTITUDE, 4);
  });

  it("lifts above both endpoints, then dives with a soft overshoot below target", () => {
    const peak = peakAltitude(from, penghu);
    expect(peak).toBeGreaterThan(from.altitude);
    expect(flyFrame(from, penghu, 0.45).altitude).toBeGreaterThan(from.altitude);
    let min = Infinity;
    for (let t = 0.62; t <= 1; t += 0.01) min = Math.min(min, flyFrame(from, penghu, t).altitude);
    expect(min).toBeLessThan(DIVE_ALTITUDE);
    expect(min).toBeGreaterThan(DIVE_ALTITUDE - 0.15);
  });

  it("phases run lift → pan → dive → settled", () => {
    expect(phaseAt(0.1)).toBe("lift");
    expect(phaseAt(0.5)).toBe("pan");
    expect(phaseAt(0.8)).toBe("dive");
    expect(phaseAt(1)).toBe("settled");
  });

  it("great-circle slerp takes the short way across the antimeridian", () => {
    const mid = slerpLatLng({ lat: 0, lng: 170 }, { lat: 0, lng: -170 }, 0.5);
    expect(Math.abs(mid.lng)).toBeCloseTo(180, 3);
    expect(angularDistance({ lat: 0, lng: 170 }, { lat: 0, lng: -170 })).toBeCloseTo(20, 3);
  });

  it("duration scales with distance within bounds", () => {
    expect(flyDuration(from, penghu)).toBeGreaterThanOrEqual(1500);
    expect(flyDuration(from, { lat: -30, lng: -60 })).toBeLessThanOrEqual(2800);
    expect(flyDuration(from, { lat: -30, lng: -60 })).toBeGreaterThan(flyDuration(from, penghu));
  });

  it("pull-back eases altitude out without moving lat/lng", () => {
    const p = pullBackFrame({ lat: 23, lng: 120, altitude: 1.15 }, 1, 1.85);
    expect(p).toEqual({ lat: 23, lng: 120, altitude: 1.85 });
  });
});

describe("arcTargets", () => {
  it("links only shared-species spots, de-duplicated by location, max 8", () => {
    const spots = getSpots();
    expect(spots.length).toBe(22);
    for (const s of spots) {
      const t = arcTargets(s, spots);
      expect(t.length).toBeLessThanOrEqual(8);
      const keys = new Set(t.map((x) => `${x.lat.toFixed(2)},${x.lng.toFixed(2)}`));
      expect(keys.size).toBe(t.length);
      for (const x of t) {
        expect(x.id).not.toBe(s.id);
        expect(x.species.some((sp) => s.species.includes(sp))).toBe(true);
      }
    }
  });
});
