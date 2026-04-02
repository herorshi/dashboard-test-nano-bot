function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function iso(d: Date) {
  return d.toISOString();
}

/**
 * คำนวณช่วงวันที่จากวันที่อ้างอิงและประเภทช่วง
 * type: day | week | month | quarter | year
 */
export function getDateRange(
  date: string,
  type: string,
): { start: string; end: string } {
  const base = new Date(date);
  if (Number.isNaN(base.getTime())) {
    throw new Error(`Invalid date: ${date}`);
  }

  const t = type.toLowerCase().trim();

  if (t === "day") {
    const s = startOfDay(base);
    const e = endOfDay(base);
    return { start: iso(s), end: iso(e) };
  }

  if (t === "week") {
    const d = startOfDay(base);
    const dow = d.getDay();
    const mondayOffset = dow === 0 ? -6 : 1 - dow;
    const start = new Date(d);
    start.setDate(start.getDate() + mondayOffset);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { start: iso(start), end: iso(endOfDay(end)) };
  }

  if (t === "month") {
    const start = new Date(base.getFullYear(), base.getMonth(), 1);
    const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
    return { start: iso(startOfDay(start)), end: iso(endOfDay(end)) };
  }

  if (t === "quarter") {
    const q = Math.floor(base.getMonth() / 3);
    const startMonth = q * 3;
    const start = new Date(base.getFullYear(), startMonth, 1);
    const end = new Date(base.getFullYear(), startMonth + 3, 0);
    return { start: iso(startOfDay(start)), end: iso(endOfDay(end)) };
  }

  if (t === "year") {
    const start = new Date(base.getFullYear(), 0, 1);
    const end = new Date(base.getFullYear(), 11, 31);
    return { start: iso(startOfDay(start)), end: iso(endOfDay(end)) };
  }

  throw new Error(
    `Unsupported type: ${type}. Use day, week, month, quarter, or year.`,
  );
}
