/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './**/*.{ts,tsx}',
    '!./node_modules/**',
    '!./dist/**',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "primary": "#6366f1",
        "primary-hover": "#4f46e5",
        "secondary": "#64748b",
        "accent": "#0891b2",
        "glass-border": "rgba(0, 0, 0, 0.08)",
        "glass-surface": "rgba(255, 255, 255, 0.7)",
        "off-white": "#f4f7f9",
        "dark-text": "#1e293b",
        "workspace-bg": "#F5F5F7",
        "surface-dark": "#2d2830",
        "card-light": "#ffffff",
        "card-dark": "#0f1117",
        "accent-green": "#52c41a",
        "accent-orange": "#fa8c16",
        "accent-blue": "#0ea5e9",
        "background-light": "#f8fafc",
        "background-dark": "#0a0c1a",
        "surface": "#ffffff",
        "surface-hover": "#f8fafc",
      },
      fontFamily: {
        "display": ["CascadiaNextSC", "CascadiaNextJP", "sans-serif"],
        "sans": ["CascadiaNextSC", "CascadiaNextJP", "sans-serif"],
      },
      boxShadow: {
        'neon': '0 0 20px rgba(217, 70, 239, 0.2)',
        'neon-cyan': '0 0 15px rgba(6, 182, 212, 0.2)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'soft-xl': '0 20px 40px -10px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        DEFAULT: '0.625rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
