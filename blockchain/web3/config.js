/**
 * Web3 Configuration
 */

module.exports = {
  // API server configuration
  apiPort: 3001,
  
  // Backend URLs
  pythonBackendUrl: 'http://localhost:8000',
  javaBackendUrl: 'http://localhost:8080/kontourcoin/api/v1',
  
  // Network synchronization interval (ms)
  syncIntervalMs: 30000,
  
  // Wallet mnemonic (for development only, use environment variables in production)
  mnemonic: process.env.MNEMONIC || 'test test test test test test test test test test test junk',
  
  // Network configurations
  networks: {
    // Local development network
    local: {
      providerUrl: 'http://localhost:8545',
      chainId: 1337,
      useWallet: true,
      contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3' // Default Hardhat deployment address
    },
    
    // Testnet (Goerli)
    testnet: {
      providerUrl: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161', // Default Infura ID for testing
      chainId: 5,
      useWallet: true,
      contractAddress: '0x0000000000000000000000000000000000000000' // Replace with actual deployment
    },
    
    // Mainnet (for read-only operations)
    mainnet: {
      providerUrl: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161', // Default Infura ID for testing
      chainId: 1,
      useWallet: false, // Read-only
      contractAddress: '0x0000000000000000000000000000000000000000' // Replace with actual deployment
    }
  }
};