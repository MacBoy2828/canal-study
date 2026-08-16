export { colors } from './colors';
export { fonts } from './typography';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  card: 28,
  sheet: 28,
} as const;

export const shadows = {
  soft: {
    shadowColor: '#1C1814',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  lift: {
    shadowColor: '#1C1814',
    shadowOpacity: 0.1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  float: {
    shadowColor: '#1C1814',
    shadowOpacity: 0.14,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
} as const;

export const motion = {
  snappy: 140,
  normal: 200,
  lush: 280,
} as const;
