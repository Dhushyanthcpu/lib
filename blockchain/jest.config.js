module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/test/**/?(*.)+(test|spec).[jt]s?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },
  moduleNameMapper: {
    '^ethers$': '<rootDir>/node_modules/ethers',
    '^@openzeppelin/contracts/(.*)$': '<rootDir>/node_modules/@openzeppelin/contracts/$1',
    '^../quantum-resistant/QuantumResistantCrypto$': '<rootDir>/test/__mocks__/quantum-resistant/QuantumResistantCrypto.ts',
    '^../quantum-mechanism/QuantumBlockchainMechanism$': '<rootDir>/test/__mocks__/quantum-mechanism/QuantumBlockchainMechanism.ts',
    '^../ai/QuantumNeuralNetwork$': '<rootDir>/test/__mocks__/ai/QuantumNeuralNetwork.ts',
    '^../../quantum-blockchain/quantum-circuit$': '<rootDir>/test/__mocks__/quantum-circuit.ts'
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  verbose: true,
  testPathIgnorePatterns: ['/node_modules/'],
  roots: ['<rootDir>'],
  modulePaths: ['<rootDir>'],
  moduleDirectories: ['node_modules', '<rootDir>']
}; 