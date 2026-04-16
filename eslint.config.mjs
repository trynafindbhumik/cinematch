import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default defineConfig([
  ...nextVitals,

  {
    files: ['**/*.{js,jsx}'],

    plugins: {
      react,
      'react-hooks': reactHooks,
    },

    rules: {
      /* -------- Next.js -------- */
      '@next/next/google-font-display': 'error',
      '@next/next/no-css-tags': 'error',
      '@next/next/no-html-link-for-pages': 'error',

      /* -------- React -------- */
      'react/jsx-uses-vars': 'error',
      'react/jsx-key': 'error',
      'react/jsx-fragments': ['error', 'syntax'],
      'react/no-array-index-key': 'warn',

      /* -------- Hooks -------- */
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      /* -------- JavaScript -------- */
      'no-console': 'warn',
      eqeqeq: 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-duplicate-imports': 'error',
      'consistent-return': 'error',

      /* -------- Imports -------- */
      'import/no-unresolved': 'error',
      'no-duplicate-imports': 'error',
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },

    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        // Makes ESLint understand @/ aliases via jsconfig.json
        typescript: {
          project: './jsconfig.json',
        },
      },
    },
  },

  // Disable formatting rules (Prettier handles formatting)
  prettier,

  // Ignore generated files
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);
