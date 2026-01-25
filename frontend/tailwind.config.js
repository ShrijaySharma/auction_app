/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cricket: {
          green: '#1a5f1a',
          dark: '#0a0a0a',
          gold: '#ffd700',
        }
      }
    },
  },
  plugins: [],
}

