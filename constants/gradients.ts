import { colors } from './colors';

export type GradientStops = readonly [string, string, ...string[]];

export const gradients = {
  // Bright, airy turquoise → sky page backgrounds.
  bg: ['#14D8E6', '#7EEAF3', '#EAFBFF'] as GradientStops,
  bgRich: ['#14D8E6', '#5FE3EF', '#EAFBFF'] as GradientStops,

  // Turquoise-filled primary action.
  primary: ['#14D8E6', '#2ECFEA'] as GradientStops,
  primarySoft: ['rgba(20, 216, 230, 0.18)', 'rgba(46, 207, 234, 0.08)'] as GradientStops,
  primaryReverse: ['#2ECFEA', '#14D8E6'] as GradientStops,

  // Card overlays — kept extremely subtle so white cards stay white.
  card: ['rgba(20, 216, 230, 0.06)', 'rgba(46, 207, 234, 0.02)'] as GradientStops,
  cardSubtle: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.75)'] as GradientStops,
  cardDark: ['#FFFFFF', '#F7FEFF'] as GradientStops,

  mint: ['#10B981', '#34D399'] as GradientStops,
  mintSoft: ['rgba(16, 185, 129, 0.16)', 'rgba(16, 185, 129, 0.04)'] as GradientStops,

  accent: ['#EF4444', '#F87171'] as GradientStops,
  accentSoft: ['rgba(239, 68, 68, 0.14)', 'rgba(248, 113, 113, 0.04)'] as GradientStops,

  danger: ['#DC2626', '#F87171'] as GradientStops,
} satisfies Record<string, GradientStops>;

// Fresh turquoise/blue/green avatar gradients (no purple/pink).
const avatarPalette: readonly GradientStops[] = [
  ['#14D8E6', '#2ECFEA'],
  ['#0EA5B7', '#14D8E6'],
  ['#10B981', '#34D399'],
  ['#2ECFEA', '#7EEAF3'],
  ['#0891B2', '#22D3EE'],
  ['#0EA5B7', '#5FE3EF'],
  ['#0D9488', '#2DD4BF'],
];

export const avatarGradientFor = (seed: string): GradientStops => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % avatarPalette.length;
  return avatarPalette[idx]!;
};
