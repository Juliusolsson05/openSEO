export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

/** Scene durations in seconds */
export const DURATIONS = {
  intro: 15,
  login: 16,
  titleGeneration: 28,
  blogPost: 20,
  outro: 8,
} as const;

export const TOTAL_DURATION = Object.values(DURATIONS).reduce((a, b) => a + b, 0);

/** Frames helper */
export const sec = (s: number) => Math.round(s * FPS);

/** Synced with src/app/globals.css */
export const COLORS = {
  background: '#F2F2F2',
  foreground: '#1A1A1A',
  card: '#FFFFFF',
  cardForeground: '#1A1A1A',
  popover: '#FFFFFF',
  popoverForeground: '#1A1A1A',
  primary: '#0078D4',
  primaryForeground: '#FFFFFF',
  primaryHover: '#106EBE',
  primaryLight: '#DEECF9',
  secondary: '#F5F5F5',
  secondaryForeground: '#323130',
  muted: '#F5F5F5',
  mutedForeground: '#616161',
  accent: '#F0F6FF',
  accentForeground: '#0078D4',
  destructive: '#D13438',
  destructiveForeground: '#FFFFFF',
  border: '#E1E1E1',
  input: '#E1E1E1',
  ring: '#0078D4',
  success: '#107C10',
  successLight: '#DFF6DD',
  warning: '#FFB900',
  warningForeground: '#835C00',
  warningLight: '#FFF4CE',
  info: '#0078D4',
  infoLight: '#DEECF9',
  sidebar: '#1B1B1F',
  sidebarForeground: '#D2D2D2',
  sidebarMuted: '#2D2D30',
  sidebarAccent: '#0078D4',
  sidebarBorder: '#3E3E42',
  sidebarHover: '#37373D',
  bg: '#F2F2F2',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#616161',
} as const;
