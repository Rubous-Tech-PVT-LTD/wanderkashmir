import { SeasonId } from "./seasonalThemes";

/**
 * Calculates the active Kashmir season based on calendar month:
 * - March–May (months 2, 3, 4)        -> Spring (Sonth)
 * - June–August (months 5, 6, 7)       -> Summer (Grishm)
 * - September–November (months 8, 9, 10)-> Autumn (Harud)
 * - December–February (months 11, 0, 1) -> Winter (Wandh)
 */
export function getSeasonFromDate(date: Date = new Date()): SeasonId {
  const month = date.getMonth(); // 0 = Jan, 1 = Feb, ..., 11 = Dec

  if (month >= 2 && month <= 4) {
    return "spring";
  }
  if (month >= 5 && month <= 7) {
    return "summer";
  }
  if (month >= 8 && month <= 10) {
    return "autumn";
  }
  return "winter";
}

/**
 * Formats a display label for the automatic season status
 */
export function getAutoSeasonLabel(seasonId: SeasonId): string {
  switch (seasonId) {
    case "spring":
      return "Automatic (Spring • Sonth)";
    case "summer":
      return "Automatic (Summer • Grishm)";
    case "autumn":
      return "Automatic (Autumn • Harud)";
    case "winter":
      return "Automatic (Winter • Wandh)";
  }
}
