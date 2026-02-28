module.exports = {
  // The root directory that Jest should scan for tests and modules
  roots: ['<rootDir>/src'],
  
  // A list of paths to directories that Jest should use to search for files in
  testMatch: ['**/__tests__/**/*.tsx?', '**/?(*.)+(spec|test).tsx?'],
  
  // Transform files with babel-jest
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
  
  // Module file extensions for importing
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  
  // Configure transformIgnorePatterns to process ES modules in node_modules
  transformIgnorePatterns: [
    // Exclude all node_modules except those that use ES modules
    '/node_modules/(?!(d3|d3-.*|react-force-graph-2d|lucide-react|@monaco-editor|.*monaco-editor.*)/)',
  ],
  
  // Add moduleNameMapper if you need to handle non-JS assets
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/src/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/src/__mocks__/fileMock.js',
  },
  
  // The test environment that will be used for testing
  testEnvironment: 'jsdom',
  
  // Indicates whether each individual test should be reported during the run
  verbose: true,
} 