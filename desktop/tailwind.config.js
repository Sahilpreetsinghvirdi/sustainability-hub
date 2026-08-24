/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* Royal Black & White scale.
           Class names kept (dark-*) so every existing component re-skins automatically:
           low numbers = near-black text, high numbers = white surfaces. */
        dark: {
          50: '#0A0A0A', 100: '#1C1C1C', 200: '#444444', 300: '#6B6B6B',
          400: '#9A9A9A', 500: '#DADADA', 600: '#F5F5F4', 700: '#FAFAF9',
          800: '#FFFFFF', 900: '#F0F0EE',
        },
        primary: { DEFAULT: '#0A0A0A', light: '#262626', dark: '#000000' },
        secondary: { DEFAULT: '#3F3F46', light: '#52525B', dark: '#27272A' },
        accent: { DEFAULT: '#18181B', light: '#3F3F46' },
        success: '#16A34A',
        warning: '#D97706',
        error: '#DC2626',
      },
      borderRadius: { xl: '12px', '2xl': '16px', '3xl': '24px' },
    },
  },
  plugins: [],
};
