import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f7f2',
          100: '#e5ede0',
          200: '#c9dbbf',
          300: '#a3c294',
          400: '#79a468',
          500: '#59854a',
          600: '#446a39',
          700: '#37542f',
          800: '#2e4429',
          900: '#283a24',
        },
      },
    },
  },
  plugins: [],
};

export default config;
