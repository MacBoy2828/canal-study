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
  sm: 6,
  md: 10,
  lg: 14,
  card: 16,
  sheet: 18,
} as const;

export const shadows = {
  soft: {
    shadowColor: '#0E1A22',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  lift: {
    shadowColor: '#0E1A22',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  float: {
    shadowColor: '#0E1A22',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
} as const;

export const motion = {
  snappy: 140,
  normal: 200,
  lush: 280,
} as const;
