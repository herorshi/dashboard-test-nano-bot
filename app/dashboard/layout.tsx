import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen min-w-0 flex-row overflow-x-hidden bg-linear-to-b from-sky-100 via-cyan-50 to-emerald-50/90 text-slate-800 md:h-screen md:max-h-screen md:overflow-hidden">
      <DashboardSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-y-contain">
        {children}
      </div>
    </div>
  );
}
