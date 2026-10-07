import js from '@eslint/js'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'vite.config.ts'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        setTimeout: 'readonly',

        clearTimeout: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        FormData: 'readonly',
        FileReader: 'readonly',
        File: 'readonly',
        Uint8Array: 'readonly',
        Event: 'readonly',
        CustomEvent: 'readonly',
        HTMLElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLImageElement: 'readonly',

        HTMLSpanElement: 'readonly',
        HTMLParagraphElement: 'readonly',
        HTMLHeadingElement: 'readonly',
        HTMLSelectElement: 'readonly',
        HTMLFormElement: 'readonly',
        NodeJS: 'readonly',
        // Vitest globals
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
      },
    },

    plugins: {
      '@typescript-eslint': typescriptEslint,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { "argsIgnorePattern": "^_" }],
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
]
