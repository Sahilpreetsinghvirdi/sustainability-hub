export const themeLight = {
  bg: '#FFFFFF',
  card: '#F9FAFA',
  cardElevated: '#FFFFFF',
  border: '#E5E5E5',
  text: '#0A0A0A',
  textMuted: '#6B7280',
  primary: '#0A0A0A',
} as const;
export const themeDark = {
  bg: '#0A0A0A',
  card: '#1C1C1E',
  cardElevated: '#242426',
  border: '#2D2D2F',
  text: '#F8FAFC',
  textMuted: '#9CA3AF',
  primary: '#FFFFFF',
} as const;

export const colors = {
  primary: {
    50: '#F5F5F5',
    100: '#EAEAEA',
    200: '#DADADA',
    300: '#9A9A9A',
    400: '#444444',
    500: '#0A0A0A',
    600: '#000000',
    700: '#000000',
    800: '#1C1C1C',
    900: '#0A0A0A',
  },
  secondary: {
    50: '#FAFAF9',
    100: '#F5F5F4',
    200: '#E4E4E2',
    300: '#BDBDBB',
    400: '#6B6B6B',
    500: '#3F3F46',
    600: '#2D2D31',
    700: '#242424',
    800: '#1C1C1C',
    900: '#0A0A0A',
  },
  success: '#1C1C1C',
  warning: '#6B6B6B',
  error: '#262626',
  info: '#444444',
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EAEAEA',
    300: '#DADADA',
    400: '#BDBDBD',
    500: '#9A9A9A',
    600: '#6B6B6B',
    700: '#444444',
    800: '#2D2D2D',
    900: '#1C1C1C',
    950: '#0A0A0A',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#FAFAF9',
    tertiary: '#F5F5F4',
    card: '#FFFFFF',
    elevated: '#FFFFFF',
  },
  text: {
    primary: '#0A0A0A',
    secondary: '#1C1C1C',
    tertiary: '#6B6B6B',
    inverse: '#FFFFFF',
    link: '#0A0A0A',
    error: '#262626',
    success: '#1C1C1C',
  },
  border: {
    light: '#DADADA',
    medium: '#9A9A9A',
    dark: '#6B6B6B',
    focus: '#0A0A0A',
  },
  carbon: {
    meat_beef: '#1C1C1C',
    meat_pork: '#2D2D2D',
    meat_poultry: '#444444',
    meat_lamb: '#0A0A0A',
    seafood: '#6B6B6B',
    dairy_milk: '#808080',
    dairy_cheese: '#9A9A9A',
    eggs: '#BDBDBD',
    produce_fruit: '#3F3F46',
    produce_vegetable: '#444444',
    grains_bread: '#6B6B6B',
    grains_pasta: '#808080',
    grains_rice: '#9A9A9A',
    beverages_alcoholic: '#2D2D2D',
    beverages_nonalcoholic: '#6B6B6B',
    transport_fuel: '#444444',
    other: '#9A9A9A',
  },
  meal: {
    breakfast: '#6B6B6B',
    lunch: '#2D2D2D',
    dinner: '#444444',
    snack: '#9A9A9A',
  },
  status: {
    pending: '#6B6B6B',
    processing: '#444444',
    completed: '#1C1C1C',
    failed: '#262626',
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
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
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
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 26,
    elevation: 14,
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
