export const colors = {
  // Branding 
  primary: '#003B7A',       // Deep blue
  primaryLight: '#0055B3',  // Lighter blue for interactive elements
  primaryGlow: '#1A7AFF',   // Bright accent for charts/highlights

  // Backgrounds
  bgDeep: '#070D1A',        // Deepest background
  bgCard: '#0F1B2D',        // Card surfaces
  bgElevated: '#162236',    // Elevated cards/modals
  bgBorder: '#1E2E45',      // Subtle borders

  // Semantic colors
  gain: '#00C896',          // Green for positive returns
  gainSubtle: '#00C89620',  // Transparent green for backgrounds
  loss: '#FF4D6A',          // Red for negative returns
  lossSubtle: '#FF4D6A20',  // Transparent red for backgrounds
  warning: '#FFB347',       // Amber for warnings
  gold: '#FFD700',          // Gold for premium features

  // Text hierarchy
  textPrimary: '#F0F4FF',   // Main text — slightly blue-white
  textSecondary: '#7A93B8', // Secondary text
  textMuted: '#3D5470',     // Muted/disabled text

  // Chart colors (distinct, accessible)
  chart1: '#1A7AFF',
  chart2: '#00C896',
  chart3: '#FFB347',
  chart4: '#FF4D6A',
  chart5: '#9B5EFF',
  chart6: '#00D4FF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  // Font sizes
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 42,
  },
  // Font weights (React Native uses string values)
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
};

export const shadows = {
  card: {
    shadowColor: '#1A7AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  glow: {
    shadowColor: '#00C896',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
};