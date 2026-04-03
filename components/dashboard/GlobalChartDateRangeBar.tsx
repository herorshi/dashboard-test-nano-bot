"use client";

import {
  ChartDateRangePicker,
  type ChartDateRangePickerProps,
} from "@/components/charts/ChartDateRangePicker";
import { useGlobalChartDateRange } from "@/contexts/GlobalChartDateRangeContext";
import { useEffect, useState } from "react";


export function GlobalChartDateRangeBar() {
  const { globalStart, globalEnd, setGlobalRange, exitGlobalSyncMode } =
    useGlobalChartDateRange();

  const [pickerStart, setPickerStart] = useState<Date | null>(globalStart);
  const [pickerEnd, setPickerEnd] = useState<Date | null>(globalEnd);

  useEffect(() => {
    queueMicrotask(() => {
      setPickerStart(globalStart);
      setPickerEnd(globalEnd);
    });
  }, [globalStart, globalEnd]);

  const handleDatesChange: ChartDateRangePickerProps["onDatesChange"] = (
    s,
    e,
  ) => {
    setPickerStart(s);
    setPickerEnd(e);
    if (s === null && e === null) {
      exitGlobalSyncMode();
      return;
    }
    if (s && e) {
      setGlobalRange(s, e);
    }
  };

  return (
    <div className="inline-block w-max max-w-full min-w-0">
      <ChartDateRangePicker
        variant="inline"
        startDate={pickerStart}
        endDate={pickerEnd}
        onDatesChange={handleDatesChange}
      />
    </div>
  );
}
