/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: { 50: '#F8FAFC', 100: '#CBD5E1', 200: '#94A3B8', 300: '#64748B', 400: '#475569', 500: '#334155', 600: '#1E293B', 700: '#15233D', 800: '#0A1628', 900: '#060D18' },
        primary: { DEFAULT: '#22C55E', light: '#34D399', dark: '#16A34A' },
        secondary: { DEFAULT: '#0EA5E9', light: '#38BDF8', dark: '#0284C7' },
        accent: { DEFAULT: '#8B5CF6', light: '#A78BFA' },
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      borderRadius: { xl: '12px', '2xl': '16px', '3xl': '24px' },
    },
  },
  plugins: [],
};
