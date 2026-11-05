/**
 * 磯路星圖 — derive a route constellation purely from content/spots.json.
 * Nodes = real spots. Edges = minimum spanning tree over "shares a species" links,
 * weighted by great-circle distance (so neighbours in the same region join first,
 * then regions bridge through the species they share). Rooted at 鹿港 for the reveal order.
 * No invented trips: every edge is two published posts that caught a common species.
 */
import type { Spot } from "./content";
import { angularDistance } from "./globeFly";

export type RouteBand = {
  key: string;
  label: string;
  en: string;
  lat: number;
  lng: number;
  /** caption placement in the star map (px offset from band centre + anchor) */
  lx: number;
  ly: number;
  anchor: "start" | "middle" | "end";
};

/** Geographic band labels only (for captions); membership is by nearest band centre. */
export const ROUTE_BANDS: RouteBand[] = [
  { key: "north", label: "北海岸", en: "NORTH COAST", lat: 25.17, lng: 121.5, lx: 30, ly: -28, anchor: "start" },
  { key: "yilan", label: "宜蘭 蘇澳", en: "SU-AO", lat: 24.49, lng: 121.86, lx: -4, ly: 36, anchor: "middle" },
  { key: "lukang", label: "彰化 鹿港", en: "LUKANG", lat: 24.07, lng: 120.4, lx: -32, ly: 34, anchor: "end" },
  { key: "chiayi", label: "嘉義 布袋", en: "BUDAI", lat: 23.37, lng: 120.15, lx: 34, ly: 4, anchor: "start" },
  { key: "tainan", label: "台南", en: "TAINAN", lat: 22.99, lng: 120.16, lx: 18, ly: 6, anchor: "start" },
  { key: "penghu", label: "澎湖", en: "PENGHU", lat: 23.255, lng: 119.667, lx: 0, ly: 28, anchor: "middle" },
];

export type RouteNode = {
  spot: Spot;
  band: RouteBand;
  x: number;
  y: number;
  depth: number;
};
export type RouteEdge = {
  id: string;
  a: string;
  b: string;
  shared: string[];
  kind: "region" | "species";
  /** BFS order from the root — drives the staged draw-in. */
  order: number;
  d: string;
  length: number;
};
export type RouteGraph = {
  nodes: RouteNode[];
  edges: RouteEdge[];
  rootId: string;
  width: number;
  height: number;
};

export const VIEW_W = 360;
export const VIEW_H = 420;
const BOUNDS = { minLng: 119.35, maxLng: 122.2, minLat: 22.78, maxLat: 25.48 };
const PAD = { x: 34, y: 34 };

export function project(lat: number, lng: number) {
  const x = PAD.x + ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * (VIEW_W - PAD.x * 2);
  const y = PAD.y + ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * (VIEW_H - PAD.y * 2);
  return { x, y };
}

export function bandOf(spot: { lat: number; lng: number }): RouteBand {
  let best = ROUTE_BANDS[0];
  let bd = Infinity;
  for (const b of ROUTE_BANDS) {
    const d = angularDistance(b, spot);
    if (d < bd) {
      bd = d;
      best = b;
    }
  }
  return best;
}

function sharedSpecies(a: Spot, b: Spot) {
  const set = new Set(a.species);
  return b.species.filter((s) => set.has(s));
}

/** Kruskal MST over the shared-species graph. */
export function routeEdges(spots: Spot[]): { a: number; b: number; shared: string[] }[] {
  const cand: { a: number; b: number; w: number; shared: string[] }[] = [];
  for (let i = 0; i < spots.length; i++) {
    for (let j = i + 1; j < spots.length; j++) {
      const shared = sharedSpecies(spots[i], spots[j]);
      if (!shared.length) continue;
      cand.push({ a: i, b: j, w: angularDistance(spots[i], spots[j]) + j * 1e-9, shared });
    }
  }
  cand.sort((x, y) => x.w - y.w);
  const parent = spots.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const out: { a: number; b: number; shared: string[] }[] = [];
  for (const c of cand) {
    const ra = find(c.a);
    const rb = find(c.b);
    if (ra === rb) continue;
    parent[ra] = rb;
    out.push({ a: c.a, b: c.b, shared: c.shared });
  }
  return out;
}

