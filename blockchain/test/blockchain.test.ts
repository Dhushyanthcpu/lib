import { Blockchain } from '../Blockchain';
import { Block } from '../Block';

describe('Blockchain', () => {
  let blockchain: Blockchain;
  const minerAddress = '0x1234567890123456789012345678901234567890';
  const senderAddress = '0x2345678901234567890123456789012345678901';
  const receiverAddress = '0x3456789012345678901234567890123456789012';

  beforeEach(() => {
    blockchain = new Blockchain({
      difficulty: 2,
      miningReward: 100,
      quantumResistanceEnabled: true,
      useSPHINCS: true
    });
  });

  test('should create a new blockchain with genesis block', () => {
    expect(blockchain.getChain().length).toBe(1);
    expect(blockchain.getChain()[0].transactions.length).toBe(0);
  });

  test('should add a transaction to pending transactions', () => {
    const transaction = {
      fromAddress: senderAddress,
      toAddress: receiverAddress,
      amount: 50,
      timestamp: Date.now()
    };

    const result = blockchain.addTransaction(transaction);
    expect(result).toBe(true);
    expect(blockchain.getPendingTransactions().length).toBe(1);
  });

  test('should mine pending transactions', () => {
    // Add a transaction
    blockchain.addTransaction({
      fromAddress: senderAddress,
      toAddress: receiverAddress,
      amount: 50,
      timestamp: Date.now()
    });

    // Mine the block
    const result = blockchain.minePendingTransactions(minerAddress);
    expect(result).toBe(true);
    expect(blockchain.getPendingTransactions().length).toBe(0);
    expect(blockchain.getChain().length).toBe(2);
  });

  test('should calculate correct balance', () => {
    // Add initial transaction
    blockchain.addTransaction({
      fromAddress: senderAddress,
      toAddress: receiverAddress,
      amount: 50,
      timestamp: Date.now()
    });

    // Mine the block
    blockchain.minePendingTransactions(minerAddress);

    // Check balances
    expect(blockchain.getBalance(minerAddress)).toBe(100); // Mining reward
    expect(blockchain.getBalance(receiverAddress)).toBe(50); // Received amount
  });

  test('should validate chain', () => {
    // Add and mine some transactions
    blockchain.addTransaction({
      fromAddress: senderAddress,
      toAddress: receiverAddress,
      amount: 50,
      timestamp: Date.now()
    });
    blockchain.minePendingTransactions(minerAddress);

    expect(blockchain.isChainValid()).toBe(true);
  });

  test('should get blockchain stats', () => {
    // Add and mine some transactions
    blockchain.addTransaction({
      fromAddress: senderAddress,
      toAddress: receiverAddress,
      amount: 50,
      timestamp: Date.now()
    });
    blockchain.minePendingTransactions(minerAddress);

    const stats = blockchain.getStats();
    expect(stats.totalBlocks).toBe(2);
    expect(stats.totalTransactions).toBe(2); // 1 transaction + 1 mining reward
    expect(stats.currentDifficulty).toBe(2);
  });

  test('should handle invalid transactions', () => {
    // Try to add transaction with insufficient balance
    const transaction = {
      fromAddress: senderAddress,
      toAddress: receiverAddress,
      amount: 1000, // More than available balance
      timestamp: Date.now()
    };

    const result = blockchain.addTransaction(transaction);
    expect(result).toBe(false);
    expect(blockchain.getPendingTransactions().length).toBe(0);
  });

  test('should adjust difficulty based on block time', () => {
    // Add and mine some transactions
    blockchain.addTransaction({
      fromAddress: senderAddress,
      toAddress: receiverAddress,
      amount: 50,
      timestamp: Date.now()
    });
    blockchain.minePendingTransactions(minerAddress);

    // Wait for a while to simulate slow block time
    jest.advanceTimersByTime(120000); // 2 minutes

    // Mine another block
    blockchain.addTransaction({
      fromAddress: senderAddress,
      toAddress: receiverAddress,
      amount: 50,
      timestamp: Date.now()
    });
    blockchain.minePendingTransactions(minerAddress);

    // Difficulty should decrease
    expect(blockchain.getDifficulty()).toBe(1);
  });
}); 