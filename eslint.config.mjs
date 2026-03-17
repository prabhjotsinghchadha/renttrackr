import antfu from '@antfu/eslint-config';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import playwright from 'eslint-plugin-playwright';
import storybook from 'eslint-plugin-storybook';

export default antfu(
  {
    // Disable Antfu's built-in React preset for now because it
    // pulls in a misconfigured `react-hooks-extra` plugin under
    // ESLint 10. Next.js config will still cover React-specific
    // rules that matter for this project.
    react: false,
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
    ignores: ['migrations/**/*', '*.md', 'Markdown/**/*', 'README.md'],
  },
  // --- Accessibility Rules ---
  jsxA11y.flatConfigs.recommended,
  // --- Tailwind CSS Rules ---
  // Temporarily disable Tailwind CSS plugin presets because several of
  // their rules rely on `context.getSourceCode`, which is incompatible
  // with our current ESLint 10 + flat config setup.
  // If we want Tailwind linting later, we can re-enable these once the
  // plugin has been updated.
  // ...tailwind.configs['flat/recommended'],
  // {
  //   settings: {
  //     tailwindcss: {
  //       config: `${dirname(fileURLToPath(import.meta.url))}/src/styles/global.css`,
  //     },
  //   },
  // },
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
      'tailwindcss/classnames-order': 'off', // Work around plugin bug with ESLint 10 flat config
      'e18e/prefer-static-regex': 'off', // Allow inline regexes instead of forcing module-scope constants
    },
  },
);
