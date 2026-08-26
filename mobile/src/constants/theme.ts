export const colors = {
  primary: {
    50: '#EFFBF3',
    100: '#D9F5E2',
    200: '#B7EAC9',
    300: '#8AD9AA',
    400: '#68CC91',
    500: '#57C58A',
    600: '#43AD75',
    700: '#348A5D',
    800: '#286D4A',
    900: '#1C4A34',
  },
  secondary: {
    50: '#F0F8FA',
    100: '#D8EEF1',
    200: '#B2DDE3',
    300: '#82C6D0',
    400: '#68B4C1',
    500: '#5DA9C5',
    600: '#468EAB',
    700: '#35718C',
    800: '#285A71',
    900: '#1D4051',
  },
  success: '#57C58A',
  warning: '#F2B85B',
  error: '#E97966',
  info: '#72A8E5',
  neutral: {
    0: '#FFFFFF',
    50: '#F6FAF7',
    100: '#EAF2EC',
    200: '#D9E5DC',
    300: '#C6D7CA',
    400: '#9CB3A3',
    500: '#789183',
    600: '#5D7769',
    700: '#466052',
    800: '#304A3D',
    900: '#203A2E',
    950: '#11271D',
  },
  background: {
    primary: '#081A14',
    secondary: '#0E241A',
    tertiary: '#163427',
    card: '#112B20',
    elevated: '#193A2A',
  },
  text: {
    primary: '#F2F8F3',
    secondary: '#C4D8CB',
    tertiary: '#8EAA99',
    inverse: '#10251B',
    link: '#7AC1D7',
    error: '#F38A78',
    success: '#70D69A',
  },
  border: {
    light: '#234736',
    medium: '#355D48',
    dark: '#4A765C',
    focus: '#57C58A',
  },
  carbon: {
    meat_beef: '#E05A52',
    meat_pork: '#E97966',
    meat_poultry: '#F19B60',
    meat_lamb: '#D44D4D',
    seafood: '#5DA9C5',
    dairy_milk: '#E6AC58',
    dairy_cheese: '#F2C96B',
    eggs: '#F4DA79',
    produce_fruit: '#57C58A',
    produce_vegetable: '#43AD75',
    grains_bread: '#9FCA62',
    grains_pasta: '#83B84D',
    grains_rice: '#6E9F3D',
    beverages_alcoholic: '#9B7BD5',
    beverages_nonalcoholic: '#67C5C5',
    transport_fuel: '#789183',
    other: '#9CB3A3',
  },
  meal: {
    breakfast: '#F2B85B',
    lunch: '#E97966',
    dinner: '#9B7BD5',
    snack: '#D982B5',
  },
  status: {
    pending: '#F2B85B',
    processing: '#72A8E5',
    completed: '#57C58A',
    failed: '#E97966',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.32,
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