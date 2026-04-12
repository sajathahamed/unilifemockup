import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
        primaryDark: '#4338ca',
        primaryLight: '#818cf8',
        secondary: '#6366f1',
        background: '#0a0a0f',
        card: '#12121a',
        'text-primary': '#f8fafc',
        'text-secondary': '#94a3b8',
        'text-muted': '#64748b',
        danger: '#EF4444',
        glass: 'rgba(255, 255, 255, 0.05)',
        glassBorder: 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
      },
      boxShadow: {
        'card': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'glow': '0 0 40px rgba(79, 70, 229, 0.3)',
        'glow-lg': '0 0 60px rgba(79, 70, 229, 0.4)',
      },
      backgroundImage: {
        'gradient-primary':
          'linear-gradient(135deg, #4338ca 0%, #6366f1 42%, #4f46e5 100%)',
      },
    },
  },
  plugins: [],
}

export default config