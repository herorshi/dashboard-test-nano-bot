"use client";

import type { ApexOptions } from "apexcharts";
import { ClientApexChart } from "@/components/charts/ClientApexChart";
import { ResizableChartPlot } from "@/components/charts/ResizableChartPlot";
import { ChartDateRangePicker } from "@/components/charts/ChartDateRangePicker";
import { useDashboardDndLayoutTick } from "@/contexts/DashboardDndLayoutContext";
import { useChartExpand } from "@/contexts/ChartExpandContext";
import { useGlobalChartDateRangeOptional } from "@/contexts/GlobalChartDateRangeContext";
import { labelsForEachCalendarDay } from "@/lib/chartRangeLabels";
import {
  MOCK_BAR_STOCK_LABELS,
  MOCK_BAR_VOLUMES,
  MOCK_PIE_LABELS,
  MOCK_PIE_SERIES,
  mockHourlyBuySell,
  mockStockIndexSeries,
} from "@/lib/mockDashboardData";
import { endOfDay, startOfDay, subDays } from "date-fns";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

/** โทนสีสดใส — เขียมทะเล/ซาย/มินต์ */
const palette = ["#059669", "#0ea5e9", "#6366f1", "#ea580c", "#db2777"];

/** พื้นหลังกราฟ: บังคับโหมดสว่าง ไม่อิ่ง system dark */
function freshBase(): Partial<ApexOptions> {
  return {
    theme: { mode: "light" },
    chart: {
      foreColor: "#475569",
    },
    grid: {
      borderColor: "#bae6fd",
      strokeDashArray: 4,
      padding: { left: 10, right: 10, top: 6, bottom: 4 },
    },
    legend: {
      labels: { colors: "#475569", useSeriesColors: false },
    },
    dataLabels: {
      style: { colors: ["#334155"] },
    },
    tooltip: {
      theme: "light",
    },
  };
}

/** พื้นผิวกราฟ */
function FreshChartSurface({ children }: { children: ReactNode }) {
  const expand = useChartExpand();
  return (
    <div
      className={`flex min-w-0 flex-col gap-2 rounded-xl bg-white p-3 ${
        expand ? "w-full" : "min-h-0 flex-1"
      }`}
    >
      {children}
    </div>
  );
}
function useChartDateRange() {
  const globalCtx = useGlobalChartDateRangeOptional();
  const [localStart, setLocalStart] = useState<Date | null>(() =>
    startOfDay(subDays(new Date(), 6)),
  );
  const [localEnd, setLocalEnd] = useState<Date | null>(() =>
    endOfDay(new Date()),
  );

  useEffect(() => {
    if (!globalCtx) return;
    return globalCtx.subscribeGlobalClear(({ start, end }) => {
      setLocalStart(start);
      setLocalEnd(end);
    });
  }, [globalCtx]);

  const globalActive = Boolean(
    globalCtx?.globalStart != null && globalCtx?.globalEnd != null,
  );
  const startDate = globalActive
    ? globalCtx!.globalStart!
    : localStart;
  const endDate = globalActive ? globalCtx!.globalEnd! : localEnd;

  const onDatesChange = (s: Date | null, e: Date | null) => {
    if (
      globalCtx?.globalStart != null &&
      globalCtx?.globalEnd != null
    ) {
      globalCtx.exitGlobalSyncMode();
    }
    setLocalStart(s ? startOfDay(s) : null);
    setLocalEnd(e ? endOfDay(e) : null);
  };

  const rangeComplete = Boolean(startDate && endDate);
  return { startDate, endDate, onDatesChange, rangeComplete };
}

function ChartRangePlaceholder({ height = 246 }: { height?: number }) {
  return (
    <div
      className="flex w-full shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-xs font-medium text-slate-500"
      style={{ height }}
    >
      เลือกช่วงวันที่ด้านบน
    </div>
  );
}

