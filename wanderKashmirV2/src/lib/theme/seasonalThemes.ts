export type SeasonId = "spring" | "summer" | "autumn" | "winter";

export interface SeasonTheme {
  id: SeasonId;
  name: string;
  kashmiriName: string;
  tagline: string;
  colors: {
    // 🔒 LOCKED CORE VALUES
    primary: string;
    secondary: string;
    tertiary: string;
    background: string;

    // Derived values
    surface: string;
    text: string;
    border: string;
    muted: string;
    primaryLight: string;
    primaryHover: string;
    secondaryLight: string;
    focusRing: string;

    // Seasonal Dark Surfaces
    footerBg: string;

    // Seasonal Glassmorphism for Search Bar
    searchGlassBg: string;
    searchGlassBorder: string;
    searchGlassBlur: string;
    searchGlassShadow: string;
  };
}

export const seasonalThemes: Record<SeasonId, SeasonTheme> = {
  spring: {
    id: "spring",
    name: "Spring",
    kashmiriName: "Sonth",
    tagline: "Tulip Pink & Almond Blooms",
    colors: {
      // 🔒 LOCKED
      primary: "#D91E63",
      secondary: "#399E96",
      tertiary: "#E9C46A",
      background: "#FFFFFF",

      // Supporting
      surface: "#FFFFFF",
      text: "#1F2421",
      border: "#EADFD5",
      muted: "#5C635E",
      primaryLight: "#FCE7F0",
      primaryHover: "#B81552",
      secondaryLight: "#E6F4F2",
      focusRing: "rgba(217, 30, 99, 0.35)",

      // Seasonal Dark Surfaces (Spring deep wine-obsidian)
      footerBg: "#1F0C16",

      // Spring Glassmorphism (Delicate Rose-Obsidian glass)
      searchGlassBg: "rgba(36, 16, 26, 0.68)",
      searchGlassBorder: "rgba(255, 255, 255, 0.22)",
      searchGlassBlur: "24px",
      searchGlassShadow: "0 8px 18px -4px rgba(0, 0, 0, 0.22), 0 2px 6px -1px rgba(217, 30, 99, 0.12)",
    },
  },
  summer: {
    id: "summer",
    name: "Summer",
    kashmiriName: "Grishm",
    tagline: "Pine Green & Dal Lake Blue",
    colors: {
      // 🔒 LOCKED
      primary: "#164E3B",
      secondary: "#0878B9",
      tertiary: "#8FBC72",
      background: "#FFFFFF",

      // Supporting
      surface: "#FFFFFF",
      text: "#17211D",
      border: "#D2E1DB",
      muted: "#56635E",
      primaryLight: "#EBF2EE",
      primaryHover: "#0D3028",
      secondaryLight: "#E5F2F9",
      focusRing: "rgba(22, 78, 59, 0.35)",

      // Seasonal Dark Surfaces (Summer deep pine-obsidian)
      footerBg: "#0C2B20",

      // Summer Glassmorphism (Pine & Dal Lake emerald smoke obsidian)
      searchGlassBg: "rgba(14, 30, 24, 0.68)",
      searchGlassBorder: "rgba(255, 255, 255, 0.22)",
      searchGlassBlur: "24px",
      searchGlassShadow: "0 8px 18px -4px rgba(0, 0, 0, 0.22), 0 2px 6px -1px rgba(22, 78, 59, 0.15)",
    },
  },
  autumn: {
    id: "autumn",
    name: "Autumn",
    kashmiriName: "Harud",
    tagline: "Chinar Rust & Saffron Gold",
    colors: {
      // 🔒 LOCKED
      primary: "#D62828",
      secondary: "#F4A261",
      tertiary: "#9D0208",
      background: "#FFFFFF",

      // Supporting
      surface: "#FFFFFF",
      text: "#1F2120",
      border: "#E9DECB",
      muted: "#5C5E58",
      primaryLight: "#FCECEB",
      primaryHover: "#B31E1E",
      secondaryLight: "#FEF3EA",
      focusRing: "rgba(214, 40, 40, 0.35)",

      // Seasonal Dark Surfaces (Autumn deep Chinar mahogany / ember obsidian)
      footerBg: "#220D0D",

      // Autumn Glassmorphism (Chinar amber-smoke & rich crimson-infused glass)
      searchGlassBg: "rgba(34, 18, 16, 0.68)",
      searchGlassBorder: "rgba(255, 255, 255, 0.22)",
      searchGlassBlur: "24px",
      searchGlassShadow: "0 8px 18px -4px rgba(0, 0, 0, 0.22), 0 2px 6px -1px rgba(214, 40, 40, 0.12)",
    },
  },
  winter: {
    id: "winter",
    name: "Winter",
    kashmiriName: "Wandh",
    tagline: "Glacier Cyan & Slate Mountain Grey",
    colors: {
      // 🔒 LOCKED
      primary: "#00B4D8",
      secondary: "#343A40",
      tertiary: "#8B5A2B",
      background: "#FFFFFF",

      // Supporting
      surface: "#FFFFFF",
      text: "#1E293B",
      border: "#E2E8F0",
      muted: "#64748B",
      primaryLight: "#E6F8FB",
      primaryHover: "#0096B4",
      secondaryLight: "#ECEFF1",
      focusRing: "rgba(0, 180, 216, 0.35)",

      // Seasonal Dark Surfaces (Winter glacial midnight alpine obsidian)
      footerBg: "#0B1824",

      // Winter Glassmorphism (Sheshnag snow & glacial alpine midnight blue frost)
      searchGlassBg: "rgba(14, 26, 38, 0.70)",
      searchGlassBorder: "rgba(255, 255, 255, 0.25)",
      searchGlassBlur: "28px",
      searchGlassShadow: "0 8px 18px -4px rgba(0, 0, 0, 0.22), 0 2px 6px -1px rgba(0, 180, 216, 0.15)",
    },
  },
};
