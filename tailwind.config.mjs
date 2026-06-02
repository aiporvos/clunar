import { fontFamily } from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#f5f5f0',
          text: '#0a0a0a',
          accent: '#7c3aed',
          accentLight: '#a78bfa',
          card: '#ffffff',
          border: '#e5e5e0',
          footer: '#0a0a0a',
        },
      },
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
      },
    },
  },
  plugins: [],
};
