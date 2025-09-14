import js from '@eslint/js';
import pluginN from 'eslint-plugin-n';
import pluginPromise from 'eslint-plugin-promise';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Node.js globals
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        console: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        URL: 'readonly', // fixes 'URL is not defined'
        // Jest globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
    },
    plugins: {
      n: pluginN,
      promise: pluginPromise,
    },
    rules: {
      // Disable Node.js specific rules that might conflict with modern features
      'n/no-unsupported-features/es-builtins': 'off',
      'n/no-unsupported-features/node-builtins': 'off',

      // Keep your existing rules
      'no-console': 'warn',
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'prefer-const': 'error',
      'no-var': 'error',

      // Promise-specific rules
      'promise/always-return': 'error',
      'promise/avoid-new': 'off',
      'promise/catch-or-return': 'error',
      'promise/no-callback-in-promise': 'warn',
      'promise/no-native': 'off',
      'promise/no-nesting': 'warn',
      'promise/no-promise-in-callback': 'warn',
      'promise/no-return-wrap': 'error',
      'promise/param-names': 'error',
      'promise/prefer-await-to-callbacks': 'warn',
      'promise/prefer-await-to-then': 'warn',
    },
  },
  {
    files: ['**/*.test.js', '**/tests/**/*.js'],
    rules: {
      'no-unused-vars': 'off', // Allow unused vars in tests
      'no-console': 'off', // Allow console in tests
    },
  },
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      'coverage/',
      'seeds/',
      '*.config.js',
    ],
  },
];
