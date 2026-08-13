export const colors = {
  canvas: '#FAFAFA',
  surface: '#FFFFFF',
  ink: '#141315',
  muted: '#88838F',
  line: '#B5B0BA',
  primary: '#7C3AED',
  primarySoft: '#F1EDFE',
  primaryWash: '#F8F5FF',
  danger: '#FF4D55',
  warning: '#FFB800',
  mint: '#D0FFEC',
  mintCard: '#CBF6E5',
  blush: '#FFE0E0',
  rose: '#FFE3F2',
  cream: '#FFFBEb',
  sky: '#E3F6FF',
  aqua: '#CDE8E3',
  taupe: '#E7DDD8',
  orange: '#FF9138',
  disabled: '#ADA9B3',
  biometricIcon: '#D7D7D7',
  inputFill: '#F5F5F5',
  chatPanel: '#F2DAFF',
  reading: '#795132',
  lessonAccent: '#66CCFF',
  eventBorder: '#4CDEAA',
  questionToday: '#F6E3FF',
  churchTop: '#E5E2F7',
  churchBottom: '#F7EDFF',
  churchLine: '#C6B9E5',
  churchGlass: '#DCECF5',
  churchDetail: '#8E79BC',
  transparent: 'transparent',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  round: 999,
} as const;

export const typography = {
  caption: 11,
  small: 12,
  body: 14,
  label: 16,
  title: 21,
  hero: 28,
} as const;

export const shadows = {
  card: {
    shadowColor: '#2D203B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
} as const;
