import type { NextConfig } from "next";

/** บังคับให้ Next ใช้โฟลเดอร์โปรเจกต์นี้เป็นหลัก — กันกรณีมี package-lock ซ้อนที่โฟลเดอร์บนสุด (เช่น C:\\Users\\...) ทำให้เจอทั้ง `pages` กับ `app` คนละที่แล้ว build พัง */
const projectRoot = process.cwd();

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
