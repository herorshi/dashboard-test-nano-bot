"use client";

import { createContext, useContext } from "react";

/** เพิ่มทีละ 1 หลังลากสลับกราฟ — ให้ line chart remount เพื่อแก่ Apex หลัง DOM ย้าย */
export const DashboardDndLayoutTickContext = createContext(0);

export function useDashboardDndLayoutTick(): number {
  return useContext(DashboardDndLayoutTickContext);
}
