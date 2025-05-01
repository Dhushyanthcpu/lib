/// <reference types="jest" />
/// <reference types="node" />

import { ethers } from 'ethers';
import '@types/jest';

declare global {
  namespace jest {
    interface Mock {
      mockResolvedValue: (value: any) => Mock;
    }
  }
}

// Set up Hardhat network for testing
beforeAll(async () => {
  // Initialize Hardhat network
  await ethers.provider.send('hardhat_reset', []);
});

// Increase timeout for blockchain tests
jest.setTimeout(30000);

// Mock axios for quantum verification
jest.mock('axios', () => ({
  post: jest.fn().mockResolvedValue({
    data: {
      valid: true,
      tx_hash: '0x1234567890abcdef'
    }
  })
})); 