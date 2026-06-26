/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./frontend/src/**/*.{html,ts}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: '#090D1A',
        darkCard: '#0F172A',
        accentGreen: '#10B981',
      }
    },
  },
  plugins: [],
}
