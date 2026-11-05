import site from "../../content/site.json";
import stories from "../../content/stories.json";
import memories from "../../content/memories.json";
import { FACEBOOK_URL } from "./urls";

export type Site = {
  title: string;
  subtitle: string;
  facebookUrl: string;
  footerCredit: string;
  primaryCta: string;
  storyCta: string;
  afterStoryCta: string;
  soundPrompt: string;
  soundYes: string;
  soundNo: string;
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

export function getSite(): Site {
  return { ...(site as Omit<Site, "facebookUrl">), facebookUrl: FACEBOOK_URL };
}

export function getStories(): Story[] {
  return stories as Story[];
}

export function getMemories(): Memory[] {
  return memories as Memory[];
}
