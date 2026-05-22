export const colors = {
  ink: '#0a0612',
  ink2: '#140b26',
  ink3: '#1d1133',

  violetDeep: '#3b1d6e',
  violetBase: '#6d28d9',
  violetGlow: '#a78bfa',

  cyanBase: '#22d3ee',
  cyanGlow: '#67e8f9',

  mint: '#2ecc8b',
  mintDeep: '#0f5132',
  accent: '#ff5b2e',
  accentGlow: '#ff8a3d',

  white: '#ffffff',
  muted: '#8b7fa8',
  textDim: 'rgba(255, 255, 255, 0.55)',
  textFaint: 'rgba(255, 255, 255, 0.35)',

  glass: 'rgba(255, 255, 255, 0.06)',
  glassStrong: 'rgba(255, 255, 255, 0.10)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',

  danger: '#f87171',
  success: '#2ecc8b',
  warning: '#fbbf24',
} as const;

export type ColorToken = keyof typeof colors;
