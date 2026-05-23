// Bright turquoise/white fintech palette.
// Token NAMES are kept stable (violet*, cyan*, ink*, glass*) so existing
// references keep working, but their VALUES now map to the light theme:
//   - "ink*"   → dark text colors (formerly dark backgrounds)
//   - "violet*"→ turquoise brand shades (formerly purple accents)
//   - "glass*" → white card surfaces + light borders
export const colors = {
  // Text (formerly dark backgrounds)
  ink: '#0F172A', // text primary
  ink2: '#1E293B',
  ink3: '#334155',

  // Brand turquoise (formerly violet/purple)
  violetDeep: '#0EA5B7',
  violetBase: '#14D8E6',
  violetGlow: '#0EA5B7', // deeper turquoise — readable for icons/links/indicators on white

  // Secondary cyan
  cyanBase: '#14D8E6',
  cyanGlow: '#2ECFEA',

  // Success green
  mint: '#10B981',
  mintDeep: '#047857',

  // Attention / destructive (formerly orange → red, for "rejected"/danger)
  accent: '#EF4444',
  accentGlow: '#F87171',

  white: '#ffffff',
  muted: '#475569', // text secondary
  textDim: '#475569',
  textFaint: '#94A3B8',

  // Card surfaces + borders (formerly translucent glass on dark)
  glass: '#FFFFFF',
  glassStrong: '#FFFFFF',
  glassBorder: '#DDF4F8',

  // Bright background anchors
  sky: '#EAFBFF',
  skyDeep: '#7EEAF3',
  rowHover: '#F4FDFF',
  pageBg: '#EAFBFF',

  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
} as const;

export type ColorToken = keyof typeof colors;
