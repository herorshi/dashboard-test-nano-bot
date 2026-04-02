import { TradingDashboard } from "@/components/dashboard/TradingDashboard";

export default function DashboardPage() {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-sky-200/80 bg-white/75 px-4 py-4 shadow-sm shadow-sky-100/50 backdrop-blur-md sm:px-6">
        <div className=" flex max-w-[1400px] flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-800">
              Trading Dashboard
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-[1400px] flex-1 flex-col px-4 py-6 sm:px-6">
        <TradingDashboard />
      </main>
    </>
  );
}
