/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Nunito", "sans-serif"],
        heading: ["Playfair Display", "serif"]
      },
      colors: {
        journal: {
          maroon: "#6B1E1E",
          maroonSoft: "#7B2D2D",
          cream: "#F5F0E8",
          gold: "#C9A84C",
          ink: "#2A1B16"
        }
      },
      boxShadow: {
        soft: "0 10px 20px rgba(16, 8, 8, 0.2)",
        leather: "inset 0 0 0 1px rgba(201,168,76,0.2), 0 10px 20px rgba(16,8,8,0.2)"
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        fadeIn: "fadeIn 250ms ease-out"
      }
    }
  },
  plugins: []
};
