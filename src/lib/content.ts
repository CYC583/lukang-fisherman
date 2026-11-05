import site from "../../content/site.json";
import stories from "../../content/stories.json";
import memories from "../../content/memories.json";
import logbook from "../../content/logbook.json";
import spots from "../../content/spots.json";
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
  /** facebook | pixnet */
  sourcePlatform: "facebook" | "pixnet";
  /** Canonical original post/article URL (FB or Pixnet). */
  postUrl: string;
  /** Optional alias of postUrl. */
  sourceUrl?: string;
  source: string;
  confidence: "exact" | "place-level" | "approximate" | "provisional";
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
