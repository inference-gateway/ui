import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

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
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  ...compat.extends('prettier'),
];

export default eslintConfig;
