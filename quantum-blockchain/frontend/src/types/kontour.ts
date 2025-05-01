// Shared type definitions for the Kontour blockchain

export interface BlockchainStats {
  block_count: number;
  transaction_count: number;
  pending_transaction_count: number;
  account_count: number;
  smart_contract_count: number;
  ai_model_count: number;
  avg_block_time: number;
  quantum_metrics: Record<string, any>;
}

export interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  previous_hash: string;
  nonce: number;
  difficulty: number;
  hash: string;
  quantum_enhanced: boolean;
  quantum_metrics: Record<string, any>;
}

export interface Transaction {
  sender: string;
  recipient: string;
  amount: number;
  timestamp: number;
  type: string;
  data: Record<string, any>;
  status: string;
  hash: string;
}

export interface Account {
  address: string;
  balance: number;
}

export interface AIModel {
  model_id: string;
  owner: string;
  config: Record<string, any>;
  training_result: Record<string, any>;
  created_at: number;
}

export interface SecurityAnalysis {
  vulnerability_score: number;
  qubits_needed_to_break: number;
  estimated_quantum_years_to_break: number;
  recommendations: string[];
}

export interface PredictionResult {
  output: number[];
  confidence: number;
  processing_time: number;
}