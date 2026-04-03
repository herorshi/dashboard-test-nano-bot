"use client";

import { faGripVertical } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DASHBOARD_CHARTS_REFLOW } from "@/components/charts/ClientApexChart";
import {
  BarVolumeCompareChart,
  ColumnOrdersChart,
  LinePriceChart,
  PiePortfolioChart,
} from "@/components/charts/DashboardCharts";
import {
  ChartFilterToolbar,
  type ChartFilter,
  type ChartId,
  CHART_IDS,
} from "@/components/dashboard/ChartFilterToolbar";
import {
  DisplayModeToolbar,
  type DashboardDisplayMode,
} from "@/components/dashboard/DisplayModeToolbar";
import { GlobalChartDateRangeBar } from "@/components/dashboard/GlobalChartDateRangeBar";
import { OrdersDataTable } from "@/components/table/DataTable";
import { Widget } from "@/components/widget/Widget";
import { DashboardDndLayoutTickContext } from "@/contexts/DashboardDndLayoutContext";
import { ChartExpandProvider } from "@/contexts/ChartExpandContext";
import { GlobalChartDateRangeProvider } from "@/contexts/GlobalChartDateRangeContext";
import {
  DndContext,
  type DragEndEvent,
  type SensorDescriptor,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { HTMLAttributes } from "react";
import { useState } from "react";

const DND_CONTEXT_ID = "dashboard-trading-dnd";
/** แยก context เฉพาะกริดกราฟ — ไม่รวมกับ section (vertical) เพื่อลดการกระตุกตอนลากการ์ด */
const CHART_GRID_DND_ID = "dashboard-chart-grid-dnd";

const SECTION_IDS = ["charts", "table"] as const;
type SectionId = (typeof SECTION_IDS)[number];

function isSectionId(id: string): id is SectionId {
  return id === "charts" || id === "table";
}

function ChartWidget({
  id,
  dragHandleProps,
}: {
  id: ChartId;
  dragHandleProps?: HTMLAttributes<HTMLDivElement>;
}) {
  switch (id) {
    case "pie":
      return (
        <Widget
          title="พอร์ตตามหลักทรัพย์"
          dragHandleProps={dragHandleProps}
        >
          <PiePortfolioChart />
        </Widget>
      );
    case "bar":
      return (
        <Widget
          title="ปริมาณซื้อขายตามหลักทรัพย์"
          dragHandleProps={dragHandleProps}
        >
          <BarVolumeCompareChart />
        </Widget>
      );
    case "line":
      return (
        <Widget
          title="ดัชนีตามเวลา"
          dragHandleProps={dragHandleProps}
        >
          <LinePriceChart />
        </Widget>
      );
    case "column":
      return (
        <Widget
          title="คำสั่งซื้อ/ขายต่อช่วง"
          dragHandleProps={dragHandleProps}
        >
          <ColumnOrdersChart />
        </Widget>
      );
    default:
      return null;
  }
}

function SortableChartCard({ id }: { id: ChartId }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.88 : 1,
    zIndex: isDragging ? 20 : undefined,
  };

  const dragHandleProps: HTMLAttributes<HTMLDivElement> = {
    ...listeners,
    ...attributes,
  };

  return (
    <div ref={setNodeRef} style={style} className="min-w-0">
      <ChartWidget id={id} dragHandleProps={dragHandleProps} />
    </div>
  );
}

/** ปุ่มลาก — แสดงเฉพาะไอคอน คำแนะนำใน tooltip แบบกำหนดเอง */
const sectionDragIconButtonClass =
  "inline-flex min-w-12 shrink-0 cursor-grab touch-none select-none items-center justify-center rounded-xl border border-sky-200/90 bg-white/90 px-5 py-2.5 text-slate-500 shadow-sm ring-1 ring-white/80 transition-colors hover:bg-sky-50/90 hover:text-slate-700 active:cursor-grabbing focus-visible:outline focus-visible:ring-2 focus-visible:ring-teal-400/45";

const SECTION_DRAG_TOOLTIP_CHARTS =
  "ลากเพื่อสลับตำแหน่งกับตารางคำสั่งซื้อขาย — โหมดแสดงผลต้องเป็น «ทั้งหมด» — เลือกช่วงวันที่ ประเภทกราฟ และโหมดแสดงผลจากหัวขอกราฟภาพรวม/แถบด้านบน — ลากหัวการ์ดเพื่อสลับลำดับ";
