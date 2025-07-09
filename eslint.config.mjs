// eslint.config.mjs
import js from '@eslint/js'
import * as tseslint from 'typescript-eslint'

const tsPlugin = await tseslint.config({
  files: ['**/*.ts', '**/*.tsx'],
  languageOptions: {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      ecmaFeatures: { jsx: true },
    },
  },
})

export default [
  {
    files: ['**/*.js', '**/*.ts'],
    languageOptions: {
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
      },
    },
  },
  js.configs.recommended,
  ...tsPlugin,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      globals: {
        window: 'readonly',
      },
    },
    rules: {
      // Add your custom rules here
    },
  },
];