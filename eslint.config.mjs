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
      globals: {
        // Browser globals
        console: 'readonly',
        fetch: 'readonly',
        process: 'readonly',
        // React globals
        React: 'readonly',
        // DOM globals
        HTMLFormElement: 'readonly',
        HTMLElement: 'readonly',
        Event: 'readonly',
        EventTarget: 'readonly',
        // Additional browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        alert: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        FormData: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        Blob: 'readonly',
        ArrayBuffer: 'readonly',
        Uint8Array: 'readonly',
        Int8Array: 'readonly',
        Uint16Array: 'readonly',
        Int16Array: 'readonly',
        Uint32Array: 'readonly',
        Int32Array: 'readonly',
        Float32Array: 'readonly',
        Float64Array: 'readonly',
        DataView: 'readonly',
        Map: 'readonly',
        Set: 'readonly',
        WeakMap: 'readonly',
        WeakSet: 'readonly',
        Promise: 'readonly',
        Symbol: 'readonly',
        Proxy: 'readonly',
        Reflect: 'readonly',
        JSON: 'readonly',
        Math: 'readonly',
        Date: 'readonly',
        RegExp: 'readonly',
        Error: 'readonly',
        TypeError: 'readonly',
        ReferenceError: 'readonly',
        SyntaxError: 'readonly',
        RangeError: 'readonly',
        EvalError: 'readonly',
        URIError: 'readonly',
        AggregateError: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        requestIdleCallback: 'readonly',
        cancelIdleCallback: 'readonly',
        performance: 'readonly',
        crypto: 'readonly',
        btoa: 'readonly',
        atob: 'readonly',
        escape: 'readonly',
        unescape: 'readonly',
        encodeURI: 'readonly',
        encodeURIComponent: 'readonly',
        decodeURI: 'readonly',
        decodeURIComponent: 'readonly',
        isFinite: 'readonly',
        isNaN: 'readonly',
        parseFloat: 'readonly',
        parseInt: 'readonly',
        Infinity: 'readonly',
        NaN: 'readonly',
        undefined: 'readonly',
        null: 'readonly',
        true: 'readonly',
        false: 'readonly',
        // API route globals
        request: 'readonly',
        supabase: 'readonly',
        trend: 'readonly',
        supplier: 'readonly',
        alert: 'readonly',
        NextResponse: 'readonly',
        NextRequest: 'readonly',
      },
    },
    rules: {
      // Ignore unused args/vars prefixed with "_"
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  // React + hooks
  {
    plugins: { react, 'react-hooks': reactHooks },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off', // Disable prop-types validation
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
    rules: {
      // Ignore unused args/vars prefixed with "_"
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
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

  // Node.js environment for scripts and configs
  {
    files: ['scripts/**/*.js', '*.config.js', '*.config.mjs', 'jest.config.js', 'jest.setup.ts'],
    languageOptions: {
      globals: {
        // Node.js globals
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
      },
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // Temporarily disable @typescript-eslint/no-explicit-any in specific folders
  {
    files: [
      'lib/ai/**/*.{ts,tsx}',
      'lib/analytics/**/*.{ts,tsx}',
      'lib/ar-vr/**/*.{ts,tsx}',
      'lib/social/**/*.{ts,tsx}',
      'app/api/**/*.{ts,tsx}',
    ],
    rules: {
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