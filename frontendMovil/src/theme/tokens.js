import { Platform } from 'react-native';

export const colors = {
  primary: '#1f2937',
  secondary: '#4b5563',
  muted: '#9ca3af',
  background: '#f9fafb',
  surface: '#ffffff',
  border: '#e5e7eb',
  softBorder: '#f3f4f6',
  text: '#111827',
  inverseText: '#ffffff',
  success: '#16a34a',
  successSoft: '#dcfce7',
  warning: '#ca8a04',
  warningSoft: '#fef9c3',
  danger: '#dc2626',
  dangerSoft: '#fee2e2',
  info: '#2563eb',
  infoSoft: '#dbeafe',
  lilacSoft: '#f3e8ff',
  mintSoft: '#dcfce7',
};

export const typography = {
  family: Platform.select({
    web: 'Geist, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    default: undefined,
  }),
  sizes: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
};

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const shadows = {
  card: {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
};
