import type { Config } from "tailwindcss";

const config: Config = {
  /** Без класса `dark` на `<html>` варианты `dark:*` не применяются — только светлая тема. */
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0F3D2E",
          dark: "#2B2F2D",
          accent: "#0F3D2E",
          "accent-hover": "#174D3B",
          light: "#F6F6F4",
          gray: "#E9E7E3",
          muted: "#D7D2CB",
          border: "rgba(43,47,45,0.14)",
          sale: "#6E2A1F",
          graphite: "#2B2F2D",
          stone: "#E9E7E3",
          clay: "#D7D2CB",
        },
      },
      fontFamily: {
        heading: ["var(--font-main)", "sans-serif"],
        body: ["var(--font-main)", "sans-serif"],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "2rem",
          lg: "4rem",
          xl: "5rem",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        "count-up": "countUp 2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
