"use client";

import { WidgetCardClearContext } from "@/contexts/WidgetCardLeaveContext";
import { useChartExpand } from "@/contexts/ChartExpandContext";
import type { HTMLAttributes, ReactNode } from "react";
import { useCallback, useRef } from "react";

type WidgetProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** แถบหัวรับ listeners จาก dnd-kit เมื่อต้องการลากสลับลำดับ */
  dragHandleProps?: HTMLAttributes<HTMLDivElement>;
  /** แสดง placeholder แทน children (เช่น ตอนลาก — ไม่รัน Apex ใน DragOverlay) */
  suspendContent?: boolean;
};

export function Widget({
  title,
  subtitle,
  children,
  dragHandleProps,
  suspendContent = false,
}: WidgetProps) {
  const isDraggable = Boolean(dragHandleProps);
  const expand = useChartExpand();
  const cardLeaveListenersRef = useRef(new Set<() => void>());

  const registerCardLeaveClear = useCallback((fn: () => void) => {
    cardLeaveListenersRef.current.add(fn);
    return () => {
      cardLeaveListenersRef.current.delete(fn);
    };
  }, []);

  const notifyCardLeave = useCallback(() => {
    cardLeaveListenersRef.current.forEach((fn) => fn());
  }, []);

  const onCardPointerLeave = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rt = e.relatedTarget;
      if (rt instanceof Node && e.currentTarget.contains(rt)) return;
      notifyCardLeave();
    },
    [notifyCardLeave],
  );

  return (
    <div
      className={`flex w-full min-w-0 max-w-full flex-col rounded-2xl border border-sky-200/90 bg-white/95 shadow-lg shadow-sky-200/40 ring-1 ring-white/90 ${
        expand
          ? "h-auto overflow-x-hidden overflow-y-visible"
          : "h-full min-h-[300px] overflow-hidden"
      }`}
      onPointerLeave={onCardPointerLeave}
    >
      <WidgetCardClearContext.Provider value={registerCardLeaveClear}>
        <div
          className={`flex shrink-0 select-none items-start justify-between gap-2 border-b border-sky-100 bg-linear-to-r from-sky-50/95 via-white to-teal-50/80 px-4 py-3 ${
            isDraggable
              ? "cursor-grab touch-none active:cursor-grabbing"
              : ""
          }`}
          {...dragHandleProps}
        >
          <div className="min-w-0">
            <h2 className="text-sm font-semibold tracking-wide text-slate-800">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
            ) : null}
          </div>
        </div>
        <div
          className={`flex flex-col gap-2 bg-white p-3 ${
            expand ? "" : "min-h-0 flex-1"
          }`}
        >
          <div
            className={`flex min-w-0 flex-col ${expand ? "" : "min-h-0 flex-1"}`}
          >
            {suspendContent ? (
              <div
                className="min-h-[240px] w-full min-w-0 flex-1 rounded-lg bg-slate-100/50 ring-1 ring-slate-200/40"
                aria-hidden
              />
            ) : (
              children
            )}
          </div>
        </div>
      </WidgetCardClearContext.Provider>
    </div>
  );
}
