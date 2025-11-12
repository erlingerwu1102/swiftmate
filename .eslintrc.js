module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    '@vue/typescript/recommended',
  ],
  rules: {
    'no-unused-vars': 'error',
    'no-console': 'warn',
  },
}