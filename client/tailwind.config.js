/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // EV-FIT brand palette — deep "night charging" navy base with a
        // high-voltage teal accent and a warning amber/red pair for alerts.
        base: {
          950: "#060B14",
          900: "#0A1220",
          800: "#0F1B2E",
          700: "#16263D",
          600: "#1E3350",
        },
        volt: {
          400: "#4DE8D6",
          500: "#22D3C4",
          600: "#0EA79B",
        },
        signal: {
          safe: "#3DDC84",
          warn: "#F5B92E",
          risk: "#FF8A3D",
          critical: "#FF4D4D",
        },
        ink: {
          100: "#F3F6FA",
          300: "#B9C4D4",
          500: "#7C8AA0",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(34, 211, 196, 0.35)",
      },
    },
  },
  plugins: [],
};
