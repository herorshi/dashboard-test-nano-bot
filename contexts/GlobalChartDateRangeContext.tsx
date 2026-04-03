"use client";

import { endOfDay, startOfDay, subDays } from "date-fns";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

function createDefaultGlobalRange(): { start: Date; end: Date } {
  const end = endOfDay(new Date());
  const start = startOfDay(subDays(end, 6));
  return { start, end };
}

type GlobalClearPayload = { start: Date; end: Date };

type Listener = (range: GlobalClearPayload) => void;

type GlobalChartDateRangeContextValue = {
  globalStart: Date | null;
  globalEnd: Date | null;
  setGlobalRange: (start: Date | null, end: Date | null) => void;
  /** เลิกโหมดซิงค์ global — ผูกช่วงล่าสุดเข้า local ของทุกกราฟ */
  exitGlobalSyncMode: () => void;
  subscribeGlobalClear: (fn: Listener) => () => void;
};

const GlobalChartDateRangeContext =
  createContext<GlobalChartDateRangeContextValue | null>(null);

export function GlobalChartDateRangeProvider({ children }: { children: ReactNode }) {
  const initRange = useMemo(() => createDefaultGlobalRange(), []);
  const [globalStart, setGlobalStart] = useState<Date | null>(initRange.start);
  const [globalEnd, setGlobalEnd] = useState<Date | null>(initRange.end);
  const listenersRef = useRef<Set<Listener>>(new Set());

  const subscribeGlobalClear = useCallback((fn: Listener) => {
    listenersRef.current.add(fn);
    return () => {
      listenersRef.current.delete(fn);
    };
  }, []);

  const exitGlobalSyncMode = useCallback(() => {
    const payload =
      globalStart != null && globalEnd != null
        ? { start: globalStart, end: globalEnd }
        : null;
    setGlobalStart(null);
    setGlobalEnd(null);
    if (payload) {
      listenersRef.current.forEach((fn) => {
        fn(payload);
      });
    }
  }, [globalStart, globalEnd]);

  const setGlobalRange = useCallback((start: Date | null, end: Date | null) => {
    setGlobalStart(start ? startOfDay(start) : null);
    setGlobalEnd(end ? endOfDay(end) : null);
  }, []);

  const value = useMemo(
    () => ({
      globalStart,
      globalEnd,
      setGlobalRange,
      exitGlobalSyncMode,
      subscribeGlobalClear,
    }),
    [
      globalStart,
      globalEnd,
      setGlobalRange,
      exitGlobalSyncMode,
      subscribeGlobalClear,
    ],
  );

  return (
    <GlobalChartDateRangeContext.Provider value={value}>
      {children}
    </GlobalChartDateRangeContext.Provider>
  );
}

export function useGlobalChartDateRange(): GlobalChartDateRangeContextValue {
  const ctx = useContext(GlobalChartDateRangeContext);
  if (!ctx) {
    throw new Error("ใช้ useGlobalChartDateRange ภายใน GlobalChartDateRangeProvider");
  }
  return ctx;
}

export function useGlobalChartDateRangeOptional(): GlobalChartDateRangeContextValue | null {
  return useContext(GlobalChartDateRangeContext);
}
