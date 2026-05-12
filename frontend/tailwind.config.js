/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Nunito", "sans-serif"]
      },
      colors: {
        pastel: {
          lavender: "#CDB4FF",
          peach: "#FFC8A2",
          mint: "#B8F2E6",
          sky: "#A0E7FF"
        }
      },
      boxShadow: {
        soft: "0 12px 30px rgba(88, 70, 125, 0.12)"
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
