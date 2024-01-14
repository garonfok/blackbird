/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    colors: {
      transparent: "transparent",

      "primary.default": "#FFBB33",
      "primary.hover": "#FFAD0A",
      "error.default": "#E4004A",

      "bg.0": "#0A0A0B",
      "bg.1": "#131315",
      "bg.2": "#1D1D20",
      "fg.0": "#F2F3F4",
      "fg.1": "#BFBFC3",
      "fg.2": "#8D8A93",

      "divider": "#2E2E30",
    },
  },
  plugins: [require("tailwind-scrollbar")({ nocompatible: true })],
};
