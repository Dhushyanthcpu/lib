import { Block } from './block';
import { Transaction } from './transaction';
import { ProofOfContour } from '../consensus/ProofOfContour';
import { EventEmitter } from 'events';
import { GeometricVerifier } from './geometric-verifier';
import { Logger } from './logger';

export class Blockchain extends EventEmitter {
  private chain: Block[];
  private pendingTransactions: Transaction[];
  private consensus: ProofOfContour;
  private verifier: GeometricVerifier;
  private logger: Logger;
  private miningInProgress: boolean = false;
  private abortController: AbortController | null = null;

  constructor() {
    super();
    this.chain = [this.createGenesisBlock()];
    this.pendingTransactions = [];
    this.consensus = new ProofOfContour();
    this.verifier = new GeometricVerifier();
    this.logger = new Logger('Blockchain');
    
    // Listen for difficulty adjustments
    this.consensus.on('difficultyAdjusted', (data) => {
      this.logger.info(`Difficulty adjusted to ${data.newDifficulty}`);
      this.emit('difficultyAdjusted', data);
    });
  }

  /**
   * Create the genesis block
   */
  private createGenesisBlock(): Block {
    return new Block(
      0,
      Date.now(),
      [],
      '0',
      {
        nonce: 0,
        contour: {
          points: [],
          complexity: 0,
          hash: Buffer.from('0')
        }
      }
    );
  }

  /**
   * Get the latest block in the chain
   */
  public getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Add a new transaction to the pending transactions
   */
  public addTransaction(transaction: Transaction): boolean {
    // Validate transaction
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaction must include from and to address');
    }

    if (!transaction.isValid()) {
      throw new Error('Cannot add invalid transaction to chain');
    }

    // Verify transaction geometry if it has contour data
    if (transaction.contourData) {
      const isGeometryValid = this.verifier.verifyTransactionGeometry(transaction);
      if (!isGeometryValid) {
        throw new Error('Transaction geometry verification failed');
      }
    }

