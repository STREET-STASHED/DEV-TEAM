// eslint.config.mjs
import js from '@eslint/js';
import parser from '@typescript-eslint/parser';
import eslintPlugin from '@typescript-eslint/eslint-plugin';

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  {
    ignores: ['.next/**/*', 'node_modules/**/*'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: true,
        console: true,
        window: true,
        document: true,
        module: true,
        require: true,
        process: true,
        setTimeout: true,
        clearTimeout: true,
        alert: true,
        FileReader: true,
        FormData: true,
        Blob: true,
        fetch: true,
        URL: true,
        URLSearchParams: true,
        XMLHttpRequest: true,
        self: true,
        __dirname: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': eslintPlugin,
    },
    rules: {
      // Add your custom rules here
    },
  },
  js.configs.recommended,
];