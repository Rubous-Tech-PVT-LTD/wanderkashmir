import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // KashmirDekho Colors
        primary: {
          DEFAULT: "#166534", // Deep forest green
          light: "#22c55e",
          dark: "#14532d",
          muted: "#dcfce7", // very light green
        },
        slate: {
          900: "#0f172a", // Dark charcoal for texts/sections
          800: "#1e293b",
          50: "#f8fafc",
        },
        kashmir: {
          DEFAULT: "#166534",
          light: "#dcfce7",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-plus-jakarta)", "sans-serif"],
        display: ["var(--font-plus-jakarta)", "sans-serif"],
        cursive: ["var(--font-dancing-script)", "cursive"],
      },
      backgroundImage: {
        "grad-saffron": "linear-gradient(135deg, #E8631A 0%, #F5A623 100%)",
        "grad-hero": "linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)",
        "grad-emerald": "linear-gradient(135deg, #1A6B4A 0%, #2D9B6E 100%)",
      },
      boxShadow: {
        "glow-orange": "0 0 30px rgba(232, 99, 26, 0.3)",
        "card": "0 4px 20px rgba(0, 0, 0, 0.08)",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s ease forwards",
        float: "float 4s ease-in-out infinite",
      },
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            table: {
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "2em",
              marginBottom: "2em",
              borderRadius: "0.5rem",
              overflow: "hidden",
            },
            "thead th": {
              backgroundColor: theme("colors.slate.50"),
              borderWidth: "1px",
              borderColor: theme("colors.slate.200"),
              padding: "0.75rem 1rem",
              textAlign: "left",
              fontWeight: "600",
              color: theme("colors.slate.900"),
            },
            "tbody td": {
              borderWidth: "1px",
              borderColor: theme("colors.slate.200"),
              padding: "0.75rem 1rem",
              color: theme("colors.slate.700"),
            },
            "tbody tr": {
              borderBottomWidth: "1px",
              borderColor: theme("colors.slate.200"),
            },
            "tbody tr:nth-child(even)": {
              backgroundColor: theme("colors.slate.50") + "80", // 50% opacity
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
