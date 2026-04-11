"use client";

import { useChartExpand } from "@/contexts/ChartExpandContext";
import { useRegisterWidgetCardLeaveClear } from "@/contexts/WidgetCardLeaveContext";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

type Handle =
  | "nw"
  | "ne"
  | "sw"
  | "se"
  | "n"
  | "s"
  | "e"
  | "w";

const MIN_W = 200;
const MIN_H = 160;

const DRAG_ACTIVATE_PX = 6;

const handleCursor: Record<Handle, string> = {
  nw: "cursor-nwse-resize",
  ne: "cursor-nesw-resize",
  sw: "cursor-nesw-resize",
  se: "cursor-nwse-resize",
  n: "cursor-ns-resize",
  s: "cursor-ns-resize",
  e: "cursor-ew-resize",
  w: "cursor-ew-resize",
};

function applyHandleDelta(
  handle: Handle,
  dx: number,
  dy: number,
  startW: number,
  startH: number,
) {
  let w = startW;
  let h = startH;
  switch (handle) {
    case "se":
      w = startW + dx;
      h = startH + dy;
      break;
    case "sw":
      w = startW - dx;
      h = startH + dy;
      break;
    case "ne":
      w = startW + dx;
      h = startH - dy;
      break;
    case "nw":
      w = startW - dx;
      h = startH - dy;
      break;
    case "e":
      w = startW + dx;
      break;
    case "w":
      w = startW - dx;
      break;
    case "s":
      h = startH + dy;
      break;
    case "n":
      h = startH - dy;
      break;
  }
  return { w, h };
}

const HANDLES: Handle[] = ["nw", "ne", "sw", "se", "n", "s", "e", "w"];


const RESIZE_PROXIMITY_PX = 28;

function computeNearbyHandles(
  clientX: number,
  clientY: number,
  rect: DOMRect,
): Set<Handle> {
  const w = rect.width;
  const h = rect.height;
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const P = RESIZE_PROXIMITY_PX;

  if (x < -P || y < -P || x > w + P || y > h + P) {
    return new Set();
  }

  const ix = Math.max(0, Math.min(w, x));
  const iy = Math.max(0, Math.min(h, y));

  const inLeft = ix < P;
  const inRight = ix > w - P;
  const inTop = iy < P;
  const inBottom = iy > h - P;

  const next = new Set<Handle>();
  if (inTop && inLeft) next.add("nw");
  else if (inTop && inRight) next.add("ne");
  else if (inBottom && inLeft) next.add("sw");
  else if (inBottom && inRight) next.add("se");
  else if (inTop) next.add("n");
  else if (inBottom) next.add("s");
  else if (inLeft) next.add("w");
  else if (inRight) next.add("e");

  return next;
}


const handleLayout: Record<Handle, string> = {
  nw: "top-0 left-0 z-30 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center",
  ne: "top-0 right-0 z-30 flex h-7 w-7 translate-x-1/2 -translate-y-1/2 items-center justify-center",
  sw: "bottom-0 left-0 z-30 flex h-7 w-7 -translate-x-1/2 translate-y-1/2 items-center justify-center",
  se: "bottom-0 right-0 z-30 flex h-7 w-7 translate-x-1/2 translate-y-1/2 items-center justify-center",
  n: "top-0 left-1/2 z-30 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center",
  s: "bottom-0 left-1/2 z-30 flex h-7 w-7 -translate-x-1/2 translate-y-1/2 items-center justify-center",
  e: "top-1/2 right-0 z-30 flex h-7 w-7 -translate-y-1/2 translate-x-1/2 items-center justify-center",
  w: "top-1/2 left-0 z-30 flex h-7 w-7 -translate-y-1/2 -translate-x-1/2 items-center justify-center",
};

export type ResizableChartPlotProps = {
  defaultHeight?: number;
  children: (size: { width: number; height: number }) => ReactNode;
};

