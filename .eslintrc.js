module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'universe/native',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {},
};
