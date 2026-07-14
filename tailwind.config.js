/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './utils/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './*.tsx',
    './*.ts',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        mint: '#6EE7B7',
        primary: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
        },
        'background-light': '#f3f4f6',
        'background-dark': '#111111',
        'card-dark': '#000000',
        gray: {
          750: '#2a2d33',
          850: '#16181c',
          900: '#111111',
          950: '#000000',
        },
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
