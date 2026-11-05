"use client";

import { getLogbook, getSite } from "@/lib/content";
import { sfx } from "@/lib/sfx";
import { useSound } from "./SoundContext";

/**
 * 釣行 album — extension of the map (fewer pure stacks).
 * Each plate can deep-link from a map pin via #log-<id>.
 */
export function SeaLogbook() {
  const entries = getLogbook();
  const site = getSite();
  const { soundOn } = useSound();

  return (
    <section
      id="logbook"
      aria-label="釣行"
      className="scroll-mt-0 snap-start bg-[var(--color-paper)] px-0"
      style={{ paddingTop: "4.5rem", paddingBottom: "3.5rem" }}
    >
      <header className="mx-auto mb-10 max-w-md px-6 text-center">
        <p className="mag-label mb-3">TSURIKOU · 釣行</p>
        <h2
          className="mag-title text-[var(--color-indigo)]"
          style={{ fontSize: "clamp(1.5rem, 6vw, 1.75rem)" }}
        >
          出海日誌
        </h2>
        <div className="mag-rule mx-auto mt-5" aria-hidden />
        <p
          className="mx-auto mt-4 text-[var(--color-indigo)]/50"
          style={{ fontSize: "0.75rem", letterSpacing: "0.14em", maxWidth: "18em" }}
        >
          地圖標點的延伸。想看更多，回粉專與部落格。
        </p>
      </header>

      <ol className="mx-auto flex max-w-lg flex-col" style={{ gap: "3.25rem" }}>
        {entries.map((e, i) => (
          <li
            key={e.id}
            id={`log-${e.id}`}
            className="w-full scroll-mt-8"
            style={{
              animation: "fadeIn 0.55s ease both",
              animationDelay: `${Math.min(i, 3) * 50}ms`,
            }}
          >
            <figure className="m-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={e.image}
                alt={`${e.species} · ${e.place}`}
                className="w-full object-cover"
                style={{
                  height: "min(62vw, 20rem)",
                  objectPosition: "center 35%",
                }}
                loading={i < 2 ? "eager" : "lazy"}
              />
              <figcaption className="px-6 pt-4">
                <p className="mag-label mb-2">
                  {e.date}
                  <span className="mx-2 opacity-40">·</span>
                  {e.place}
                </p>
                <p
                  className="mag-title mb-2 text-[var(--color-indigo)]"
                  style={{ fontSize: "1.0625rem", letterSpacing: "0.22em" }}
                >
                  {e.species}
                </p>
                <p
                  className="leading-relaxed text-[var(--color-indigo)]/75"
                  style={{
                    fontSize: "0.875rem",
                    letterSpacing: "0.04em",
                    maxWidth: "22em",
                  }}
                >
                  {e.line}
                </p>
                {e.spotId && (
                  <a
                    href="#map"
                    onClick={() => {
                      if (soundOn === true) sfx.tap();
                    }}
                    className="mt-3 inline-block text-[var(--color-gold)]"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.6875rem",
                      letterSpacing: "0.22em",
                    }}
                  >
                    在地圖上看 →
                  </a>
                )}
              </figcaption>
            </figure>
          </li>
        ))}
      </ol>

      <div className="mx-auto mt-14 flex max-w-sm flex-col gap-2.5 px-6">
        <a
          href={site.facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            if (soundOn === true) sfx.tap();
          }}
          className="flex w-full items-center justify-center font-bold transition active:opacity-90"
          style={{
            minHeight: 50,
            background: "var(--color-gold)",
            color: "var(--color-indigo)",
            fontFamily: "var(--font-display)",
            fontSize: "0.875rem",
            letterSpacing: "0.22em",
          }}
        >
          {site.primaryCta}
        </a>
        <a
          href={site.pixnetUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            if (soundOn === true) sfx.tap();
          }}
          className="flex w-full items-center justify-center transition active:opacity-90"
          style={{
            minHeight: 48,
            border: "1px solid var(--color-indigo)",
            color: "var(--color-indigo)",
            background: "transparent",
            fontFamily: "var(--font-display)",
            fontSize: "0.875rem",
            letterSpacing: "0.22em",
            fontWeight: 600,
          }}
        >
          {site.secondaryCta}
        </a>
      </div>
    </section>
  );
}
