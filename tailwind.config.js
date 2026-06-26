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
          secondary: 'var(--secondary)',
          accent: 'var(--accent)',
          highlight: 'var(--highlight)',
          bg: 'var(--background)',
          surface: 'var(--surface)',
          text: 'var(--text)',
          textMuted: 'var(--text-muted)',
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
