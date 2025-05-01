import { Block, Transaction } from './Block';

declare module 'events' {
  interface EventEmitter {
    emit(event: 'transactionAdded', transaction: Transaction): boolean;
    emit(event: 'blockMined', block: Block): boolean;
    emit(event: 'blockAdded', block: Block): boolean;
    on(event: 'transactionAdded', listener: (transaction: Transaction) => void): this;
    on(event: 'blockMined', listener: (block: Block) => void): this;
    on(event: 'blockAdded', listener: (block: Block) => void): this;
  }
} 