"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import { getSpots, spotOriginalUrl, type Spot } from "@/lib/content";
import { sfx } from "@/lib/sfx";
import { useSoundOptional } from "./SoundContext";

/**
 * Interactive mist-gold fishing map (Leaflet + Carto Positron).
 * Pan / zoom; tap pin → trip summary panel. Mobile-first.
 */
export function FishingMap() {
  const spots = getSpots();
  const { soundOn } = useSoundOptional();
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);
  const [active, setActive] = useState<Spot | null>(null);
  const [ready, setReady] = useState(false);

  const tap = () => {
    if (soundOn === true) sfx.tap();
  };

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      if (!mapEl.current || mapRef.current) return;
      const leafletMod = await import("leaflet");
      const L = leafletMod.default ?? leafletMod;
      // CSS side-effect
      if (cancelled || !mapEl.current) return;

      const map = L.map(mapEl.current, {
        center: [23.7, 120.6],
        zoom: 7,
        minZoom: 6,
        maxZoom: 14,
        zoomControl: false,
        attributionControl: true,
        worldCopyJump: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Esri light-gray — no API key; paper-like base for mist-gold pins
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Tiles &copy; Esri",
          maxZoom: 16,
        },
      ).addTo(map);

      const goldIcon = L.divIcon({
        className: "lf-pin",
        html: `<span class="lf-pin-dot"></span>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        popupAnchor: [0, -12],
      });

      const markers: LeafletMarker[] = [];
      for (const spot of spots) {
        const m = L.marker([spot.lat, spot.lng], { icon: goldIcon });
        m.addTo(map);
        m.on("click", () => {
          setActive(spot);
          if (soundOn === true) sfx.tap();
          map.flyTo([spot.lat, spot.lng], Math.max(map.getZoom(), 10), { duration: 0.55 });
        });
        markers.push(m);
      }
      markersRef.current = markers;

      if (spots.length > 0) {
        const bounds = L.latLngBounds(spots.map((s) => [s.lat, s.lng] as [number, number]));
        map.fitBounds(bounds.pad(0.35));
      }

      mapRef.current = map;
      // Leaflet needs a second layout pass once the container has real height
      requestAnimationFrame(() => {
        map.invalidateSize?.();
        if (spots.length > 0) {
          const bounds = L.latLngBounds(spots.map((s) => [s.lat, s.lng] as [number, number]));
          map.fitBounds(bounds.pad(0.35));
        }
      });
      setReady(true);
    }

    void boot();

    return () => {
      cancelled = true;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // spots are static JSON; soundOn used only in click handlers via closure refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep click sfx in sync without rebuilding map
  useEffect(() => {
    markersRef.current.forEach((m, i) => {
      m.off("click");
      const spot = spots[i];
      if (!spot) return;
      m.on("click", () => {
        setActive(spot);
        if (soundOn === true) sfx.tap();
        mapRef.current?.flyTo([spot.lat, spot.lng], Math.max(mapRef.current.getZoom(), 10), {
          duration: 0.55,
        });
      });
    });
  }, [soundOn, spots]);

  return (
    <section
      id="map"
      aria-label="釣點地圖"
      className="relative flex min-h-dvh w-full snap-start flex-col bg-[var(--color-paper)]"
      style={{ paddingTop: "3.25rem", paddingBottom: "2.5rem" }}
    >
      <header className="mx-auto mb-5 max-w-md px-6 text-center">
        <p className="mag-label mb-3">TSURIBA · 釣場</p>
        <h2
          className="mag-title text-[var(--color-indigo)]"
          style={{ fontSize: "clamp(1.5rem, 6vw, 1.75rem)" }}
        >
          釣點地圖
        </h2>
        <div className="mag-rule mx-auto mt-5" aria-hidden />
        <p
          className="mx-auto mt-4 leading-relaxed text-[var(--color-indigo)]/55"
          style={{ fontSize: "0.8125rem", letterSpacing: "0.1em", maxWidth: "20em" }}
        >
          手指滑動、捏放縮放。點霧金標記，看該地釣了什麼。
        </p>
      </header>

      <div className="relative mx-auto w-full max-w-lg px-4">
        <div
          className="relative overflow-hidden"
          style={{
            border: "1px solid rgba(197,160,89,0.55)",
            boxShadow: "0 1px 0 rgba(255,255,255,0.4) inset",
            background: "var(--color-paper)",
          }}
        >
          <div
            ref={mapEl}
            className="lf-map w-full"
            style={{ height: "min(68dvh, 28rem)", minHeight: 320 }}
            role="application"
            aria-label="可互動釣點地圖"
            data-testid="fishing-map"
          />
          {!ready && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-[var(--color-paper)]"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "0.28em", fontSize: "0.75rem" }}
            >
              載入海圖…
            </div>
          )}
        </div>

        {/* spot chips */}
        <ul
          className="mt-4 flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
          aria-label="釣點快捷"
        >
          {spots.map((s) => {
            const on = active?.id === s.id;
            return (
              <li key={s.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    tap();
                    setActive(s);
                    mapRef.current?.flyTo([s.lat, s.lng], 10, { duration: 0.55 });
                  }}
                  className="whitespace-nowrap transition active:opacity-90"
                  style={{
                    minHeight: 36,
                    paddingInline: "0.9rem",
                    border: on
                      ? "1px solid var(--color-gold)"
                      : "1px solid rgba(11,28,44,0.18)",
                    background: on ? "rgba(197,160,89,0.18)" : "transparent",
                    color: "var(--color-indigo)",
                    fontFamily: "var(--font-display)",
                    fontSize: "0.6875rem",
                    letterSpacing: "0.18em",
                  }}
                >
                  {s.name}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {active && (
        <aside
          className="mx-auto mt-5 w-full max-w-lg px-4"
          aria-live="polite"
          data-testid="spot-detail"
        >
          <article
            className="overflow-hidden"
            style={{
              background: "rgba(247,244,237,0.98)",
              border: "1px solid rgba(197,160,89,0.55)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.image}
              alt={active.name}
              className="h-44 w-full object-cover"
              style={{ objectPosition: "center 35%" }}
            />
            <div className="px-5 py-4">
              <p className="mag-label mb-2">
                {active.region}
                <span className="mx-2 opacity-40">·</span>
                {active.season}
              </p>
              <h3
                className="mag-title text-[var(--color-indigo)]"
                style={{ fontSize: "1.125rem", letterSpacing: "0.18em" }}
              >
                {active.name}
              </h3>
              <p
                className="mt-2 text-[var(--color-indigo)]"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.875rem",
                  letterSpacing: "0.14em",
                }}
              >
                {active.species.join(" · ")}
              </p>
              <p
                className="mt-3 leading-relaxed text-[var(--color-indigo)]/75"
                style={{ fontSize: "0.875rem", letterSpacing: "0.04em" }}
              >
                {active.summary}
              </p>
              <p
                className="mt-3 text-[var(--color-indigo)]/40"
                style={{ fontSize: "0.625rem", letterSpacing: "0.08em", lineHeight: 1.5 }}
              >
                來源：{active.source}（信心：{active.confidence}）
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {spotOriginalUrl(active) && (
                  <a
                    href={spotOriginalUrl(active)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={tap}
                    data-testid="spot-original"
                    className="inline-flex items-center justify-center font-bold transition active:opacity-90"
                    style={{
                      minHeight: 40,
                      paddingInline: "1rem",
                      background: "var(--color-gold)",
                      color: "var(--color-indigo)",
                      fontFamily: "var(--font-display)",
                      fontSize: "0.6875rem",
                      letterSpacing: "0.22em",
                    }}
                  >
                    {active.sourcePlatform === "pixnet" ? "看痞客邦原文" : "看粉專原文"}
                  </a>
                )}
                {active.logbookId && (
                  <a
                    href={`#log-${active.logbookId}`}
                    onClick={tap}
                    className="inline-flex items-center justify-center transition active:opacity-90"
                    style={{
                      minHeight: 40,
                      paddingInline: "1rem",
                      border: "1px solid var(--color-indigo)",
                      color: "var(--color-indigo)",
                      fontFamily: "var(--font-display)",
                      fontSize: "0.6875rem",
                      letterSpacing: "0.22em",
                    }}
                  >
                    看日誌
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    tap();
                    setActive(null);
                  }}
                  className="inline-flex items-center justify-center transition active:opacity-90"
                  style={{
                    minHeight: 40,
                    paddingInline: "1rem",
                    color: "rgba(11,28,44,0.45)",
                    fontFamily: "var(--font-display)",
                    fontSize: "0.6875rem",
                    letterSpacing: "0.22em",
                  }}
                >
                  收合
                </button>
              </div>
            </div>
          </article>
        </aside>
      )}

    </section>
  );
}
