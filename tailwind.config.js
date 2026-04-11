// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Humer brand - industrial / metallic aesthetic
        brand: {
          50: "#fdf8f0",
          100: "#f9edda",
          200: "#f2d8b0",
          300: "#e8bd7c",
          400: "#dd9f47",
          500: "#d4872a", // Primary: ámbar industrial
          600: "#b86e1e",
          700: "#945519",
          800: "#784416",
          900: "#633918",
          950: "#371d09",
        },
        slate: {
          850: "#172033",
          950: "#0a0f1a",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        display: ["Syne", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(212, 135, 42, 0.3)",
        "glow-sm": "0 0 10px rgba(212, 135, 42, 0.2)",
        card: "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)",
      },
      backgroundImage: {
        "grid-pattern":
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M0 40L40 0M-10 10L10-10M30 50L50 30' stroke='rgba(255,255,255,0.03)' stroke-width='1'/%3E%3C/svg%3E\")",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
