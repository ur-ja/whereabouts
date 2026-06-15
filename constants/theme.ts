export const colors = {
  background: '#F3F4F6',
  text: '#1A1A2E',
  textMuted: '#8B8FA3',
  accent: '#4A7FD7',
  india: '#1D9E75',
  australia: '#4A7FD7',
  neutral: '#8B8FA3',
  border: 'rgba(26, 26, 46, 0.08)',
  card: '#FFFFFF',
  indiaTint: 'rgba(29, 158, 117, 0.1)',
  australiaTint: 'rgba(74, 127, 215, 0.12)',
  neutralTint: 'rgba(139, 143, 163, 0.12)',
  statusIconBg: 'rgba(74, 127, 215, 0.15)',
  destructive: '#C94C4C',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 28,
};

export const typography = {
  body: 16,
  label: 11,
  title: 20,
  display: 24,
};

export const radius = {
  card: 16,
  pill: 20,
  button: 12,
};

export const shadow = {
  card: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
};

export const emptyPlaceholder = {
  fontSize: typography.body,
  color: colors.textMuted,
  fontStyle: 'italic' as const,
  lineHeight: 24,
};

export const NOTE_MAX_LENGTH = 1000;