/** Pie — สัดส่วนพอร์ตตามหลักทรัพย์ */
export function PiePortfolioChart() {
  const { startDate, endDate, onDatesChange } = useChartDateRange();
  const options: ApexOptions = {
    ...freshBase(),
    chart: { type: "pie" },
    labels: [...MOCK_PIE_LABELS],
    colors: palette,
    dataLabels: {
      style: {
        colors: ["#ffffff"],
        fontWeight: 600,
      },
    },
    plotOptions: {
      pie: {
        expandOnClick: true,
        dataLabels: { offset: -8 },
        customScale: 1.08,
      },
    },
    stroke: {
      width: 3,
      colors: ["#ffffff"],
    },
    tooltip: {
      y: {
        formatter: (v: number) => `${v.toFixed(1)}%`,
      },
    },
  };
  const series = [...MOCK_PIE_SERIES];
  return (
    <FreshChartSurface>
      <ChartDateRangePicker
        startDate={startDate}
        endDate={endDate}
        onDatesChange={onDatesChange}
      />
      <ResizableChartPlot defaultHeight={246}>
        {({ height }) => (
          /** เข้าถึง ReactApexChart จริงๆ */
          <ClientApexChart
            type="pie"
            options={options}
            series={series}
            height={height}
          />
        )}
      </ResizableChartPlot>
    </FreshChartSurface>
  );
}


/** Bar — เปรียบเทียบปริมาณซื้อขายตามหลักทรัพย์ */
export function BarVolumeCompareChart() {
  const { startDate, endDate, onDatesChange, rangeComplete } = useChartDateRange();
  const categories = useMemo(() => [...MOCK_BAR_STOCK_LABELS], []);
  const options: ApexOptions = {
    ...freshBase(),
    chart: { type: "bar" },
    dataLabels: {
      style: {
        colors: ["#ffffff"],
        fontWeight: 600,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        barHeight: "82%",
        dataLabels: { position: "center" },
      },
    },
    colors: ["#0ea5e9"],
    xaxis: {
      axisBorder: { show: false },
      categories,
      labels: {
        style: { colors: "#64748b", fontSize: "12px" },
        formatter: (v) => {
          const n = Number(v);
          if (Number.isNaN(n)) return String(v);
          return `${(n / 1000).toFixed(0)}k`;
        },
      },
      title: {
        text: "ปริมาณ (หุ้น)",
        style: { color: "#0d9488", fontSize: "11px", fontWeight: 600 },
      },
    },
    yaxis: {
      labels: {
        style: { colors: "#64748b", fontSize: "12px" },
      },
      title: {
        text: "หลักทรัพย์",
        style: { color: "#0d9488", fontSize: "11px", fontWeight: 600 },
      },
    },
    tooltip: {
      y: { formatter: (v: number) => `${v.toLocaleString("th-TH")} หุ้น` },
    },
  };
  const series = [{ name: "Volume", data: [...MOCK_BAR_VOLUMES] }];
  return (
    <FreshChartSurface>
      <ChartDateRangePicker
        startDate={startDate}
        endDate={endDate}
        onDatesChange={onDatesChange}
      />
      <ResizableChartPlot defaultHeight={246}>
        {({ height }) =>
          rangeComplete ? (
            <ClientApexChart
              key={`bar-${categories.join(",")}`}
              type="bar"
              options={options}
              series={series}
              height={height}
            />
          ) : (
            <ChartRangePlaceholder height={height} />
          )
        }
      </ResizableChartPlot>
    </FreshChartSurface>
  );
}

