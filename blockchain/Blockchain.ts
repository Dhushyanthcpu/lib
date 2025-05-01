import { Block, Transaction } from './Block';
import { QuantumHash } from './quantum-hash';
import { EventEmitter } from 'events';

// Define event types
type BlockchainEventTypes = {
  transactionAdded: [Transaction];
  blockMined: [Block];
  blockAdded: [Block];
};

export interface BlockchainConfig {
  difficulty: number;
  miningReward: number;
  quantumResistanceEnabled: boolean;
  useSPHINCS: boolean;
  maxBlockSize?: number;
  blockTime?: number;
}

export interface BlockchainStats {
  totalBlocks: number;
  totalTransactions: number;
  averageBlockTime: number;
  currentDifficulty: number;
  networkHashRate: number;
}

export class Blockchain extends EventEmitter {
  private chain: Block[];
  private difficulty: number;
  private pendingTransactions: Transaction[];
  private readonly miningReward: number;
  private quantumResistanceEnabled: boolean;
  private useSPHINCS: boolean;
  private quantumHasher: QuantumHash;
  private readonly maxBlockSize: number;
  private readonly blockTime: number;
  private lastBlockTimestamp: number;

  constructor(config: BlockchainConfig = {
    difficulty: 4,
    miningReward: 100,
    quantumResistanceEnabled: false,
    useSPHINCS: false,
    maxBlockSize: 1000,
    blockTime: 60000 // 1 minute
  }) {
    super();
    this.difficulty = config.difficulty;
    this.miningReward = config.miningReward;
    this.quantumResistanceEnabled = config.quantumResistanceEnabled;
    this.useSPHINCS = config.useSPHINCS;
    this.maxBlockSize = config.maxBlockSize || 1000;
    this.blockTime = config.blockTime || 60000;
    this.pendingTransactions = [];
    this.quantumHasher = new QuantumHash();
    this.quantumHasher.setQuantumResistance(this.quantumResistanceEnabled, this.useSPHINCS);
    this.chain = [this.createGenesisBlock()];
    this.lastBlockTimestamp = Date.now();
  }

  private createGenesisBlock(): Block {
    return new Block(
      Date.now(),
      [],
      '0'.repeat(128),
      this.quantumResistanceEnabled,
      this.useSPHINCS
    );
  }

  public get latestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  public getChain(): Block[] {
    return [...this.chain];
  }

  public addTransaction(transaction: Transaction): boolean {
    if (!this.validateTransaction(transaction)) {
      return false;
    }

    // Add timestamp if not present
    if (!transaction.timestamp) {
      transaction.timestamp = Date.now();
    }

    this.pendingTransactions.push(transaction);
    super.emit('transactionAdded', transaction);
    return true;
  }

  private validateTransaction(transaction: Transaction): boolean {
    if (!transaction.fromAddress || !transaction.toAddress || transaction.amount <= 0) {
      return false;
    }

    // Check if sender has sufficient balance
    if (transaction.fromAddress !== '0x0000000000000000000000000000000000000000') {
      const balance = this.getBalance(transaction.fromAddress);
      const totalAmount = transaction.amount + (transaction.fee || 0);
      if (balance < totalAmount) {
        return false;
      }
    }

    return true;
  }

  public minePendingTransactions(minerAddress: string): boolean {
    if (this.pendingTransactions.length === 0) {
      return false;
    }

    const rewardTx: Transaction = {
      fromAddress: '0x0000000000000000000000000000000000000000',
      toAddress: minerAddress,
      amount: this.miningReward,
      timestamp: Date.now(),
      fee: 0
    };

    // Adjust difficulty based on block time
    this.adjustDifficulty();

    const block = new Block(
      Date.now(),
      [...this.pendingTransactions, rewardTx],
      this.latestBlock.hash,
      this.quantumResistanceEnabled,
      this.useSPHINCS
    );

    block.mineBlock(this.difficulty);
    
    if (this.addBlock(block)) {
      this.pendingTransactions = [];
      this.lastBlockTimestamp = block.timestamp;
      super.emit('blockMined', block);
      return true;
    }
    return false;
  }

  private adjustDifficulty(): void {
    const timeSinceLastBlock = Date.now() - this.lastBlockTimestamp;
    if (timeSinceLastBlock < this.blockTime / 2) {
      this.difficulty++;
    } else if (timeSinceLastBlock > this.blockTime * 2) {
      this.difficulty = Math.max(1, this.difficulty - 1);
    }
  }

  private addBlock(block: Block): boolean {
    if (!block.isValid()) {
      return false;
    }

    if (block.previousHash !== this.latestBlock.hash) {
      return false;
    }

    this.chain.push(block);
    super.emit('blockAdded', block);
    return true;
  }

  public isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (!currentBlock.isValid()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  public getBalance(address: string): number {
    let balance = 0;

    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        if (transaction.fromAddress === address) {
          balance -= transaction.amount;
          if (transaction.fee) {
            balance -= transaction.fee;
          }
        }
        if (transaction.toAddress === address) {
          balance += transaction.amount;
        }
      }
    }

    // Include pending transactions
    for (const transaction of this.pendingTransactions) {
      if (transaction.fromAddress === address) {
        balance -= transaction.amount;
        if (transaction.fee) {
          balance -= transaction.fee;
        }
      }
      if (transaction.toAddress === address) {
        balance += transaction.amount;
      }
    }

    return balance;
  }

  public getBlock(index: number): Block | null {
    if (index < 0 || index >= this.chain.length) {
      return null;
    }
    return this.chain[index];
  }

  public getPendingTransactions(): Transaction[] {
    return [...this.pendingTransactions];
  }

  public getDifficulty(): number {
    return this.difficulty;
  }

  public getStats(): BlockchainStats {
    const totalBlocks = this.chain.length;
    const totalTransactions = this.chain.reduce(
      (sum, block) => sum + block.transactions.length,
      0
    );
    const averageBlockTime = totalBlocks > 1
      ? (this.chain[totalBlocks - 1].timestamp - this.chain[0].timestamp) / (totalBlocks - 1)
      : 0;
    const networkHashRate = this.calculateNetworkHashRate();

    return {
      totalBlocks,
      totalTransactions,
      averageBlockTime,
      currentDifficulty: this.difficulty,
      networkHashRate
    };
  }

  private calculateNetworkHashRate(): number {
    if (this.chain.length < 2) {
      return 0;
    }

    const lastBlock = this.chain[this.chain.length - 1];
    const timeSinceLastBlock = Date.now() - lastBlock.timestamp;
    const expectedHashRate = Math.pow(2, this.difficulty) / timeSinceLastBlock;
    return expectedHashRate;
  }
} 