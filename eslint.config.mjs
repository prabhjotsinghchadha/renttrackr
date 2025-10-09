import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import antfu from '@antfu/eslint-config';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import playwright from 'eslint-plugin-playwright';
import storybook from 'eslint-plugin-storybook';
import tailwind from 'eslint-plugin-tailwindcss';

export default antfu(
  {
    react: true,
    nextjs: true,
    typescript: true,

    // Configuration preferences
    lessOpinionated: true,
    isInEditor: false,

    // Disable stylistic rules - let Prettier handle formatting
    stylistic: false,

    // Format settings
    formatters: {
      css: true,
    },

    // Ignored paths
    ignores: ['migrations/**/*', '*.md'],
  },
  // --- Accessibility Rules ---
  jsxA11y.flatConfigs.recommended,
  // --- Tailwind CSS Rules ---
  ...tailwind.configs['flat/recommended'],
  {
    settings: {
      tailwindcss: {
        config: `${dirname(fileURLToPath(import.meta.url))}/src/styles/global.css`,
      },
    },
  },
  // --- E2E Testing Rules ---
  {
    files: ['**/*.spec.ts', '**/*.e2e.ts'],
    ...playwright.configs['flat/recommended'],
  },
  // --- Storybook Rules ---
  ...storybook.configs['flat/recommended'],
  // --- Custom Rule Overrides ---
  {
    rules: {
      'antfu/no-top-level-await': 'off', // Allow top-level await
      'ts/consistent-type-definitions': ['error', 'type'], // Use `type` instead of `interface`
      'react/prefer-destructuring-assignment': 'off', // Vscode doesn't support automatically destructuring, it's a pain to add a new variable
      'node/prefer-global/process': 'off', // Allow using `process.env`
      'test/padding-around-all': 'error', // Add padding in test files
      'test/prefer-lowercase-title': 'off', // Allow using uppercase titles in test titles
      'react/prefer-shorthand-fragment': 'off', // Disable React 19 context provider shorthand
      'react/no-context-provider': 'off', // Allow Context.Provider syntax
      'react/prefer-shorthand-boolean': 'off', // Disable React 19 shorthand rules
      'react-19/no-context-provider': 'off', // Disable React 19 context provider rule
      'react-refresh/only-export-components': 'off', // Allow exporting constants with components
      'react-dom/no-dangerously-set-innerhtml': 'off', // Allow dangerouslySetInnerHTML for dynamic CSS
      'react-hooks-extra/no-direct-set-state-in-use-effect': 'off', // Allow setState in useEffect for media queries
    },
  },
);
