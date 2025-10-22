module.exports = {
  preset: 'react-native',
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest.globals.js'], // setupFiles は最初に実行（環境の土台）
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // その後に拡張
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo(nent)?|@expo(nent)?/.*|@expo/vector-icons|react-navigation|@react-navigation/.*)/)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/notif-first-news/'],
};
