/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Semantic app colors — backed by CSS variables, theme-aware
        app: {
          bg:        'rgb(var(--app-bg) / <alpha-value>)',
          surface:   'rgb(var(--app-surface) / <alpha-value>)',
          raised:    'rgb(var(--app-raised) / <alpha-value>)',
          border:    'rgb(var(--app-border) / <alpha-value>)',
          text:      'rgb(var(--app-text) / <alpha-value>)',
          'text-2':  'rgb(var(--app-text-2) / <alpha-value>)',
          'text-3':  'rgb(var(--app-text-3) / <alpha-value>)',
        },
        // Canvas editor — always dark (design surface)
        canvas: {
          bg:      '#0f1117',
          surface: '#1a1d27',
          border:  '#2a2d3a',
          hover:   '#252836',
        },
        brand: {
          primary: '#6366f1',
          hover:   '#4f52d3',
        },
        aws:   '#FF9900',
        azure: '#0078D4',
        gcp:   '#4285F4',
      },
    },
  },
  plugins: [],
}
