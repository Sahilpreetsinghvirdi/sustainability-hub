// mobile/src/constants/theme.ts
export const colors = {
  // Primary palette
  primary: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E', // Main green
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },

  // Secondary - ocean blue
  secondary: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
  },

  // Semantic colors
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Neutral
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0A0A0A',
  },

  // Dark theme base
  background: {
    primary: '#0A1628',
    secondary: '#111D3A',
    tertiary: '#1A2A4A',
    card: '#15233D',
    elevated: '#1E2D4D',
  },

  // Text
  text: {
    primary: '#F8FAFC',
    secondary: '#CBD5E1',
    tertiary: '#94A3B8',
    inverse: '#0F172A',
    link: '#38BDF8',
    error: '#F87171',
    success: '#4ADE80',
  },

  // Borders
  border: {
    light: '#1E2D4D',
    medium: '#2D3E5E',
    dark: '#3D4E6E',
    focus: '#22C55E',
  },

  // Carbon category colors
  carbon: {
    meat_beef: '#DC2626',
    meat_pork: '#EF4444',
    meat_poultry: '#F97316',
    meat_lamb: '#B91C1C',
    seafood: '#0EA5E9',
    dairy_milk: '#F59E0B',
    dairy_cheese: '#FBBF24',
    eggs: '#FDE047',
    produce_fruit: '#22C55E',
    produce_vegetable: '#16A34A',
    grains_bread: '#84CC16',
    grains_pasta: '#65A30D',
    grains_rice: '#4D7C0F',
    beverages_alcoholic: '#8B5CF6',
    beverages_nonalcoholic: '#06B6D4',
    transport_fuel: '#64748B',
    other: '#94A3B8',
  },

  // Meal type colors
  meal: {
    breakfast: '#F59E0B',
    lunch: '#EF4444',
    dinner: '#8B5CF6',
    snack: '#EC4899',
  },

  // Status colors
  status: {
    pending: '#F59E0B',
    processing: '#3B82F6',
    completed: '#22C55E',
    failed: '#EF4444',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    mono: 'Menlo',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 16,
  },
};

export const animation = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  easing: {
    easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    easeIn: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
    easeInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    spring: 'spring',
  },
};

export const breakpoints = {
  phone: 0,
  tablet: 768,
  desktop: 1024,
};

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modal: 400,
  popover: 500,
  tooltip: 600,
  toast: 700,
};

export type ThemeColors = typeof colors;
export type ThemeSpacing = typeof spacing;
export type ThemeTypography = typeof typography;