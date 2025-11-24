import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier';

const eslintConfig = [
  {
    ignores: [
      // Build artifacts
      '.next/',
      'build/',
      'dist/',
      'out/',

      // Node modules
      'node_modules/',

      // Charts directory
      'charts/',

      // Examples directory
      'examples/',

      // Generated files
      '*.generated.*',
      '*.min.js',

      // Config files
      'next-env.d.ts',
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  eslintConfigPrettier,
];

export default eslintConfig;
