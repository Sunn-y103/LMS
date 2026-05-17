export const COLORS = {
  // Brand / Primary (Indigo)
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  primaryMuted: '#3730A3',

  // Dark theme backgrounds
  bgBase: '#0B0F1A',
  bgSurface: '#111827',
  bgElevated: '#1F2937',
  bgCard: '#1A2236',

  // Text
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0B0F1A',

  // Semantic
  success: '#22C55E',
  successLight: '#BBF7D0',
  warning: '#F59E0B',
  warningLight: '#FDE68A',
  error: '#EF4444',
  errorLight: '#FECACA',
  info: '#3B82F6',
  infoLight: '#BFDBFE',

  // Borders
  border: '#1E293B',
  borderLight: '#334155',

  // Overlay
  overlay: 'rgba(0,0,0,0.6)',
} as const;

export type ColorKey = keyof typeof COLORS;
