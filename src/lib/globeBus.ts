/** Cross-section bus: any section (展示廊 cards, chips) ⇄ the 釣場地球 stage. */
export const FLY_EVENT = "lf:globe-fly";
export const ACTIVE_EVENT = "lf:globe-active";
export type FlyDetail = { id: string; scroll?: boolean };
export type ActiveDetail = { id: string | null };

export function requestGlobeFly(id: string, scroll = true) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<FlyDetail>(FLY_EVENT, { detail: { id, scroll } }));
}
export function announceGlobeActive(id: string | null) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ActiveDetail>(ACTIVE_EVENT, { detail: { id } }));
}
