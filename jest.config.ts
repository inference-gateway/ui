import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

const config: Config = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>'],
  modulePaths: ['<rootDir>'],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/jest-setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.jest.json',
      },
    ],
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(react-markdown|rehype-raw|rehype-sanitize|hast-util-sanitize|micromark|decode-named-character-reference|character-entities|remark-rehype|mdast-util-to-hast|mdast-util-to-string|remark-parse|markdown-table|unist-util-stringify-position|unist-util-visit|unist-util-is|trough|unified|bail|is-plain-obj|vfile|vfile-message|@types|mdast-util-from-markdown|remark-gfm|ccount|escape-string-regexp|property-information)/)',
  ],
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
};

export default config;
