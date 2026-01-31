export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const COLORS = {
  // Primary
  primary: '#3B82F6', // blue-500
  primaryLight: '#60A5FA', // blue-400
  primaryDark: '#2563EB', // blue-600

  // Neutrals
  background: '#171717', // neutral-900
  surface: '#262626', // neutral-800
  surfaceLight: '#404040', // neutral-700
  text: '#FFFFFF',
  textSecondary: '#A3A3A3', // neutral-400
  textMuted: '#737373', // neutral-500
  border: '#404040', // neutral-700

  // Semantic
  success: '#22C55E', // green-500
  successLight: '#4ADE80', // green-400
  warning: '#F59E0B', // amber-500
  warningLight: '#FBBF24', // amber-400
  error: '#EF4444', // red-500
  errorLight: '#F87171', // red-400
  info: '#06B6D4', // cyan-500

  // Accents
  purple: '#A855F7',
  orange: '#F97316',
  pink: '#EC4899',
  teal: '#14B8A6',
  indigo: '#6366F1',
};

export const FONTS = {
  heading: 'System',
  body: 'System',
  mono: 'monospace',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};
