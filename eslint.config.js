import baseConfig from '@mister-guiiug/dev-pwa-config/eslint-react';

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
