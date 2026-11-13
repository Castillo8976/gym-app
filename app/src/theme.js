export const colors = {
  background: '#0B0B10',
  surface: 'rgba(255,255,255,0.05)',
  surfaceStrong: 'rgba(255,255,255,0.08)',
  surfacePressed: 'rgba(255,255,255,0.12)',
  border: 'rgba(255,255,255,0.10)',
  borderSubtle: 'rgba(255,255,255,0.14)',
  text: '#FFFFFF',
  textMuted: '#9A9CA8',
  textChip: '#C9CBD6',
  accent: '#7C83F5',
  accentLight: '#AEB3FF',
  accentViolet: '#9EA4FF',
  heroStart: '#3B3F7A',
  heroEnd: '#262A55',
  prBackground: '#DDE0FF',
  prText: '#0B0B10',
  ascending: '#8FBF9F',
  descending: '#D49A6A',
  danger: '#E58B8B',
  ranks: {
    bronce: '#C28A5E',
    plata: '#AEB6C4',
    oro: '#D1B15C',
    platino: '#7FB8B0',
    diamante: '#8DB5E0',
  },
};

export const fonts = {
  heading: 'SpaceGrotesk_700Bold',
  headingMedium: 'SpaceGrotesk_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_600SemiBold',
};

export const typography = {
  base: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  heading: {
    fontFamily: fonts.heading,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.56,
  },
  hero: {
    fontFamily: fonts.heading,
    fontSize: 38,
    lineHeight: 44,
    letterSpacing: -0.76,
  },
  eyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.32,
    textTransform: 'uppercase',
  },
  muted: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
  },
  button: {
    fontFamily: fonts.heading,
    fontSize: 16,
    lineHeight: 20,
  },
};

export const spacing = {
  screenHorizontal: 18,
  screenTop: 22,
  section: 14,
  card: 16,
  hero: 20,
};

export const radii = {
  card: 22,
  hero: 26,
  button: 16,
  control: 12,
  pill: 99,
};

export const sizes = {
  minTouchTarget: 44,
  bottomBar: 78,
  icon: 22,
  progress: 8,
};

export const theme = {
  colors,
  fonts,
  typography,
  spacing,
  radii,
  sizes,
};

export default theme;
