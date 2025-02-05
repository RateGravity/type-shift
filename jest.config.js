const { join } = require('path');

module.exports = {
  globalSetup: join(__dirname, './config/jest.setup.ts'),
  collectCoverageFrom: ['**/*.{t,j}s?(x)'],
  coveragePathIgnorePatterns: ['__(.+?)__'],
  verbose: true,
  rootDir: join(__dirname, './src'),
  transform: { '[jt]sx?$': ['babel-jest', { rootMode: 'upward' }] },
  moduleFileExtensions: ['json', 'ts', 'js'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    ['^type-shift$']: join(__dirname, './src/index.ts')
  }
};
