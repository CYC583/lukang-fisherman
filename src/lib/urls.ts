import site from "../../content/site.json";

/** Encoded FB fan-page URL (Chinese path segment safe for all browsers). */
export const FACEBOOK_URL: string = encodeURI(site.facebookUrl);

/** @deprecated Pixnet removed from CTAs — kept only so old imports don't crash tests mid-migrate. */
export const BLOG_URL: string = FACEBOOK_URL;
