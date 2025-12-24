import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// StationScout Brand Colors
const brandColors = {
  primary: '#6366F1', // Indigo - for primary actions and branding
  primaryDark: '#4F46E5',
  secondary: '#EC4899', // Pink - for accents and highlights
  success: '#10B981', // Green - for success states
  warning: '#F59E0B', // Amber - for warnings
  error: '#EF4444', // Red - for errors
  info: '#3B82F6', // Blue - for information
};

// Light Theme
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: brandColors.primary,
    primaryContainer: '#E0E7FF',
    secondary: brandColors.secondary,
    secondaryContainer: '#FCE7F3',
    tertiary: '#8B5CF6',
    error: brandColors.error,
    success: brandColors.success,
    background: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceVariant: '#F3F4F6',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#111827',
    onSurface: '#111827',
    outline: '#D1D5DB',
  },
  roundness: 12, // Rounded corners for modern look
};

// Dark Theme
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#818CF8',
    primaryContainer: '#4338CA',
    secondary: '#F472B6',
    secondaryContainer: '#BE185D',
    tertiary: '#A78BFA',
    error: brandColors.error,
    success: brandColors.success,
    background: '#111827',
    surface: '#1F2937',
    surfaceVariant: '#374151',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#F9FAFB',
    onSurface: '#F9FAFB',
    outline: '#4B5563',
  },
  roundness: 12,
};

// Typography configuration
export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Spacing configuration
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

// Export theme type for TypeScript
export type AppTheme = typeof lightTheme;


const theme = {
  light: lightTheme,
  dark: darkTheme,
  spacing,
};

export default theme;