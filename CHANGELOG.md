# Changelog

All notable changes to BizStock Alert will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
