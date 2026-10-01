"use client";

import React from "react";
import {
  SlidersHorizontal,
  RotateCcw,
  Check,
  Hotel,
  Palmtree,
  Anchor,
  Home,
  MapPin,
  Sparkles,
  Wifi,
  Flame,
  Mountain,
  Coffee,
  Car,
} from "lucide-react";

export interface FilterCountOption {
  key: string;
  name: string;
  count: number;
}

export interface StaysFilterSidebarProps {
  activeType: string;
  activeLocation: string;
  activeMaxPrice: number | null;
  activeAmenities: string[];
  types: FilterCountOption[];
  locations: FilterCountOption[];
  availableAmenities: string[];
  maxPriceLimit: number;
  onSelectType: (type: string) => void;
  onSelectLocation: (loc: string) => void;
  onSelectMaxPrice: (price: number | null) => void;
  onToggleAmenity: (amenity: string) => void;
  onResetAll: () => void;
  onCloseMobile?: () => void;
}

export default function StaysFilterSidebar({
  activeType,
  activeLocation,
  activeMaxPrice,
  activeAmenities,
  types,
  locations,
  availableAmenities,
  maxPriceLimit,
  onSelectType,
  onSelectLocation,
  onSelectMaxPrice,
  onToggleAmenity,
  onResetAll,
  onCloseMobile,
}: StaysFilterSidebarProps) {
  const isAnyFilterActive =
    activeType !== "ALL" ||
    activeLocation !== "ALL" ||
    activeMaxPrice !== null ||
    activeAmenities.length > 0;

  const getTypeIcon = (typeKey: string) => {
    switch (typeKey.toUpperCase()) {
      case "RESORT":
        return <Palmtree className="w-3.5 h-3.5" />;
      case "HOUSEBOAT":
        return <Anchor className="w-3.5 h-3.5" />;
      case "HOMESTAY":
        return <Home className="w-3.5 h-3.5" />;
      case "HOTEL":
        return <Hotel className="w-3.5 h-3.5" />;
      default:
        return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes("wifi")) return <Wifi className="w-3.5 h-3.5" />;
    if (lower.includes("heating")) return <Flame className="w-3.5 h-3.5" />;
    if (lower.includes("mountain") || lower.includes("view")) return <Mountain className="w-3.5 h-3.5" />;
    if (lower.includes("breakfast")) return <Coffee className="w-3.5 h-3.5" />;
    if (lower.includes("parking")) return <Car className="w-3.5 h-3.5" />;
    return <Sparkles className="w-3.5 h-3.5" />;
  };

  const priceTiers = [
    { label: "All Prices", value: null },
    { label: "Under ₹2,000", value: 2000 },
    { label: "Under ₹3,500", value: 3500 },
    { label: "Under ₹5,000", value: 5000 },
    { label: "Luxury (₹5,000+)", value: 10000 },
  ];

  return (
    <div className="bg-white border border-[var(--season-border,#E5E7EB)] rounded-2xl p-5 shadow-xs space-y-6">
      {/* 1. Header with Reset */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--season-border,#F3F4F6)]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[var(--season-primary)]" />
          <h3 className="text-sm font-bold text-[var(--season-text,#111827)] uppercase tracking-wider font-display">
            Filters
          </h3>
        </div>
        {isAnyFilterActive && (
          <button
            type="button"
            onClick={onResetAll}
            className="text-xs font-semibold text-[var(--season-primary)] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* 2. Property Type */}
      <div className="pb-5 border-b border-[var(--season-border,#F3F4F6)]">
        <h4 className="text-xs font-bold text-[var(--season-text,#111827)] uppercase tracking-wider mb-3">
          Property Type
        </h4>
        <div className="space-y-1.5">
          {types.map((typeOption) => {
            const isSelected = activeType.toUpperCase() === typeOption.key.toUpperCase();
            return (
              <button
                key={typeOption.key}
                type="button"
                onClick={() => {
                  onSelectType(isSelected && typeOption.key !== "ALL" ? "ALL" : typeOption.key);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[var(--season-primary)] text-white shadow-xs font-bold"
                    : "text-[var(--season-text,#374151)] hover:bg-slate-50 hover:text-[var(--season-primary)]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={isSelected ? "text-white" : "text-[var(--season-primary)]"}>
                    {getTypeIcon(typeOption.key)}
                  </span>
                  <span>{typeOption.name}</span>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {typeOption.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Destination / Hub Location */}
      <div className="pb-5 border-b border-[var(--season-border,#F3F4F6)]">
        <h4 className="text-xs font-bold text-[var(--season-text,#111827)] uppercase tracking-wider mb-3">
          Destination & Area
        </h4>
        <div className="space-y-1.5">
          {locations.map((loc) => {
            const isSelected = activeLocation.toLowerCase() === loc.key.toLowerCase();
            return (
              <button
                key={loc.key}
                type="button"
                onClick={() => {
                  onSelectLocation(isSelected && loc.key !== "ALL" ? "ALL" : loc.key);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[var(--season-primary-light,#FFF7ED)] text-[var(--season-primary)] font-bold border border-[var(--season-primary)]/20"
                    : "text-[var(--season-text,#374151)] hover:bg-slate-50 hover:text-[var(--season-primary)]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "border-[var(--season-primary)] bg-[var(--season-primary)]"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  <span className="truncate max-w-[140px] text-left">{loc.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">{loc.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Price Filter */}
      <div className="pb-5 border-b border-[var(--season-border,#F3F4F6)]">
        <h4 className="text-xs font-bold text-[var(--season-text,#111827)] uppercase tracking-wider mb-3">
          Budget / Night
        </h4>
        <div className="space-y-1.5">
          {priceTiers.map((tier, idx) => {
            const isSelected = activeMaxPrice === tier.value;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onSelectMaxPrice(isSelected ? null : tier.value);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[var(--season-primary-light,#FFF7ED)] text-[var(--season-primary)] font-bold border border-[var(--season-primary)]/20"
                    : "text-[var(--season-text,#374151)] hover:bg-slate-50 hover:text-[var(--season-primary)]"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? "border-[var(--season-primary)] bg-[var(--season-primary)] text-white"
                      : "border-slate-300 bg-white text-transparent"
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>{tier.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Key Amenities */}
      {availableAmenities.length > 0 && (
        <div className="pb-5 border-b border-[var(--season-border,#F3F4F6)]">
          <h4 className="text-xs font-bold text-[var(--season-text,#111827)] uppercase tracking-wider mb-3">
            Popular Amenities
          </h4>
          <div className="space-y-1.5">
            {availableAmenities.map((amenity) => {
              const isChecked = activeAmenities.includes(amenity);
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => onToggleAmenity(amenity)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isChecked
                      ? "bg-[var(--season-primary-light,#FFF7ED)] text-[var(--season-primary)] font-bold border border-[var(--season-primary)]/20"
                      : "text-[var(--season-text,#374151)] hover:bg-slate-50 hover:text-[var(--season-primary)]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${
                      isChecked
                        ? "border-[var(--season-primary)] bg-[var(--season-primary)] text-white"
                        : "border-slate-300 bg-white text-transparent"
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-slate-400">{getAmenityIcon(amenity)}</span>
                    <span className="truncate">{amenity}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Guarantee & Security Notice */}
      <div className="pt-2">
        <h4 className="text-xs font-bold text-[var(--season-text,#111827)] uppercase tracking-wider mb-2">
          Verified Stays Guarantee
        </h4>
        <p className="text-[11px] text-[var(--season-muted,#6B7280)] leading-relaxed">
          Every resort, boutique hotel, and lake houseboat is personally inspected by WanderKashmir's local team for cleanliness, heating, and hospitality.
        </p>
      </div>
    </div>
  );
}
