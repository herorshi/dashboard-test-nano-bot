"use client";

import { createContext, useContext, type ReactNode } from "react";

const ChartExpandContext = createContext(false);

export function ChartExpandProvider({
  value,
  children,
}: {
  value: boolean;
  children: ReactNode;
}) {
  return (
    <ChartExpandContext.Provider value={value}>
      {children}
    </ChartExpandContext.Provider>
  );
}

export function useChartExpand(): boolean {
  return useContext(ChartExpandContext);
}