/** Line — ดัชนี / ราคาอ้างอิงตามเวลา */
export function LinePriceChart() {
  const dndLayoutTick = useDashboardDndLayoutTick();
  const { startDate, endDate, onDatesChange, rangeComplete } = useChartDateRange();
  const categories = useMemo(() => {
    if (!startDate || !endDate) return [];
    return labelsForEachCalendarDay(startDate, endDate);
  }, [startDate, endDate]);
  const lineSeriesData = useMemo(() => {
    if (!startDate || !endDate) return [];
    const dayLabels = labelsForEachCalendarDay(startDate, endDate);
    const seed =
      Math.floor(startDate.getTime() / 86_400_000) +
      Math.floor(endDate.getTime() / 86_400_000);
    return mockStockIndexSeries(dayLabels.length, seed);
  }, [startDate, endDate]);
  const options: ApexOptions = {
    ...freshBase(),
    chart: {
      type: "line",
      zoom: { enabled: false },
      animations: { enabled: false },
    },
    stroke: { curve: "smooth", width: 4 },
    colors: ["#059669"],
    xaxis: {
      axisBorder: { show: false },
      categories,
      labels: { style: { colors: "#64748b", fontSize: "12px" } },
    },
    yaxis: {
      labels: {
        style: { colors: "#64748b", fontSize: "12px" },
        formatter: (v) => `${v.toLocaleString()}`,
      },
      title: {
        text: "ดัชนี (จุด)",
        style: { color: "#0d9488", fontSize: "11px", fontWeight: 600 },
      },
    },
    markers: {
      size: 4,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 6 },
    },
    tooltip: { y: { formatter: (v: number) => `${v.toFixed(2)} จุด` } },
  };
  const series = [
    { name: "SET (จำลอง)", data: lineSeriesData },
  ];
  return (
    <FreshChartSurface>
      <ChartDateRangePicker
        startDate={startDate}
        endDate={endDate}
        onDatesChange={onDatesChange}
      />
      <ResizableChartPlot defaultHeight={246}>
        {({ height }) =>
          rangeComplete ? (
            <ClientApexChart
              key={`line-price-${dndLayoutTick}`}
              type="line"
              options={options}
              series={series}
              height={height}
            />
          ) : (
            <ChartRangePlaceholder height={height} />
          )
        }
      </ResizableChartPlot>
    </FreshChartSurface>
  );
}

/** Column — คำสั่งซื้อ/ขายต่อช่วง (กระดานหุ้น) */
export function ColumnOrdersChart() {
  const { startDate, endDate, onDatesChange, rangeComplete } = useChartDateRange();
  const categories = useMemo(() => {
    if (!startDate || !endDate) return [];
    return labelsForEachCalendarDay(startDate, endDate);
  }, [startDate, endDate]);
  const buySell = useMemo(() => {
    if (!startDate || !endDate) {
      return { buy: [] as number[], sell: [] as number[] };
    }
    const dayLabels = labelsForEachCalendarDay(startDate, endDate);
    const seed = startDate.getTime() ^ endDate.getTime();
    return mockHourlyBuySell(dayLabels.length, seed);
  }, [startDate, endDate]);
  const options: ApexOptions = {
    ...freshBase(),
    chart: { type: "bar" },
    dataLabels: {
      style: {
        colors: ["#ffffff"],
        fontWeight: 600,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 6,
        columnWidth: "72%",
        dataLabels: { position: "top" },
      },
    },
    colors: ["#f97316", "#10b981"],
    xaxis: {
      axisBorder: { show: false },
      categories,
      labels: { style: { colors: "#64748b", fontSize: "12px" } },
    },
    yaxis: {
      labels: {
        style: { colors: "#64748b", fontSize: "12px" },
      },
      title: {
        text: "จำนวนคำสั่ง",
        style: { color: "#0d9488", fontSize: "11px", fontWeight: 600 },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: { colors: "#475569" },
    },
    tooltip: { y: { formatter: (v: number) => `${v} รายการ` } },
  };
  const series = [
    { name: "ซื้อ", data: buySell.buy },
    { name: "ขาย", data: buySell.sell },
  ];
  return (
    <FreshChartSurface>
      <ChartDateRangePicker
        startDate={startDate}
        endDate={endDate}
        onDatesChange={onDatesChange}
      />
      <ResizableChartPlot defaultHeight={246}>
        {({ height }) =>
          rangeComplete ? (
            <ClientApexChart
              key={`col-${categories.join(",")}`}
              type="bar"
              options={options}
              series={series}
              height={height}
            />
          ) : (
            <ChartRangePlaceholder height={height} />
          )
        }
      </ResizableChartPlot>
    </FreshChartSurface>
  );
}
