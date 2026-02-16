/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
      },
      colors: {
        'kid-blue': '#4A90E2',
        'kid-yellow': '#FFD93D',
        'kid-pink': '#FF6B9D',
        'kid-green': '#6BCB77',
      },
    },
  },
  plugins: [],
}
