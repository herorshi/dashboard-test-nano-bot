"use client";

import {
  faAnglesLeft,
  faAnglesRight,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const nav = [{ href: "/dashboard", label: "Dashboard", icon: faChartLine }] as const;

export function DashboardSidebar() {
  /** จอแคบ (ต่ำกว่า md): บังคับโหมดไอคอนอย่างเดียว */
  const isNarrow = useMediaQuery("(max-width: 767px)");
  const [userCollapsed, setUserCollapsed] = useState(false);
  const collapsed = isNarrow ? true : userCollapsed;
  const pathname = usePathname();

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-sky-200/80 bg-white/90 backdrop-blur-sm transition-[width] duration-200 ease-out ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {!isNarrow && (
        <div
          className={`flex min-h-11 items-center border-b border-sky-200/60 ${
            collapsed ? "justify-center px-2" : "justify-between gap-2 px-3"
          }`}
        >
          {!collapsed && (
            <span className="min-w-0 truncate text-sm font-semibold text-slate-800">
              เมนู
            </span>
          )}
          <button
            type="button"
            aria-expanded={!collapsed}
            aria-label={collapsed ? "ขยายแถบด้านข้าง" : "ย่อแถบด้านข้าง"}
            onClick={() => setUserCollapsed((c) => !c)}
            className="inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-md p-0 text-slate-500 transition-colors hover:bg-sky-50/90 hover:text-teal-800 focus-visible:outline focus-visible:ring-2 focus-visible:ring-teal-400/80"
          >
            <FontAwesomeIcon
              icon={collapsed ? faAnglesRight : faAnglesLeft}
              className="block h-3 w-3 shrink-0"
              aria-hidden
            />
          </button>
        </div>
      )}

      <nav
        className={`flex flex-col gap-1 p-2 ${isNarrow ? "pt-3" : ""}`}
        aria-label="เมนูหลัก"
      >
        {nav.map(({ href, label, icon }) => {
          const active =
            pathname === href || pathname === "/" || pathname?.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-teal-400/80 ${
                collapsed ? "justify-center" : ""
              } ${
                active
                  ? "bg-teal-100/90 text-teal-900"
                  : "text-slate-600 hover:bg-sky-50 hover:text-slate-900"
              }`}
            >
              <span className="inline-flex size-7 shrink-0 items-center justify-center">
                <FontAwesomeIcon
                  icon={icon}
                  className="block h-3 w-3 shrink-0"
                  aria-hidden
                />
              </span>
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
