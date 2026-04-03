"use client";

import { createContext, useContext, useEffect } from "react";

/** ลงทะเบียน callback เมื่อเมาส์ออกจากการ์ด Widget ทั้งใบ */
export const WidgetCardClearContext = createContext<
  ((fn: () => void) => () => void) | null
>(null);

export function useRegisterWidgetCardLeaveClear(onClear: () => void) {
  const register = useContext(WidgetCardClearContext);
  useEffect(() => {
    if (!register) return;
    return register(onClear);
  }, [register, onClear]);
}
