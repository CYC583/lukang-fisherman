import site from "../../content/site.json";
import stories from "../../content/stories.json";
import memories from "../../content/memories.json";
import logbook from "../../content/logbook.json";
import spots from "../../content/spots.json";
import gear from "../../content/gear.json";
import { FACEBOOK_URL, PIXNET_URL } from "./urls";

export type Site = {
  title: string;
  subtitle: string;
  facebookUrl: string;
  pixnetUrl: string;
  footerCredit: string;
  primaryCta: string;
  secondaryCta: string;
  mapCta: string;
  joinCta: string;
  storyCta: string;
  afterStoryCta: string;
  soundPrompt: string;
  soundYes: string;
  soundNo: string;
  tagline: string;
  eyebrow: string;
};

export type Story = {
  id: string;
  chapter: string;
  title: string;
  narration: string[];
  media?: { type: "image" | "video"; src: string; alt: string; credit?: string };
};

export type Memory = {
  id: string;
  badge: string;
  title: string;
  blurb: string;
  image: string;
  credit: string;
};

export type LogEntry = {
  id: string;
  date: string;
  place: string;
  species: string;
  tags: string[];
  line: string;
  image: string;
  spotId?: string;
};

export type Spot = {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  species: string[];
  summary: string;
  season: string;
  tags: string[];
  image: string;
  logbookId?: string;
  sourcePlatform: "facebook" | "pixnet";
  postUrl: string;
  sourceUrl?: string;
  source: string;
  confidence: "exact" | "place-level" | "approximate" | "provisional";
};

export type GearItem = {
  id: string;
  name: string;
  brand: string;
  blurb: string;
  x: number;
  y: number;
  image: string;
  focus: string;
};

export type SpeciesAtlasEntry = {
  name: string;
  count: number;
  spotIds: string[];
  spots: Spot[];
};

/** Prefer postUrl, fall back to sourceUrl. Empty → no outbound. */
export function spotOriginalUrl(spot: Spot): string | null {
  const u = (spot.postUrl || spot.sourceUrl || "").trim();
  return u.length > 0 ? u : null;
}

export function getSite(): Site {
  const s = site as Omit<Site, "facebookUrl" | "pixnetUrl"> & {
    facebookUrl: string;
    pixnetUrl: string;
  };
  return {
    ...s,
    facebookUrl: FACEBOOK_URL,
    pixnetUrl: PIXNET_URL,
  };
}

export function getStories(): Story[] {
  return stories as Story[];
}

export function getMemories(): Memory[] {
  return memories as Memory[];
}

export function getLogbook(): LogEntry[] {
  return logbook as LogEntry[];
}

export function getSpots(): Spot[] {
  return spots as Spot[];
}

export function getGear(): GearItem[] {
  return gear as GearItem[];
}

/** Aggregate species → spots from spots.json (1:1 with published trips). */
export function getSpeciesAtlas(list: Spot[] = getSpots()): SpeciesAtlasEntry[] {
  const map = new Map<string, Spot[]>();
  for (const spot of list) {
    for (const name of spot.species) {
      const key = name.trim();
      if (!key) continue;
      const arr = map.get(key) ?? [];
      if (!arr.some((s) => s.id === spot.id)) arr.push(spot);
      map.set(key, arr);
    }
  }
  return [...map.entries()]
    .map(([name, spotsFor]) => ({
      name,
      count: spotsFor.length,
      spotIds: spotsFor.map((s) => s.id),
      spots: spotsFor,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh-Hant"));
}

/** Spots sharing ≥1 species with the active pin (excludes self). */
export function relatedSpots(active: Spot, list: Spot[] = getSpots()): Spot[] {
  const set = new Set(active.species);
  return list.filter(
    (s) => s.id !== active.id && s.species.some((sp) => set.has(sp)),
  );
}
