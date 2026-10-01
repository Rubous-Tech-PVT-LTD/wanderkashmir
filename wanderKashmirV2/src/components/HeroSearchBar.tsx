"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Calendar as CalendarIcon,
  Users,
  Search,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Check,
  Compass,
  Sparkles,
  ArrowRight,
} from "lucide-react";

// =============================================================================
// KASHMIR DESTINATION CATALOG FOR FUZZY SEARCH & AUTO-SUGGEST
// =============================================================================
export interface KashmirDestination {
  id: string;
  name: string;
  highlight: string;
  district: string;
  tags: string[];
  popular?: boolean;
}

export const KASHMIR_DESTINATIONS: KashmirDestination[] = [
  {
    id: "gulmarg",
    name: "Gulmarg",
    highlight: "Gondola Phase 1 & 2 • Apharwat Peak • Alpine Skiing",
    district: "Baramulla District",
    tags: ["gulmarg", "ski", "gondola", "apharwat", "snow", "cable car", "golf", "winter sports"],
    popular: true,
  },
  {
    id: "pahalgam",
    name: "Pahalgam",
    highlight: "Lidder River • Betaab Valley • Aru Valley • Baisaran",
    district: "Anantnag District",
    tags: ["pahalgam", "pahalgham", "betaab", "aru", "baisaran", "lidder", "sheshnag", "mini switzerland"],
    popular: true,
  },
  {
    id: "srinagar",
    name: "Srinagar & Dal Lake",
    highlight: "Heritage Houseboats • Sunset Shikara • Mughal Gardens",
    district: "Srinagar Central",
    tags: ["srinagar", "dal lake", "shikara", "houseboat", "mughal garden", "nishat", "shalimar", "nigeen", "old city"],
    popular: true,
  },
  {
    id: "sonamarg",
    name: "Sonamarg",
    highlight: "Thajiwas Glacier • Zero Point • Sindh River Rafting",
    district: "Ganderbal District",
    tags: ["sonamarg", "sonmarg", "thajiwas", "glacier", "zero point", "zojila", "sindh river", "gateway ladakh"],
    popular: true,
  },
  {
    id: "doodhpathri",
    name: "Doodhpathri",
    highlight: "Valley of Milk • Lush Pine Meadows • Shaliganga River",
    district: "Budgam District",
    tags: ["doodhpathri", "doodpathri", "doodh patri", "milk valley", "shaliganga", "untouched meadows"],
    popular: true,
  },
  {
    id: "gurez",
    name: "Gurez Valley",
    highlight: "Habba Khatoon Peak • Kishanganga River • Offbeat Alpine",
    district: "Bandipora District",
    tags: ["gurez", "gurez valley", "gurais", "habba khatoon", "dawar", "kishanganga", "remote"],
    popular: false,
  },
  {
    id: "yusmarg",
    name: "Yusmarg",
    highlight: "Doodganga River Trek • Alpine Nilnag Lake",
    district: "Budgam District",
    tags: ["yusmarg", "yousmarg", "nilnag", "doodganga", "pine trek"],
    popular: false,
  },
  {
    id: "sinthan",
    name: "Sinthan Top & Daksum",
    highlight: "360° Snow Pass (12,500 ft) • Trout Sanctuary",
    district: "Kishtwar / Anantnag Highway",
    tags: ["sinthan", "sinthan top", "daksum", "kokernag", "mountain pass"],
    popular: false,
  },
];

// =============================================================================
// RECENT SEARCH RECORD INTERFACE
// =============================================================================
export interface RecentSearchItem {
  id: string;
  destination: string;
  datesText?: string;
  startDate?: string;
  endDate?: string;
  guestsText?: string;
  adults?: number;
  children?: number;
  timestamp: number;
}

const LOCAL_STORAGE_KEY = "gtm_recent_searches";

