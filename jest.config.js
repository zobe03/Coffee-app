/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/__tests__'],
    testMatch: ['**/__tests__/test_*.ts'],
    testPathIgnorePatterns: ['/node_modules/', '/e2e/', '__mocks__', 'helpers'],
    moduleNameMapper: {
        '^expo-sqlite$': '<rootDir>/__tests__/__mocks__/expo-sqlite.ts',
        '^react-native$': '<rootDir>/__tests__/__mocks__/react-native.ts',
    },
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            tsconfig: {
                module: 'commonjs',
                esModuleInterop: true,
                allowJs: true,
                strict: false,
            },
        }],
    },
};
