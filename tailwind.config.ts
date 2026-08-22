import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Deep pine green — primary brand color.
        brand: {
          50: '#f2f8f5',
          100: '#dfeee6',
          200: '#b9ddc9',
          300: '#8bc4a8',
          400: '#57a380',
          500: '#348264',
          600: '#246850',
          700: '#1d5341',
          800: '#194235',
          900: '#16362c',
          950: '#0c1f19',
        },
        // Warm saffron — accent for CTAs, badges, curation highlights.
        accent: {
          50: '#fdf8ed',
          100: '#f9ecc9',
          200: '#f2d68e',
          300: '#eabc55',
          400: '#e0a530',
          500: '#c98a1f',
          600: '#a86c18',
          700: '#855316',
          800: '#6d4318',
          900: '#5c3819',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 30, 25, 0.04), 0 8px 24px -8px rgba(15, 30, 25, 0.12)',
        lift: '0 4px 8px rgba(15, 30, 25, 0.06), 0 16px 32px -12px rgba(15, 30, 25, 0.18)',
      },
    },
  },
  plugins: [],
};

export default config;
