/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./frontend/src/**/*.{html,ts}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--primary)',
          primaryHover: 'var(--primary-hover)',
          bg: 'var(--background)',
          surface: 'var(--surface)',
          text: 'var(--text)',
          border: 'var(--border)',
          editorBg: 'var(--editor-bg)',
          editorLine: 'var(--editor-line)',
          success: 'var(--success)',
          warning: 'var(--warning)',
          danger: 'var(--danger)',
        }
      }
    },
  },
  plugins: [],
}
