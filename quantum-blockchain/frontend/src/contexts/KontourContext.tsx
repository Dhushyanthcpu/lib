import React, { createContext, useState, useEffect, useCallback, ReactNode, useContext } from 'react';
import axios from 'axios';
import { Web3Context } from './Web3Context';
import { 
  BlockchainStats, 
  Block, 
  Transaction, 
  Account, 
  AIModel, 
  SecurityAnalysis 
} from '../types';

// API URL - PHP Backend
const API_URL = 'http://localhost:8001/api';

interface KontourContextProps {
  // Blockchain data
  stats: BlockchainStats | null;
  blocks: Block[];
  pendingTransactions: Transaction[];
  accounts: Account[];
  aiModels: AIModel[];
  securityAnalysis: SecurityAnalysis | null;
  
  // Loading states
  loading: {
    stats: boolean;
    blocks: boolean;
    transactions: boolean;
    accounts: boolean;
    aiModels: boolean;
  };
  
  // Error states
  errors: {
    stats: string | null;
    blocks: string | null;
    transactions: string | null;
    accounts: string | null;
    aiModels: string | null;
  };
  
  // Actions
  fetchBlockchainStats: () => Promise<void>;
  fetchBlocks: () => Promise<void>;
  fetchPendingTransactions: () => Promise<void>;
  fetchAccounts: () => Promise<void>;
  fetchAIModels: () => Promise<void>;
  
  createAccount: () => Promise<string | null>;
  createTransaction: (sender: string, recipient: string, amount: number, type?: string, data?: any) => Promise<Transaction | null>;
  mineBlock: (minerAddress: string) => Promise<Block | null>;
  
  trainAIModel: (ownerAddress: string, modelConfig: any, trainingData: any[]) => Promise<AIModel | null>;
  predictWithAIModel: (modelId: string, inputData: number[]) => Promise<any>;
  
  optimizeBlockchain: (target: string) => Promise<any>;
  analyzeBlockchainSecurity: () => Promise<SecurityAnalysis | null>;
  
  // Selected items
  selectedAccount: string | null;
  setSelectedAccount: (address: string | null) => void;
  selectedBlock: Block | null;
  setSelectedBlock: (block: Block | null) => void;
  selectedTransaction: Transaction | null;
  setSelectedTransaction: (transaction: Transaction | null) => void;
}

export const KontourContext = createContext<KontourContextProps>({
  // Blockchain data
  stats: null,
  blocks: [],
  pendingTransactions: [],
  accounts: [],
  aiModels: [],
  securityAnalysis: null,
  
  // Loading states
  loading: {
    stats: false,
    blocks: false,
    transactions: false,
    accounts: false,
    aiModels: false,
  },
  
  // Error states
  errors: {
    stats: null,
    blocks: null,
    transactions: null,
    accounts: null,
    aiModels: null,
  },
  
  // Actions
  fetchBlockchainStats: async () => {},
  fetchBlocks: async () => {},
  fetchPendingTransactions: async () => {},
  fetchAccounts: async () => {},
  fetchAIModels: async () => {},
  
  createAccount: async () => null,
  createTransaction: async () => null,
  mineBlock: async () => null,
  
  trainAIModel: async () => null,
  predictWithAIModel: async () => ({}),
  
  optimizeBlockchain: async () => ({}),
  analyzeBlockchainSecurity: async () => null,
  
  // Selected items
  selectedAccount: null,
  setSelectedAccount: () => {},
  selectedBlock: null,
  setSelectedBlock: () => {},
  selectedTransaction: null,
  setSelectedTransaction: () => {},
});

interface KontourProviderProps {
  children: ReactNode;
}

