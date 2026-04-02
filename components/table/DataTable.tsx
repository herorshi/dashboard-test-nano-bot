"use client";

import { getDateRange } from "@/lib/getDateRange";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type OrderRow = {
  id: string;
  symbol: string;
  side: "Buy" | "Sell";
  price: number;
  size: number;
  status: string;
  updatedAt: string;
};

type Column = {
  key: keyof OrderRow;
  header: string;
  defaultWidth: number;
};

const COLUMNS: Column[] = [
  { key: "symbol", header: "หลักทรัพย์", defaultWidth: 108 },
  { key: "side", header: "ฝั่ง", defaultWidth: 72 },
  { key: "price", header: "ราคา", defaultWidth: 100 },
  { key: "size", header: "ขนาด", defaultWidth: 88 },
  { key: "status", header: "สถานะ", defaultWidth: 100 },
  { key: "updatedAt", header: "อัปเดต", defaultWidth: 178 },
];

/** เส้นแบ่งแนวตั้งระหว่างคอลัมน์ทุกช่อง — ใช้สีเข้มกว่าขอบตารางเล็กน้อยให้เห็นชัด */
const COL_DIVIDE = "divide-x divide-sky-200";

function formatPrice(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatUpdatedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}

/** จำลองคำสั่งกระดานหุ้น — ไม่รวมกลุ่มธนาคาร / พลังงาน (ราคาเป็นบาท) */
export const MOCK_ORDERS: OrderRow[] = [
  {
    id: "ord_7f2a9c1e",
    symbol: "CPALL",
    side: "Buy",
    price: 67.0,
    size: 300,
    status: "Filled",
    updatedAt: "2026-04-02T02:18:33Z",
  },
  {
    id: "ord_8b3d104a",
    symbol: "AOT",
    side: "Sell",
    price: 68.5,
    size: 150,
    status: "Partially filled",
    updatedAt: "2026-04-02T02:21:07Z",
  },
  {
    id: "ord_2e91f7aa",
    symbol: "ADVANC",
    side: "Buy",
    price: 218.0,
    size: 80,
    status: "Open",
    updatedAt: "2026-04-02T02:22:41Z",
  },
  {
    id: "ord_c4a50813",
    symbol: "DELTA",
    side: "Sell",
    price: 95.5,
    size: 120,
    status: "Open",
    updatedAt: "2026-04-02T02:23:15Z",
  },
  {
    id: "ord_19d6e822",
    symbol: "TRUE",
    side: "Buy",
    price: 5.85,
    size: 5_000,
    status: "Filled",
    updatedAt: "2026-04-02T02:25:02Z",
  },
  {
    id: "ord_5f0a9b7d",
    symbol: "BDMS",
    side: "Sell",
    price: 26.25,
    size: 600,
    status: "Filled",
    updatedAt: "2026-04-02T02:26:18Z",
  },
  {
    id: "ord_a8123c44",
    symbol: "CBG",
    side: "Buy",
    price: 44.5,
    size: 350,
    status: "Post-only",
    updatedAt: "2026-04-02T02:27:55Z",
  },
  {
    id: "ord_3d904e91",
    symbol: "HANA",
    side: "Sell",
    price: 34.75,
    size: 280,
    status: "Cancelled",
    updatedAt: "2026-04-02T02:28:31Z",
  },
  {
    id: "ord_9e71b2c6",
    symbol: "LH",
    side: "Buy",
    price: 8.65,
    size: 2_000,
    status: "Filled",
    updatedAt: "2026-04-02T02:29:44Z",
  },
  {
    id: "ord_6c22a8f0",
    symbol: "CPF",
    side: "Buy",
    price: 21.9,
    size: 1_200,
    status: "Open",
    updatedAt: "2026-04-02T02:31:12Z",
  },
  {
    id: "ord_b501d3e8",
    symbol: "MINT",
    side: "Sell",
    price: 36.2,
    size: 420,
    status: "Partially filled",
    updatedAt: "2026-04-02T02:32:06Z",
  },
  {
    id: "ord_f4e8901a",
    symbol: "HMPRO",
    side: "Buy",
    price: 12.4,
    size: 3_500,
    status: "Filled",
    updatedAt: "2026-04-02T02:33:58Z",
  },
];

function cellValue(row: OrderRow, key: keyof OrderRow): ReactNode {
  if (key === "price") return formatPrice(row.price);
  if (key === "size") return row.size.toLocaleString();
  if (key === "updatedAt") return formatUpdatedAt(row.updatedAt);
  return String(row[key]);
}

