/**
 * Minimal Jest configuration to restore a working test pipeline.
 * Uses Node environment and targets JS tests to avoid TS transpilation requirements.
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  roots: ['<rootDir>'],
  moduleFileExtensions: ['js', 'json'],
  collectCoverageFrom: [],
};


