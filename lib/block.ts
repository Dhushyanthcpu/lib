import { createHash } from 'crypto';
import { Transaction } from './transaction';

export class Block {
  public index: number;
  public timestamp: number;
  public transactions: Transaction[];
  public previousHash: string;
  public hash: string;
  public proofOfContour: any | null = null;
  
  /**
   * Create a new block
   */
  constructor(
    index: number,
    timestamp: number,
    transactions: Transaction[],
    previousHash: string,
    proofOfContour: any = null
  ) {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.proofOfContour = proofOfContour;
    this.hash = this.calculateHash();
  }
  
  /**
   * Calculate the hash of this block
   */
  public calculateHash(): string {
    return createHash('sha256')
      .update(
        this.index.toString() +
        this.timestamp.toString() +
        this.previousHash +
        JSON.stringify(this.transactions.map(tx => tx.hash)) +
        (this.proofOfContour ? JSON.stringify({
          nonce: this.proofOfContour.nonce,
          contourHash: this.proofOfContour.contour.hash.toString('hex')
        }) : '')
      )
      .digest('hex');
  }
  
  /**
   * Set the proof of contour data
   */
  public setProofOfContour(proofOfContour: any): void {
    this.proofOfContour = proofOfContour;
    this.hash = this.calculateHash();
  }
  
  /**
   * Get the size of the block in bytes
   */
  public getSize(): number {
    // Calculate size based on JSON representation
    const blockJson = JSON.stringify({
      index: this.index,
      timestamp: this.timestamp,
      transactions: this.transactions.map(tx => tx.toObject()),
      previousHash: this.previousHash,
      hash: this.hash,
      proofOfContour: this.proofOfContour
    });
    
    return Buffer.from(blockJson).length;
  }
  
  /**
   * Convert block to a plain object
   */
  public toObject(): any {
    return {
      index: this.index,
      timestamp: this.timestamp,
      transactions: this.transactions.map(tx => tx.toObject()),
      previousHash: this.previousHash,
      hash: this.hash,
      proofOfContour: this.proofOfContour,
      size: this.getSize()
    };
  }
  
  /**
   * Create a block from a plain object
   */
  public static fromObject(obj: any): Block {
    const transactions = (obj.transactions || []).map((txObj: any) => 
      Transaction.fromObject(txObj)
    );
    
    const block = new Block(
      obj.index,
      obj.timestamp,
      transactions,
      obj.previousHash,
      obj.proofOfContour
    );
    
    // Set the hash if provided
    if (obj.hash) {
      block.hash = obj.hash;
    }
    
    return block;
  }
}
