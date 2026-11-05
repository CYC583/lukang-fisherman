import site from "../../content/site.json";
import stories from "../../content/stories.json";
import { BLOG_URL, FACEBOOK_URL } from "./urls";

export type Site = {
  title: string;
  facebookUrl: string;
  blogUrl: string;
  footerCredit: string;
  primaryCta: string;
  storyCta: string;
  blogCta: string;
};

export type Story = {
  id: string;
  title: string;
  body: string;
  // media paths are placeholders; see .superpowers/sdd/media-curation.md
  media?: { type: "image" | "video"; src: string; alt: string };
};

export function getSite(): Site {
  return { ...site, facebookUrl: FACEBOOK_URL, blogUrl: BLOG_URL };
}

export function getStories(): Story[] {
  return stories as Story[];
}
