"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type SoundCtx = {
  /** null = not chosen yet (gate visible) */
  soundOn: boolean | null;
  choose: (on: boolean) => void;
  toggle: () => void;
};

const Ctx = createContext<SoundCtx | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [soundOn, setSoundOn] = useState<boolean | null>(null);
  const choose = useCallback((on: boolean) => setSoundOn(on), []);
  const toggle = useCallback(() => setSoundOn((s) => (s === null ? true : !s)), []);
  const value = useMemo(() => ({ soundOn, choose, toggle }), [soundOn, choose, toggle]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSound() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSound must be used within SoundProvider");
  return ctx;
}
