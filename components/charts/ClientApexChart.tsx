"use client";

import type ApexCharts from "apexcharts";
import type { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";
import type { ComponentProps } from "react";
import { useEffect, useRef } from "react";

export const DASHBOARD_CHARTS_REFLOW = "dashboard-charts-reflow";

type ChartProps = Omit<
  ComponentProps<typeof ReactApexChart>,
  "width" | "height"
> & {
  height?: number;
};

export function ClientApexChart({
  height = 240,
  options,
  series,
  ...rest
}: ChartProps) {
  const chartRef = useRef<ApexCharts | null>(null);
  const seriesRef = useRef(series);
  seriesRef.current = series;

  const merged: ApexOptions = {
    ...options,
    chart: {
      ...options.chart,
      background: "transparent",
      toolbar: { show: true, ...options.chart?.toolbar },
      animations: {
        enabled: true,
        speed: 400,
        ...(options.chart?.animations && typeof options.chart.animations === "object"
          ? options.chart.animations
          : {}),
      },
      redrawOnParentResize: true,
      redrawOnWindowResize: true,
    },
    theme: { ...options.theme },
    responsive: [
      ...(options.responsive ?? []),
      {
        breakpoint: 768,
        options: {
          legend: {
            fontSize: "11px",
            itemMargin: { horizontal: 6, vertical: 4 },
          },
          xaxis: {
            labels: {
              hideOverlappingLabels: true,
              maxHeight: 80,
              style: { fontSize: "11px" },
            },
          },
          yaxis: {
            labels: {
              maxWidth: 52,
              style: { fontSize: "11px" },
            },
          },
        },
      },
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
            horizontalAlign: "center",
            fontSize: "10px",
            offsetY: 4,
            itemMargin: { horizontal: 4, vertical: 2 },
          },
          xaxis: {
            labels: {
              rotate: -45,
              rotateAlways: false,
              hideOverlappingLabels: true,
              maxHeight: 72,
              style: { fontSize: "10px" },
            },
          },
          yaxis: {
            labels: {
              maxWidth: 40,
              style: { fontSize: "10px" },
            },
          },
          plotOptions: {
            bar: {
              dataLabels: { fontSize: "10px" },
            },
          },
        },
      },
    ],
  };

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const id = requestAnimationFrame(() => {
      try {
        const runner = chart as unknown as {
          resize?: () => void;
          windowResizeHandler?: () => void;
        };
        runner.resize?.();
        runner.windowResizeHandler?.();
      } catch {
        /* no-op */
      }
    });
    return () => cancelAnimationFrame(id);
  }, [height]);

  useEffect(() => {
    const onReflow = () => {
      const chart = chartRef.current;
      if (!chart) return;
      try {
        const runner = chart as unknown as {
          windowResizeHandler?: () => void;
        };
        runner.windowResizeHandler?.();
      } catch {
        /* no-op */
      }
      try {
        const s = seriesRef.current;
        if (s != null) {
          void chart.updateSeries(s, true);
        }
      } catch {
        /* no-op */
      }
    };
    window.addEventListener(DASHBOARD_CHARTS_REFLOW, onReflow);
    return () => window.removeEventListener(DASHBOARD_CHARTS_REFLOW, onReflow);
  }, []);

  return (
    <div className="min-h-0 w-full min-w-0 flex-1">
      <ReactApexChart
        chartRef={chartRef}
        height={height}
        width="100%"
        options={merged}
        series={series}
        {...rest}
      />
    </div>
  );
}