/** Spread co-located spots on a small golden-angle spiral so every star is tappable. */
function layout(spots: Spot[]) {
  const pts = spots.map((s) => project(s.lat, s.lng));
  const groups: number[][] = [];
  const seen = new Set<number>();
  for (let i = 0; i < spots.length; i++) {
    if (seen.has(i)) continue;
    const g = [i];
    seen.add(i);
    for (let j = i + 1; j < spots.length; j++) {
      if (!seen.has(j) && angularDistance(spots[i], spots[j]) < 0.075) {
        g.push(j);
        seen.add(j);
      }
    }
    groups.push(g);
  }
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (const g of groups) {
    if (g.length === 1) continue;
    const cx = g.reduce((s, i) => s + pts[i].x, 0) / g.length;
    const cy = g.reduce((s, i) => s + pts[i].y, 0) / g.length;
    g.forEach((idx, k) => {
      const r = 13 + 8.5 * Math.sqrt(k);
      const th = k * golden - Math.PI / 2;
      pts[idx] = { x: cx + Math.cos(th) * r, y: cy + Math.sin(th) * r };
    });
  }
  return pts;
}

function curve(ax: number, ay: number, bx: number, by: number, bend: number) {
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const k = Math.min(38, len * 0.22) * bend;
  const cx = mx + (-dy / len) * k;
  const cy = my + (dx / len) * k;
  return { d: `M${ax.toFixed(1)} ${ay.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`, len };
}

export function buildRouteGraph(spots: Spot[]): RouteGraph {
  const pts = layout(spots);
  const raw = routeEdges(spots);
  const rootIdx = Math.max(
    0,
    spots.findIndex((s) => s.name.includes("鹿港")),
  );
  // BFS from 鹿港 for depth + reveal order
  const adj = spots.map(() => [] as number[]);
  raw.forEach((e, i) => {
    adj[e.a].push(i);
    adj[e.b].push(i);
  });
  const depth = spots.map(() => Infinity);
  depth[rootIdx] = 0;
  const order = raw.map(() => 0);
  const q = [rootIdx];
  let n = 0;
  const flip = raw.map(() => false);
  while (q.length) {
    const u = q.shift()!;
    for (const ei of adj[u]) {
      const e = raw[ei];
      const v = e.a === u ? e.b : e.a;
      if (depth[v] !== Infinity) continue;
      depth[v] = depth[u] + 1;
      order[ei] = n++;
      flip[ei] = e.a !== u; // draw from parent → child
      q.push(v);
    }
  }
  const nodes: RouteNode[] = spots.map((spot, i) => ({
    spot,
    band: bandOf(spot),
    x: pts[i].x,
    y: pts[i].y,
    depth: Number.isFinite(depth[i]) ? depth[i] : 0,
  }));
  const edges: RouteEdge[] = raw.map((e, i) => {
    const [pa, pb] = flip[i] ? [e.b, e.a] : [e.a, e.b];
    const kind = nodes[pa].band.key === nodes[pb].band.key ? "region" : "species";
    const c = curve(pts[pa].x, pts[pa].y, pts[pb].x, pts[pb].y, kind === "species" ? (i % 2 ? 1 : -1) : 0.35);
    return {
      id: `${spots[pa].id}~${spots[pb].id}`,
      a: spots[pa].id,
      b: spots[pb].id,
      shared: e.shared,
      kind,
      order: order[i],
      d: c.d,
      length: c.len,
    };
  });
  return { nodes, edges, rootId: spots[rootIdx].id, width: VIEW_W, height: VIEW_H };
}

/* —— cross-section bus: constellation ⇄ globe —— */
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
