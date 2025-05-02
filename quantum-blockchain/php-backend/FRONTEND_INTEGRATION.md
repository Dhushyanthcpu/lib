# Frontend Integration Guide

This guide explains how to integrate the Quantum Blockchain PHP Backend with your frontend application.

## Authentication Integration

### User Registration

```typescript
// Example using axios
import axios from 'axios';

const API_URL = 'http://localhost:8001/api';

async function registerUser(userData) {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      password_confirmation: userData.passwordConfirmation,
      device_name: navigator.userAgent // Optional: Send device info
    });
    
    // Store token in localStorage or secure storage
    localStorage.setItem('token', response.data.data.access_token);
    
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw error;
  }
}
```

### User Login

```typescript
async function loginUser(credentials) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: credentials.email,
      password: credentials.password,
      device_name: navigator.userAgent // Optional: Send device info
    });
    
    // Store token in localStorage or secure storage
    localStorage.setItem('token', response.data.data.access_token);
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
}
```

### Setting Up Authenticated Requests

```typescript
// Create an axios instance with authentication header
const authAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include token
authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
authAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Redirect to login page or refresh token logic
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);
```

## Blockchain Data Integration

### Fetching Blockchain Stats

```typescript
async function fetchBlockchainStats() {
  try {
    const response = await authAxios.get('/blockchain/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching blockchain stats:', error);
    throw error;
  }
}
```

### Fetching Quantum Metrics

```typescript
async function fetchQuantumMetrics() {
  try {
    const response = await authAxios.get('/dashboard/quantum-metrics');
    return response.data.data.quantum_metrics;
  } catch (error) {
    console.error('Error fetching quantum metrics:', error);
    throw error;
  }
}
```

### Creating a Transaction

```typescript
async function createTransaction(transactionData) {
  try {
    const response = await authAxios.post('/transactions/create', {
      sender: transactionData.sender,
      recipient: transactionData.recipient,
      amount: transactionData.amount,
      transaction_type: transactionData.type || 'transfer',
      data: transactionData.data || {}
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}
```

### Mining a Block

```typescript
async function mineBlock(minerAddress) {
  try {
    const response = await authAxios.post('/mining/mine-block', {
      miner_address: minerAddress
    });
    
    return response.data;
  } catch (error) {
    console.error('Error mining block:', error);
    throw error;
  }
}
```

## Complete TypeScript Client

Here's a complete TypeScript client for integrating with the backend:

