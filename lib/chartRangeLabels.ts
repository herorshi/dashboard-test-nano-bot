import { max, min } from "date-fns";

/** สร้างป้ายแกน X จำนวน `count` จุดจากช่วงวันที่ (ใช้กับกราฟ mock กระดานหุ้น) */
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
