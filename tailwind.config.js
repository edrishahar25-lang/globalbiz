/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Text colors (token names kept stable; values now dark-on-light)
        ink: '#0F172A',
        'ink-2': '#1E293B',
        'ink-3': '#334155',
        'ink-soft': '#475569',
        'ink-faint': '#94A3B8',

        // Brand turquoise (formerly violet/purple)
        violet: {
          deep: '#0EA5B7',
          base: '#14D8E6',
          glow: '#0EA5B7',
        },
        turquoise: '#14D8E6',
        cyan: {
          base: '#14D8E6',
          glow: '#2ECFEA',
        },
        sky: '#EAFBFF',
        'sky-deep': '#7EEAF3',
        'row-hover': '#F4FDFF',

        mint: '#10B981',
        accent: '#EF4444',
        muted: '#475569',

        // Card surfaces + borders (formerly translucent glass)
        glass: '#FFFFFF',
        'glass-strong': '#FFFFFF',
        'glass-border': '#DDF4F8',
      },
      fontFamily: {
        heebo: ['Heebo_400Regular'],
        'heebo-medium': ['Heebo_500Medium'],
        'heebo-bold': ['Heebo_700Bold'],
        'heebo-black': ['Heebo_900Black'],
      },
      boxShadow: {
        card: '0 8px 30px rgba(20,216,230,0.10)',
      },
    },
  },
  plugins: [],
};
