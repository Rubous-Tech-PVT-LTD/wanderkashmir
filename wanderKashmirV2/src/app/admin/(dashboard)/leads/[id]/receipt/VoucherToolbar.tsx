"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { SeasonId } from "@/lib/theme/seasonalThemes";

interface VoucherToolbarProps {
  activeSeason: SeasonId;
}

const SEASON_CONFIG: Record<
  SeasonId,
  {
    name: string;
    kashmiri: string;
    icon: string;
    activeClass: string;
    btnClass: string;
  }
> = {
  spring: {
    name: "Spring",
    kashmiri: "Sonth",
    icon: "🌸",
    activeClass: "bg-pink-600 text-white shadow-xs border-pink-500",
    btnClass: "bg-pink-600 hover:bg-pink-500 text-white shadow-pink-600/20",
  },
  summer: {
    name: "Summer",
    kashmiri: "Grishm",
    icon: "☀️",
    activeClass: "bg-emerald-600 text-white shadow-xs border-emerald-500",
    btnClass: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20",
  },
  autumn: {
    name: "Autumn",
    kashmiri: "Harud",
    icon: "🍁",
    activeClass: "bg-red-700 text-white shadow-xs border-red-600",
    btnClass: "bg-red-700 hover:bg-red-600 text-white shadow-red-700/20",
  },
  winter: {
    name: "Winter",
    kashmiri: "Wandh",
    icon: "❄️",
    activeClass: "bg-sky-600 text-white shadow-xs border-sky-500",
    btnClass: "bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20",
  },
};

export default function VoucherToolbar({ activeSeason }: VoucherToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSelectSeason = (season: SeasonId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("season", season);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const currentCfg = SEASON_CONFIG[activeSeason] || SEASON_CONFIG.autumn;

  return (
    <div className="max-w-3xl mx-auto mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 print:hidden">
      <Link
        href="/admin/leads"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Leads</span>
      </Link>

      {/* Season Palette Switcher Tabs */}
      <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl self-start sm:self-auto">
        {(["spring", "summer", "autumn", "winter"] as SeasonId[]).map((sKey) => {
          const cfg = SEASON_CONFIG[sKey];
          const isSelected = activeSeason === sKey;
          return (
            <button
              key={sKey}
              type="button"
              onClick={() => handleSelectSeason(sKey)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                isSelected
                  ? cfg.activeClass
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80"
              }`}
              title={`Switch to ${cfg.name} (${cfg.kashmiri})`}
            >
              <span>{cfg.icon}</span>
              <span className="hidden sm:inline">{cfg.name}</span>
              <span className="text-[9px] opacity-80 hidden md:inline">({cfg.kashmiri})</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => window.print()}
          className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer ${currentCfg.btnClass}`}
        >
          <Printer className="w-4 h-4" />
          <span>Print Voucher / Save as PDF</span>
        </button>
      </div>
    </div>
  );
}
