"use client";

import { useEffect, useRef, useState } from "react";
import { getStories, type Story } from "@/lib/content";
import { useSound } from "./SoundContext";
import { CastInteraction } from "./CastInteraction";

function CinematicClip({
  story,
  index,
  soundOn,
}: {
  story: Story;
  index: number;
  soundOn: boolean | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [line, setLine] = useState(0);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !story.media || story.media.type !== "video") return;
    v.muted = soundOn !== true;
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, [soundOn, story.media]);

  useEffect(() => {
    if (!story.narration?.length) return;
    const id = setInterval(() => {
      setLine((n) => (n + 1) % story.narration.length);
    }, 4200);
    return () => clearInterval(id);
  }, [story.narration]);

  const media = story.media;

  return (
    <article className="relative flex min-h-dvh w-full snap-start flex-col justify-end overflow-hidden bg-[var(--color-charcoal)]">
      {media?.type === "video" ? (
        <video
          ref={videoRef}
          src={media.src}
          aria-label={media.alt}
          autoPlay
          muted={soundOn !== true}
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : media ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media.src} alt={media.alt} className="absolute inset-0 h-full w-full object-cover" />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/35" />

      {/* Broadcast chrome */}
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-5 pt-5">
        <span className="text-[10px] tracking-[0.45em] text-white/75">
          CH.{story.chapter} · 鹿港漁人
        </span>
        <span className="rounded-sm bg-[var(--color-gold)]/90 px-2 py-0.5 text-[9px] font-bold tracking-widest text-[var(--color-indigo)]">
          ON AIR
        </span>
      </div>

      {/* Cinematic lower-third narration — continuous TV feel, not clip+caption stack */}
      <div className="relative z-10 px-6 pb-16 pt-24">
        <p className="mb-3 text-[11px] tracking-[0.4em] text-[var(--color-gold)]">
          {String(index + 1).padStart(2, "0")} / {story.title}
        </p>
        <h2 className="mb-5 text-2xl font-bold tracking-[0.2em] text-[var(--color-paper)] drop-shadow-md">
          {story.title}
        </h2>
        <div className="min-h-[4.5rem] border-l-2 border-[var(--color-gold)] pl-4">
          <p
            key={line}
            className="animate-[fadeIn_0.7s_ease-out] text-base leading-relaxed tracking-wide text-[var(--color-paper)]/95"
          >
            {story.narration[line]}
          </p>
        </div>
        {media?.credit && (
          <p className="mt-6 text-[9px] tracking-widest text-white/40">{media.credit}</p>
        )}
      </div>
    </article>
  );
}

export function StoryCinema() {
  const stories = getStories();
  const { soundOn } = useSound();

  return (
    <section id="story" className="scroll-mt-0 snap-y snap-mandatory">
      {stories.map((s, i) => (
        <div key={s.id}>
          <CinematicClip story={s} index={i} soundOn={soundOn} />
          {i === 0 && (
            <div className="bg-[var(--color-paper)]">
              <CastInteraction />
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