const SECTION_DRAG_TOOLTIP_TABLE =
  "ลากเพื่อสลับตำแหน่งกับกราฟ — คลิกแถวเพื่อดูรายละเอียด — ลากขอบหัวคอลัมน์เพื่อปรับความกว้าง";

function SectionDragWithTooltip({
  tooltipText,
  dragProps,
}: {
  tooltipText: string;
  dragProps: HTMLAttributes<HTMLDivElement>;
}) {
  return (
    <div className="group relative shrink-0">
      <div
        role="button"
        tabIndex={0}
        {...dragProps}
        aria-label={tooltipText}
        className={sectionDragIconButtonClass}
      >
        <FontAwesomeIcon icon={faGripVertical} className="h-5 w-5" aria-hidden />
      </div>
      <div
        role="tooltip"
        aria-hidden="true"
        className="pointer-events-none absolute bottom-full left-1/2 z-[60] mb-2 flex w-max max-w-[min(100vw-2rem,22rem)] -translate-x-1/2 flex-col items-center opacity-0 translate-y-2 scale-[0.98] transition-[opacity,transform] duration-200 ease-out will-change-[opacity,transform] group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 motion-reduce:transition-none motion-reduce:duration-0 motion-reduce:group-hover:translate-y-0"
      >
        <div className="rounded-lg bg-neutral-950 px-3 py-2.5 text-left text-xs font-medium leading-relaxed text-white shadow-xl ring-1 ring-white/15">
          {tooltipText}
        </div>
        <div
          className="-mt-px h-0 w-0 shrink-0 border-l-[7px] border-r-[7px] border-t-[8px] border-l-transparent border-r-transparent border-t-neutral-950"
          aria-hidden
        />
      </div>
    </div>
  );
}

function SortableChartsBlock({
  filter,
  singleId,
  order,
  onChartFilterChange,
  sensors,
  onChartDragEnd,
}: {
  filter: ChartFilter;
  singleId: ChartId | null;
  order: ChartId[];
  onChartFilterChange: (v: ChartFilter) => void;
  sensors: SensorDescriptor<any>[];
  onChartDragEnd: (event: DragEndEvent) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: "charts" });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.92 : 1,
    zIndex: isDragging ? 15 : undefined,
  };

  const sectionDragProps: HTMLAttributes<HTMLDivElement> = {
    ...listeners,
    ...attributes,
  };

  return (
    <section
      ref={setNodeRef}
      style={style}
      aria-labelledby="dashboard-charts-heading"
      className={
        filter === "all"
          ? "min-w-0 space-y-4"
          : "w-full min-w-0 space-y-4"
      }
    >
      <div className="flex min-w-0 items-start gap-3">
        <SectionDragWithTooltip
          tooltipText={SECTION_DRAG_TOOLTIP_CHARTS}
          dragProps={sectionDragProps}
        />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-nowrap items-center gap-x-3 overflow-x-auto pb-0.5 [scrollbar-width:thin]">
            <h2
              id="dashboard-charts-heading"
              className="shrink-0 pt-0.5 text-lg font-semibold tracking-tight text-slate-800"
            >
              กราฟภาพรวม
            </h2>
            <div className="min-w-0 shrink [&_[role=toolbar]]:!inline-block [&_[role=toolbar]]:!w-max [&_[role=toolbar]]:max-w-none">
              <ChartFilterToolbar
                value={filter}
                onChange={onChartFilterChange}
              />
            </div>
            <div className="ml-auto min-w-0 shrink-0 sm:max-w-[min(100%,28rem)]">
              <GlobalChartDateRangeBar />
            </div>
          </div>
        </div>
      </div>
      
      {filter === "all" ? (
        <DndContext
          id={CHART_GRID_DND_ID}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onChartDragEnd}
        >
          <SortableContext items={order} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {order.map((id) => (
                <SortableChartCard key={id} id={id} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="w-full min-w-0">
          {singleId ? <ChartWidget id={singleId} /> : null}
        </div>
      )}
    </section>
  );
}

function SortableTableBlock() {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: "table" });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.92 : 1,
    zIndex: isDragging ? 15 : undefined,
  };

  const sectionDragProps: HTMLAttributes<HTMLDivElement> = {
    ...listeners,
    ...attributes,
  };

  return (
    <section
      ref={setNodeRef}
      style={style}
      aria-labelledby="dashboard-orders-heading"
      className="min-w-0 shrink-0 pb-4"
    >
      <div className="mb-4 flex min-w-0 items-start gap-3">
        <SectionDragWithTooltip
          tooltipText={SECTION_DRAG_TOOLTIP_TABLE}
          dragProps={sectionDragProps}
        />
        <div className="min-w-0 flex-1 pt-0.5">
          <h2
            id="dashboard-orders-heading"
            className="text-lg font-semibold tracking-tight text-slate-800"
          >
            ตารางคำสั่งซื้อขาย
          </h2>
        </div>
      </div>
      <OrdersDataTable />
    </section>
  );
}

