"use client";

import { useCallback, useRef, useState } from "react";
import { getMemories, getSite } from "@/lib/content";
import { sfx } from "@/lib/sfx";
import { useSoundOptional } from "./SoundContext";

/**
 * 磯の記録 — quiet Japanese editorial plates.
 * Replaces 「釣友會想傳的幾張」. Tap opens mist-gold 9:16 postcard for save.
 */
export function MemoryPostcards() {
  const memories = getMemories();
  const site = getSite();
  const { soundOn } = useSoundOptional();
  const [open, setOpen] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const tap = () => {
    if (soundOn === true) sfx.tap();
  };

  const savePostcard = useCallback(async (imageSrc: string, title: string, blurb: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = 1080;
    const h = 1920;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // paper field
    ctx.fillStyle = "#F7F4ED";
    ctx.fillRect(0, 0, w, h);

    // thin mist-gold frame
    ctx.strokeStyle = "#C5A059";
    ctx.lineWidth = 3;
    ctx.strokeRect(48, 48, w - 96, h - 96);
    ctx.strokeStyle = "rgba(197,160,89,0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(64, 64, w - 128, h - 128);

    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("img"));
      img.src = imageSrc;
    }).catch(() => undefined);

    if (img.naturalWidth) {
      const boxX = 96;
      const boxY = 140;
      const boxW = w - 192;
      const boxH = 1180;
      const scale = Math.max(boxW / img.naturalWidth, boxH / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      const dx = boxX + (boxW - dw) / 2;
      const dy = boxY + (boxH - dh) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.rect(boxX, boxY, boxW, boxH);
      ctx.clip();
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
      ctx.strokeStyle = "rgba(197,160,89,0.45)";
      ctx.lineWidth = 1;
      ctx.strokeRect(boxX, boxY, boxW, boxH);
    }

    ctx.fillStyle = "#C5A059";
    ctx.font = "600 28px 'Noto Serif JP', serif";
    ctx.textAlign = "center";
    ctx.fillText("磯の記録", w / 2, 1480);

    ctx.fillStyle = "#1A1A1A";
    ctx.font = "700 52px 'Noto Serif TC', serif";
    ctx.fillText(title, w / 2, 1560);

    ctx.fillStyle = "rgba(26,26,26,0.7)";
    ctx.font = "500 34px 'Noto Serif TC', serif";
    ctx.fillText(blurb, w / 2, 1630);

    ctx.fillStyle = "rgba(197,160,89,0.85)";
    ctx.font = "600 26px 'Noto Serif JP', serif";
    ctx.fillText("鹿港漁人", w / 2, 1740);

    const a = document.createElement("a");
    a.download = `lukang-${title}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  }, []);

  return (
    <section
      id="memories"
      aria-label="磯の記録"
      className="snap-start bg-[var(--color-indigo)] text-[var(--color-paper)]"
      style={{ paddingTop: "4.5rem", paddingBottom: "4rem" }}
    >
      <header className="mx-auto mb-12 max-w-md px-6 text-center">
        <p className="mag-label mb-3">ISO NO KIROKU</p>
        <h2
          className="mag-title"
          style={{ fontSize: "clamp(1.5rem, 6vw, 1.75rem)", color: "var(--color-paper)" }}
        >
          磯の記録
        </h2>
        <div className="mag-rule mx-auto mt-5" aria-hidden />
        <p
          className="mx-auto mt-5 leading-relaxed text-[var(--color-paper)]/55"
          style={{ fontSize: "0.8125rem", letterSpacing: "0.12em", maxWidth: "16em" }}
        >
          公開釣行。點開留下紀念。
        </p>
      </header>

      <div className="mx-auto flex max-w-lg flex-col" style={{ gap: "3.25rem" }}>
        {memories.map((m, i) => {
          const expanded = open === m.id;
          return (
            <article key={m.id} className="px-0">
              <button
                type="button"
                onClick={() => {
                  tap();
                  setOpen(expanded ? null : m.id);
                }}
                className="block w-full text-left"
                aria-expanded={expanded}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.image}
                  alt={m.title}
                  className="w-full object-cover"
                  style={{
                    height: expanded ? "min(92vw, 36rem)" : "min(72vw, 24rem)",
                    objectPosition: "center 30%",
                    transition: "height 0.35s ease",
                  }}
                  loading={i === 0 ? "eager" : "lazy"}
                />
                <div className="flex items-end justify-between gap-4 px-6 pt-4">
                  <div>
                    <p className="mag-label mb-1.5">{m.badge}</p>
                    <h3
                      className="mag-title"
                      style={{ fontSize: "1.0625rem", letterSpacing: "0.2em" }}
                    >
                      {m.title}
                    </h3>
                    <p
                      className="mt-1.5 text-[var(--color-paper)]/60"
                      style={{ fontSize: "0.8125rem", letterSpacing: "0.06em" }}
                    >
                      {m.blurb}
                    </p>
                  </div>
                  <span
                    className="shrink-0 pb-0.5 text-[var(--color-gold)]"
                    style={{ fontSize: "0.625rem", letterSpacing: "0.28em" }}
                  >
                    {expanded ? "收合" : "展開"}
                  </span>
                </div>
              </button>

              {expanded && (
                <div className="mt-4 flex items-center gap-3 px-6">
                  <button
                    type="button"
                    onClick={() => {
                      tap();
                      void savePostcard(m.image, m.title, m.blurb);
                    }}
                    className="inline-flex items-center justify-center transition active:opacity-90"
                    style={{
                      minHeight: 44,
                      paddingInline: "1.25rem",
                      border: "1px solid rgba(197,160,89,0.7)",
                      color: "var(--color-gold)",
                      fontFamily: "var(--font-display)",
                      fontSize: "0.75rem",
                      letterSpacing: "0.28em",
                    }}
                  >
                    留下紀念
                  </button>
                  <span
                    className="text-[var(--color-paper)]/35"
                    style={{ fontSize: "0.625rem", letterSpacing: "0.2em" }}
                  >
                    9:16 霧金框
                  </span>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="mx-auto mt-14 flex max-w-sm flex-col gap-2.5 px-6 text-center">
        <a
          href={site.facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={tap}
          className="flex w-full items-center justify-center font-bold transition active:opacity-90"
          style={{
            minHeight: 52,
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
          onClick={tap}
          className="flex w-full items-center justify-center transition active:opacity-90"
          style={{
            minHeight: 48,
            border: "1px solid rgba(197,160,89,0.7)",
            color: "var(--color-gold)",
            fontFamily: "var(--font-display)",
            fontSize: "0.875rem",
            letterSpacing: "0.22em",
          }}
        >
          {site.secondaryCta}
        </a>
      </div>

      <canvas ref={canvasRef} className="hidden" aria-hidden />
    </section>
  );
}