export function ResizableChartPlot({
  defaultHeight = 246,
  children,
}: ResizableChartPlotProps) {
  const fillRegion = useChartExpand();
  const shellRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [nearbyHandles, setNearbyHandles] = useState<Set<Handle>>(() => new Set());
  const [resizing, setResizing] = useState(false);
  const rafHoverRef = useRef<number | null>(null);
  const lastPointerRef = useRef({ x: 0, y: 0 });

  const dragRef = useRef<{
    handle: Handle;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    activated: boolean;
  } | null>(null);
  /** โหมดลากปรับขนาดเอง — ref ให้ ResizeObserver อ่านค่าล่าสุดโดยไม่ต้องรี subscribing */
  const userSizedRef = useRef(false);
  const [userSized, setUserSized] = useState(false);
  const sizeRef = useRef({ w: MIN_W, h: defaultHeight });
  const [size, setSize] = useState({
    w: MIN_W,
    h: Math.max(MIN_H, defaultHeight),
  });
  sizeRef.current = size;

  const markUserSized = useCallback(() => {
    userSizedRef.current = true;
    setUserSized(true);
  }, []);

  const readBounds = useCallback(() => {
    const el = shellRef.current;
    if (!el) return { w: 800, h: 600 };
    const r = el.getBoundingClientRect();
    return {
      w: Math.max(MIN_W, Math.floor(r.width)),
      h: Math.max(MIN_H, Math.floor(r.height)),
    };
  }, []);

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    const update = () => {
      const { w: bw, h: bh } = readBounds();
      setSize((prev) => {
        if (!userSizedRef.current) {
          const autoH = fillRegion
            ? Math.max(MIN_H, bh)
            : Math.min(
                Math.max(MIN_H, defaultHeight),
                Math.max(MIN_H, bh),
              );
          return {
            w: Math.max(MIN_W, bw),
            h: autoH,
          };
        }
        return {
          w: Math.min(Math.max(MIN_W, prev.w), bw),
          h: Math.min(Math.max(MIN_H, prev.h), bh),
        };
      });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [readBounds, defaultHeight, fillRegion]);

  const flushSize = useCallback((next: { w: number; h: number }) => {
    const { w: maxW, h: maxH } = readBounds();
    setSize({
      w: Math.min(Math.max(MIN_W, next.w), maxW),
      h: Math.min(Math.max(MIN_H, next.h), maxH),
    });
  }, [readBounds]);

  const onHandleDown = useCallback(
    (handle: Handle) => (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setResizing(true);
      const b = readBounds();
      const { w, h } = sizeRef.current;
      dragRef.current = {
        handle,
        startX: e.clientX,
        startY: e.clientY,
        startW: userSizedRef.current ? w : b.w,
        startH: h,
        activated: false,
      };
    },
    [readBounds],
  );

  const updateNearbyHandles = useCallback((clientX: number, clientY: number) => {
    const inner = innerRef.current;
    if (!inner) return;
    setNearbyHandles(computeNearbyHandles(clientX, clientY, inner.getBoundingClientRect()));
  }, []);

  const onShellPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      if (resizing) return;
      if (rafHoverRef.current != null) return;
      rafHoverRef.current = requestAnimationFrame(() => {
        rafHoverRef.current = null;
        const { x, y } = lastPointerRef.current;
        updateNearbyHandles(x, y);
      });
    },
    [resizing, updateNearbyHandles],
  );

  const clearNearbyHandles = useCallback(() => {
    setNearbyHandles(new Set());
  }, []);

  useRegisterWidgetCardLeaveClear(clearNearbyHandles);

  useEffect(() => {
    return () => {
      if (rafHoverRef.current != null) {
        cancelAnimationFrame(rafHoverRef.current);
        rafHoverRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const ctx = dragRef.current;
      if (!ctx) return;
      if (!ctx.activated) {
        const d = Math.hypot(e.clientX - ctx.startX, e.clientY - ctx.startY);
        if (d < DRAG_ACTIVATE_PX) return;
        ctx.activated = true;
        markUserSized();
      }
      const { w: maxW, h: maxH } = readBounds();
      const dx = e.clientX - ctx.startX;
      const dy = e.clientY - ctx.startY;
      let { w, h } = applyHandleDelta(
        ctx.handle,
        dx,
        dy,
        ctx.startW,
        ctx.startH,
      );
      w = Math.min(Math.max(MIN_W, w), maxW);
      h = Math.min(Math.max(MIN_H, h), maxH);
      flushSize({ w, h });
    };
    const endDrag = () => {
      dragRef.current = null;
      setResizing(false);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
  }, [flushSize, readBounds, markUserSized]);

  return (
    <div
      ref={shellRef}
      onPointerMove={onShellPointerMove}
      onPointerLeave={clearNearbyHandles}
      className={
        fillRegion
          ? "relative w-full min-w-0 min-h-[min(18rem,38svh)] sm:min-h-[min(22rem,42svh)] overflow-visible"
          : "relative w-full min-w-0 min-h-[min(11rem,28svh)] sm:min-h-[200px] flex-1 overflow-visible"
      }
    >
      <div
        ref={innerRef}
        className={`relative min-h-0 rounded-xl ${
          fillRegion ? "w-full overflow-visible" : "overflow-visible"
        } ${userSized ? "mx-auto max-w-full shrink-0" : "w-full min-w-0"}`}
        style={
          userSized
            ? { width: size.w, height: size.h }
            : { width: "100%", maxWidth: "100%", height: size.h }
        }
      >
        {children({ width: size.w, height: size.h })}
        {HANDLES.map((h) => {
          const showGrip = resizing || nearbyHandles.has(h);
          return (
            <button
              key={h}
              type="button"
              aria-label="ปรับขนาดกราฟ"
              title="ลากเพื่อปรับขนาด"
              tabIndex={-1}
              className={`absolute touch-none border-0 bg-transparent p-0 shadow-none outline-none transition-opacity duration-150 ease-out focus-visible:ring-2 focus-visible:ring-teal-400/35 ${handleLayout[h]} ${handleCursor[h]} ${
                showGrip ? "z-40" : "z-30"
              }`}
              onPointerDown={onHandleDown(h)}
            >
              <span
                aria-hidden
                className={`pointer-events-none h-3 w-3 shrink-0 rounded-full border-2 border-white shadow-sm transition-opacity duration-150 ${
                  showGrip
                    ? "bg-teal-500 opacity-100 ring-1 ring-teal-600/30"
                    : "opacity-0"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
