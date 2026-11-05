import site from "../../content/site.json";
import stories from "../../content/stories.json";
import memories from "../../content/memories.json";
import logbook from "../../content/logbook.json";
import stats from "../../content/stats.json";
import species from "../../content/species.json";
import guess from "../../content/guess.json";
import { FACEBOOK_URL } from "./urls";

export type Site = {
  title: string;
  subtitle: string;
  facebookUrl: string;
  footerCredit: string;
  primaryCta: string;
  secondaryCta: string;
  joinCta: string;
  storyCta: string;
  afterStoryCta: string;
  soundPrompt: string;
  soundYes: string;
  soundNo: string;
  tagline: string;
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
};

export type StatItem = { id: string; label: string; value: number; suffix: string; hint: string };
export type Species = { id: string; name: string; aka: string; blurb: string; image: string };
export type Guess = {
  prompt: string;
  image: string;
  choices: { id: string; label: string }[];
  answerId: string;
  reveal: string;
};

export function getSite(): Site {
  return { ...(site as Omit<Site, "facebookUrl">), facebookUrl: FACEBOOK_URL };
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

export function getStats(): { seasonLabel: string; items: StatItem[] } {
  return stats as { seasonLabel: string; items: StatItem[] };
}

export function getSpecies(): Species[] {
  return species as Species[];
}

export function getGuess(): Guess {
  return guess as Guess;
}
