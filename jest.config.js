module.exports = {
  preset: 'jest-expo',
  transform: {
    '^.+\\.tsx?$': 'babel-jest',
  },
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  testMatch: ['**/?(*.)+(spec|test).ts?(x)'],
};