module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    transform: {
        '\\.(js|ts)$': 'ts-jest',
    },
    transformIgnorePatterns: ['/node_modules/(?!express-graphql)'],
};
