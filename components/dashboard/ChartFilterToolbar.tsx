"use client";

import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faChartBar,
  faChartColumn,
  faChartLine,
  faChartPie,
  faTableCells,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export const CHART_IDS = ["pie", "bar", "line", "column"] as const;
export type ChartId = (typeof CHART_IDS)[number];
export type ChartFilter = "all" | ChartId;

/** แทร็ก glass — ต่ำกว่า xl เต็มความกว้าง; xl+ กว้างตามเนื้อหา (คู่กับแถบใน TradingDashboard) */
const trackOuter =
  "block w-full max-w-full min-w-0 rounded-2xl border border-white/70 bg-linear-to-b from-slate-50/95 via-white/60 to-slate-100/70 p-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.85),0_8px_32px_-8px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/50 backdrop-blur-md xl:inline-block xl:w-max xl:max-w-full";

const trackInner =
  "relative flex w-full min-w-0 flex-wrap content-start items-center gap-x-1 gap-y-1 xl:w-max xl:min-w-0";

const segmentBase =
  "relative z-10 inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-transparent px-2.5 py-1.5 text-sm font-medium motion-safe:transition-[color,transform] motion-safe:duration-200 motion-safe:ease-out focus-visible:outline focus-visible:ring-2 focus-visible:ring-teal-400/90 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50/80 active:scale-[0.97]";

const segmentOn = "text-white";

const segmentOff =
  "text-slate-600 hover:-translate-y-px hover:text-slate-900 hover:shadow-sm hover:shadow-slate-200/40";

const pill =
  "pointer-events-none absolute left-0 top-0 z-0 rounded-xl bg-linear-to-br from-teal-500 via-teal-500 to-emerald-600 shadow-lg shadow-teal-500/30 ring-1 ring-white/35 motion-safe:transition-[transform,width,height,opacity] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none will-change-[transform,width,height]";

const TOOLBAR: {
  id: ChartFilter;
  label: string;
  icon: IconDefinition;
}[] = [
  { id: "all", label: "ทั้งหมด", icon: faTableCells },
  { id: "pie", label: "Pie", icon: faChartPie },
  { id: "bar", label: "Bar", icon: faChartBar },
  { id: "line", label: "Line", icon: faChartLine },
  { id: "column", label: "Column", icon: faChartColumn },
];

type Indicator = {
  left: number;
  top: number;
  width: number;
  height: number;
  ready: boolean;
};

type ToolbarProps = {
  value: ChartFilter;
  onChange: (v: ChartFilter) => void;
};

export function ChartFilterToolbar({ value, onChange }: ToolbarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = useState<Indicator>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    ready: false,
  });

  const measure = useCallback(() => {
    const container = containerRef.current;
    const idx = TOOLBAR.findIndex((t) => t.id === value);
    const btn = buttonRefs.current[idx];
    if (!container || !btn) return;
    const cr = container.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    setIndicator({
      left: br.left - cr.left,
      top: br.top - cr.top,
      width: br.width,
      height: br.height,
      ready: true,
    });
  }, [value]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  useLayoutEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  return (
    <div
      role="toolbar"
      aria-label="กรองกราฟ — ทั้งหมด หรือทีละประเภท"
      className={trackOuter}
    >
      <div ref={containerRef} className={trackInner}>
        <div
          aria-hidden
          className={pill}
          style={{
            width: Math.max(0, indicator.width),
            height: Math.max(0, indicator.height),
            transform: `translate3d(${indicator.left}px,${indicator.top}px,0)`,
            opacity:
              indicator.ready && indicator.width > 0 && indicator.height > 0
                ? 1
                : 0,
          }}
        />
        {TOOLBAR.map(({ id, label, icon }, i) => {
          const isOn = value === id;
          return (
            <button
              key={id}
              ref={(el) => {
                buttonRefs.current[i] = el;
              }}
              type="button"
              aria-pressed={isOn}
              onClick={() => onChange(id)}
              className={`group ${segmentBase} ${isOn ? segmentOn : segmentOff}`}
            >
              <FontAwesomeIcon
                icon={icon}
                className={`h-3.5 w-3.5 shrink-0 motion-safe:transition-opacity motion-safe:duration-200 ${
                  isOn ? "opacity-100" : "opacity-80 group-hover:opacity-100"
                }`}
              />
              <span className={isOn ? "font-semibold" : "font-medium"}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
