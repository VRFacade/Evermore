export type ThemeColors = {
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
  accentMuted: string;
  danger: string;
  success: string;
  tile: string;
  tileIcon: string;
  comingSoon: string;
  overlay: string;
};

export const lightColors: ThemeColors = {
  background: '#F4F1EA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFDF8',
  text: '#1C1917',
  textSecondary: '#78716C',
  border: '#E7E5E4',
  accent: '#0F766E',
  accentMuted: '#CCFBF1',
  danger: '#DC2626',
  success: '#16A34A',
  tile: '#FFFFFF',
  tileIcon: '#0F766E',
  comingSoon: '#A8A29E',
  overlay: 'rgba(28, 25, 23, 0.45)',
};

export const darkColors: ThemeColors = {
  background: '#0C0A09',
  surface: '#1C1917',
  surfaceElevated: '#292524',
  text: '#FAFAF9',
  textSecondary: '#A8A29E',
  border: '#44403C',
  accent: '#2DD4BF',
  accentMuted: '#134E4A',
  danger: '#F87171',
  success: '#4ADE80',
  tile: '#1C1917',
  tileIcon: '#2DD4BF',
  comingSoon: '#78716C',
  overlay: 'rgba(0, 0, 0, 0.55)',
};
