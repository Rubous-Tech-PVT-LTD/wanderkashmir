import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export interface StatStripItem {
  label: string;
  value: string | number;
  helper?: string;
  tone?: "default" | "primary" | "secondary" | "tertiary" | "emerald" | "amber" | "rose" | "blue";
  href?: string;
  onClick?: () => void;
  active?: boolean;
}

const STRIPE_COLOR: Record<NonNullable<StatStripItem["tone"]>, string> = {
  default: "bg-slate-200",
  primary: "bg-[var(--season-primary)]",
  secondary: "bg-[var(--season-secondary)]",
  tertiary: "bg-[var(--season-tertiary)]",
  emerald: "bg-[var(--season-primary)]",
  amber: "bg-[var(--season-secondary)]",
  rose: "bg-rose-500",
  blue: "bg-sky-500",
};

const VALUE_TONE: Record<NonNullable<StatStripItem["tone"]>, string> = {
  default: "text-slate-900",
  primary: "text-slate-900",
  secondary: "text-slate-900",
  tertiary: "text-slate-900",
  emerald: "text-slate-900",
  amber: "text-slate-900",
  rose: "text-rose-700",
  blue: "text-sky-700",
};

interface AdminStatStripProps {
  items: StatStripItem[];
  columns?: 2 | 3 | 4 | 5;
}

const GRID_COLS: Record<NonNullable<AdminStatStripProps["columns"]>, string> = {
  2: "grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
};

export function AdminStatStrip({ items, columns = 4 }: AdminStatStripProps) {
  return (
    <div className={`grid ${GRID_COLS[columns]} gap-3.5`}>
      {items.map((item) => {
        const toneKey = item.tone || "default";
        const valueClass = VALUE_TONE[toneKey];
        const stripeClass = STRIPE_COLOR[toneKey];
        const baseClasses = `rounded-md bg-white border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-xs hover:border-slate-300 transition-all text-left flex flex-col justify-between overflow-hidden relative group p-4 pt-4.5 ${
          item.active
            ? "ring-1 ring-[var(--season-primary)] border-[var(--season-primary)]"
            : ""
        }`;

        const inner = (
          <>
            {/* 3px Top Brand Accent Stripe */}
            <div className={`h-[3px] w-full ${stripeClass} absolute top-0 left-0 transition-colors`} />

            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 truncate">
                  {item.label}
                </span>
                {item.href && (
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
                )}
              </div>
              <div className={`text-2xl font-bold tracking-tight mt-1.5 tabular-nums ${valueClass}`}>
                {item.value}
              </div>
            </div>

            {item.helper && (
              <div className="border-t border-slate-100 pt-2 mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                <span className="truncate">{item.helper}</span>
              </div>
            )}
          </>
        );

        if (item.href) {
          return (
            <Link key={item.label} href={item.href} className={baseClasses}>
              {inner}
            </Link>
          );
        }

        if (item.onClick) {
          return (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className={`${baseClasses} cursor-pointer`}
            >
              {inner}
            </button>
          );
        }

        return (
          <div key={item.label} className={baseClasses}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}

