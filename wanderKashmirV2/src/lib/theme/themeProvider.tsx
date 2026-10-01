"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  SeasonId,
  SeasonTheme,
  seasonalThemes,
} from "./seasonalThemes";
import { getSeasonFromDate } from "./seasonUtils";

export type ThemeMode = "automatic" | "manual";

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  selectedSeason: SeasonId;
  setSelectedSeason: (season: SeasonId) => void;
  activeSeason: SeasonTheme;
  autoSeason: SeasonId;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY_MODE = "wk_theme_mode";
const STORAGE_KEY_SEASON = "wk_theme_season";

function applySeasonToDOM(theme: SeasonTheme) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.setAttribute("data-season", theme.id);

  // Apply all CSS variables
  root.style.setProperty("--season-primary", theme.colors.primary);
  root.style.setProperty("--season-secondary", theme.colors.secondary);
  root.style.setProperty("--season-tertiary", theme.colors.tertiary);
  root.style.setProperty("--season-background", theme.colors.background);
  root.style.setProperty("--season-surface", theme.colors.surface);
  root.style.setProperty("--season-text", theme.colors.text);
  root.style.setProperty("--season-border", theme.colors.border);
  root.style.setProperty("--season-muted", theme.colors.muted);
  root.style.setProperty("--season-primary-light", theme.colors.primaryLight);
  root.style.setProperty("--season-primary-hover", theme.colors.primaryHover);
  root.style.setProperty("--season-secondary-light", theme.colors.secondaryLight);
  root.style.setProperty("--season-focus-ring", theme.colors.focusRing);
  root.style.setProperty("--season-footer-bg", theme.colors.footerBg || "#0C2B20");

  // Search Bar Glassmorphism Variables
  if (theme.colors.searchGlassBg) {
    root.style.setProperty("--season-search-glass-bg", theme.colors.searchGlassBg);
  }
  if (theme.colors.searchGlassBorder) {
    root.style.setProperty("--season-search-glass-border", theme.colors.searchGlassBorder);
  }
  if (theme.colors.searchGlassBlur) {
    root.style.setProperty("--season-search-glass-blur", theme.colors.searchGlassBlur);
  }
  if (theme.colors.searchGlassShadow) {
    root.style.setProperty("--season-search-glass-shadow", theme.colors.searchGlassShadow);
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("automatic");
  const [selectedSeason, setSelectedSeasonState] = useState<SeasonId>("autumn");
  const [isMounted, setIsMounted] = useState(false);

  // 1. Calculate auto season from current date (September = Autumn/Harud)
  const autoSeason = useMemo(() => getSeasonFromDate(), []);

  // 2. Initialize from localStorage on client mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedMode = localStorage.getItem(STORAGE_KEY_MODE) as ThemeMode | null;
      const savedSeason = localStorage.getItem(STORAGE_KEY_SEASON) as SeasonId | null;

      if (savedMode === "manual" && savedSeason && seasonalThemes[savedSeason]) {
        setModeState("manual");
        setSelectedSeasonState(savedSeason);
      } else {
        setModeState("automatic");
        setSelectedSeasonState(autoSeason);
      }
    } catch {
      // Ignore localStorage errors in private mode
    }
  }, [autoSeason]);

  // 3. Resolve active season
  const effectiveSeasonId: SeasonId = mode === "automatic" ? autoSeason : selectedSeason;
  const activeSeason = seasonalThemes[effectiveSeasonId] || seasonalThemes.autumn;

  // 4. Update DOM CSS variables whenever effective season changes
  useEffect(() => {
    applySeasonToDOM(activeSeason);
  }, [activeSeason]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(STORAGE_KEY_MODE, newMode);
      if (newMode === "automatic") {
        localStorage.removeItem(STORAGE_KEY_SEASON);
      }
    } catch {}
  };

  const setSelectedSeason = (newSeason: SeasonId) => {
    setModeState("manual");
    setSelectedSeasonState(newSeason);
    try {
      localStorage.setItem(STORAGE_KEY_MODE, "manual");
      localStorage.setItem(STORAGE_KEY_SEASON, newSeason);
    } catch {}
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        setMode,
        selectedSeason: effectiveSeasonId,
        setSelectedSeason,
        activeSeason,
        autoSeason,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useSeasonalTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useSeasonalTheme must be used within a ThemeProvider");
  }
  return context;
}
