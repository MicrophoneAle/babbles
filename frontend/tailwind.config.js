/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Nunito", "sans-serif"],
        heading: ["Carattere", "cursive"],
        prose: ["Lora", "serif"]
      },
      colors: {
        journal: {
          brown: "#6B4F3A",
          grey: "#8C8C8C",
          charcoal: "#3D3D3D",
          paper: "#FAFAF8",
          white: "#FFFFFF",
          cover: "#3B2A1A",
          sticky: "#F5E6C8",
          text: "#2C2C2C",
          saved: "#7A9E7E"
        }
      },
      boxShadow: {
        soft: "0 8px 20px rgba(45, 45, 45, 0.2)",
        leather: "inset 0 0 0 1px rgba(255,255,255,0.08), 0 12px 24px rgba(30,20,12,0.35)"
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        fadeIn: "fadeIn 250ms ease-out",
        saveFlash: "saveFlash 2s ease-in-out"
      }
    }
  },
  plugins: []
};
