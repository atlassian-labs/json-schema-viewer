const config = {
  testEnvironment: 'jsdom',
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/src/test/style-mock.js',
  },
  setupFiles: ['<rootDir>/src/test/setup.js'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/schema.ts',
    '!src/stories/**',
    '!src/test/**',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  // https://stackoverflow.com/questions/49263429/jest-gives-an-error-syntaxerror-unexpected-token-export
  transformIgnorePatterns: ['node_modules/jest-runner'],
};
module.exports = config;