    this.pendingTransactions.push(transaction);
    this.emit('transactionAdded', transaction);
    return true;
  }

  /**
   * Start mining process for pending transactions
   */
  public async minePendingTransactions(miningRewardAddress: string): Promise<Block | null> {
    // Check if mining is already in progress
    if (this.miningInProgress) {
      this.logger.warn('Mining already in progress');
      return null;
    }

    // Set mining flag
    this.miningInProgress = true;
    this.abortController = new AbortController();
    
    try {
      // Create mining reward transaction
      const rewardTx = new Transaction(null, miningRewardAddress, this.getRewardAmount());
      const transactions = [...this.pendingTransactions, rewardTx];
      
      // Get the latest block
      const latestBlock = this.getLatestBlock();
      
      // Create a new block
      const newBlock = new Block(
        latestBlock.index + 1,
        Date.now(),
        transactions,
        latestBlock.hash
      );
      
      // Mine the block
      this.emit('miningStarted', { blockIndex: newBlock.index });
      this.logger.info(`Mining block ${newBlock.index} with ${transactions.length} transactions`);
      
      // Set up abort signal
      const signal = this.abortController.signal;
      
      // Start mining with abort signal
      const miningResult = await Promise.race([
        this.consensus.mine(
          { transactions: transactions.map(tx => tx.toObject()), timestamp: newBlock.timestamp },
          latestBlock.hash,
          miningRewardAddress
        ),
        new Promise<null>((resolve) => {
          signal.addEventListener('abort', () => resolve(null));
        })
      ]);
      
      // Check if mining was aborted
      if (!miningResult) {
        this.logger.info('Mining aborted');
        this.emit('miningAborted', { blockIndex: newBlock.index });
        return null;
      }
      
      // Set the proof of contour data
      newBlock.setProofOfContour(miningResult);
      
      // Add the block to the chain
      this.chain.push(newBlock);
      
      // Clear pending transactions
      this.pendingTransactions = [];
      
      // Emit block mined event
      this.emit('blockMined', newBlock);
      this.logger.info(`Block ${newBlock.index} mined successfully`);
      
      return newBlock;
    } catch (error) {
      this.logger.error(`Mining error: ${error instanceof Error ? error.message : String(error)}`);
      this.emit('miningError', { error });
      return null;
    } finally {
      // Reset mining flag
      this.miningInProgress = false;
      this.abortController = null;
    }
  }

  /**
   * Stop the current mining process
   */
  public stopMining(): boolean {
    if (!this.miningInProgress || !this.abortController) {
      return false;
    }
    
    this.consensus.stopMiningProcess();
    this.abortController.abort();
    this.logger.info('Mining process stopped');
    return true;
  }

  /**
   * Get the current mining status
   */
  public isMining(): boolean {
    return this.miningInProgress;
  }

  /**
   * Get the current reward amount
   */
  private getRewardAmount(): number {
    // Calculate reward based on current block height
    const blockHeight = this.chain.length;
    const baseReward = 50;
    const halvingInterval = 210000;
    
    // Calculate halvings
    const halvings = Math.floor(blockHeight / halvingInterval);
    
    // Calculate reward with halvings
    return baseReward / Math.pow(2, halvings);
  }

  /**
   * Get the balance of an address
   */
  public getBalanceOfAddress(address: string): number {
    let balance = 0;
    
    // Check each block in the chain
    for (const block of this.chain) {
      for (const trans of block.transactions) {
        // If the address is the sender, subtract the amount from the balance
        if (trans.fromAddress === address) {
          balance -= trans.amount;
          balance -= trans.fee || 0;
        }
        
        // If the address is the recipient, add the amount to the balance
        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }
    
    return balance;
  }

  /**
   * Validate the integrity of the blockchain
   */
  public isChainValid(): boolean {
    // Check each block in the chain
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      
      // Validate block hash
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        this.logger.error(`Block ${i} has invalid hash`);
        return false;
      }
      
      // Validate previous hash reference
      if (currentBlock.previousHash !== previousBlock.hash) {
        this.logger.error(`Block ${i} has invalid previous hash reference`);
        return false;
      }
      
      // Validate proof of contour
      if (!this.validateProofOfContour(currentBlock)) {
        this.logger.error(`Block ${i} has invalid proof of contour`);
        return false;
      }
      
      // Validate all transactions in the block
      for (const tx of currentBlock.transactions) {
        if (!tx.isValid()) {
          this.logger.error(`Block ${i} contains invalid transaction`);
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Validate the proof of contour for a block
   */
  private validateProofOfContour(block: Block): boolean {
    if (!block.proofOfContour) {
      return false;
    }
    
    // Get the previous block
    const previousBlock = this.chain.find(b => b.hash === block.previousHash);
    if (!previousBlock) {
      return false;
    }
    
    // Verify the proof of contour
    const verificationResult = this.consensus.verify(
      { transactions: block.transactions.map(tx => tx.toObject()), timestamp: block.timestamp },
      previousBlock.hash,
      block.proofOfContour.miner || '',
      block.proofOfContour.nonce,
      block.proofOfContour.contour
    );
    
    return verificationResult.valid;
  }

  /**
   * Get the entire blockchain
   */
  public getChain(): Block[] {
    return [...this.chain];
  }

  /**
   * Get pending transactions
   */
  public getPendingTransactions(): Transaction[] {
    return [...this.pendingTransactions];
  }

  /**
   * Get the current difficulty
   */
  public getDifficulty(): number {
    return this.consensus.getDifficulty();
  }

  /**
   * Set the difficulty manually
   */
  public setDifficulty(difficulty: number): void {
    this.consensus.setDifficulty(difficulty);
  }

  /**
   * Get block by index
   */
  public getBlockByIndex(index: number): Block | null {
    if (index < 0 || index >= this.chain.length) {
      return null;
    }
    
    return this.chain[index];
  }

  /**
   * Get block by hash
   */
  public getBlockByHash(hash: string): Block | null {
    return this.chain.find(block => block.hash === hash) || null;
  }

  /**
   * Get transaction by hash
   */
  public getTransactionByHash(hash: string): Transaction | null {
    // Check pending transactions
    const pendingTx = this.pendingTransactions.find(tx => tx.hash === hash);
    if (pendingTx) {
      return pendingTx;
    }
    
    // Check transactions in blocks
    for (const block of this.chain) {
      const tx = block.transactions.find(tx => tx.hash === hash);
      if (tx) {
        return tx;
      }
    }
    
    return null;
  }

  /**
   * Get transactions for an address
   */
  public getTransactionsForAddress(address: string): Transaction[] {
    const txs: Transaction[] = [];
    
    // Check each block in the chain
    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.fromAddress === address || tx.toAddress === address) {
          txs.push(tx);
        }
      }
    }
    
    return txs;
  }
}
