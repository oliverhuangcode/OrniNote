/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'ml-green': '#10B981', // Emerald-500 as default, adjust as needed
        'ml-dark': '#1F2937',   // Gray-800
        'ml-gray': '#6B7280',   // Gray-500
      },
      fontFamily: {
        'jetbrains': ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}