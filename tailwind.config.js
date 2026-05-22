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
        ink: '#0a0612',
        'ink-2': '#140b26',
        'ink-3': '#1d1133',
        violet: {
          deep: '#3b1d6e',
          base: '#6d28d9',
          glow: '#a78bfa',
        },
        cyan: {
          base: '#22d3ee',
          glow: '#67e8f9',
        },
        mint: '#2ecc8b',
        accent: '#ff5b2e',
        muted: '#8b7fa8',
        glass: 'rgba(255, 255, 255, 0.06)',
        'glass-strong': 'rgba(255, 255, 255, 0.10)',
        'glass-border': 'rgba(255, 255, 255, 0.12)',
      },
      fontFamily: {
        heebo: ['Heebo_400Regular'],
        'heebo-medium': ['Heebo_500Medium'],
        'heebo-bold': ['Heebo_700Bold'],
        'heebo-black': ['Heebo_900Black'],
      },
    },
  },
  plugins: [],
};