export function OrdersDataTable({ rows = MOCK_ORDERS }: { rows?: OrderRow[] }) {
  const [widths, setWidths] = useState(() =>
    COLUMNS.map((c) => c.defaultWidth),
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const dragRef = useRef<{ col: number; startX: number; startWidths: number[] } | null>(
    null,
  );

  const stopResize = useCallback(() => {
    dragRef.current = null;
  }, []);

  useEffect(() => {
    const onUp = () => stopResize();
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [stopResize]);

  const onResizeMove = useCallback(
    (clientX: number) => {
      const ctx = dragRef.current;
      if (!ctx) return;
      const delta = clientX - ctx.startX;
      setWidths(() => {
        const next = [...ctx.startWidths];
        const w = Math.max(52, ctx.startWidths[ctx.col] + delta);
        next[ctx.col] = w;
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      const x = "touches" in e ? e.touches[0]?.clientX : e.clientX;
      if (x == null) return;
      onResizeMove(x);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
    };
  }, [onResizeMove]);

  const startResize = (colIndex: number, clientX: number) => {
    dragRef.current = { 
      col: colIndex,
      startX: clientX,
      startWidths: [...widths],
    };
  };

  const gridTemplate = useMemo(
    () => widths.map((w) => `${w}px`).join(" "),
    [widths],
  );

  return (
    <div className="flex min-h-[280px] min-w-0 flex-1 flex-col overflow-auto rounded-xl border border-sky-200/90 bg-white shadow-sm">
      <div
        role="row"
        className={`sticky top-0 z-10 grid border-b border-sky-100 bg-linear-to-r from-sky-50/95 to-teal-50/60 text-xs font-semibold uppercase tracking-wide text-teal-800/80 backdrop-blur-sm ${COL_DIVIDE}`}
        style={{ gridTemplateColumns: gridTemplate }}
      >
        {COLUMNS.map((col, i) => (
          <div
            key={col.key}
            className="relative flex min-w-0 items-center px-3 py-2.5 select-none"
          >
            <span className="truncate">{col.header}</span>
            {i < COLUMNS.length - 1 ? (
              <button
                type="button"
                aria-label={`ปรับความกว้างคอลัมน์ ${col.header}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  startResize(i, e.clientX);
                }}
                onTouchStart={(e) => {
                  const x = e.touches[0]?.clientX;
                  if (x != null) startResize(i, x);
                }}
                className="absolute top-0 right-0 z-20 h-full w-2 cursor-col-resize hover:bg-teal-400/35"
              />
            ) : null}
          </div>
        ))}
      </div>
      <div role="table" className="min-w-max bg-white">
        {rows.map((row) => {
          const open = expandedId === row.id;
          return (
            <div key={row.id} className="border-b border-sky-100 bg-white last:border-0">
              <button
                type="button"
                role="row"
                aria-expanded={open}
                onClick={() => setExpandedId(open ? null : row.id)}
                className={`grid w-full min-w-0 bg-white text-left text-sm text-slate-800 transition-colors hover:bg-sky-50/95 focus-visible:outline focus-visible:ring-2 focus-visible:ring-teal-400/80 ${COL_DIVIDE}`}
                style={{ gridTemplateColumns: gridTemplate }}
              >
                {COLUMNS.map((col) => (
                  <div
                    key={col.key}
                    className="flex min-w-0 items-center px-3 py-2.5"
                  >
                    {col.key === "side" ? (
                      <span
                        className={
                          row.side === "Buy"
                            ? "rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800"
                            : "rounded-md bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800"
                        }
                      >
                        {row.side}
                      </span>
                    ) : (
                      <span
                        className={
                          col.key === "updatedAt"
                            ? "whitespace-nowrap tabular-nums"
                            : "truncate tabular-nums"
                        }
                      >
                        {cellValue(row, col.key)}
                      </span>
                    )}
                  </div>
                ))}
              </button>
              {open ? (
                <div
                  role="region"
                  aria-label="รายละเอียดคำสั่ง"
                  className="border-t border-sky-100 bg-white px-4 py-3 text-xs leading-relaxed text-slate-600"
                >
                  <ExpandedDetails row={row} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExpandedDetails({ row }: { row: OrderRow }) {
  let rangeLabel = "";
  try {
    const r = getDateRange(row.updatedAt.slice(0, 10), "week");
    rangeLabel = `${r.start.slice(0, 10)} → ${r.end.slice(0, 10)}`;
  } catch {
    rangeLabel = "—";
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <p>
        <span className="text-slate-500">รหัสคำสั่ง:</span>{" "}
        <span className="font-mono text-slate-800">{row.id}</span>
      </p>
      <p>
        <span className="text-slate-500">มูลค่าประมาณ:</span>{" "}
        <span className="tabular-nums text-slate-800">
          {(row.price * row.size).toLocaleString("th-TH", {
            maximumFractionDigits: 2,
          })}{" "}
          บาท
        </span>
      </p>
      <p className="sm:col-span-2">
        <span className="text-slate-500">ช่วงสัปดาห์ (getDateRange, week):</span>{" "}
        <span className="font-mono text-teal-900">{rangeLabel}</span>
      </p>
    </div>
  );
}
