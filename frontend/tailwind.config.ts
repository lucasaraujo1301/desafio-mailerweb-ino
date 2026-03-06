import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'Instrument Sans'", "sans-serif"],
        mono: ["'Fira Code'", "monospace"],
      },
      colors: {
        surface: {
          950: "#07080a",
          900: "#0d0f12",
          800: "#13161b",
          700: "#1c2028",
          600: "#252a34",
          500: "#353c4a",
          400: "#4d5668",
          300: "#6b7589",
          200: "#9aa4b5",
          100: "#c8cfd8",
          50:  "#eef0f3",
        },
        brand: {
          600: "#1a4fd6",
          500: "#2563eb",
          400: "#3b82f6",
          300: "#60a5fa",
          200: "#93c5fd",
          glow: "rgba(37,99,235,0.35)",
        },
        success: {
          600: "#059669",
          500: "#10b981",
          400: "#34d399",
          glow: "rgba(16,185,129,0.25)",
        },
        danger: {
          600: "#dc2626",
          500: "#ef4444",
          400: "#f87171",
          glow: "rgba(239,68,68,0.25)",
        },
        warn: {
          500: "#f59e0b",
          400: "#fbbf24",
        },
      },
      boxShadow: {
        "glow-brand": "0 0 20px rgba(37,99,235,0.3), 0 0 60px rgba(37,99,235,0.1)",
        "glow-success": "0 0 20px rgba(16,185,129,0.25)",
        "glow-danger": "0 0 20px rgba(239,68,68,0.2)",
        "card": "0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.07)",
        "modal": "0 25px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)",
      },
      animation: {
        "fade-in":    "fadeIn 0.4s ease forwards",
        "slide-up":   "slideUp 0.45s cubic-bezier(0.16,1,0.3,1) forwards",
        "slide-right":"slideRight 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
        "scale-in":   "scaleIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards",
        "shimmer":    "shimmer 1.8s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:    { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp:   { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideRight:{ from: { opacity: "0", transform: "translateX(-16px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        scaleIn:   { from: { opacity: "0", transform: "scale(0.95)" }, to: { opacity: "1", transform: "scale(1)" } },
        shimmer:   { "0%,100%": { opacity: "0.5" }, "50%": { opacity: "1" } },
        pulseSoft: { "0%,100%": { opacity: "0.7" }, "50%": { opacity: "1" } },
      },
    },
  },
  plugins: [],
};

export default config;
