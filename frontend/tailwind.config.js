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
        // ui-ux-pro-max: Micro SaaS Indigo 配色方案
        "primary": {
          DEFAULT: "#6366f1",
          hover: "#4f46e5",
          light: "#818cf8",
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          900: "#1e1b4b",
        },
        "secondary": "#64748b",
        "accent": {
          DEFAULT: "#059669",
          green: "#52c41a",
          orange: "#fa8c16",
          blue: "#0ea5e9",
          cyan: "#0891b2",
        },
        "destructive": "#dc2626",
        "muted": {
          DEFAULT: "#ebeff9",
          foreground: "#64748b",
        },
        "foreground": "#1e1b4b",
        "dark-text": "#1e293b",
        "border": "#e0e7ff",
        "ring": "#6366f1",
        // 背景
        "background": {
          DEFAULT: "#f5f3ff",
          light: "#f8fafc",
          dark: "#0a0c1a",
        },
        "workspace-bg": "#F5F5F7",
        // 表面 / 卡片
        "surface": {
          DEFAULT: "#ffffff",
          hover: "#f8fafc",
          dark: "#2d2830",
        },
        "card": {
          DEFAULT: "#ffffff",
          foreground: "#1e1b4b",
          dark: "#0f1117",
        },
        // 玻璃效果
        "glass-border": "rgba(0, 0, 0, 0.08)",
        "glass-surface": "rgba(255, 255, 255, 0.7)",
        "off-white": "#f4f7f9",
      },
      fontFamily: {
        "display": ["Plus Jakarta Sans", "CascadiaNextSC", "CascadiaNextJP", "sans-serif"],
        "sans": ["Plus Jakarta Sans", "CascadiaNextSC", "CascadiaNextJP", "sans-serif"],
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0,0,0,0.05)',
        'md': '0 4px 6px rgba(0,0,0,0.07)',
        'lg': '0 10px 15px rgba(0,0,0,0.1)',
        'xl': '0 20px 25px rgba(0,0,0,0.12)',
        'card': '0 4px 12px rgba(99,102,241,0.08)',
        'card-hover': '0 8px 20px rgba(99,102,241,0.14)',
        'neon': '0 0 20px rgba(99,102,241,0.2)',
        'neon-cyan': '0 0 15px rgba(6, 182, 212, 0.2)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'soft-xl': '0 20px 40px -10px rgba(0, 0, 0, 0.08)',
        'primary': '0 4px 14px rgba(99,102,241,0.25)',
      },
      borderRadius: {
        DEFAULT: '0.625rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
    },
  },
  plugins: [],
}
