import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx,jsx,js}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"JetBrains Mono"', 'monospace'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      maxWidth: {
        '8xl': '96rem',
        '9xl': '108rem',
        'content': '120rem',
      },
    },
  },
  plugins: [],
} satisfies Config
