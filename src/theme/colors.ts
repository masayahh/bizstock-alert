/**
 * Unified color system for BizStock Alert
 * Provides consistent, professional color palette across all components
 * Follows the "Calm Black" theme with vibrant emerald green accents
 */

export const colors = {
  // Primary brand colors
  accent: '#10b981', // Vibrant emerald green - main accent
  accentLight: '#34d399', // Lighter emerald for highlights
  accentDark: '#059669', // Darker emerald for depth

  // Background colors
  background: '#000000', // Pure black background
  backgroundElevated: '#0a0f14', // Slightly elevated background
  backgroundCard: '#111827', // Card background (deeper, more premium)
  backgroundCardLight: '#1f2937', // Lighter card variant

  // Text colors
  text: '#ffffff', // Primary white text
  textSecondary: '#9ca3af', // Secondary gray text
  textTertiary: '#6b7280', // Tertiary gray text
  textMuted: '#4b5563', // Muted text for less important content

  // Border colors
  border: 'rgba(255,255,255,0.08)', // Subtle border
  borderLight: 'rgba(255,255,255,0.05)', // Even more subtle
  borderFocus: 'rgba(16, 185, 129, 0.3)', // Focused border with accent

  // Semantic colors
  success: '#10b981', // Success state (matches accent)
  warning: '#f59e0b', // Warning state (amber)
  error: '#ef4444', // Error state (red)
  errorBg: 'rgba(239, 68, 68, 0.1)', // Error background
  info: '#60a5fa', // Info state (blue)

  // Importance levels
  high: '#ef4444', // High importance (red)
  highDark: '#dc2626', // Darker red
  medium: '#f59e0b', // Medium importance (amber)
  mediumDark: '#d97706', // Darker amber
  low: '#10b981', // Low importance (green)
  lowDark: '#059669', // Darker green
  neutral: '#374151', // Neutral (dark gray)
  neutralDark: '#1f2937', // Darker neutral

  // Shadow and overlay colors
  shadow: 'rgba(0, 0, 0, 0.5)', // Standard shadow
  shadowLight: 'rgba(0, 0, 0, 0.3)', // Lighter shadow
  shadowDark: 'rgba(0, 0, 0, 0.7)', // Darker shadow
  overlay: 'rgba(0, 0, 0, 0.7)', // Modal overlay
  gradient: 'rgba(16, 185, 129, 0.05)', // Subtle gradient

  // Link colors
  link: '#60a5fa', // Link color (blue)
  linkHover: '#93c5fd', // Link hover state

  // Special colors
  disabled: '#374151', // Disabled state
  disabledText: '#6b7280', // Disabled text
} as const;

export type ColorName = keyof typeof colors;

/**
 * Get color value by name with type safety
 */
export const getColor = (name: ColorName): string => colors[name];

/**
 * Color presets for common use cases
 */
export const colorPresets = {
  card: {
    background: colors.backgroundCard,
    border: colors.border,
    shadow: colors.shadow,
  },
  cardElevated: {
    background: colors.backgroundCardLight,
    border: colors.border,
    shadow: colors.shadowDark,
  },
  button: {
    primary: {
      background: colors.accent,
      text: colors.text,
      shadow: colors.shadow,
    },
    secondary: {
      background: colors.backgroundCard,
      text: colors.text,
      border: colors.border,
    },
    danger: {
      background: colors.error,
      text: colors.text,
      shadow: colors.shadow,
    },
  },
  importance: {
    high: {
      color: colors.high,
      icon: '🔴',
      label: '強',
    },
    medium: {
      color: colors.medium,
      icon: '🟡',
      label: '中',
    },
    low: {
      color: colors.low,
      icon: '🟢',
      label: '弱',
    },
    neutral: {
      color: colors.neutral,
      icon: '⚪',
      label: '－',
    },
  },
} as const;