// =============================================================================
// FUZZY SEARCH & TYPO-TOLERANCE ALGORITHM
// =============================================================================
function computeLevenshtein(a: string, b: string): number {
  const an = a.length;
  const bn = b.length;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix: number[][] = [];
  for (let i = 0; i <= bn; ++i) matrix[i] = [i];
  for (let j = 0; j <= an; ++j) matrix[0][j] = j;

  for (let i = 1; i <= bn; ++i) {
    for (let j = 1; j <= an; ++j) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[bn][an];
}

function scoreDestination(dest: KashmirDestination, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  const name = dest.name.toLowerCase();
  const district = dest.district.toLowerCase();
  const highlight = dest.highlight.toLowerCase();

  // 1. Exact match
  if (name === q) return 1000;

  // 2. Starts with query (e.g. "gul" -> "gulmarg")
  if (name.startsWith(q)) return 800 - (name.length - q.length);

  // 3. Any tag starts with query
  for (const tag of dest.tags) {
    if (tag.startsWith(q)) return 600;
  }

  // 4. Substring anywhere in name or tags
  if (name.includes(q)) return 400;
  for (const tag of dest.tags) {
    if (tag.includes(q)) return 350;
  }
  if (district.includes(q) || highlight.includes(q)) return 250;

  // 5. Typo tolerance using Levenshtein distance (e.g., "pahalgham" -> "pahalgam", "gulmrg" -> "gulmarg")
  let bestDistance = Infinity;
  const wordsToCompare = [
    ...name.split(/[\s&,-]+/),
    ...dest.tags,
  ];

  for (const word of wordsToCompare) {
    const cleanWord = word.trim().toLowerCase();
    if (!cleanWord || cleanWord.length < 3) continue;

    const dist = computeLevenshtein(cleanWord, q);
    if (dist < bestDistance) {
      bestDistance = dist;
    }
  }

  // Allow 1 typo for strings >= 4 chars, 2 typos for strings >= 6 chars
  if (q.length >= 4 && bestDistance <= 1) {
    return 300 - bestDistance * 50;
  }
  if (q.length >= 6 && bestDistance <= 2) {
    return 200 - bestDistance * 40;
  }

  return 0;
}

// =============================================================================
// CALENDAR HELPER UTILITIES
// =============================================================================
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function formatShortDate(date: Date): string {
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()].slice(0, 3)}`;
}

function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isSameDay(d1: Date | null, d2: Date | null): boolean {
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function isDateInRange(date: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const t = date.getTime();
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return t > s && t < e;
}

function isBeforeDay(d1: Date, d2: Date): boolean {
  const t1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
  const t2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime();
  return t1 < t2;
}

// =============================================================================
// MAIN COMPONENT: HeroSearchBar
// =============================================================================
export default function HeroSearchBar({
  className = "",
  onSearchSubmit,
}: {
  className?: string;
  onSearchSubmit?: (searchParams: {
    destination: string;
    startDate?: string;
    endDate?: string;
    adults: number;
    children: number;
  }) => void;
}) {
  const router = useRouter();

  // Field states
  const [destinationQuery, setDestinationQuery] = useState("");
  const [selectedDestinationName, setSelectedDestinationName] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);

  // Popover open states
  const [activePopover, setActivePopover] = useState<"destination" | "dates" | "guests" | null>(null);

  // Calendar month view navigation (defaults to current month)
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(() => new Date());

  // Recent Searches state
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);

  // Outside click refs
  const searchBarRef = useRef<HTMLDivElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);

  // Load recent searches on mount from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, 5));
        }
      }
    } catch {
      // Ignore localStorage errors (e.g. private browsing mode)
    }
  }, []);

  // Save a search to localStorage
  const saveRecentSearch = (destName: string, start?: Date | null, end?: Date | null, ad = adults, ch = children) => {
    if (!destName.trim()) return;

    let datesText = "";
    if (start && end) {
      datesText = `${formatShortDate(start)} – ${formatShortDate(end)}`;
    } else if (start) {
      datesText = `From ${formatShortDate(start)}`;
    }

    const guestsText = `${ad} Adult${ad > 1 ? "s" : ""}${ch > 0 ? `, ${ch} Child${ch > 1 ? "ren" : ""}` : ""}`;

    const newRecord: RecentSearchItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      destination: destName.trim(),
      datesText,
      startDate: start ? formatDateISO(start) : undefined,
      endDate: end ? formatDateISO(end) : undefined,
      guestsText,
      adults: ad,
      children: ch,
      timestamp: Date.now(),
    };

    try {
      const existing = recentSearches.filter(
        (item) => item.destination.toLowerCase() !== destName.trim().toLowerCase()
      );
      const updated = [newRecord, ...existing].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  };

  const removeRecentSearch = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const updated = recentSearches.filter((item) => item.id !== id);
      setRecentSearches(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const clearAllRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setRecentSearches([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  // Close popovers on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setActivePopover(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActivePopover(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Filter destinations with intelligent scoring & typo handling
  const searchResults = useMemo(() => {
    const q = destinationQuery.trim();
    if (!q) return [];

    return KASHMIR_DESTINATIONS.map((dest) => ({
      destination: dest,
      score: scoreDestination(dest, q),
    }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.destination);
  }, [destinationQuery]);

  // Handle destination selection
  const handleSelectDestination = (dest: KashmirDestination) => {
    setSelectedDestinationName(dest.name);
    setDestinationQuery(dest.name);
    setActivePopover("dates"); // Smooth transition to dates
  };

  // Handle clicking a recent search item
  const handleSelectRecentSearch = (item: RecentSearchItem) => {
    setSelectedDestinationName(item.destination);
    setDestinationQuery(item.destination);
    if (item.startDate) {
      const [y, m, d] = item.startDate.split("-").map(Number);
      setStartDate(new Date(y, m - 1, d));
    }
    if (item.endDate) {
      const [y, m, d] = item.endDate.split("-").map(Number);
      setEndDate(new Date(y, m - 1, d));
    }
    if (item.adults !== undefined) setAdults(item.adults);
    if (item.children !== undefined) setChildren(item.children);

    setActivePopover(null);
  };

  // Calendar Day Click Handler (Unified Range Selection)
  const handleDayClick = (dayDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isBeforeDay(dayDate, today)) return;

    if (!startDate || (startDate && endDate)) {
      // First click: select start date, clear end date
      setStartDate(dayDate);
      setEndDate(null);
    } else if (startDate && !endDate) {
      // Second click:
      if (isBeforeDay(dayDate, startDate)) {
        // User clicked an earlier date, switch start date
        setStartDate(dayDate);
      } else if (isSameDay(dayDate, startDate)) {
        // Clicked same date: make 1 night or keep single
        setEndDate(dayDate);
        setActivePopover("guests");
      } else {
        // Complete the range
        setEndDate(dayDate);
        setActivePopover("guests"); // Smooth transition to guests
      }
    }
  };

  // Quick Preset Handlers (e.g. 3 Days, 5 Days, 7 Days)
  const applyDatePreset = (daysCount: number) => {
    const start = new Date();
    start.setDate(start.getDate() + 1); // Starts tomorrow
    const end = new Date(start);
    end.setDate(end.getDate() + (daysCount - 1));

    setStartDate(start);
    setEndDate(end);
    setActivePopover("guests");
  };

  // Form Submit / Search Action
  const handlePerformSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const finalDest = selectedDestinationName || destinationQuery.trim() || "All Valleys";

    // Save to recent search history
    saveRecentSearch(finalDest, startDate, endDate, adults, children);

    if (onSearchSubmit) {
      onSearchSubmit({
        destination: finalDest,
        startDate: startDate ? formatDateISO(startDate) : undefined,
        endDate: endDate ? formatDateISO(endDate) : undefined,
        adults,
        children,
      });
      return;
    }

    const params = new URLSearchParams();
    if (finalDest && finalDest !== "All Valleys") {
      params.set("destination", finalDest);
    }
    if (startDate) params.set("startDate", formatDateISO(startDate));
    if (endDate) params.set("endDate", formatDateISO(endDate));
    params.set("adults", adults.toString());
    if (children > 0) params.set("children", children.toString());

    router.push(`/tours?${params.toString()}`);
  };

  // Calendar Month Generators
  const getDaysInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInCurrent = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInCurrent };
  };

  const currentYear = calendarViewDate.getFullYear();
  const currentMonth = calendarViewDate.getMonth();
  const { firstDay, daysInCurrent } = getDaysInMonth(currentYear, currentMonth);

  const prevMonth = () => {
    setCalendarViewDate(new Date(currentYear, currentMonth - 1, 1));
  };
  const nextMonth = () => {
    setCalendarViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Compute duration in nights
  const nightsCount = useMemo(() => {
    if (!startDate || !endDate) return null;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
  }, [startDate, endDate]);

  return (
    <div
      ref={searchBarRef}
      className={`relative w-full mx-auto transition-all duration-300 ${className}`}
    >
      {/* =====================================================================
          MAIN FLOATING SEARCH BAR CONTAINER
          - Desktop: Elegant horizontal floating pill
          - Mobile: Vertically stacked cards with large touch targets
      ===================================================================== */}
      <div
        className="rounded-xl md:rounded-2xl p-1.5 md:p-1.5 border transition-all duration-300"
        style={{
          backgroundColor: "var(--season-search-glass-bg, rgba(0, 0, 0, 0.65))",
          borderColor: "var(--season-search-glass-border, rgba(255, 255, 255, 0.22))",
          backdropFilter: "blur(var(--season-search-glass-blur, 24px))",
          WebkitBackdropFilter: "blur(var(--season-search-glass-blur, 24px))",
          boxShadow: "var(--season-search-glass-shadow, 0 20px 50px -12px rgba(0, 0, 0, 0.35))",
        }}
      >
        <div className="flex flex-col md:flex-row items-stretch md:items-center divide-y md:divide-y-0 md:divide-x divide-white/15 gap-1 md:gap-0">
          {/* ---------------------------------------------------------------
              FIELD 1: DESTINATION (Fuzzy Search & Auto-Suggest & Recent Searches)
          --------------------------------------------------------------- */}
          <div className="relative flex-1 group">
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                setActivePopover(activePopover === "destination" ? null : "destination");
                setTimeout(() => destinationInputRef.current?.focus(), 50);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setActivePopover(activePopover === "destination" ? null : "destination");
                  setTimeout(() => destinationInputRef.current?.focus(), 50);
                }
              }}
              className={`w-full text-left px-3 py-2 md:py-1.5 rounded-lg md:rounded-xl transition-all duration-200 flex items-center gap-2.5 cursor-pointer ${
                activePopover === "destination"
                  ? "bg-white/20 ring-1 ring-white/40 shadow-xs"
                  : "hover:bg-white/10"
              }`}
            >
              <div
                className="w-8.5 h-8.5 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 bg-white/15 text-white"
              >
                <MapPin className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <span className="block text-[10px] uppercase font-bold tracking-wider text-white/95 drop-shadow-xs">
                  Where to?
                </span>
                <input
                  ref={destinationInputRef}
                  type="text"
                  value={destinationQuery}
                  placeholder="Gulmarg, Pahalgam, Dal Lake..."
                  onChange={(e) => {
                    setDestinationQuery(e.target.value);
                    setSelectedDestinationName(e.target.value);
                    if (activePopover !== "destination") setActivePopover("destination");
                  }}
                  onFocus={() => setActivePopover("destination")}
                  className="w-full bg-transparent text-sm md:text-[14px] font-semibold text-white placeholder:text-[13px] md:placeholder:text-[13px] placeholder:text-white/70 placeholder:font-normal focus:outline-hidden truncate"
                />
              </div>

              {destinationQuery && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDestinationQuery("");
                    setSelectedDestinationName("");
                    destinationInputRef.current?.focus();
                  }}
                  className="p-1 text-white/60 hover:text-white rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* DESTINATION POPOVER (Auto-Suggest / Typos / Recent Searches) */}
            {activePopover === "destination" && (
              <div
                className="absolute top-full left-0 mt-3 w-full md:w-96 max-w-[95vw] bg-white rounded-2xl shadow-2xl border p-3 z-50 animate-in fade-in zoom-in-95 duration-150"
                style={{ borderColor: "var(--season-border)" }}
              >
                {/* Mode A: Input is EMPTY -> Show Recent Searches & Trending */}
                {!destinationQuery.trim() ? (
                  <div>
                    {recentSearches.length > 0 ? (
                      <div className="mb-4">
                        <div className="flex items-center justify-between px-2 py-1.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> Recent Searches
                          </span>
                          <button
                            type="button"
                            onClick={clearAllRecentSearches}
                            className="text-[11px] font-medium text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            Clear all
                          </button>
                        </div>
                        <div className="space-y-1 mt-1">
                          {recentSearches.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleSelectRecentSearch(item)}
                              className="group flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Clock className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-[var(--season-primary)]" />
                                <div className="truncate">
                                  <div className="text-sm font-semibold text-slate-800 group-hover:text-[var(--season-primary)] truncate">
                                    {item.destination}
                                  </div>
                                  {(item.datesText || item.guestsText) && (
                                    <div className="text-[11px] text-slate-400 truncate">
                                      {[item.datesText, item.guestsText].filter(Boolean).join(" • ")}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => removeRecentSearch(e, item.id)}
                                className="p-1 text-slate-300 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
                                title="Remove search"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {/* Popular Destinations in Kashmir */}
                    <div>
                      <div className="px-2 py-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--season-secondary)" }} />
                          Trending in Kashmir
                        </span>
                      </div>
                      <div className="space-y-1 mt-1">
                        {KASHMIR_DESTINATIONS.filter((d) => d.popular).map((dest) => (
                          <div
                            key={dest.id}
                            onClick={() => handleSelectDestination(dest)}
                            className="group flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{ backgroundColor: "var(--season-primary-light)" }}
                              >
                                <Compass className="w-4 h-4" style={{ color: "var(--season-primary)" }} />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-slate-800 group-hover:text-[var(--season-primary)]">
                                  {dest.name}
                                </div>
                                <div className="text-[11px] text-slate-400 line-clamp-1">
                                  {dest.highlight}
                                </div>
                              </div>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[var(--season-primary)] group-hover:translate-x-0.5 transition-all" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Mode B: Query typed -> Show intelligent Fuzzy / Typo Search Results */
                  <div>
                    <div className="px-2 py-1 mb-1">
                      <span className="text-xs font-semibold text-slate-500">
                        {searchResults.length > 0
                          ? `Suggestions for "${destinationQuery}"`
                          : `No exact match for "${destinationQuery}"`}
                      </span>
                    </div>

                    {searchResults.length > 0 ? (
                      <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                        {searchResults.map((dest) => (
                          <div
                            key={dest.id}
                            onClick={() => handleSelectDestination(dest)}
                            className="group flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                              style={{ backgroundColor: "var(--season-primary-light)" }}
                            >
                              <MapPin className="w-4 h-4" style={{ color: "var(--season-primary)" }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-800 group-hover:text-[var(--season-primary)]">
                                  {dest.name}
                                </span>
                                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                  {dest.district}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                {dest.highlight}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Zero Exact Matches -> Suggest Popular Kashmir destinations to prevent drop-off */
                      <div className="p-3 text-center">
                        <p className="text-xs text-slate-500 mb-3">
                          Looking for a specific valley? Check these popular favorites:
                        </p>
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {KASHMIR_DESTINATIONS.slice(0, 4).map((dest) => (
                            <button
                              key={dest.id}
                              type="button"
                              onClick={() => handleSelectDestination(dest)}
                              className="text-xs px-2.5 py-1 rounded-full border border-slate-200 hover:border-slate-400 font-medium text-slate-700 cursor-pointer transition-colors"
                            >
                              {dest.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ---------------------------------------------------------------
              FIELD 2: DATES (Unified Calendar Dropdown for Start & End Date)
          --------------------------------------------------------------- */}
          <div className="relative flex-1 group">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setActivePopover(activePopover === "dates" ? null : "dates")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setActivePopover(activePopover === "dates" ? null : "dates");
                }
              }}
              className={`w-full text-left px-3 py-2 md:py-1.5 rounded-lg md:rounded-xl transition-all duration-200 flex items-center gap-2.5 cursor-pointer ${
                activePopover === "dates"
                  ? "bg-white/20 ring-1 ring-white/40 shadow-xs"
                  : "hover:bg-white/10"
              }`}
            >
              <div
                className="w-8.5 h-8.5 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 bg-white/15 text-white"
              >
                <CalendarIcon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <span className="block text-[10px] uppercase font-bold tracking-wider text-white/95 drop-shadow-xs">
                  When
                </span>
                <div className="text-sm md:text-[15px] font-semibold text-white truncate">
                  {startDate && endDate ? (
                    <span>
                      {formatShortDate(startDate)} – {formatShortDate(endDate)}
                      <span className="ml-1.5 text-xs font-normal text-white/85">
                        ({nightsCount} {nightsCount === 1 ? "night" : "nights"})
                      </span>
                    </span>
                  ) : startDate ? (
                    <span>
                      {formatShortDate(startDate)} – <span className="text-white/75 text-xs md:text-[13px]">Select return</span>
                    </span>
                  ) : (
                    <span className="text-white/70 font-normal text-xs md:text-[13px]">Add travel dates</span>
                  )}
                </div>
              </div>

              {startDate && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStartDate(null);
                    setEndDate(null);
                  }}
                  className="p-1 text-white/60 hover:text-white rounded-full hover:bg-white/20 transition-colors"
                  title="Clear dates"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* UNIFIED CALENDAR POPOVER */}
            {activePopover === "dates" && (
              <div
                className="absolute top-full left-0 md:-left-12 mt-3 w-full md:w-[350px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
                style={{ borderColor: "var(--season-border)" }}
              >
                {/* Header with Navigation */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <div className="font-bold text-slate-900 text-sm">
                    {MONTH_NAMES[currentMonth]} {currentYear}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={prevMonth}
                      className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={nextMonth}
                      className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Day labels */}
                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {DAYS_OF_WEEK.map((d) => (
                    <span key={d} className="text-[11px] font-bold text-slate-400">
                      {d}
                    </span>
                  ))}
                </div>

                {/* Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {/* Empty cells before 1st day of month */}
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-8 md:h-9" />
                  ))}

                  {/* Days */}
                  {Array.from({ length: daysInCurrent }).map((_, i) => {
                    const dayNum = i + 1;
                    const date = new Date(currentYear, currentMonth, dayNum);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isPast = isBeforeDay(date, today);

                    const isStart = isSameDay(date, startDate);
                    const isEnd = isSameDay(date, endDate);
                    const inRange = isDateInRange(date, startDate, endDate);
                    const inHoverRange =
                      startDate &&
                      !endDate &&
                      hoverDate &&
                      isDateInRange(date, startDate, hoverDate);

                    return (
                      <button
                        key={dayNum}
                        type="button"
                        disabled={isPast}
                        onClick={() => handleDayClick(date)}
                        onMouseEnter={() => setHoverDate(date)}
                        onMouseLeave={() => setHoverDate(null)}
                        className={`h-8 md:h-9 w-full text-xs font-semibold flex items-center justify-center transition-all cursor-pointer relative ${
                          isPast ? "text-slate-300 cursor-not-allowed" : "hover:scale-105"
                        } ${
                          isStart
                            ? "rounded-l-full text-white z-10 shadow-sm"
                            : isEnd
                            ? "rounded-r-full text-white z-10 shadow-sm"
                            : inRange || inHoverRange
                            ? "text-slate-900 font-medium"
                            : "rounded-full text-slate-700 hover:bg-slate-100"
                        }`}
                        style={{
                          backgroundColor:
                            isStart || isEnd
                              ? "var(--season-primary)"
                              : inRange || inHoverRange
                              ? "var(--season-primary-light)"
                              : undefined,
                          color: isStart || isEnd ? "#ffffff" : undefined,
                        }}
                      >
                        {dayNum}
                      </button>
                    );
                  })}
                </div>

                {/* Quick Presets for popular Kashmir itineraries */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Popular Itineraries
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyDatePreset(3)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-medium text-slate-700 cursor-pointer transition-colors"
                    >
                      3 Days (Short Trip)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDatePreset(5)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-medium text-slate-700 cursor-pointer transition-colors"
                    >
                      5 Days (Classic Circuit)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDatePreset(7)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-medium text-slate-700 cursor-pointer transition-colors"
                    >
                      7 Days (Grand Valley)
                    </button>
                  </div>
                </div>

                {/* Calendar Action buttons */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setStartDate(null);
                      setEndDate(null);
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePopover(startDate ? "guests" : null)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg text-white cursor-pointer shadow-xs"
                    style={{ backgroundColor: "var(--season-primary)" }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ---------------------------------------------------------------
              FIELD 3: GUESTS (Popover with + and - for Adults & Children)
          --------------------------------------------------------------- */}
          <div className="relative flex-1 group">
            <button
              type="button"
              onClick={() => setActivePopover(activePopover === "guests" ? null : "guests")}
              className={`w-full text-left px-3 py-2 md:py-1.5 rounded-lg md:rounded-xl transition-all duration-200 flex items-center gap-2.5 cursor-pointer ${
                activePopover === "guests"
                  ? "bg-white/20 ring-1 ring-white/40 shadow-xs"
                  : "hover:bg-white/10"
              }`}
            >
              <div
                className="w-8.5 h-8.5 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 bg-white/15 text-white"
              >
                <Users className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <span className="block text-[10px] uppercase font-bold tracking-wider text-white/95 drop-shadow-xs">
                  Guests
                </span>
                <div className="text-sm md:text-[15px] font-semibold text-white truncate">
                  {adults} Adult{adults > 1 ? "s" : ""}
                  {children > 0 && `, ${children} Child${children > 1 ? "ren" : ""}`}
                </div>
              </div>
            </button>

            {/* GUESTS COUNTER POPOVER */}
            {activePopover === "guests" && (
              <div
                className="absolute top-full right-0 mt-3 w-full md:w-80 max-w-[95vw] bg-white rounded-2xl shadow-2xl border p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
                style={{ borderColor: "var(--season-border)" }}
              >
                {/* Control 1: Adults */}
                <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                  <div>
                    <div className="text-sm font-bold text-slate-800">Adults</div>
                    <div className="text-xs text-slate-400">Ages 13 and above</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={adults <= 1}
                      onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
                      className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:border-slate-900 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-slate-900">
                      {adults}
                    </span>
                    <button
                      type="button"
                      disabled={adults >= 16}
                      onClick={() => setAdults((prev) => Math.min(16, prev + 1))}
                      className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:border-slate-900 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Control 2: Children */}
                <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                  <div>
                    <div className="text-sm font-bold text-slate-800">Children</div>
                    <div className="text-xs text-slate-400">Ages 2 to 12 years</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={children <= 0}
                      onClick={() => setChildren((prev) => Math.max(0, prev - 1))}
                      className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:border-slate-900 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-slate-900">
                      {children}
                    </span>
                    <button
                      type="button"
                      disabled={children >= 8}
                      onClick={() => setChildren((prev) => Math.min(8, prev + 1))}
                      className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:border-slate-900 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Popover Footer */}
                <div className="flex items-center justify-between mt-3 pt-1">
                  <span className="text-xs font-medium text-slate-500">
                    Total: {adults + children} {adults + children === 1 ? "Traveler" : "Travelers"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivePopover(null)}
                    className="text-xs font-bold px-4 py-1.5 rounded-lg text-white cursor-pointer shadow-xs"
                    style={{ backgroundColor: "var(--season-primary)" }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ---------------------------------------------------------------
              CTA BUTTON (Visually Distinct, Dynamic Seasonal Primary Color)
              Desktop: Integrated right button
              Mobile: Full-width high-converting touch target
          --------------------------------------------------------------- */}
          <div className="p-1 md:p-0.5 md:pl-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handlePerformSearch()}
              className="btn-season-primary w-full md:w-auto h-10 md:h-10.5 px-5 md:px-6 rounded-lg md:rounded-xl font-bold text-xs md:text-sm tracking-wide inline-flex items-center justify-center gap-2 shadow-lg active:scale-98 cursor-pointer transition-all duration-200"
            >
              <Search className="w-4 h-4 shrink-0 stroke-[2.5]" />
              <span>Find Your Trip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
