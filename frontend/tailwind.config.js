/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        krishi: {
          50:  "#F2FAF0",
          100: "#DFF2D0",
          200: "#BDE8A0",
          300: "#8FCC72",
          400: "#63AE48",
          500: "#4E9435",
          600: "#3D7A2B",
          700: "#2D5C1E",
          800: "#1A3D10",
          900: "#0F2409",
        },
        amber: {
          50:  "#FFFBEB",
          100: "#FEF3C7",
          400: "#F59E0B",
          600: "#B45309",
        },
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl:  "16px",
        "2xl": "24px",
      },
      boxShadow: {
        card: "0 4px 16px rgba(0,0,0,0.08)",
        lg:   "0 8px 32px rgba(0,0,0,0.10)",
      },
    },
  },
  plugins: [],
};
