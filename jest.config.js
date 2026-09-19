const config = {
  testEnvironment: 'jsdom',
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/schema.ts',
    '!src/stories/**',
    '!src/test/**',
  ],
  coverageThreshold: {
    global: {
      branches: 45,
      functions: 55,
      lines: 50,
      statements: 80,
    },
  },
  // https://stackoverflow.com/questions/49263429/jest-gives-an-error-syntaxerror-unexpected-token-export
  transformIgnorePatterns: ['node_modules/jest-runner'],
};
module.exports = config;
