/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: "#000000",
      "fg.default": "#FFFFFF",
      "fg.muted": "#BFBFC3",
      "fg.subtle": "#535158",
      "bg.emphasis": "#43424A",
      "bg.default": "#333238",
      "bg.inset": "#1F1E24",
      "brand.default": "#FFAD0A",
      "success.default": "#00C48C",
      "success.emphasis": "#00D68F",
      "danger.default": "#FE2020",
      "danger.emphasis": "#FE4A49",
    },
  },
  plugins: [require("tailwind-scrollbar")({ nocompatible: true })],
};
