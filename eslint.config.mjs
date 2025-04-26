import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
  },
  {
    ignores: ['**/db/*', '**/dist/*', '**/node_modules/*'],
  },
  {
    languageOptions: { globals: globals.browser },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error'], // Prevent unused variables
      // '@typescript-eslint/no-explicit-any': 'warn', // Discourage using `any`
      '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
      'no-undef': 'off',
    },
  },
];
