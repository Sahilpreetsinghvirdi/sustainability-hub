/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* Royal Black & White scale — now driven by CSS variables so the whole
           app flips between Light ("porcelain") and Dark ("midnight") themes.
           Class names kept (dark-*); semantics: low = text, high = surfaces. */
        dark: {
          50: 'rgb(var(--c50) / <alpha-value>)',
          100: 'rgb(var(--c100) / <alpha-value>)',
          200: 'rgb(var(--c200) / <alpha-value>)',
          300: 'rgb(var(--c300) / <alpha-value>)',
          400: 'rgb(var(--c400) / <alpha-value>)',
          500: 'rgb(var(--c500) / <alpha-value>)',
          600: 'rgb(var(--c600) / <alpha-value>)',
          700: 'rgb(var(--c700) / <alpha-value>)',
          800: 'rgb(var(--c800) / <alpha-value>)',
          900: 'rgb(var(--c900) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'rgb(var(--p-default) / <alpha-value>)',
          light: 'rgb(var(--p-light) / <alpha-value>)',
          dark: 'rgb(var(--p-dark) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--s-default) / <alpha-value>)',
          light: 'rgb(var(--s-light) / <alpha-value>)',
          dark: 'rgb(var(--s-dark) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--a-default) / <alpha-value>)',
          light: 'rgb(var(--a-light) / <alpha-value>)',
        },
        success: 'rgb(var(--success) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        error: 'rgb(var(--error) / <alpha-value>)',
      },
      borderRadius: { xl: '12px', '2xl': '16px', '3xl': '24px' },
    },
  },
  plugins: [],
};
