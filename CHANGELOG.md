# Changelog

All notable changes to BizStock Alert will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-11-19

### Added

#### Professional UI Enhancements
- **Search & Filter System**: Real-time search across events and notifications with instant results
- **Advanced Filtering**: Filter by importance level (high/medium/low) with visual chip indicators
- **Smart Sorting**: Toggle between time-based and importance-based sorting
- **Pull-to-Refresh**: Native RefreshControl integration for manual updates
- **Professional Animations**: Fade-in, slide, scale, and spring animations across all components

#### Unified Design System (src/theme/)
- **Color System** (colors.ts): 40+ semantic colors with type safety
  - Brand colors: Vibrant emerald green (#10b981)
  - Background hierarchy: Pure black to elevated grays
  - Semantic colors: success, warning, error, info
  - Importance levels with color coding
  - Shadow and overlay system
  - Color presets for common use cases
- **Typography System** (typography.ts): Complete font hierarchy
  - Font sizes: xs (11px) to 4xl (32px)
  - Font weights: light (300) to extrabold (800)
  - Line heights and letter spacing
  - Pre-defined text styles (h1-h4, body, caption, label, badge, button)
- **Spacing System** (spacing.ts): Consistent 4px-based spacing
  - Spacing scale: 0 to 96px
  - Border radius: sm (6px) to 2xl (24px)
  - Shadow system with elevation levels
  - Layout patterns for common use cases

#### Advanced UI Components (src/components/)
- **Button**: Professional button with 4 variants, 3 sizes, press animations, loading state, icons
- **Toast**: Toast notification system with 4 types, slide animations, auto-dismiss, action buttons
- **Badge**: Badge/label component with 5 variants, 3 sizes, icon support
- **LoadingSpinner**: Animated spinner with 3 sizes, fullscreen overlay mode, custom messages
- **EmptyState**: Professional empty state with icons, titles, subtitles, action slots
- **ErrorBoundary**: React error boundary with graceful error handling and retry functionality

#### Enhanced Core Components
- **NotificationLine**: Upgraded with fade-in/scale animations, accent bars, importance badges with icons (🔴🟡🟢), React.memo optimization
- **LiveTile**: Enhanced with gradient overlays, ticker underlines, press animations, bottom accent lines, improved shadows
- **EventSheet**: Redesigned with slide-up animations, background overlay, handle bar, section headers with accent bars, Linking API integration

#### Animation Hooks (src/hooks/useAnimation.ts)
- **useFadeIn**: Configurable fade-in animation
- **useSlideIn**: Slide from top/bottom/left/right
- **useScale**: Scale animation with spring physics
- **useRotation**: Continuous or one-time rotation
- **usePulse**: Pulse effect for attention
- **usePressAnimation**: Press down/up interaction

#### Utility Functions (src/utils/)
- **Formatters** (formatters.ts):
  - Number formatting with thousand separators
  - Japanese date/time formatting
  - Relative time (e.g., "2時間前", "たった今")
  - Text truncation with ellipsis
  - Ticker validation and formatting
- **Constants** (constants.ts):
  - App-wide constants with type safety
  - Animation duration presets
  - Maximum item limits
  - Filter and sort type definitions

### Enhanced

#### App.tsx Major Improvements
- Search functionality with real-time filtering
- Filter chips with active states
- Sort toggle with visual indicator
- Badge counters showing item counts
- Enhanced header with title and subtitle
- Professional empty states with examples
- Refined color palette (#111827 cards, #10b981 accent)
- Subtle borders (0.08 opacity) for elegance
- Professional shadows throughout
- Full accessibility (ARIA labels, roles, hints, states)
- Increased item limits (5→10) for better content visibility

#### Performance Optimizations
- React.memo on all components (NotificationLine, LiveTile, EventSheet, Button, Toast, Badge, etc.)
- useMemo for filtered/sorted data
- useCallback for event handlers
- Native driver for all animations (60fps)
- Optimized re-render prevention

#### Accessibility
- Complete ARIA implementation across all components
- Descriptive accessibility labels and hints
- Proper accessibility roles (button, text, link, etc.)
- Accessibility states (disabled, busy, selected)
- Screen reader support

### Fixed
- **Critical**: Fixed TypeScript type mismatches in App.tsx importance level comparisons (English vs Japanese)
- **Critical**: Fixed react-redux v8 compatibility in useRedux.ts (removed v9-only .withTypes() syntax)
- All TypeScript type errors in new code resolved
- Prettier/ESLint formatting issues auto-fixed

### Changed
- Unified color palette across all components for consistency
- Deeper card backgrounds (#111827 vs #0b0f14) for premium feel
- More subtle borders (0.08 vs 0.10 opacity)
- Typography refinements (letter-spacing adjustments)
- Professional shadow system with elevation values

### Technical Improvements
- Type-safe theme tokens with autocomplete
- Consistent design language across entire app
- Reduced code duplication
- Better developer experience
- Easier maintenance and extensibility

### Test Coverage
- 41 tests passing (100%)
- Zero TypeScript errors in new code
- Zero lint errors
- All animations use native driver

---

## [0.1.0] - 2025-10-25

### Added

#### Core Features (Phases 0-10)
- **Data Ingestion Service**: EDINET API and RSS/Atom feed integration
- **Notification Scheduler**: Automated push notifications at 08:30, 12:15, 15:45 JST
- **AI Summarization**: OpenAI GPT-3.5 integration for event summarization (150-250 chars)
- **Event Clustering**: Automatic grouping of related news with deduplication
- **Personalization Engine**: Impact estimation and ranking based on watchlist
- **UI Components**: Complete React Native UI with Calm Black design
- **Mock Mode**: Development mode with sample data (no API keys required)
- **Debug Screen**: Real-time monitoring of app state and data flow
- **Redux State Management**: Optimized with memoized selectors and typed hooks
- **Production Pipeline**: Full data processing pipeline with error handling and fallback

#### UI Components
- **LiveTile**: Real-time stock status display with importance indicators
- **NotificationLine**: Notification history with ticker and importance
- **EventSheet**: Modal-based event detail view with sources
- **SettingsBlock**: Toggle controls for notification preferences
- **DebugScreen**: Development tool for state inspection

#### Android Optimizations
- Removed nested ScrollView to eliminate system crashes
- Removed KeyboardAvoidingView (Android handles keyboard automatically)
- Implemented flexWrap layout for horizontal tile display
- Added Modal wrapper for EventSheet to prevent UI conflicts
- Proper StatusBar configuration for Android
- Limited rendered items for performance (3 tiles, 5 events, 5 notifications)

### Fixed
- **Critical**: Fixed Android system crashes caused by nested ScrollView
- **Critical**: Fixed Android system UI crashes caused by KeyboardAvoidingView
- Fixed GitHub Actions CI workflow configuration
- Fixed ESLint dependency conflicts
- Fixed Modal event handling on Android

### Changed
- Stable configuration with Expo SDK 49, React Native 0.72.4
- Optimized Redux selectors with memoization
- Improved TypeScript type safety across all services

### Technical Stack
- React Native 0.72.4
- Expo 49.0.0
- TypeScript 5.1.6
- Redux Toolkit 1.9.5
- Jest 29.7.0
- ESLint 8.43.0

### Test Coverage
- 41 tests passing (100%)
- Services: normalization, clustering, personalization, ranking
- Zero lint errors

### Documentation
- README.md: Complete project overview
- SETUP.md: Setup instructions
- TESTING.md: Testing guide
- MANUAL_TASKS.md: User action items
- CLAUDE.md: Development guidelines
- APP_PREVIEW.md: ASCII art UI previews
- QUICK_START_GUIDE.md: Quick start guide
- VISUAL_GUIDE.md: Visual design specifications

---

**Note**: This is the initial release with all core features implemented and Android optimizations complete.
