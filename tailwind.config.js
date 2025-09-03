// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // ✅ toggles dark mode via .dark on <html>
  theme: {
    extend: {
      colors: {
        /* Brand Palette */
        primary: "var(--color-primary)",
        accent: "var(--color-accent)",
        gold: "var(--color-gold)",

        /* UI Colors */
        bg: "var(--color-bg)",
        text: "var(--color-text)",
        navbar: "var(--color-navbar)",
        "navbar-text": "var(--color-navbar-text)",
        "sidebar-bg": "var(--color-sidebar-bg)",
        "sidebar-text": "var(--color-sidebar-text)",
        "dropdown-bg": "var(--color-dropdown-bg)",
      },
    },
  },
  plugins: [],
};
