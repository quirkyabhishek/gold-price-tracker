/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#FFD700',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
      },
      animation: {
        'pulse-gold': 'pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 215, 0, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(255, 215, 0, 0)' },
        },
      },
    },
  },
  plugins: [],
};
