// eslint.config.mjs
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';

export default [
  // Base JS (with JSX parse)
  {
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },

  // React + hooks
  {
    plugins: { react, 'react-hooks': reactHooks },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
    },
    settings: { react: { version: 'detect' } },
  },

  // Next recommendations
  {
    plugins: { '@next/next': nextPlugin },
    rules: { ...nextPlugin.configs['core-web-vitals'].rules },
  },

  // TypeScript (non type-aware; fast, no parserOptions.project)
  ...tseslint.configs.recommended.map((cfg) => ({
    ...cfg,
    files: ['**/*.{ts,tsx}'],
  })),

  // Tests: allow relaxed rules + Jest globals
  {
    files: ['**/*.{test,spec}.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: {
        // Jest globals
        afterAll: 'readonly', afterEach: 'readonly', beforeAll: 'readonly', beforeEach: 'readonly',
        describe: 'readonly', expect: 'readonly', it: 'readonly', jest: 'readonly', test: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // Ignores (Capacitor, build outputs, node_modules, generated files)
  {
    ignores: [
      'android/**',
      'ios/**',
      '.next/**',
      'out/**',
      'node_modules/**',
      '__mocks__/**',
      'public/**',
      'types/**/*.d.ts',
      '**/*.lock',
      'jest.setup.js',
      'jest.config.cjs',
    ],
  },
];