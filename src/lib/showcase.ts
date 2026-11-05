import data from "../../content/showcase.json";

export type ShowcaseCategoryKey = "catch" | "island" | "reel";
export type ShowcaseCategory = { key: ShowcaseCategoryKey; label: string; en: string };
export type ShowcaseStat = { label: string; value: string };
export type ShowcaseItem = {
  id: string;
  category: ShowcaseCategoryKey;
  kind: "post" | "reel";
  featured?: boolean;
  date: string;
  title: string;
  kicker: string;
  body: string;
  stats: ShowcaseStat[];
  tags: string[];
  note?: string;
  image: string;
  /** Local mp4 for in-page Reel playback */
  video?: string;
  imagePosition?: string;
  imageNote?: string;
  postUrl: string;
  linkLabel: string;
  secondaryUrl?: string;
  secondaryLabel?: string;
  /** spots.json id — enables 「在地球上看」 */
  spotId?: string;
};
export type Showcase = {
  eyebrow: string;
  title: string;
  lede: string;
  pageUrl: string;
  snapshotNote: string;
  categories: ShowcaseCategory[];
  items: ShowcaseItem[];
};

export function getShowcase(): Showcase {
  return data as Showcase;
}

/** Featured first, then source order. Only categories that actually have items. */
export function showcaseView(sc: Showcase = getShowcase()) {
  const items = [...sc.items].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  const categories = sc.categories.filter((c) => items.some((i) => i.category === c.key));
  return { items, categories };
}

export function filterShowcase(items: ShowcaseItem[], key: ShowcaseCategoryKey | "all") {
  return key === "all" ? items : items.filter((i) => i.category === key);
}
