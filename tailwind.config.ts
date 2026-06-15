import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './contexts/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A84C',
          50: '#F5EDD4',
          100: '#F0E4BF',
          200: '#E5D396',
          300: '#DBC26D',
          400: '#D4B35A',
          500: '#C9A84C',
          600: '#8A7535',
          700: '#6B5A29',
          800: '#4C3F1D',
          900: '#2D2511',
        },
        dark: {
          DEFAULT: '#0A0A0A',
          bg: '#0A0A0A',
          'bg-elevated': '#111111',
          'bg-raised': '#161616',
          'bg-subtle': '#0D0D0D',
        },
        fg: {
          DEFAULT: '#F0EDE6',
          muted: '#8A8580',
          faint: '#4A4642',
        },
        border: {
          DEFAULT: '#1E1E1E',
          gold: 'rgba(201, 168, 76, 0.2)',
        },
        success: '#4A7A5A',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Hanken Grotesk"', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '2px',
        sm: '2px',
        md: '2px',
        lg: '2px',
        xl: '2px',
        '2xl': '2px',
        '3xl': '2px',
        full: '9999px',
      },
    },
  },
  plugins: [],
}

export default config
