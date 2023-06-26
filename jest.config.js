const config = {
  testEnvironment: 'jsdom',
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
  },
  // https://stackoverflow.com/questions/49263429/jest-gives-an-error-syntaxerror-unexpected-token-export
  transformIgnorePatterns: ['node_modules/jest-runner'],
};
module.exports = config;
