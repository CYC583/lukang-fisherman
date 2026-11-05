"use client";

import { useState } from "react";
import { getGuess } from "@/lib/content";
import { sfx } from "@/lib/sfx";
import { useSound } from "./SoundContext";

export function GuessWeight() {
  const g = getGuess();
  const { soundOn } = useSound();
  const [picked, setPicked] = useState<string | null>(null);
  const revealed = picked !== null;

  return (
    <section id="guess" className="bg-[var(--color-indigo)] px-5 py-14 text-[var(--color-paper)]">
      <div className="mx-auto mb-6 max-w-md text-center">
        <p className="mb-2 text-[10px] tracking-[0.45em] text-[var(--color-gold)]">PLAY · 朋友來玩</p>
        <h2 className="text-2xl font-bold tracking-[0.25em]">{g.prompt}</h2>
      </div>
      <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-[var(--color-gold)]/30 bg-black/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={g.image} alt="猜重量的漁獲" className="aspect-[4/5] w-full object-cover" />
        <div className="space-y-3 p-4">
          {!revealed ? (
            <div className="grid gap-2">
              {g.choices.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    if (soundOn) sfx.tap();
                    setPicked(c.id);
                    if (soundOn) setTimeout(() => (c.id === g.answerId ? sfx.confirm() : sfx.splash()), 120);
                  }}
                  className="rounded-full border border-[var(--color-gold)]/50 px-4 py-3 text-sm tracking-widest transition active:scale-95"
                >
                  {c.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2 text-center">
              <p className="text-[var(--color-gold)] tracking-widest">
                {picked === g.answerId ? "漂亮，差不多！" : "差一點——揭曉："}
              </p>
              <p className="text-lg font-bold tracking-widest">
                {g.choices.find((c) => c.id === g.answerId)?.label}
              </p>
              <p className="text-sm leading-relaxed text-white/80">{g.reveal}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
