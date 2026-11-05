"use client";
import { useRef, useState } from "react";

const THRESHOLD = 60;

export function CastInteraction({ onDone }: { onDone?: () => void }) {
  const [state, setState] = useState<"idle" | "cast" | "skipped">("idle");
  const start = useRef<number | null>(null);

  const finish = (s: "cast" | "skipped") => {
    if (state !== "idle") return;
    setState(s);
    onDone?.();
  };

  return (
    <div className="mx-auto max-w-sm px-6 py-12 text-center">
      {state === "idle" ? (
        <>
          <div
            role="region"
            aria-label="往上滑拋竿"
            className="relative mx-auto flex h-48 touch-none select-none items-end justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-[var(--color-indigo)]/5 to-[var(--color-indigo)]/20"
            onPointerDown={(e) => (start.current = e.clientY)}
            onPointerUp={(e) => {
              if (start.current !== null && start.current - e.clientY > THRESHOLD) finish("cast");
              start.current = null;
            }}
          >
            <span className="mb-4 animate-bounce text-sm tracking-[0.3em]">↑ 往上一甩，拋竿！</span>
          </div>
          <button type="button" onClick={() => finish("skipped")} className="mt-3 text-xs tracking-widest underline opacity-60">
            略過拋竿
          </button>
        </>
      ) : (
        <p className="text-xl font-bold tracking-[0.3em] text-[var(--color-gold)]">
          {state === "cast" ? "漂亮！上鉤了！" : "師傅幫你甩了——上鉤！"}
        </p>
      )}
    </div>
  );
}
