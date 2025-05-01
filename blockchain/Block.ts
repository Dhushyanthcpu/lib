import { Buffer } from 'buffer';
import { QuantumHash } from './quantum-hash';

export interface Transaction {
  fromAddress: string | null;
  toAddress: string;
  amount: number;
  fee?: number;
  timestamp?: number;
  signature?: string;
  zkProof?: Buffer;
}

export class Block {
  timestamp: number;
  transactions: Transaction[];
  previousHash: string;
  hash: string;
  nonce: number;
  merkleRoot: string;
  private quantumHasher: QuantumHash;

  constructor(
    timestamp: number,
    transactions: Transaction[],
    previousHash = '',
    quantumResistanceEnabled = false,
    useSPHINCS = false
  ) {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.quantumHasher = new QuantumHash();
    this.quantumHasher.setQuantumResistance(quantumResistanceEnabled, useSPHINCS);
    this.merkleRoot = this.calculateMerkleRoot();
    this.hash = this.calculateHash();
  }

  private calculateMerkleRoot(): string {
    if (this.transactions.length === 0) {
      return Buffer.alloc(32).toString('hex');
    }

    let hashes = this.transactions.map(tx => 
      this.quantumHasher.hash(JSON.stringify(tx)).toString('hex')
    );

    while (hashes.length > 1) {
      const newHashes: string[] = [];
      for (let i = 0; i < hashes.length; i += 2) {
        const left = hashes[i];
        const right = i + 1 < hashes.length ? hashes[i + 1] : left;
        const combined = Buffer.from(left + right);
        newHashes.push(this.quantumHasher.hash(combined).toString('hex'));
      }
      hashes = newHashes;
    }

    return hashes[0];
  }

  calculateHash(): string {
    const data = Buffer.from(
      this.previousHash +
      this.timestamp.toString() +
      this.merkleRoot +
      this.nonce.toString()
    );
    return this.quantumHasher.hash(data).toString('hex');
  }

  mineBlock(difficulty: number): void {
    const target = '0'.repeat(difficulty);
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`Block mined: ${this.hash}`);
  }

  isValid(): boolean {
    // Verify block hash
    if (this.hash !== this.calculateHash()) {
      return false;
    }

    // Verify merkle root
    if (this.merkleRoot !== this.calculateMerkleRoot()) {
      return false;
    }

    // Verify transactions
    for (const tx of this.transactions) {
      if (!this.verifyTransaction(tx)) {
        return false;
      }
    }

    return true;
  }

  private verifyTransaction(tx: Transaction): boolean {
    // Basic transaction validation
    if (!tx.fromAddress || !tx.toAddress || tx.amount <= 0) {
      return false;
    }

    // Skip signature verification for mining rewards
    if (tx.fromAddress === '0x0000000000000000000000000000000000000000') {
      return true;
    }

    // Verify signature if present
    if (tx.signature) {
      // TODO: Implement signature verification
      return true;
    }

    return false;
  }
} 