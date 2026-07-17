import type { Config } from 'tailwindcss'

// Design system: green = health/primary, amber = appetite/accent,
// teal = money/budget, warm stone neutrals — never clinical gray.
export default <Partial<Config>>{
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          900: '#14532D',
        },
        accent: {
          100: '#FEF3C7',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        money: {
          100: '#CCFBF1',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
        },
        danger: '#F43F5E',
        violet: { 400: '#A78BFA', 500: '#8B5CF6' },
        surface: {
          DEFAULT: '#FFFFFF',
          bg: '#FAF7F2',
          'bg-dark': '#131110',
          dark: '#1E1B18',
          'dark-2': '#282420',
        },
        ink: {
          DEFAULT: '#1C1917',
          muted: '#78716C',
          faint: '#A8A29E',
          inverse: '#F2EDE5',
          'inverse-muted': '#A8A099',
        },
        line: {
          DEFAULT: '#EAE4DA',
          dark: '#332E29',
        },
        slot: {
          breakfast: '#F59E0B',
          'morning-snack': '#F97316',
          lunch: '#16A34A',
          'evening-snack': '#0D9488',
          dinner: '#6366F1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        sheet: '24px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(28,25,23,.05), 0 4px 16px rgba(28,25,23,.05)',
        lift: '0 4px 12px rgba(28,25,23,.08), 0 12px 32px rgba(28,25,23,.10)',
        sheet: '0 -8px 40px rgba(28,25,23,.18)',
        'card-dark': '0 1px 2px rgba(0,0,0,.4), 0 4px 16px rgba(0,0,0,.3)',
      },
      keyframes: {
        'slide-up': {
          from: { transform: 'translateY(24px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'ring-grow': { from: { 'stroke-dasharray': '0 999' } },
      },
      animation: {
        'slide-up': 'slide-up .28s cubic-bezier(.16,1,.3,1) both',
        'fade-in': 'fade-in .2s ease both',
      },
    },
  },
}
