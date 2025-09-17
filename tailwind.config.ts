import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx,jsx,js}'],
  theme: {
    extend: {
      maxWidth: {
        '8xl': '96rem',
        '9xl': '108rem',
        'content': '120rem',
      },
    },
  },
  plugins: [],
} satisfies Config
