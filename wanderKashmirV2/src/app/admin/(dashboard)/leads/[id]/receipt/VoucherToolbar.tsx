"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowLeft, Printer, Flower2, Sun, Leaf, Snowflake, Pencil } from "lucide-react";
import { SeasonId } from "@/lib/theme/seasonalThemes";
import { useAdminBasePath } from "@/components/admin/ui";

interface VoucherToolbarProps {
  activeSeason: SeasonId;
}

const SEASON_CONFIG: Record<
  SeasonId,
  {
    name: string;
    kashmiri: string;
    Icon: React.ComponentType<{ className?: string }>;
    activeClass: string;
    btnClass: string;
  }
> = {
  spring: {
    name: "Spring",
    kashmiri: "Sonth",
    Icon: Flower2,
    activeClass: "bg-pink-600 text-white border-pink-600",
    btnClass: "bg-pink-600 hover:bg-pink-700 text-white",
  },
  summer: {
    name: "Summer",
    kashmiri: "Grishm",
    Icon: Sun,
    activeClass: "bg-emerald-700 text-white border-emerald-700",
    btnClass: "bg-emerald-700 hover:bg-emerald-800 text-white",
  },
  autumn: {
    name: "Autumn",
    kashmiri: "Harud",
    Icon: Leaf,
    activeClass: "bg-amber-700 text-white border-amber-700",
    btnClass: "bg-amber-700 hover:bg-amber-800 text-white",
  },
  winter: {
    name: "Winter",
    kashmiri: "Wandh",
    Icon: Snowflake,
    activeClass: "bg-sky-700 text-white border-sky-700",
    btnClass: "bg-sky-700 hover:bg-sky-800 text-white",
  },
};

export default function VoucherToolbar({ activeSeason }: VoucherToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const basePath = useAdminBasePath();

  const handleSelectSeason = (season: SeasonId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("season", season);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const currentCfg = SEASON_CONFIG[activeSeason] || SEASON_CONFIG.autumn;

  return (
    <div className="max-w-3xl mx-auto mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 print:hidden">
      <Link
        href={`${basePath}/leads`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Leads</span>
      </Link>

      {/* Season Palette Switcher */}
      <div className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white p-1 self-start sm:self-auto shadow-xs">
        {(["spring", "summer", "autumn", "winter"] as SeasonId[]).map((sKey) => {
          const cfg = SEASON_CONFIG[sKey];
          const Icon = cfg.Icon;
          const isSelected = activeSeason === sKey;
          return (
            <button
              key={sKey}
              type="button"
              onClick={() => handleSelectSeason(sKey)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                isSelected
                  ? cfg.activeClass
                  : "border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
              title={`Switch to ${cfg.name} (${cfg.kashmiri})`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{cfg.name}</span>
              <span className="text-[10px] opacity-75 hidden md:inline">({cfg.kashmiri})</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2.5">
        <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-slate-500">
          <Pencil className="h-3 w-3" />
          <span>Click voucher fields to edit before printing</span>
        </span>
        <button
          type="button"
          onClick={() => window.print()}
          className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-semibold shadow-xs transition-colors cursor-pointer ${currentCfg.btnClass}`}
        >
          <Printer className="h-3.5 w-3.5" />
          <span>Print / Save PDF</span>
        </button>
      </div>
    </div>
  );
}
