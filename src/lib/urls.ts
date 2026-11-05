import site from "../../content/site.json";

/** Encoded FB fan-page URL (Chinese path segment safe for all browsers). */
export const FACEBOOK_URL: string = encodeURI(site.facebookUrl);

/** Pixnet blog — restored per YC 00:22 feedback. */
export const PIXNET_URL: string = site.pixnetUrl;

/** @deprecated Prefer PIXNET_URL; alias kept for older imports. */
export const BLOG_URL: string = PIXNET_URL;
