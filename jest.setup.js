require('react-native-gesture-handler/jestSetup');

// JSDOM向けの最低限のブラウザ風グローバル
global.self = global;
if (typeof window === 'undefined') global.window = global;
if (typeof navigator === 'undefined') global.navigator = { userAgent: 'node' };
