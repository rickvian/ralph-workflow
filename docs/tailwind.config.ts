import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#b39aff',
          'purple-light': '#c9b8ff',
          bg: '#16171d',
        },
      },
    },
  },
  plugins: [],
}

export default config
