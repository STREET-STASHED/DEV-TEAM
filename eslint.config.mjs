// eslint.config.mjs
import js from "@eslint/js";
import parser from "@typescript-eslint/parser";
import eslintPlugin from "@typescript-eslint/eslint-plugin";
import unusedImports from "eslint-plugin-unused-imports";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  {
    ignores: [
      ".next/**/*",
      "node_modules/**/*",
      "public/sw.js",
      "public/workbox-*.js",
    ],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
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
        __dirname: "readonly",
        HTMLInputElement: "readonly",
        HTMLFormElement: "readonly",
        HTMLButtonElement: "readonly",
        HTMLDivElement: "readonly",
        IntersectionObserver: "readonly",
        sessionStorage: "readonly",
        localStorage: "readonly",
        crypto: "readonly",
        Request: "readonly",
        Response: "readonly",
        Headers: "readonly",
        indexedDB: "readonly",
        IDBTransaction: "readonly",
        IDBDatabase: "readonly",
        IDBObjectStore: "readonly",
        IDBCursor: "readonly",
        IDBIndex: "readonly",
        IDBRequest: "readonly",
        DOMException: "readonly",
        FetchEvent: "readonly",
        registration: "readonly",
        location: "readonly",
        define: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": eslintPlugin,
    },
    rules: {
      "no-prototype-builtins": "error",
    },
  },
  {
    plugins: {
      "@typescript-eslint": eslintPlugin,
      "unused-imports": unusedImports,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "unused-imports/no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
  js.configs.recommended,
  await (async () => {
    const reactHooks = await import("eslint-plugin-react-hooks");
    return {
      plugins: {
        "react-hooks": reactHooks.default,
      },
      rules: {
        ...reactHooks.configs.recommended.rules,
      },
    };
  })(),
  await (async () => {
    const prettier = await import("eslint-plugin-prettier");
    const prettierConfig = await import("eslint-config-prettier");
    return {
      plugins: {
        prettier: prettier.default,
      },
      rules: {
        ...prettierConfig.default.rules,
        "prettier/prettier": "error",
      },
    };
  })(),
];
