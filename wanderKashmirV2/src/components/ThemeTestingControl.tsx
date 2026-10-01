"use client";

import { useState, useRef, useEffect } from "react";
import { useSeasonalTheme } from "@/lib/theme/themeProvider";
import { seasonalThemes, SeasonId } from "@/lib/theme/seasonalThemes";
import { Sparkles, Check, ChevronDown, Calendar } from "lucide-react";

export default function ThemeTestingControl() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { mode, setMode, selectedSeason, setSelectedSeason, activeSeason, autoSeason } = useSeasonalTheme();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const seasonsList: SeasonId[] = ["spring", "summer", "autumn", "winter"];

  return (
    <div
      ref={dropdownRef}
      className="fixed bottom-4 right-4 z-50 font-sans text-xs select-none"
      aria-label="Theme Testing Localhost Control"
    >
      {/* Floating Pill Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-white/95 backdrop-blur-md border border-neutral-200/90 shadow-lg hover:shadow-xl text-neutral-800 transition-all hover:scale-[1.02] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Active season 4-dot preview badge */}
        <div className="flex items-center -space-x-1">
          <span
            className="w-2.5 h-2.5 rounded-full ring-1 ring-white"
            style={{ backgroundColor: activeSeason.colors.primary }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full ring-1 ring-white"
            style={{ backgroundColor: activeSeason.colors.secondary }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full ring-1 ring-white"
            style={{ backgroundColor: activeSeason.colors.tertiary }}
          />
        </div>

        {/* Title */}
        <span className="font-semibold text-neutral-900 tracking-tight">
          Theme:{" "}
          <span className="font-bold" style={{ color: activeSeason.colors.primary }}>
            {mode === "automatic"
              ? `Auto (${activeSeason.name})`
              : `${activeSeason.name} / ${activeSeason.kashmiriName}`}
          </span>
        </span>

        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500">
          Dev
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute bottom-[calc(100%+8px)] right-0 w-72 bg-white rounded-2xl border border-neutral-200 shadow-2xl p-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150"
          style={{
            boxShadow: "0 20px 30px -10px rgba(0, 0, 0, 0.15), 0 10px 15px -3px rgba(0, 0, 0, 0.08)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-2.5 py-2 border-b border-neutral-100 mb-1.5">
            <div className="flex items-center gap-1.5 text-neutral-900 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-neutral-600" />
              <span>Seasonal Theme Switcher</span>
            </div>
            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded">
              Localhost Only
            </span>
          </div>

          {/* Automatic Option */}
          <button
            type="button"
            onClick={() => {
              setMode("automatic");
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-colors mb-1 ${
              mode === "automatic"
                ? "bg-neutral-100/90 text-neutral-900 font-bold"
                : "hover:bg-neutral-50 text-neutral-700 font-medium"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs">Automatic Mode</span>
                <span className="text-[10px] text-neutral-500 font-normal">
                  Date-based: {seasonalThemes[autoSeason].name} ({seasonalThemes[autoSeason].kashmiriName})
                </span>
              </div>
            </div>
            {mode === "automatic" && <Check className="w-4 h-4 text-neutral-900" />}
          </button>

          <div className="h-px bg-neutral-100 my-1.5" />

          <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
            Manual Kashmir Seasons
          </div>

          {/* Manual Season Options */}
          <div className="space-y-1">
            {seasonsList.map((seasonKey) => {
              const item = seasonalThemes[seasonKey];
              const isSelected = mode === "manual" && selectedSeason === seasonKey;

              return (
                <button
                  key={seasonKey}
                  type="button"
                  onClick={() => {
                    setSelectedSeason(seasonKey);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-colors ${
                    isSelected
                      ? "bg-neutral-100/90 text-neutral-900 font-bold"
                      : "hover:bg-neutral-50 text-neutral-700 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Swatch dots */}
                    <div className="flex items-center -space-x-1">
                      <span
                        className="w-3 h-3 rounded-full border border-white shadow-2xs"
                        style={{ backgroundColor: item.colors.primary }}
                      />
                      <span
                        className="w-3 h-3 rounded-full border border-white shadow-2xs"
                        style={{ backgroundColor: item.colors.secondary }}
                      />
                      <span
                        className="w-3 h-3 rounded-full border border-white shadow-2xs"
                        style={{ backgroundColor: item.colors.tertiary }}
                      />
                    </div>

                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">
                        {item.name} / {item.kashmiriName}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-normal">
                        {item.tagline}
                      </span>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-neutral-900" />}
                </button>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-neutral-100 px-2 text-[10px] text-neutral-400 text-center">
            Persists in localStorage • Zero reload
          </div>
        </div>
      )}
    </div>
  );
}
