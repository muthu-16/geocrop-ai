/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        geo: {
          50: '#f4f9f5',
          100: '#e3f2e6',
          200: '#c5e5cc',
          300: '#97d1a3',
          400: '#62b574',
          500: '#3e9852',
          600: '#2e7a3f',
          700: '#276135',
          800: '#234e2e',
          900: '#1d4127',
          950: '#0c2313',
        },
        earth: {
          50: '#fbf8f3',
          100: '#f5eee3',
          200: '#ebd9c3',
          300: '#ddbd9b',
          400: '#cc9c71',
          500: '#be8150',
          600: '#ae6d44',
          700: '#91553a',
          800: '#754634',
          900: '#603b2d',
          950: '#341d16',
        },
        darkbg: '#0d131a',
        cardbg: '#16202c',
        glassborder: 'rgba(255, 255, 255, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif', 'Mukta Malar', 'Noto Sans Tamil'],
        tamil: ['Noto Sans Tamil', 'Mukta Malar', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounceSubtle 2s infinite',
      },
      keyframes: {
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(-3%)' },
          '50%': { transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
