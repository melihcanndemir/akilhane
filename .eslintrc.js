module.exports = {
  extends: [
    'next/core-web-vitals',
    'next/typescript'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // Console logs - warning only  
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-alert': 'warn',

    // TypeScript Rules - Relaxed for development
    // '@typescript-eslint/no-unused-vars': ['error', { 
    //   argsIgnorePattern: '^_',
    //   varsIgnorePattern: '^_',
    //   ignoreRestSiblings: true 
    // }],
    '@typescript-eslint/no-explicit-any': 'warn',
    // '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    // '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-misused-promises': 'warn',
    // '@typescript-eslint/require-await': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    // '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/prefer-as-const': 'error',
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    '@typescript-eslint/ban-ts-comment': 'error',

    // Basic JavaScript Rules
    'prefer-const': 'error',
    'no-var': 'error',
    // 'prefer-destructuring': ['error', {
    //   array: true,
    //   object: true
    // }],

    'prefer-arrow-callback': 'error',
    'arrow-body-style': ['error', 'as-needed'],
    'no-param-reassign': 'error',
    // 'consistent-return': 'error',

    // Object/Array Rules
    'no-array-constructor': 'error',
    'no-new-object': 'error',
    'object-shorthand': ['error', 'always'],
    'prefer-object-spread': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'error',

    // Comparison Rules
    'eqeqeq': ['error', 'always'],
    'no-implicit-coercion': 'error',
    // 'no-nested-ternary': 'error',
    'no-unneeded-ternary': 'error',

    // Error Handling
    'no-throw-literal': 'error',
    'prefer-promise-reject-errors': 'error',

    // Complexity Rules - Commented out for development ease
    // 'complexity': ['error', { max: 10 }],
    // 'max-depth': ['error', { max: 4 }],
    // 'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
    // 'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
    // 'max-params': ['error', { max: 4 }],

    // Code Style Rules
    'no-trailing-spaces': 'error',
    'no-multiple-empty-lines': ['error', { max: 1 }],
    'eol-last': ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    'semi': ['error', 'always'],
    'quotes': 'off',

    // Best Practices
    'curly': ['error', 'all'],
    'dot-notation': 'error',
    'no-eval': 'error',
    'no-new': 'error',
    'no-self-compare': 'error',
    'no-unused-expressions': 'error',
    'no-useless-return': 'error',
    'yoda': 'error',
  },
  ignorePatterns: [
    'node_modules/**',
    '.next/**',
    'out/**',
    'dist/**',
    'build/**',
    '*.config.js',
    '*.config.ts',
  ],
};

// ADIM 2: Paketleri yükledikten sonra bu config'i kullan
/*
module.exports = {
  extends: [
    'next/core-web-vitals',
    'next/typescript',
    '@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  plugins: [
    '@typescript-eslint',
    'import',
    'react-hooks',
    'jsx-a11y',
    'security',
    'sonarjs'
  ],
  rules: {
    // Yukarıdaki tüm rules + ek plugin rules
    // ... (önceki tüm rules)
    
    // IMPORT RULES
    'import/order': ['error', {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always'
    }],
    'import/no-duplicates': 'error',
    
    // REACT RULES
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    
    // ACCESSIBILITY RULES
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-has-content': 'error',
    
    // SECURITY RULES
    'security/detect-object-injection': 'warn',
    
    // SONAR RULES
    'sonarjs/cognitive-complexity': ['error', 15],
    'sonarjs/no-duplicate-string': ['error', { threshold: 3 }],
  }
};
*/