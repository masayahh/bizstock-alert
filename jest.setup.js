/**
 * Minimal Jest setup for this repo.
 * Some RN libs are optional here; guard them with try/catch.
 */
try { require('react-native-gesture-handler/jestSetup'); } catch (e) { /* optional */ }
try { jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock')); } catch (e) { /* optional */ }
