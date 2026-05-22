import { colors } from './colors';

export type GradientStops = readonly [string, string, ...string[]];

export const gradients = {
  bg: [colors.ink, colors.ink2, colors.ink] as GradientStops,
  bgRich: [colors.ink, '#1a0b3d', '#0a0612'] as GradientStops,

  primary: [colors.violetDeep, colors.violetBase, colors.cyanBase] as GradientStops,
  primarySoft: ['rgba(167, 139, 250, 0.35)', 'rgba(34, 211, 238, 0.25)'] as GradientStops,
  primaryReverse: [colors.cyanBase, colors.violetBase, colors.violetDeep] as GradientStops,

  card: ['rgba(167, 139, 250, 0.18)', 'rgba(34, 211, 238, 0.08)'] as GradientStops,
  cardSubtle: ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)'] as GradientStops,
  cardDark: ['rgba(20, 11, 38, 0.85)', 'rgba(10, 6, 18, 0.95)'] as GradientStops,

  mint: [colors.mintDeep, colors.mint] as GradientStops,
  mintSoft: ['rgba(46, 204, 139, 0.20)', 'rgba(46, 204, 139, 0.05)'] as GradientStops,

  accent: [colors.accent, colors.accentGlow] as GradientStops,
  accentSoft: ['rgba(255, 91, 46, 0.20)', 'rgba(255, 138, 61, 0.05)'] as GradientStops,

  danger: ['#7f1d1d', '#f87171'] as GradientStops,
} satisfies Record<string, GradientStops>;

const avatarPalette: readonly GradientStops[] = [
  ['#6d28d9', '#22d3ee'],
  ['#ff5b2e', '#ff8a3d'],
  ['#0f5132', '#2ecc8b'],
  ['#a78bfa', '#6d28d9'],
  ['#3b1d6e', '#22d3ee'],
  ['#1d4ed8', '#22d3ee'],
  ['#be185d', '#a78bfa'],
];

export const avatarGradientFor = (seed: string): GradientStops => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % avatarPalette.length;
  return avatarPalette[idx]!;
};
