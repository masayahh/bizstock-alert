/**
 * Unified spacing system for BizStock Alert
 * Provides consistent spacing, padding, and margin values
 * Based on 4px base unit for scalability
 */

const BASE_UNIT = 4;

export const spacing = {
  // Base spacing scale (4px increments)
  0: 0,
  1: BASE_UNIT * 1, // 4px
  2: BASE_UNIT * 2, // 8px
  3: BASE_UNIT * 3, // 12px
  4: BASE_UNIT * 4, // 16px
  5: BASE_UNIT * 5, // 20px
  6: BASE_UNIT * 6, // 24px
  8: BASE_UNIT * 8, // 32px
  10: BASE_UNIT * 10, // 40px
  12: BASE_UNIT * 12, // 48px
  16: BASE_UNIT * 16, // 64px
  20: BASE_UNIT * 20, // 80px
  24: BASE_UNIT * 24, // 96px
} as const;

/**
 * Border radius values for consistent rounded corners
 */
export const borderRadius = {
  none: 0,
  sm: 6,
  base: 8,
  md: 12,
  lg: 16,
  xl: 18,
  '2xl': 24,
  full: 9999,
} as const;

/**
 * Shadow presets for elevation
 */
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  xl: {
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  '2xl': {
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
} as const;

/**
 * Common spacing patterns for layouts
 */
export const layout = {
  // Container padding
  containerPadding: spacing[4], // 16px
  containerPaddingLarge: spacing[5], // 20px

  // Section spacing
  sectionGap: spacing[6], // 24px
  sectionGapLarge: spacing[8], // 32px

  // Card spacing
  cardPadding: spacing[3], // 12px
  cardPaddingLarge: spacing[4], // 16px
  cardGap: spacing[2], // 8px
  cardGapLarge: spacing[3], // 12px

  // Button spacing
  buttonPadding: spacing[3], // 12px
  buttonPaddingLarge: spacing[4], // 16px
  buttonGap: spacing[2], // 8px

  // Input spacing
  inputPadding: spacing[3], // 12px
  inputPaddingLarge: spacing[4], // 16px

  // List item spacing
  listItemPadding: spacing[3], // 12px
  listItemGap: spacing[2], // 8px
} as const;
