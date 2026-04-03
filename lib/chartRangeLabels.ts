import {
  addDays,
  differenceInCalendarDays,
  max,
  min,
  startOfDay,
} from "date-fns";

/** จำนวนวันปฏิทินในช่วง [start, end] รวมปลายทั้งสอง (timezone เครื่อง) */
export function calendarDayCountInclusive(start: Date, end: Date): number {
  const a = startOfDay(min([start, end]));
  const b = startOfDay(max([start, end]));
  return differenceInCalendarDays(b, a) + 1;
}

/**
 * ป้ายแกน X หนึ่งค่าต่อหนึ่งวันปฏิทิน — ช่วง 3 วันได้ 3 ป้าย (ไม่ใช้การแบ่งเวลาแบบเส้นตรงที่ทำให้ซ้ำวัน)
 */
export function labelsForEachCalendarDay(start: Date, end: Date): string[] {
  const a = startOfDay(min([start, end]));
  const n = calendarDayCountInclusive(start, end);
  if (n <= 0) return [];
  return Array.from({ length: n }, (_, i) => {
    const d = addDays(a, i);
    return d.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
    });
  });
}

/** @deprecated ใช้ labelsForEachCalendarDay เมื่อต้องการ 1 จุดต่อวัน — คงไว้สำหรับการแบ่งช่วงแบบเทียบเชิงเวลา */
export function labelsForChartRange(
  start: Date,
  end: Date,
  count: number,
): string[] {
  const s = min([start, end]).getTime();
  const e = max([start, end]).getTime();
  if (count <= 0) return [];
  if (count === 1) {
    return [
      new Date(s).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
      }),
    ];
  }
  return Array.from({ length: count }, (_, i) => {
    const t = s + ((e - s) * i) / (count - 1);
    return new Date(t).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
    });
  });
}
