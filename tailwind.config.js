/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf4f0',
          100: '#fbe8e1',
          200: '#f7d1c3',
          300: '#f2b29a',
          400: '#ea8866',
          500: '#e26338',
          600: '#d3481e',
          700: '#b13816',
          800: '#8e2f17',
          900: '#752b17',
          950: '#3f1208',
        },
        cosmic: {
          50: '#f3f1ff',
          100: '#e9e5ff',
          200: '#d5ceff',
          300: '#b7a7ff',
          400: '#9575ff',
          500: '#7643fd',
          600: '#6722f4',
          700: '#5814dc',
          800: '#4a11b6',
          900: '#3e1094',
          950: '#250863',
        },
      },
      fontFamily: {
        sans: ['var(--font-pretendard)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