function bumpChartsReflow() {
  queueMicrotask(() => {
    requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent(DASHBOARD_CHARTS_REFLOW));
    });
  });
  window.setTimeout(() => {
    window.dispatchEvent(new CustomEvent(DASHBOARD_CHARTS_REFLOW));
  }, 260);
}

export function TradingDashboard() {
  const [chartFilter, setChartFilter] = useState<ChartFilter>("all");
  const [displayMode, setDisplayMode] =
    useState<DashboardDisplayMode>("all");
  const [order, setOrder] = useState<ChartId[]>([...CHART_IDS]);
  const [sectionOrder, setSectionOrder] = useState<SectionId[]>([
    ...SECTION_IDS,
  ]);
  const [dndLayoutTick, setDndLayoutTick] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleSectionDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (!isSectionId(activeId) || !isSectionId(overId)) return;
    if (displayMode !== "all") return;
    setSectionOrder((items) => {
      const a = items.indexOf(activeId);
      const b = items.indexOf(overId);
      if (a === -1 || b === -1) return items;
      return arrayMove(items, a, b);
    });
    setDndLayoutTick((n) => n + 1);
    bumpChartsReflow();
  }

  function handleChartDragEnd(event: DragEndEvent) {
    if (chartFilter !== "all" || displayMode === "table") return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const a = String(active.id) as ChartId;
    const b = String(over.id) as ChartId;
    if (!CHART_IDS.includes(a) || !CHART_IDS.includes(b)) return;
    setOrder((items) => {
      const ia = items.indexOf(a);
      const ib = items.indexOf(b);
      if (ia === -1 || ib === -1) return items;
      return arrayMove(items, ia, ib);
    });
    setDndLayoutTick((n) => n + 1);
    bumpChartsReflow();
  }

  const singleId: ChartId | null =
    chartFilter !== "all" ? chartFilter : null;

  const sortableSectionItems: SectionId[] =
    displayMode === "all"
      ? sectionOrder
      : displayMode === "charts"
        ? ["charts"]
        : ["table"];

  return (
    <GlobalChartDateRangeProvider>
      <ChartExpandProvider value={chartFilter !== "all"}>
        <div className="flex min-h-0 flex-1 flex-col">
          {/*
            แถบฟิลเตอร์อยู่นอก DnD — ไม่เลื่อนตามการสลับตำแหน่งกราฟ/ตาราง
          */}
          <div className="sticky top-0 z-20 -mx-4 shrink-0 bg-linear-to-b px-4 py-4 shadow-sm shadow-sky-100/40 backdrop-blur-md sm:-mx-6 sm:px-6">
            <div className="flex w-full min-w-0 flex-col items-start">
              <div className="min-w-0 w-full max-w-full">
                <DisplayModeToolbar
                  value={displayMode}
                  onChange={setDisplayMode}
                />
              </div>
            </div>
          </div>
          <DashboardDndLayoutTickContext.Provider value={dndLayoutTick}>
            <DndContext
              id={DND_CONTEXT_ID}
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleSectionDragEnd}
            >
              <SortableContext
                items={sortableSectionItems}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-10">
                  {displayMode === "table" ? (
                    <SortableTableBlock key="table" />
                  ) : displayMode === "charts" ? (
                    <SortableChartsBlock
                      key="charts"
                      filter={chartFilter}
                      singleId={singleId}
                      order={order}
                      onChartFilterChange={setChartFilter}
                      sensors={sensors}
                      onChartDragEnd={handleChartDragEnd}
                    />
                  ) : (
                    sectionOrder.map((sid) =>
                      sid === "charts" ? (
                        <SortableChartsBlock
                          key="charts"
                          filter={chartFilter}
                          singleId={singleId}
                          order={order}
                          onChartFilterChange={setChartFilter}
                          sensors={sensors}
                          onChartDragEnd={handleChartDragEnd}
                        />
                      ) : (
                        <SortableTableBlock key="table" />
                      ),
                    )
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </DashboardDndLayoutTickContext.Provider>
        </div>
      </ChartExpandProvider>
    </GlobalChartDateRangeProvider>
  );
}
