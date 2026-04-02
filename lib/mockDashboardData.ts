/** ข้อมูลจำลองกระดานหุ้น (SET) — ไม่ใช่คู่คริปโต */

/** PRNG แบบ deterministic จาก seed (ให้ช่วงวันที่เดิมได้กราฟเดิม) */
function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** สัดส่วนพอร์ตตามหลักทรัพย์ (ชื่อย่อหุ้น — ไม่ใช่กลุ่มธนาคาร/พลังงาน) */
export const MOCK_PIE_LABELS = [
  "CPALL",
  "AOT",
  "ADVANC",
  "DELTA",
  "TRUE",
] as const;

/** สัดส่วน % รวม 100 */
export const MOCK_PIE_SERIES = [24.2, 19.8, 21.5, 20.1, 14.4];

/** ปริมาณซื้อขายตามหลักทรัพย์ (ไม่รวมกลุ่มธนาคาร / พลังงาน) */
export const MOCK_BAR_STOCK_LABELS = [
  "CPALL",
  "AOT",
  "ADVANC",
  "DELTA",
  "TRUE",
  "BDMS",
] as const;

/** ปริมาณซื้อขายโดยประมาณ (หุ้น — แกนแสดงเป็นพัน / k) */
export const MOCK_BAR_VOLUMES = [18_420, 15_960, 22_340, 9_180, 11_650, 8_510];

/**
 * ดัชนีแบบ random walk (จำลองเส้น SET / ดัชนีอ้างอิง)
 */
export function mockStockIndexSeries(count: number, seed: number): number[] {
  if (count <= 0) return [];
  const rand = mulberry32(seed);
  let p = 1_418 + rand() * 85;
  return Array.from({ length: count }, () => {
    p += (rand() - 0.47) * 32;
    p = Math.max(1_340, Math.min(1_525, p));
    return Math.round(p * 100) / 100;
  });
}

/**
 * จำนวนคำสั่งซื้อ/ขายต่อช่วง (กระดานหุ้น — รายการ)
 */
export function mockHourlyBuySell(
  count: number,
  seed: number,
): { buy: number[]; sell: number[] } {
  if (count <= 0) return { buy: [], sell: [] };
  const rand = mulberry32(seed + 1337);
  const buy = Array.from({ length: count }, () => {
    const base = 72 + Math.floor(rand() * 156);
    return base;
  });
  const sell = buy.map((b) => {
    const skew = Math.floor((rand() - 0.46) * 48);
    return Math.max(28, Math.min(240, b + skew));
  });
  return { buy, sell };
}
