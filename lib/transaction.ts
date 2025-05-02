import { createHash } from 'crypto';
import * as elliptic from 'elliptic';

// Initialize elliptic curve
const ec = new elliptic.ec('secp256k1');

export class Transaction {
  public fromAddress: string | null;
  public toAddress: string;
  public amount: number;
  public timestamp: number;
  public signature: string | null = null;
  public hash: string;
  public fee: number = 0;
  public contourData?: any;
  
  /**
   * Create a new transaction
   */
  constructor(fromAddress: string | null, toAddress: string, amount: number, fee: number = 0, contourData?: any) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.timestamp = Date.now();
    this.fee = fee;
    this.contourData = contourData;
    this.hash = this.calculateHash();
  }
  
  /**
   * Calculate the hash of this transaction
   */
  public calculateHash(): string {
    return createHash('sha256')
      .update(
        (this.fromAddress || '') +
        this.toAddress +
        this.amount.toString() +
        this.timestamp.toString() +
        this.fee.toString() +
        (this.contourData ? JSON.stringify(this.contourData) : '')
      )
      .digest('hex');
  }
  
  /**
   * Sign the transaction with the given signing key
   */
  public signTransaction(signingKey: elliptic.ec.KeyPair): void {
    // Check if the transaction is a mining reward
    if (!this.fromAddress) {
      throw new Error('Cannot sign mining reward transactions');
    }
    
    // Check if the public key matches the from address
    const publicKey = signingKey.getPublic('hex');
    if (publicKey !== this.fromAddress) {
      throw new Error('You cannot sign transactions for other wallets');
    }
    
    // Calculate the hash of this transaction
    const txHash = this.calculateHash();
    
    // Sign the hash
    const signature = signingKey.sign(txHash, 'base64');
    
    // Store the signature
    this.signature = signature.toDER('hex');
  }
  
  /**
   * Check if the transaction is valid
   */
  public isValid(): boolean {
    // Mining reward transactions are valid by default
    if (!this.fromAddress) {
      return true;
    }
    
    // Check if the transaction has a signature
    if (!this.signature || this.signature.length === 0) {
      throw new Error('No signature in this transaction');
    }
    
    // Verify the signature
    try {
      const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
      return publicKey.verify(this.calculateHash(), this.signature);
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Convert transaction to a plain object
   */
  public toObject(): any {
    return {
      fromAddress: this.fromAddress,
      toAddress: this.toAddress,
      amount: this.amount,
      timestamp: this.timestamp,
      signature: this.signature,
      hash: this.hash,
      fee: this.fee,
      contourData: this.contourData
    };
  }
  
  /**
   * Create a transaction from a plain object
   */
  public static fromObject(obj: any): Transaction {
    const tx = new Transaction(
      obj.fromAddress,
      obj.toAddress,
      obj.amount,
      obj.fee || 0,
      obj.contourData
    );
    
    tx.timestamp = obj.timestamp || Date.now();
    tx.signature = obj.signature || null;
    tx.hash = obj.hash || tx.calculateHash();
    
    return tx;
  }
}
