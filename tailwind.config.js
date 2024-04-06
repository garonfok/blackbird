/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    colors: {
      transparent: "transparent",

      "primary.default": "#FFBB33",
      "primary.hover": "#FFAD0A",
      "error.default": "#E4004A",
      "error.focus": "#FF4782",

      "bg.0": "#0A0A0B",
      "bg.1": "#131315",
      "bg.2": "#1D1D20",

      "fg.0": "#F2F3F4",
      "fg.1": "#BFBFC3",
      "fg.2": "#8D8A93",

      "divider.default": "#2E2E30",
      "divider.focus": "#3C3C3E",

      "sidebar-bg.default": "#0A0A0B",
      "sidebar-bg.focus": "#1D1D20",

      "main-bg.default": "#131315",
      "main-bg.hover": "#1D1D20",
      "main-bg.focus": "#27272B",

      "float-bg.default": "#131315",
      "float-bg.focus": "#303036",
    },
  },
  plugins: [require("tailwind-scrollbar")({ nocompatible: true })],
};
