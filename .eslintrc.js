module.exports = {
    env: {
        node: true,
        es6: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
    ],
    rules: {
        quotes: ['warn', 'single'],
        'default-param-last': ['warn'],
        'no-var': ['error'],
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_+', varsIgnorePattern: '^_+' }],
        '@typescript-eslint/type-annotation-spacing': ['warn'],
        '@typescript-eslint/no-unused-vars': [
            'warn',
            { argsIgnorePattern: '^_+', varsIgnorePattern: '^_+' },
        ],
        '@typescript-eslint/no-use-before-define': ['error', { functions: false }],
        '@typescript-eslint/explicit-function-return-type': ['off', { allowExpressions: true }],
        '@typescript-eslint/no-empty-function': ['error', { allow: ['constructors'] }],
        '@typescript-eslint/unbound-method': [
            'error',
            {
                ignoreStatic: true,
            },
        ],
    },
};
