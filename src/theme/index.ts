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
  sm: 10,
  md: 16,
  lg: 22,
  card: 30,
  sheet: 28,
} as const;

export const shadows = {
  soft: {
    shadowColor: '#142433',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  lift: {
    shadowColor: '#142433',
    shadowOpacity: 0.14,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
  float: {
    shadowColor: '#142433',
    shadowOpacity: 0.2,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 18 },
    elevation: 12,
  },
} as const;

export const motion = {
  snappy: 180,
  normal: 280,
  lush: 420,
} as const;
