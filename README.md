# Trading Dashboard

แดชบอร์ดสำหรับดูกราฟการซื้อขาย (ApexCharts) + ตารางคำสั่งซื้อขาย แบบลากจัดเรียงส่วนและกราฟได้ รองรับช่วงวันที่แบบ global และต่อกราฟ

---

## ความต้องการของระบบ

| รายการ | เวอร์ชัน |
|--------|----------|
| **Node.js** | **20.9 ขึ้นไป** (แนะนำ LTS ล่าสุด — สอดคล้องกับ `engines` ใน `package.json` และ Next.js 16) |
| แพ็กเกจจัดการ | npm, yarn หรือ pnpm ตามที่ถนัด |

ตรวจเวอร์ชัน Node:

```bash
node -v
```

ถ้า Node ต่ำกว่า 20 ให้ติดตั้ง/สลับเวอร์ชันด้วย [nvm](https://github.com/nvm-sh/nvm) หรือเครื่องมือจัดการ Node อื่น

---

## เริ่มต้นใช้งาน

### 1. ติดตั้ง dependencies

```bash
npm install
```

หรือ

```bash
yarn install
```

### 2. รันโหมดพัฒนา

```bash
npm run dev
```

จากนั้นเปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000) แล้วไปที่หน้าแดชบอร์ดตาม route ที่โปรเจกต์กำหนด (เช่น `/dashboard` ถ้ามี)

### 3. Build สำหรับ production

```bash
npm run build
```

### 4. รัน production หลัง build

```bash
npm run start
```

### 5. ตรวจโค้ดด้วย ESLint

```bash
npm run lint
```

---

## สคริปต์ที่มีใน `package.json`

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `npm run dev` | เซิร์ฟเวอร์พัฒนา Next.js |
| `npm run build` | สร้าง production build |
| `npm run start` | รัน production server (ต้อง `build` ก่อน) |
| `npm run lint` | รัน ESLint |

---

## โครงสร้างโปรเจกต์ (หลัก)

```
app/                 # App Router — หน้าและ layout
components/
  charts/            # กราฟ ApexCharts + ช่วงวันที่ต่อกราฟ
  dashboard/         # แดชบอร์ด, sidebar, ตัวกรองกราฟ, แถบวันที่ global
  table/             # ตารางคำสั่งซื้อขาย
  widget/            # การ์ดห่อกราฟ
contexts/            # React context (ช่วงวันที่ global, DnD layout, ฯลฯ)
```

---

## เทคโนโลยีหลัก

- **Next.js** (App Router)
- **React** + **TypeScript**
- **Tailwind CSS**
- **ApexCharts** / **react-apexcharts**
- **@dnd-kit** — ลากสลับลำดับส่วนกราฟ/ตารางและกราฟย่อย
- **react-datepicker** — เลือกช่วงวันที่
- **Font Awesome** (React) — ไอคอน

---

## หมายเหตุสำหรับผู้พัฒนาต่อ

- เวอร์ชัน Next.js ในโปรเจกต์อาจมี API/แนวทางต่างจากเอกสารเวอร์ชันเก่า โปรดอ่านคู่มือใน `node_modules/next/dist/docs/` เมื่อแก้ไขหรืออัปเกรด
- โปรเจกต์นี้ไม่ได้กำหนดไฟล์ `.env` เป็นค่าเริ่มต้น หากต่อ API จริงในอนาคต ให้เพิ่มตัวแปรสภาพแวดล้อมและเอกสารใน README นี้เอง

---

## License

โปรเจกต์ระบุ `"private": true` ใน `package.json` — ใช้ภายในทีม/องค์กรตามที่กำหนด
