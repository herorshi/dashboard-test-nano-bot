"use client";

import { th } from "date-fns/locale";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("th", th);

export type ChartDateRangePickerProps = {
  startDate: Date | null;
  endDate: Date | null;
  onDatesChange: (start: Date | null, end: Date | null) => void;
  /** ค่าเริ่มต้น: ช่วงวันที่ */
  label?: string;
  /** card = มีเส้นแบ่งใต้แถบ (ในการ์ดกราฟ), inline = ไม่มีขอบล่าง (แถบ global) */
  variant?: "card" | "inline";
};


const mobileFullWidthDateRoot =
  "[&_.react-datepicker-wrapper]:block [&_.react-datepicker-wrapper]:w-full [&_.react-datepicker-wrapper]:min-w-0 [&_.react-datepicker__input-container]:flex [&_.react-datepicker__input-container]:w-full [&_.react-datepicker__input-container]:min-w-0 [&_.react-datepicker__input-container]:max-w-full [&_.react-datepicker__input-container]:items-center [&_input]:box-border [&_input]:w-full";


const inputWidthShared =
  "w-full min-w-0 max-w-full xl:min-w-[12rem] xl:max-w-[12rem]";

export function ChartDateRangePicker({
  startDate,
  endDate,
  onDatesChange,
  label = "ช่วงวันที่",
  variant = "card",
}: ChartDateRangePickerProps) {
  const rowClass =
    variant === "inline"
      ? `flex min-w-0 w-full max-w-full flex-wrap items-center gap-2 ${mobileFullWidthDateRoot}`
      : `mb-2 flex min-w-0 w-full max-w-full flex-wrap items-center gap-2 border-b border-cyan-100/80 pb-2 ${mobileFullWidthDateRoot}`;

  return (
    <div className={rowClass}>
      <DatePicker
        selectsRange
        startDate={startDate ?? undefined}
        endDate={endDate ?? undefined}
        maxDate={new Date()}
        onChange={(dates) => {
          const [s, e] = dates;
          onDatesChange(s ?? null, e ?? null);
        }}
        dateFormat="dd/MM/yyyy"
        locale="th"
        placeholderText="เลือกช่วง"
        isClearable
        className={`box-border rounded-lg border border-sky-200 bg-white px-2 py-1.5 pr-9 text-xs tabular-nums text-slate-800 shadow-sm outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-300 ${inputWidthShared}`}
        calendarClassName="!font-sans"
      />
    </div>
  );
}
