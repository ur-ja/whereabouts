export const PREDEFINED_TAGS = [
  'Family & relationships',
  'Career & opportunities',
  'Cost of living',
  'Belonging',
  'Weather & lifestyle',
  'Friends',
  'Feeling at home',
  'Pace of life',
  'Loneliness',
  'Food & comfort',
  'Freedom',
  'Uncertainty',
] as const;

export type PredefinedTag = (typeof PREDEFINED_TAGS)[number];