export const KontourProvider: React.FC<KontourProviderProps> = ({ children }) => {
  // Web3 context
  const { account } = useContext(Web3Context);
  
  // Blockchain data
  const [stats, setStats] = useState<BlockchainStats | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [aiModels, setAiModels] = useState<AIModel[]>([]);
  const [securityAnalysis, setSecurityAnalysis] = useState<SecurityAnalysis | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState({
    stats: false,
    blocks: false,
    transactions: false,
    accounts: false,
    aiModels: false,
  });
  
  // Error states
  const [errors, setErrors] = useState({
    stats: null as string | null,
    blocks: null as string | null,
    transactions: null as string | null,
    accounts: null as string | null,
    aiModels: null as string | null,
  });
  
  // Selected items
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  // Set Web3 account as selected account when connected
  useEffect(() => {
    if (account) {
      setSelectedAccount(account);
    }
  }, [account]);
  
  // Fetch blockchain stats
  const fetchBlockchainStats = useCallback(async () => {
    setLoading(prev => ({ ...prev, stats: true }));
    setErrors(prev => ({ ...prev, stats: null }));
    
    try {
      // Get basic blockchain stats
      const statsResponse = await axios.get(`${API_URL}/blockchain/stats`);
      const basicStats = statsResponse.data;
      
      // Get quantum metrics
      const quantumResponse = await axios.get(`${API_URL}/dashboard/quantum-metrics`);
      const quantumMetrics = quantumResponse.data.data.quantum_metrics;
      
      // Combine the data
      setStats({
        ...basicStats,
        quantum_metrics: quantumMetrics
      });
    } catch (error) {
      console.error('Error fetching blockchain stats:', error);
      setErrors(prev => ({ ...prev, stats: 'Failed to fetch blockchain stats' }));
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  }, []);
  
  // Fetch blocks
  const fetchBlocks = useCallback(async () => {
    setLoading(prev => ({ ...prev, blocks: true }));
    setErrors(prev => ({ ...prev, blocks: null }));
    
    try {
      const response = await axios.get(`${API_URL}/blockchain/blocks`);
      setBlocks(response.data.blocks);
    } catch (error) {
      console.error('Error fetching blocks:', error);
      setErrors(prev => ({ ...prev, blocks: 'Failed to fetch blocks' }));
    } finally {
      setLoading(prev => ({ ...prev, blocks: false }));
    }
  }, []);
  
  // Fetch pending transactions
  const fetchPendingTransactions = useCallback(async () => {
    setLoading(prev => ({ ...prev, transactions: true }));
    setErrors(prev => ({ ...prev, transactions: null }));
    
    try {
      const response = await axios.get(`${API_URL}/blockchain/pending-transactions`);
      setPendingTransactions(response.data.transactions);
    } catch (error) {
      console.error('Error fetching pending transactions:', error);
      setErrors(prev => ({ ...prev, transactions: 'Failed to fetch pending transactions' }));
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }));
    }
  }, []);
  
  // Fetch accounts
  const fetchAccounts = useCallback(async () => {
    setLoading(prev => ({ ...prev, accounts: true }));
    setErrors(prev => ({ ...prev, accounts: null }));
    
    try {
      // In a real implementation, this would fetch all accounts
      // Here we'll use a simplified approach to fetch a few accounts
      const accountsData: Account[] = [];
      
      // Fetch a few accounts for demonstration
      for (let i = 1; i <= 3; i++) {
        const address = `KTR${i}000000000000000000000000000000`;
        const response = await axios.get(`${API_URL}/accounts/${address}/balance`);
        accountsData.push({
          address: response.data.address,
          balance: response.data.balance
        });
      }
      
      setAccounts(accountsData);
      
      // Set first account as selected if none is selected
      if (!selectedAccount && accountsData.length > 0) {
        setSelectedAccount(accountsData[0].address);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setErrors(prev => ({ ...prev, accounts: 'Failed to fetch accounts' }));
    } finally {
      setLoading(prev => ({ ...prev, accounts: false }));
    }
  }, [selectedAccount]);
  
  // Fetch AI models
  const fetchAIModels = useCallback(async () => {
    setLoading(prev => ({ ...prev, aiModels: true }));
    setErrors(prev => ({ ...prev, aiModels: null }));
    
    try {
      // In a real implementation, this would fetch AI models from the API
      // Here we'll use a simplified approach with mock data
      const mockModels: AIModel[] = [
        {
          model_id: 'quantum_ai_model_1234567890',
          owner: 'KTR1000000000000000000000000000000',
          config: {
            num_qubits: 8,
            layers: 2
          },
          training_result: {
            final_accuracy: 0.92,
            final_loss: 0.08,
            training_time: 5.2
          },
          created_at: Math.floor(Date.now() / 1000) - 86400 // 1 day ago
        },
        {
          model_id: 'quantum_ai_model_0987654321',
          owner: 'KTR2000000000000000000000000000000',
          config: {
            num_qubits: 12,
            layers: 3
          },
          training_result: {
            final_accuracy: 0.95,
            final_loss: 0.05,
            training_time: 8.7
          },
          created_at: Math.floor(Date.now() / 1000) - 43200 // 12 hours ago
        }
      ];
      
      setAiModels(mockModels);
    } catch (error) {
      console.error('Error fetching AI models:', error);
      setErrors(prev => ({ ...prev, aiModels: 'Failed to fetch AI models' }));
    } finally {
      setLoading(prev => ({ ...prev, aiModels: false }));
    }
  }, []);
  
  // Create account
  const createAccount = useCallback(async () => {
    try {
      const response = await axios.post(`${API_URL}/accounts/create`, {});
      
      // Add new account to accounts list
      const newAddress = response.data.address;
      setAccounts(prev => [...prev, { address: newAddress, balance: 0 }]);
      
      // Refresh blockchain stats
      fetchBlockchainStats();
      
      return newAddress;
    } catch (error) {
      console.error('Error creating account:', error);
      return null;
    }
  }, [fetchBlockchainStats]);
  
  // Create transaction
  const createTransaction = useCallback(async (
    sender: string,
    recipient: string,
    amount: number,
    type: string = 'transfer',
    data: any = {}
  ) => {
    try {
      const response = await axios.post(`${API_URL}/transactions/create`, {
        sender,
        recipient,
        amount,
        transaction_type: type,
        data
      });
      
      // Refresh pending transactions
      fetchPendingTransactions();
      
      return response.data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      return null;
    }
  }, [fetchPendingTransactions]);
  
  // Mine block
  const mineBlock = useCallback(async (minerAddress: string) => {
    try {
      const response = await axios.post(`${API_URL}/mining/mine-block`, {
        miner_address: minerAddress
      });
      
      // Refresh blockchain data
      fetchBlockchainStats();
      fetchBlocks();
      fetchPendingTransactions();
      fetchAccounts();
      
      return response.data;
    } catch (error) {
      console.error('Error mining block:', error);
      return null;
    }
  }, [fetchBlockchainStats, fetchBlocks, fetchPendingTransactions, fetchAccounts]);
  
  // Train AI model
  const trainAIModel = useCallback(async (
    ownerAddress: string,
    modelConfig: any,
    trainingData: any[]
  ) => {
    try {
      const response = await axios.post(`${API_URL}/ai/train`, {
        owner_address: ownerAddress,
        model_config: modelConfig,
        training_data: trainingData
      });
      
      // Add model to AI models list
      const newModel: AIModel = {
        model_id: response.data.model_id,
        owner: ownerAddress,
        config: modelConfig,
        training_result: response.data.training_result,
        created_at: Math.floor(Date.now() / 1000)
      };
      
      setAiModels(prev => [...prev, newModel]);
      
      // Refresh blockchain stats
      fetchBlockchainStats();
      
      return newModel;
    } catch (error) {
      console.error('Error training AI model:', error);
      return null;
    }
  }, [fetchBlockchainStats]);
  
  // Predict with AI model
  const predictWithAIModel = useCallback(async (
    modelId: string,
    inputData: number[]
  ) => {
    try {
      const response = await axios.post(`${API_URL}/ai/predict`, {
        model_id: modelId,
        input_data: inputData
      });
      
      return response.data;
    } catch (error) {
      console.error('Error making prediction with AI model:', error);
      return null;
    }
  }, []);
  
  // Optimize blockchain
  const optimizeBlockchain = useCallback(async (target: string) => {
    try {
      const response = await axios.post(`${API_URL}/optimization/optimize`, {
        optimization_target: target
      });
      
      // Refresh blockchain stats
      fetchBlockchainStats();
      
      return response.data;
    } catch (error) {
      console.error('Error optimizing blockchain:', error);
      return null;
    }
  }, [fetchBlockchainStats]);
  
  // Analyze blockchain security
  const analyzeBlockchainSecurity = useCallback(async () => {
    try {
      const response = await axios.post(`${API_URL}/security/analyze`, {});
      
      const securityAnalysis: SecurityAnalysis = response.data.security_analysis;
      setSecurityAnalysis(securityAnalysis);
      
      return securityAnalysis;
    } catch (error) {
      console.error('Error analyzing blockchain security:', error);
      return null;
    }
  }, []);
  
  // Fetch initial data
  useEffect(() => {
    fetchBlockchainStats();
    fetchBlocks();
    fetchPendingTransactions();
    fetchAccounts();
    fetchAIModels();
  }, [fetchBlockchainStats, fetchBlocks, fetchPendingTransactions, fetchAccounts, fetchAIModels]);
  
  const value = {
    // Blockchain data
    stats,
    blocks,
    pendingTransactions,
    accounts,
    aiModels,
    securityAnalysis,
    
    // Loading states
    loading,
    
    // Error states
    errors,
    
    // Actions
    fetchBlockchainStats,
    fetchBlocks,
    fetchPendingTransactions,
    fetchAccounts,
    fetchAIModels,
    
    createAccount,
    createTransaction,
    mineBlock,
    
    trainAIModel,
    predictWithAIModel,
    
    optimizeBlockchain,
    analyzeBlockchainSecurity,
    
    // Selected items
    selectedAccount,
    setSelectedAccount,
    selectedBlock,
    setSelectedBlock,
    selectedTransaction,
    setSelectedTransaction,
  };
  
  return <KontourContext.Provider value={value}>{children}</KontourContext.Provider>;
};