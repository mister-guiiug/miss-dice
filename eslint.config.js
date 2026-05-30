import baseConfig from '@mister-guiiug/dev-wpa-config/eslint-react';

export default [
  {
    ignores: [
      'dist/**',
      'dev-dist/**',
      'coverage/**',
      'e2e/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  ...baseConfig,
];
