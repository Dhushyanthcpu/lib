import { EventEmitter } from 'events';

export interface QueuedTransaction {
  id: string;
  type: 'send' | 'swap' | 'approve';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  data: any;
  retries: number;
  lastAttempt: Date | null;
  error?: string;
}

export class TransactionQueueManager extends EventEmitter {
  private static instance: TransactionQueueManager;
  private queue: Map<string, QueuedTransaction>;
  private processing: boolean;
  private maxRetries: number;
  private retryDelay: number; // milliseconds

  private constructor() {
    super();
    this.queue = new Map();
    this.processing = false;
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
  }

  static getInstance(): TransactionQueueManager {
    if (!TransactionQueueManager.instance) {
      TransactionQueueManager.instance = new TransactionQueueManager();
    }
    return TransactionQueueManager.instance;
  }

  addTransaction(type: 'send' | 'swap' | 'approve', data: any): string {
    const id = crypto.randomUUID();
    const transaction: QueuedTransaction = {
      id,
      type,
      status: 'pending',
      data,
      retries: 0,
      lastAttempt: null
    };

    this.queue.set(id, transaction);
    this.emit('transactionAdded', transaction);

    if (!this.processing) {
      this.processQueue();
    }

    return id;
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return;

    this.processing = true;
    
    while (this.queue.size > 0) {
      const pendingTransactions = Array.from(this.queue.values())
        .filter(tx => tx.status === 'pending' || 
          (tx.status === 'failed' && 
           tx.retries < this.maxRetries && 
           (tx.lastAttempt ? Date.now() - tx.lastAttempt.getTime() >= this.retryDelay : true)));

      if (pendingTransactions.length === 0) {
        break;
      }

      for (const transaction of pendingTransactions) {
        try {
          transaction.status = 'processing';
          transaction.lastAttempt = new Date();
          this.emit('transactionStatusChanged', transaction);

          await this.processTransaction(transaction);

          transaction.status = 'completed';
          this.emit('transactionStatusChanged', transaction);
          this.queue.delete(transaction.id);

        } catch (error) {
          transaction.retries++;
          transaction.status = 'failed';
          transaction.error = error instanceof Error ? error.message : 'Unknown error';
          this.emit('transactionStatusChanged', transaction);

          if (transaction.retries >= this.maxRetries) {
            this.queue.delete(transaction.id);
            this.emit('transactionFailed', transaction);
          }
        }
      }

      // Wait before next batch
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.processing = false;
  }

  private async processTransaction(transaction: QueuedTransaction): Promise<void> {
    switch (transaction.type) {
      case 'send':
        await this.processSendTransaction(transaction);
        break;
      case 'swap':
        await this.processSwapTransaction(transaction);
        break;
      case 'approve':
        await this.processApprovalTransaction(transaction);
        break;
      default:
        throw new Error('Unknown transaction type');
    }
  }

  private async processSendTransaction(transaction: QueuedTransaction): Promise<void> {
    // Implementation for sending tokens/coins
    const { from, to, amount, currency } = transaction.data;
    // Add actual implementation here
  }

  private async processSwapTransaction(transaction: QueuedTransaction): Promise<void> {
    // Implementation for token swaps
    const { fromToken, toToken, amount, slippage } = transaction.data;
    // Add actual implementation here
  }

  private async processApprovalTransaction(transaction: QueuedTransaction): Promise<void> {
    // Implementation for token approvals
    const { token, spender, amount } = transaction.data;
    // Add actual implementation here
  }

  getTransaction(id: string): QueuedTransaction | undefined {
    return this.queue.get(id);
  }

  getAllTransactions(): QueuedTransaction[] {
    return Array.from(this.queue.values());
  }

  getPendingTransactions(): QueuedTransaction[] {
    return Array.from(this.queue.values())
      .filter(tx => tx.status === 'pending' || tx.status === 'processing');
  }

  getFailedTransactions(): QueuedTransaction[] {
    return Array.from(this.queue.values())
      .filter(tx => tx.status === 'failed');
  }

  retryTransaction(id: string): boolean {
    const transaction = this.queue.get(id);
    if (transaction && transaction.status === 'failed') {
      transaction.status = 'pending';
      transaction.retries = 0;
      transaction.error = undefined;
      this.emit('transactionStatusChanged', transaction);
      
      if (!this.processing) {
        this.processQueue();
      }
      return true;
    }
    return false;
  }

  cancelTransaction(id: string): boolean {
    const transaction = this.queue.get(id);
    if (transaction && (transaction.status === 'pending' || transaction.status === 'failed')) {
      this.queue.delete(id);
      this.emit('transactionCancelled', transaction);
      return true;
    }
    return false;
  }

  setMaxRetries(value: number): void {
    this.maxRetries = value;
  }

  setRetryDelay(milliseconds: number): void {
    this.retryDelay = milliseconds;
  }
} 