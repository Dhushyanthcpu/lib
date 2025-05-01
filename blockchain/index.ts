import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Now process.env.OPENAI_API_KEY and process.env.ANTHROPIC_API_KEY are available

// Export all blockchain-related classes
export { Block, Transaction } from './Block';
export { Blockchain, BlockchainConfig, BlockchainStats } from './Blockchain';
export { QuantumHash } from './quantum-hash';
export { QuantumBlockchainWorkflow } from './QuantumBlockchainWorkflow';
export { QuantumBlockchainIntegration } from './QuantumBlockchainIntegration';

// Export AI-related classes
export * from './ai';

// Export market-related classes
export { CryptoMarketAnalyzer } from './market/CryptoMarketAnalyzer';

// Export types
export * from './types/market';
