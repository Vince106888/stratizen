/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // 1️⃣ Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        'strathmore-blue': '#00205B',   // Primary blue
        'strathmore-light': '#e6f0ff',  // Light variant
        'strathmore-dark': '#001f66',   // Dark variant
        'strathmore-gray': '#f5f5f5',   // Optional neutral color
      },
    },
  },
  plugins: [],
}
