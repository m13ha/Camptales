/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.setup.js'],
  moduleNameMapper: {
    // Handle module aliases (if you have them in your tsconfig)
    // Example: '^@components/(.*)$': '<rootDir>/src/components/$1',
    
    // Mock static assets to prevent errors during tests
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    // Use ts-jest for ts/tsx files
    '^.+\\.tsx?$': ['ts-jest', {
        tsconfig: 'tsconfig.json', // Ensure it uses your project's tsconfig
    }],
  },
  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
};
