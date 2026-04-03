"use client";

import {
  ChartDateRangePicker,
  type ChartDateRangePickerProps,
} from "@/components/charts/ChartDateRangePicker";
import { useGlobalChartDateRange } from "@/contexts/GlobalChartDateRangeContext";

export function GlobalChartDateRangeBar() {
  const { globalStart, globalEnd, setGlobalRange, exitGlobalSyncMode } =
    useGlobalChartDateRange();

  const handleDatesChange: ChartDateRangePickerProps["onDatesChange"] = (
    s,
    e,
  ) => {
    if (s && e) {
      setGlobalRange(s, e);
      return;
    }
    if (s === null && e === null) {
      exitGlobalSyncMode();
      return;
    }
    setGlobalRange(s, e);
  };

  return (
    <div className="block w-full min-w-0 max-w-full xl:block xl:w-full xl:max-w-[12rem]">
      <ChartDateRangePicker
        variant="inline"
        startDate={globalStart}
        endDate={globalEnd}
        onDatesChange={handleDatesChange}
      />
    </div>
  );
}
