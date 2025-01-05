import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      screens: {
        'laptop-sm': {'min': '1024px', 'max': '1366px'},
        'laptop-md': {'min': '1367px', 'max': '1536px'},
      },
      fontFamily: {
        'primary': ['medium', 'sans-serif'],
        'secondary': ['bold', 'serif'],
      },
      keyframes: {
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(20px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(20px) rotate(-360deg)' }
        }
      },
      animation: {
        'orbit': 'orbit 2s linear infinite'
      }
    },
  },
  plugins: [],
} satisfies Config
