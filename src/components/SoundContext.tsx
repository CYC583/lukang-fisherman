"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { setSfxEnabled } from "@/lib/sfx";

type SoundCtx = {
  soundOn: boolean | null;
  introDone: boolean;
  choose: (on: boolean) => void;
  toggle: () => void;
  markIntroDone: () => void;
};

const Ctx = createContext<SoundCtx | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [soundOn, setSoundOn] = useState<boolean | null>(null);
  const [introDone, setIntroDone] = useState(false);
  const choose = useCallback((on: boolean) => setSoundOn(on), []);
  const toggle = useCallback(() => setSoundOn((s) => (s === null ? true : !s)), []);
  const markIntroDone = useCallback(() => setIntroDone(true), []);

  useEffect(() => {
    setSfxEnabled(soundOn === true);
  }, [soundOn]);

  const value = useMemo(
    () => ({ soundOn, introDone, choose, toggle, markIntroDone }),
    [soundOn, introDone, choose, toggle, markIntroDone],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSound() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSound must be used within SoundProvider");
  return ctx;
}

export function useSoundOptional(): SoundCtx {
  return (
    useContext(Ctx) ?? {
      soundOn: null,
      introDone: false,
      choose: () => {},
      toggle: () => {},
      markIntroDone: () => {},
    }
  );
}
