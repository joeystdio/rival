import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        surface: '#18181b',
        'surface-hover': '#27272a',
        border: '#27272a',
        'border-light': '#3f3f46',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'accent-gradient': 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
      },
    },
  },
  plugins: [],
}
export default config
