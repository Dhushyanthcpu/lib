import { Blockchain } from '../Blockchain';

// Create a new blockchain instance
const blockchain = new Blockchain({
  difficulty: 2,
  miningReward: 100,
  quantumResistanceEnabled: true,
  useSPHINCS: true
});

// Create some test addresses
const minerAddress = '0x1234567890123456789012345678901234567890';
const senderAddress = '0x2345678901234567890123456789012345678901';
const receiverAddress = '0x3456789012345678901234567890123456789012';

// Add some transactions
console.log('Adding transactions...');
blockchain.addTransaction({
  fromAddress: senderAddress,
  toAddress: receiverAddress,
  amount: 50,
  timestamp: Date.now()
});

// Mine the block
console.log('Mining block...');
blockchain.minePendingTransactions(minerAddress);

// Check balances
console.log('\nBalances:');
console.log(`Miner: ${blockchain.getBalance(minerAddress)}`);
console.log(`Sender: ${blockchain.getBalance(senderAddress)}`);
console.log(`Receiver: ${blockchain.getBalance(receiverAddress)}`);

// Get blockchain stats
const stats = blockchain.getStats();
console.log('\nBlockchain Stats:');
console.log(`Total Blocks: ${stats.totalBlocks}`);
console.log(`Total Transactions: ${stats.totalTransactions}`);
console.log(`Average Block Time: ${stats.averageBlockTime}ms`);
console.log(`Current Difficulty: ${stats.currentDifficulty}`);
console.log(`Network Hash Rate: ${stats.networkHashRate} H/s`);

// Validate the chain
console.log('\nChain Validation:');
console.log(`Is Chain Valid: ${blockchain.isChainValid()}`);

// Get the entire chain
console.log('\nBlockchain Structure:');
blockchain.getChain().forEach((block, index) => {
  console.log(`\nBlock ${index}:`);
  console.log(`Hash: ${block.hash}`);
  console.log(`Previous Hash: ${block.previousHash}`);
  console.log(`Timestamp: ${new Date(block.timestamp).toISOString()}`);
  console.log(`Transactions: ${block.transactions.length}`);
}); 