```typescript
// api-client.ts
import axios, { AxiosInstance } from 'axios';

export class QuantumBlockchainClient {
  private api: AxiosInstance;
  private apiUrl: string;
  
  constructor(apiUrl = 'http://localhost:8001/api') {
    this.apiUrl = apiUrl;
    this.api = axios.create({
      baseURL: apiUrl,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    this.setupInterceptors();
  }
  
  private setupInterceptors() {
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          localStorage.removeItem('token');
          
          // Emit an event that can be caught by the app
          window.dispatchEvent(new CustomEvent('auth:logout', {
            detail: { reason: 'token_expired' }
          }));
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  // Authentication methods
  async register(userData: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    device_name?: string;
  }) {
    const response = await this.api.post('/auth/register', userData);
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.access_token);
    }
    return response.data;
  }
  
  async login(credentials: {
    email: string;
    password: string;
    device_name?: string;
  }) {
    const response = await this.api.post('/auth/login', credentials);
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.access_token);
    }
    return response.data;
  }
  
  async logout() {
    const response = await this.api.post('/auth/logout');
    if (response.data.success) {
      localStorage.removeItem('token');
    }
    return response.data;
  }
  
  async logoutAll() {
    const response = await this.api.post('/auth/logout-all');
    if (response.data.success) {
      localStorage.removeItem('token');
    }
    return response.data;
  }
  
  async getUser() {
    const response = await this.api.get('/auth/user');
    return response.data.data.user;
  }
  
  async getSessions() {
    const response = await this.api.get('/auth/sessions');
    return response.data.data.sessions;
  }
  
  async revokeSession(tokenId: number) {
    const response = await this.api.delete(`/auth/sessions/${tokenId}`);
    return response.data;
  }
  
  async updateProfile(profileData: {
    name?: string;
    email?: string;
    preferences?: Record<string, any>;
  }) {
    const response = await this.api.put('/auth/profile', profileData);
    return response.data;
  }
  
  async changePassword(passwordData: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }) {
    const response = await this.api.post('/auth/change-password', passwordData);
    if (response.data.success) {
      localStorage.removeItem('token');
    }
    return response.data;
  }
  
  // Blockchain methods
  async getBlockchainStats() {
    const response = await this.api.get('/blockchain/stats');
    return response.data;
  }
  
  async getBlocks() {
    const response = await this.api.get('/blockchain/blocks');
    return response.data.blocks;
  }
  
  async getPendingTransactions() {
    const response = await this.api.get('/blockchain/pending-transactions');
    return response.data.transactions;
  }
  
  async getAccountBalance(address: string) {
    const response = await this.api.get(`/accounts/${address}/balance`);
    return response.data;
  }
  
  async createAccount() {
    const response = await this.api.post('/accounts/create');
    return response.data;
  }
  
  async getAllAccounts() {
    const response = await this.api.get('/accounts');
    return response.data;
  }
  
  async createTransaction(transactionData: {
    sender: string;
    recipient: string;
    amount: number;
    transaction_type?: string;
    data?: Record<string, any>;
  }) {
    const response = await this.api.post('/transactions/create', transactionData);
    return response.data;
  }
  
  async getTransactionByHash(hash: string) {
    const response = await this.api.get(`/transactions/${hash}`);
    return response.data;
  }
  
  async getTransactionsByUser(userId: string) {
    const response = await this.api.get(`/transactions/user/${userId}`);
    return response.data;
  }
  
  async mineBlock(minerAddress: string) {
    const response = await this.api.post('/mining/mine-block', {
      miner_address: minerAddress
    });
    return response.data;
  }
  
  async getMiningDifficulty() {
    const response = await this.api.get('/mining/difficulty');
    return response.data;
  }
  
  async getMiningRewards() {
    const response = await this.api.get('/mining/rewards');
    return response.data;
  }
  
  // Dashboard methods
  async getDashboardSummary() {
    const response = await this.api.get('/dashboard/summary');
    return response.data.data;
  }
  
  async getDashboardPerformance() {
    const response = await this.api.get('/dashboard/performance');
    return response.data.data;
  }
  
  async getDashboardRecentActivity() {
    const response = await this.api.get('/dashboard/recent-activity');
    return response.data.data;
  }
  
  async getDashboardMarketTrends() {
    const response = await this.api.get('/dashboard/market-trends');
    return response.data.data;
  }
  
  async getQuantumMetrics() {
    const response = await this.api.get('/dashboard/quantum-metrics');
    return response.data.data.quantum_metrics;
  }
  
  // AI methods
  async trainAIModel(modelData: {
    owner_address: string;
    model_config: Record<string, any>;
    training_data: any[];
  }) {
    const response = await this.api.post('/ai/train', modelData);
    return response.data;
  }
  
  async predictWithAIModel(predictionData: {
    model_id: string;
    input_data: number[];
  }) {
    const response = await this.api.post('/ai/predict', predictionData);
    return response.data;
  }
  
  async getAllAIModels() {
    const response = await this.api.get('/ai/models');
    return response.data;
  }
  
  async getAIModelById(modelId: string) {
    const response = await this.api.get(`/ai/models/${modelId}`);
    return response.data;
  }
  
  async evaluateAIModel(modelId: string, evaluationData: any) {
    const response = await this.api.post(`/ai/models/${modelId}/evaluate`, evaluationData);
    return response.data;
  }
  
  // Optimization methods
  async optimizeBlockchain(target: string) {
    const response = await this.api.post('/optimization/optimize', {
      optimization_target: target
    });
    return response.data;
  }
  
  async getOptimizationStrategies() {
    const response = await this.api.get('/optimization/strategies');
    return response.data;
  }
  
  async simulateOptimization(simulationData: any) {
    const response = await this.api.post('/optimization/simulate', simulationData);
    return response.data;
  }
  
  // Security methods
  async analyzeBlockchainSecurity() {
    const response = await this.api.post('/security/analyze');
    return response.data;
  }
  
  async getLatestSecurityUpdates() {
    const response = await this.api.get('/security/latest');
    return response.data;
  }
  
  async getVulnerabilities() {
    const response = await this.api.get('/security/vulnerabilities');
    return response.data;
  }
  
  async auditBlockchain() {
    const response = await this.api.post('/security/audit');
    return response.data;
  }
}

// Usage example:
// const client = new QuantumBlockchainClient('http://localhost:8001/api');
// client.login({ email: 'user@example.com', password: 'password123' })
//   .then(() => client.getBlockchainStats())
//   .then(stats => console.log(stats))
//   .catch(error => console.error(error));
```

