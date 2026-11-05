"use client";

import { useState } from "react";
import { getGear, type GearItem } from "@/lib/content";
import { sfx } from "@/lib/sfx";
import { useSoundOptional } from "./SoundContext";

/**
 * Interactive gear wall — true FB ref photo with hotspot callouts
 * (白帽金徽 / SUNLINE / LIMITED PRO / SHIMANO…).
 */
export function GearWall() {
  const items = getGear();
  const { soundOn } = useSoundOptional();
  const [active, setActive] = useState<GearItem | null>(items[0] ?? null);

  const tap = () => {
    if (soundOn === true) sfx.tap();
  };

  return (
    <section
      id="gear"
      aria-label="裝備牆"
      className="relative flex min-h-dvh w-full snap-start flex-col overflow-hidden"
      style={{
        paddingTop: "3.5rem",
        paddingBottom: "3.5rem",
        background:
          "linear-gradient(180deg, #070e16 0%, #0b1c2c 40%, #0f1a14 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(rgba(197,160,89,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(197,160,89,0.22) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at 50% 40%, black 10%, transparent 70%)",
        }}
      />

      <header className="relative z-10 mx-auto mb-6 max-w-md px-6 text-center">
        <p className="mag-label mb-3" style={{ color: "#C5A059" }}>
          GEAR · 裝備
        </p>
        <h2
          className="mag-title"
          style={{
            fontSize: "clamp(1.5rem, 6vw, 1.85rem)",
            color: "#F7F4ED",
            textShadow: "0 0 28px rgba(197,160,89,0.25)",
          }}
        >
          裝備牆
        </h2>
        <div
          className="mx-auto mt-5"
          aria-hidden
          style={{
            height: 1,
            width: "2.75rem",
            background: "linear-gradient(90deg, transparent, #C5A059, transparent)",
          }}
        />
        <p
          className="mx-auto mt-4"
          style={{
            fontSize: "0.8125rem",
            letterSpacing: "0.1em",
            maxWidth: "22em",
            color: "rgba(247,244,237,0.55)",
            lineHeight: 1.7,
          }}
        >
          點霧金熱點——白帽金徽、SUNLINE、LIMITED PRO、SHIMANO。粉專本人真圖，不亂改字。
        </p>
      </header>

      <div className="relative z-10 mx-auto w-full max-w-lg px-4">
        <div
          className="relative overflow-hidden"
          style={{
            border: "1px solid rgba(197,160,89,0.5)",
            boxShadow:
              "0 0 48px rgba(197,160,89,0.12), 0 24px 60px rgba(0,0,0,0.45)",
            background: "#050a10",
          }}
          data-testid="gear-wall"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/media/fb/refs/ref_gear_full.jpg"
            alt="鹿港漁人全副裝備（粉專真圖）"
            className="block w-full"
            style={{ display: "block", width: "100%", height: "auto" }}
          />

          {items.map((item) => {
            const on = active?.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-label={item.name}
                aria-pressed={on}
                onClick={() => {
                  tap();
                  setActive(item);
                }}
                className={on ? "lf-gear-hot is-active" : "lf-gear-hot"}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                }}
              >
                <span className="lf-gear-hot-ring" />
                <span className="lf-gear-hot-core" />
              </button>
            );
          })}
        </div>

        {/* chip rail */}
        <ul
          className="mt-4 flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
          aria-label="裝備快捷"
        >
          {items.map((item) => {
            const on = active?.id === item.id;
            return (
              <li key={item.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    tap();
                    setActive(item);
                  }}
                  className="whitespace-nowrap transition active:opacity-90"
                  style={{
                    minHeight: 36,
                    paddingInline: "0.9rem",
                    border: on
                      ? "1px solid var(--color-gold)"
                      : "1px solid rgba(247,244,237,0.18)",
                    background: on ? "rgba(197,160,89,0.22)" : "rgba(7,14,22,0.55)",
                    color: on ? "#C5A059" : "rgba(247,244,237,0.78)",
                    fontFamily: "var(--font-display)",
                    fontSize: "0.6875rem",
                    letterSpacing: "0.18em",
                  }}
                >
                  {item.name}
                </button>
              </li>
            );
          })}
        </ul>

        {active && (
          <aside
            className="mt-5 lf-glass-card"
            aria-live="polite"
            data-testid="gear-detail"
            style={{
              background: "rgba(247,244,237,0.08)",
              border: "1px solid rgba(197,160,89,0.5)",
              backdropFilter: "blur(18px) saturate(1.2)",
              WebkitBackdropFilter: "blur(18px) saturate(1.2)",
              padding: "1.15rem 1.25rem",
              boxShadow: "0 18px 48px rgba(0,0,0,0.35)",
            }}
          >
            <p className="mag-label mb-2" style={{ color: "#C5A059" }}>
              {active.brand}
            </p>
            <h3
              className="mag-title"
              style={{
                fontSize: "1.125rem",
                letterSpacing: "0.18em",
                color: "#F7F4ED",
              }}
            >
              {active.name}
            </h3>
            <p
              className="mt-3 leading-relaxed"
              style={{
                fontSize: "0.875rem",
                letterSpacing: "0.04em",
                color: "rgba(247,244,237,0.72)",
              }}
            >
              {active.blurb}
            </p>
          </aside>
        )}
      </div>
    </section>
  );
}
