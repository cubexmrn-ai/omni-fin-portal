/** @type {import('tailwindcss').Config} */
module.exports = {
  // "class" (not the default "media") so individual pages/sections can
  // opt into dark mode via a local toggle (e.g. Market Analysis) without
  // forcing it site-wide based on OS preference. Add the "dark" class to
  // any wrapper to activate `dark:` variants underneath it.
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx,mdx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9ebff",
          200: "#bcdcff",
          300: "#8ec5ff",
          400: "#59a4ff",
          500: "#3182ff",
          600: "#1b63f5",
          700: "#154de1",
          800: "#1740b6",
          900: "#193a8f",
          950: "#13254f",
        },
        gold: {
          50: "#fdf9ec",
          100: "#faf0c9",
          200: "#f5df8e",
          300: "#f0c951",
          400: "#ecb629",
          500: "#dc9a17",
          600: "#bd7812",
          700: "#975714",
          800: "#7d4516",
          900: "#6a3a17",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(15, 23, 42, 0.06), 0 1px 3px 0 rgba(15, 23, 42, 0.08)",
        "card-hover": "0 4px 12px -2px rgba(15, 23, 42, 0.12), 0 2px 6px -1px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