## React Hook Example

```typescript
// useQuantumBlockchain.ts
import { useState, useEffect, useCallback } from 'react';
import { QuantumBlockchainClient } from './api-client';

export function useQuantumBlockchain() {
  const [client] = useState(() => new QuantumBlockchainClient());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (token) {
          const userData = await client.getUser();
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Authentication check failed:', err);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [client]);
  
  // Login function
  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      const response = await client.login(credentials);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client]);
  
  // Register function
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      const response = await client.register(userData);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client]);
  
  // Logout function
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await client.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Logout failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client]);
  
  return {
    client,
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout
  };
}
```

## Next.js Integration Example

```typescript
// pages/_app.tsx
import { useState } from 'react';
import { QuantumBlockchainClient } from '../lib/api-client';
import { BlockchainContext } from '../contexts/BlockchainContext';

function MyApp({ Component, pageProps }) {
  const [client] = useState(() => new QuantumBlockchainClient());
  
  return (
    <BlockchainContext.Provider value={{ client }}>
      <Component {...pageProps} />
    </BlockchainContext.Provider>
  );
}

export default MyApp;

// contexts/BlockchainContext.tsx
import { createContext, useContext } from 'react';
import { QuantumBlockchainClient } from '../lib/api-client';

interface BlockchainContextType {
  client: QuantumBlockchainClient;
}

export const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export function useBlockchain() {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
}

// pages/dashboard.tsx
import { useEffect, useState } from 'react';
import { useBlockchain } from '../contexts/BlockchainContext';

export default function Dashboard() {
  const { client } = useBlockchain();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const statsData = await client.getBlockchainStats();
        const quantumMetrics = await client.getQuantumMetrics();
        
        setStats({
          ...statsData,
          quantum_metrics: quantumMetrics
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [client]);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Quantum Blockchain Dashboard</h1>
      {stats && (
        <div>
          <h2>Blockchain Stats</h2>
          <p>Block Count: {stats.block_count}</p>
          <p>Transaction Count: {stats.transaction_count}</p>
          <p>Pending Transactions: {stats.pending_transaction_count}</p>
          
          <h2>Quantum Metrics</h2>
          <p>Mining Speedup: {stats.quantum_metrics.mining_speedup.mean}x</p>
          <p>Verification Accuracy: {stats.quantum_metrics.verification_accuracy.mean * 100}%</p>
          <p>AI Training Efficiency: {stats.quantum_metrics.ai_training_efficiency.mean}x</p>
        </div>
      )}
    </div>
  );
}
```

This guide should help you integrate the Quantum Blockchain PHP Backend with your frontend application. For more detailed information, refer to the API documentation.