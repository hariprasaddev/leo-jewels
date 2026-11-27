/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#C6A15B",
          light: "#DCC194",
          pale: "#F0E4CB",
          dark: "#A88342",
          deep: "#7D5F2A",
        },
        ivory: "#FAF7F0",
        ink: "#171717",
        charcoal: "#292929",
        cream: "#F5F0E7",
        stone: "#8A8578",
        line: "#E5DED0",
        /* Premium storefront header palette */
        espresso: "#211A16",
        "espresso-deep": "#191310",
        "charcoal-deep": "#141110",
        champagne: "#D6B16E",
        "gold-soft": "#C69A52",
        "warm-ivory": "#F8F3EA",
        "brown-sep": "#514235",
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Didot", "Georgia", "serif"],
        sans: ["Jost", "Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        eyebrow: "0.28em",
        wide2: "0.16em",
      },
      boxShadow: {
        soft: "0 18px 50px -24px rgba(23,23,23,0.28)",
        card: "0 2px 20px -8px rgba(23,23,23,0.18)",
      },
      transitionTimingFunction: {
        silk: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fade-in 0.4s ease-out both",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
};
