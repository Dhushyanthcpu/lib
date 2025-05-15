import axios from 'axios';

// Define the TransactionData interface
export interface TransactionData {
  sender: string;
  recipient: string;
  amount: number;
  fee?: number;
  timestamp: number;
  balance?: number;
  expectedHash?: string;
  data?: any;
}

// Define the WorkflowConfig interface
export interface WorkflowConfig {
  difficulty?: number;
  auto_mine?: boolean;
  verification_algorithm?: string;
  [key: string]: any;
}

export interface WorkflowStats {
  transactions_processed: number;
  blocks_mined: number;
  sync_errors: number;
  contours_verified: number;
}

// Define the MineBlockParams interface
export interface MineBlockParams {
  block_data: string;
  target_difficulty: number;
  max_iterations: number;
}

// Define the WorkflowStats interface
export interface WorkflowStats {
  transactions_processed: number;
  blocks_mined: number;
  sync_errors: number;
  contours_verified: number;
}

export class QuantumBridge {
  private apiUrl: string;

  constructor(apiUrl: string = 'http://localhost:8000') {
    this.apiUrl = apiUrl;
  }

  async verifyTransaction(transactionData: TransactionData): Promise<any> {
    try {
      const response = await axios.post(`${this.apiUrl}/verify_transaction`, transactionData);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to verify transaction: ${error.message}`);
    }
  }

  async startWorkflow(config: WorkflowConfig = {}): Promise<any> {
    try {
      const response = await axios.post(`${this.apiUrl}/workflow/start`, config);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to start workflow: ${error.message}`);
    }
  }

  async stopWorkflow(): Promise<any> {
    try {
      const response = await axios.post(`${this.apiUrl}/workflow/stop`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to stop workflow: ${error.message}`);
    }
  }

  async getWorkflowStats(): Promise<WorkflowStats> {
    try {
      const response = await axios.get<WorkflowStats>(`${this.apiUrl}/workflow/stats`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get workflow stats: ${error.message}`);
    }
  }

  async mineBlock(blockData: string, difficulty: number = 4, maxIterations: number = 100): Promise<any> {
    try {
      const params: MineBlockParams = {
        block_data: blockData,
        target_difficulty: difficulty,
        max_iterations: maxIterations
      };
      const response = await axios.post(`${this.apiUrl}/mine_block`, params);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to mine block: ${error.message}`);
    }
  }
}

// Example usage in a Next.js component
export async function verifyTransactionOnChain(data: TransactionData) {
  const bridge = new QuantumBridge();
  const result = await bridge.verifyTransaction(data);
  return result;
}
