export const colors = {
  mist: '#D7E4EE',
  mistDeep: '#A8C0D4',
  slate: '#4A5F73',
  ink: '#1B2A3A',
  paper: '#F7F3EC',
  paperWarm: '#EFE8DC',
  orange: '#E36A2A',
  orangeSoft: '#F0A57A',
  correct: '#2F6B4F',
  wrong: '#A33B3B',
  white: '#FFFFFF',
  overlay: 'rgba(27, 42, 58, 0.45)',
  tabInactive: '#7A8FA3',
} as const;

export type ColorName = keyof typeof colors;
