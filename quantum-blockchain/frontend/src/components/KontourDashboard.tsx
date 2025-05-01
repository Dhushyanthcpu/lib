import React, { useState, useEffect, useRef } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import axios from 'axios';

interface BlockchainStats {
  block_count: number;
  transaction_count: number;
  pending_transaction_count: number;
  account_count: number;
  smart_contract_count: number;
  ai_model_count: number;
  avg_block_time: number;
  quantum_metrics: Record<string, any>;
}

interface Block {
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

interface Transaction {
  sender: string;
  recipient: string;
  amount: number;
  timestamp: number;
  type: string;
  data: Record<string, any>;
  status: string;
  hash: string;
}

interface Account {
  address: string;
  balance: number;
}

interface AIModel {
  model_id: string;
  owner: string;
  config: Record<string, any>;
  training_result: Record<string, any>;
  created_at: number;
}

interface SecurityAnalysis {
  vulnerability_score: number;
  qubits_needed_to_break: number;
  estimated_quantum_years_to_break: number;
  recommendations: string[];
}

const API_URL = 'http://localhost:8001';

export const KontourDashboard: React.FC = () => {
  // State for blockchain data
  const [stats, setStats] = useState<BlockchainStats | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [aiModels, setAiModels] = useState<AIModel[]>([]);
  const [securityAnalysis, setSecurityAnalysis] = useState<SecurityAnalysis | null>(null);
  
  // State for user actions
  const [isCreatingAccount, setIsCreatingAccount] = useState<boolean>(false);
  const [isCreatingTransaction, setIsCreatingTransaction] = useState<boolean>(false);
  const [isMining, setIsMining] = useState<boolean>(false);
  const [isTrainingAI, setIsTrainingAI] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [isAnalyzingSecurity, setIsAnalyzingSecurity] = useState<boolean>(false);
  
  // State for form inputs
  const [transactionForm, setTransactionForm] = useState({
    sender: '',
    recipient: '',
    amount: 0,
    type: 'transfer'
  });
  
  const [aiTrainingForm, setAiTrainingForm] = useState({
    owner_address: '',
    num_qubits: 8,
    layers: 2,
    learning_rate: 0.01,
    epochs: 50
  });
  
  const [optimizationTarget, setOptimizationTarget] = useState<string>('transaction_routing');
  
  // State for error handling
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Canvas refs for visualizations
  const blockchainCanvasRef = useRef<HTMLCanvasElement>(null);
  const quantumMetricsCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Web3 integration
  const { connected, account, connectWallet } = useWeb3();
  
  // Fetch blockchain data on component mount
  useEffect(() => {
    fetchBlockchainStats();
    fetchBlockchain();
    fetchPendingTransactions();
    fetchAccounts();
  }, []);
  
  // Update visualizations when data changes
  useEffect(() => {
    if (stats && blockchainCanvasRef.current) {
      drawBlockchainVisualization();
    }
  }, [stats, blocks]);
  
  useEffect(() => {
    if (stats && quantumMetricsCanvasRef.current) {
      drawQuantumMetricsVisualization();
    }
  }, [stats]);
  
  // Set default sender when account is connected
  useEffect(() => {
    if (connected && account) {
      setTransactionForm(prev => ({ ...prev, sender: account }));
      setAiTrainingForm(prev => ({ ...prev, owner_address: account }));
    }
  }, [connected, account]);
  
  const fetchBlockchainStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/blockchain/stats`);
      setStats(response.data);
    } catch (err) {
      setError('Failed to fetch blockchain stats');
      console.error(err);
    }
  };
  
  const fetchBlockchain = async () => {
    try {
      const response = await axios.get(`${API_URL}/blockchain/blocks`);
      setBlocks(response.data.blocks);
    } catch (err) {
      setError('Failed to fetch blockchain');
      console.error(err);
    }
  };
  
  const fetchPendingTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/blockchain/pending-transactions`);
      setPendingTransactions(response.data.transactions);
    } catch (err) {
      setError('Failed to fetch pending transactions');
      console.error(err);
    }
  };
  
  const fetchAccounts = async () => {
    try {
      // In a real implementation, this would fetch all accounts
      // Here we'll use the accounts from the blockchain data
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
      
      if (accountsData.length > 0 && !selectedAccount) {
        setSelectedAccount(accountsData[0].address);
        setTransactionForm(prev => ({ ...prev, sender: accountsData[0].address }));
        setAiTrainingForm(prev => ({ ...prev, owner_address: accountsData[0].address }));
      }
    } catch (err) {
      setError('Failed to fetch accounts');
      console.error(err);
    }
  };
  
  const createAccount = async () => {
    setError(null);
    setSuccess(null);
    setIsCreatingAccount(true);
    
    try {
      const response = await axios.post(`${API_URL}/accounts/create`, {});
      
      // Add new account to accounts list
      const newAddress = response.data.address;
      setAccounts(prev => [...prev, { address: newAddress, balance: 0 }]);
      
      setSuccess(`Account created: ${newAddress}`);
      
      // Refresh blockchain stats
      fetchBlockchainStats();
    } catch (err) {
      setError('Failed to create account');
      console.error(err);
    } finally {
      setIsCreatingAccount(false);
    }
  };
  
  const createTransaction = async () => {
    setError(null);
    setSuccess(null);
    setIsCreatingTransaction(true);
    
    try {
      const response = await axios.post(`${API_URL}/transactions/create`, {
        sender: transactionForm.sender,
        recipient: transactionForm.recipient,
        amount: transactionForm.amount,
        transaction_type: transactionForm.type,
        data: {}
      });
      
      setSuccess(`Transaction created: ${response.data.hash}`);
      
      // Refresh pending transactions
      fetchPendingTransactions();
      
      // Reset form
      setTransactionForm(prev => ({
        ...prev,
        recipient: '',
        amount: 0
      }));
    } catch (err) {
      setError('Failed to create transaction');
      console.error(err);
    } finally {
      setIsCreatingTransaction(false);
    }
  };
  
  const mineBlock = async () => {
    setError(null);
    setSuccess(null);
    setIsMining(true);
    
    try {
      const response = await axios.post(`${API_URL}/mining/mine-block`, {
        miner_address: selectedAccount
      });
      
      setSuccess(`Block mined: ${response.data.hash}`);
      
      // Refresh blockchain data
      fetchBlockchainStats();
      fetchBlockchain();
      fetchPendingTransactions();
      fetchAccounts();
    } catch (err) {
      setError('Failed to mine block');
      console.error(err);
    } finally {
      setIsMining(false);
    }
  };
  
  const trainAIModel = async () => {
    setError(null);
    setSuccess(null);
    setIsTrainingAI(true);
    
    try {
      // Generate simulated training data
      const trainingData = [];
      for (let i = 0; i < 100; i++) {
        trainingData.push({
          features: Array.from({ length: aiTrainingForm.num_qubits }, () => Math.random() * 2 - 1),
          label: Math.random() > 0.5 ? 1 : 0
        });
      }
      
      const response = await axios.post(`${API_URL}/ai/train`, {
        owner_address: aiTrainingForm.owner_address,
        model_config: {
          num_qubits: aiTrainingForm.num_qubits,
          layers: aiTrainingForm.layers,
          learning_rate: aiTrainingForm.learning_rate,
          epochs: aiTrainingForm.epochs
        },
        training_data: trainingData
      });
      
      setSuccess(`AI model trained: ${response.data.model_id}`);
      
      // Add model to AI models list
      setAiModels(prev => [...prev, {
        model_id: response.data.model_id,
        owner: aiTrainingForm.owner_address,
        config: response.data.training_result,
        training_result: response.data.training_result,
        created_at: Math.floor(Date.now() / 1000)
      }]);
      
      // Refresh blockchain stats
      fetchBlockchainStats();
    } catch (err) {
      setError('Failed to train AI model');
      console.error(err);
    } finally {
      setIsTrainingAI(false);
    }
  };
  
  const optimizeBlockchain = async () => {
    setError(null);
    setSuccess(null);
    setIsOptimizing(true);
    
    try {
      const response = await axios.post(`${API_URL}/optimization/optimize`, {
        optimization_target: optimizationTarget
      });
      
      setSuccess(`Blockchain optimized for ${optimizationTarget}`);
      
      // Refresh blockchain stats
      fetchBlockchainStats();
    } catch (err) {
      setError('Failed to optimize blockchain');
      console.error(err);
    } finally {
      setIsOptimizing(false);
    }
  };
  
  const analyzeBlockchainSecurity = async () => {
    setError(null);
    setSuccess(null);
    setIsAnalyzingSecurity(true);
    
    try {
      const response = await axios.post(`${API_URL}/security/analyze`, {});
      
      setSecurityAnalysis(response.data.security_analysis);
      setSuccess('Security analysis completed');
    } catch (err) {
      setError('Failed to analyze blockchain security');
      console.error(err);
    } finally {
      setIsAnalyzingSecurity(false);
    }
  };
  
  const drawBlockchainVisualization = () => {
    if (!blockchainCanvasRef.current || !stats || blocks.length === 0) return;
    
    const canvas = blockchainCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up dimensions
    const padding = 40;
    const width = canvas.width - 2 * padding;
    const height = canvas.height - 2 * padding;
    
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Draw blocks as rectangles
    const blockWidth = Math.min(width / blocks.length, 30);
    const maxTransactions = Math.max(...blocks.map(block => block.transactions.length), 1);
    
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const x = padding + i * (width / blocks.length);
      const blockHeight = (block.transactions.length / maxTransactions) * height;
      const y = canvas.height - padding - blockHeight;
      
      // Draw block
      ctx.fillStyle = block.quantum_enhanced ? 'rgba(64, 128, 255, 0.7)' : 'rgba(128, 128, 128, 0.7)';
      ctx.fillRect(x, y, blockWidth, blockHeight);
      
      // Draw block index
      if (i % Math.max(1, Math.floor(blocks.length / 10)) === 0) {
        ctx.fillStyle = 'black';
        ctx.font = '10px Arial';
        ctx.fillText(block.index.toString(), x, canvas.height - padding + 15);
      }
    }
    
    // Draw legend
    ctx.font = '12px Arial';
    ctx.fillStyle = 'rgba(64, 128, 255, 0.7)';
    ctx.fillRect(padding, padding, 15, 15);
    ctx.fillStyle = 'black';
    ctx.fillText('Quantum Enhanced Blocks', padding + 20, padding + 12);
    
    // Draw axes labels
    ctx.fillStyle = 'black';
    ctx.fillText('Block Index', canvas.width / 2, canvas.height - 10);
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Transactions', 0, 0);
    ctx.restore();
  };
  
  const drawQuantumMetricsVisualization = () => {
    if (!quantumMetricsCanvasRef.current || !stats) return;
    
    const canvas = quantumMetricsCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up dimensions
    const padding = 40;
    const width = canvas.width - 2 * padding;
    const height = canvas.height - 2 * padding;
    
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Get quantum metrics
    const metrics = stats.quantum_metrics;
    const categories = Object.keys(metrics);
    
    // Draw bars for each metric
    const barWidth = width / categories.length;
    
    categories.forEach((category, index) => {
      const metric = metrics[category];
      const x = padding + index * barWidth;
      
      // Draw bar for mean value
      const meanHeight = Math.min(metric.mean * height / 10, height);
      ctx.fillStyle = 'rgba(64, 128, 255, 0.7)';
      ctx.fillRect(x + barWidth * 0.2, canvas.height - padding - meanHeight, barWidth * 0.6, meanHeight);
      
      // Draw label
      ctx.fillStyle = 'black';
      ctx.font = '10px Arial';
      ctx.fillText(category.replace(/_/g, ' '), x + barWidth * 0.5 - 30, canvas.height - padding + 15);
      ctx.fillText(metric.mean.toFixed(2) + 'x', x + barWidth * 0.5 - 10, canvas.height - padding - meanHeight - 5);
    });
    
    // Draw axes labels
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.fillText('Quantum Performance Metrics', canvas.width / 2 - 80, canvas.height - 10);
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Speedup Factor', 0, 0);
    ctx.restore();
  };
  
  return (
    <div className="kontour-dashboard">
      <h2>Kontour Coin Blockchain Dashboard</h2>
      
      <div className="dashboard-container">
        <div className="control-panel">
          <h3>Blockchain Controls</h3>
          
          <div className="account-section">
            <h4>Accounts</h4>
            <select 
              value={selectedAccount} 
              onChange={(e) => {
                setSelectedAccount(e.target.value);
                setTransactionForm(prev => ({ ...prev, sender: e.target.value }));
                setAiTrainingForm(prev => ({ ...prev, owner_address: e.target.value }));
              }}
            >
              {accounts.map(account => (
                <option key={account.address} value={account.address}>
                  {account.address.substring(0, 8)}... ({account.balance} KTR)
                </option>
              ))}
            </select>
            
            <button 
              onClick={createAccount}
              disabled={isCreatingAccount}
              className="action-button"
            >
              {isCreatingAccount ? 'Creating...' : 'Create New Account'}
            </button>
          </div>
          
          <div className="transaction-section">
            <h4>Create Transaction</h4>
            <div className="form-group">
              <label>From:</label>
              <select 
                value={transactionForm.sender}
                onChange={(e) => setTransactionForm(prev => ({ ...prev, sender: e.target.value }))}
                disabled={isCreatingTransaction}
              >
                {accounts.map(account => (
                  <option key={account.address} value={account.address}>
                    {account.address.substring(0, 8)}... ({account.balance} KTR)
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>To:</label>
              <select 
                value={transactionForm.recipient}
                onChange={(e) => setTransactionForm(prev => ({ ...prev, recipient: e.target.value }))}
                disabled={isCreatingTransaction}
              >
                <option value="">Select recipient</option>
                {accounts.map(account => (
                  <option key={account.address} value={account.address}>
                    {account.address.substring(0, 8)}... ({account.balance} KTR)
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Amount:</label>
              <input 
                type="number"
                value={transactionForm.amount}
                onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                disabled={isCreatingTransaction}
                min={0}
                step={0.1}
              />
            </div>
            
            <div className="form-group">
              <label>Type:</label>
              <select 
                value={transactionForm.type}
                onChange={(e) => setTransactionForm(prev => ({ ...prev, type: e.target.value }))}
                disabled={isCreatingTransaction}
              >
                <option value="transfer">Transfer</option>
                <option value="smart_contract">Smart Contract</option>
                <option value="ai_training">AI Training</option>
                <option value="quantum_computing">Quantum Computing</option>
              </select>
            </div>
            
            <button 
              onClick={createTransaction}
              disabled={isCreatingTransaction || !transactionForm.sender || !transactionForm.recipient || transactionForm.amount <= 0}
              className="action-button"
            >
              {isCreatingTransaction ? 'Creating...' : 'Create Transaction'}
            </button>
          </div>
          
          <div className="mining-section">
            <h4>Mining</h4>
            <p>Pending Transactions: {pendingTransactions.length}</p>
            <button 
              onClick={mineBlock}
              disabled={isMining || pendingTransactions.length === 0}
              className="action-button"
            >
              {isMining ? 'Mining...' : 'Mine Block with Quantum Computing'}
            </button>
          </div>
          
          <div className="web3-integration">
            <h4>Web3 Integration</h4>
            {!connected ? (
              <button 
                onClick={connectWallet}
                className="connect-wallet-button"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="connected-wallet">
                <p>Connected: {account?.substring(0, 6)}...{account?.substring(account!.length - 4)}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="visualization-panel">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {success && (
            <div className="success-message">
              {success}
            </div>
          )}
          
          <div className="stats-section">
            <h3>Blockchain Statistics</h3>
            {stats && (
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Blocks:</span>
                  <span className="stat-value">{stats.block_count}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Transactions:</span>
                  <span className="stat-value">{stats.transaction_count}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Pending:</span>
                  <span className="stat-value">{stats.pending_transaction_count}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Accounts:</span>
                  <span className="stat-value">{stats.account_count}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Smart Contracts:</span>
                  <span className="stat-value">{stats.smart_contract_count}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">AI Models:</span>
                  <span className="stat-value">{stats.ai_model_count}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Avg Block Time:</span>
                  <span className="stat-value">{stats.avg_block_time.toFixed(2)}s</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="visualization-container">
            <h3>Blockchain Visualization</h3>
            <canvas 
              ref={blockchainCanvasRef} 
              width={600} 
              height={300} 
              className="visualization-canvas"
            ></canvas>
          </div>
          
          <div className="visualization-container">
            <h3>Quantum Performance Metrics</h3>
            <canvas 
              ref={quantumMetricsCanvasRef} 
              width={600} 
              height={300} 
              className="visualization-canvas"
            ></canvas>
          </div>
          
          <div className="tabs-container">
            <div className="tabs">
              <button className="tab-button active">Quantum AI</button>
              <button className="tab-button">Optimization</button>
              <button className="tab-button">Security</button>
            </div>
            
            <div className="tab-content">
              <div className="ai-training-section">
                <h3>Quantum AI Training</h3>
                <div className="form-group">
                  <label>Owner Address:</label>
                  <select 
                    value={aiTrainingForm.owner_address}
                    onChange={(e) => setAiTrainingForm(prev => ({ ...prev, owner_address: e.target.value }))}
                    disabled={isTrainingAI}
                  >
                    {accounts.map(account => (
                      <option key={account.address} value={account.address}>
                        {account.address.substring(0, 8)}... ({account.balance} KTR)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Number of Qubits:</label>
                  <input 
                    type="number"
                    value={aiTrainingForm.num_qubits}
                    onChange={(e) => setAiTrainingForm(prev => ({ ...prev, num_qubits: parseInt(e.target.value) }))}
                    disabled={isTrainingAI}
                    min={2}
                    max={20}
                  />
                </div>
                
                <div className="form-group">
                  <label>Layers:</label>
                  <input 
                    type="number"
                    value={aiTrainingForm.layers}
                    onChange={(e) => setAiTrainingForm(prev => ({ ...prev, layers: parseInt(e.target.value) }))}
                    disabled={isTrainingAI}
                    min={1}
                    max={10}
                  />
                </div>
                
                <div className="form-group">
                  <label>Learning Rate:</label>
                  <input 
                    type="number"
                    value={aiTrainingForm.learning_rate}
                    onChange={(e) => setAiTrainingForm(prev => ({ ...prev, learning_rate: parseFloat(e.target.value) }))}
                    disabled={isTrainingAI}
                    min={0.001}
                    max={0.1}
                    step={0.001}
                  />
                </div>
                
                <div className="form-group">
                  <label>Epochs:</label>
                  <input 
                    type="number"
                    value={aiTrainingForm.epochs}
                    onChange={(e) => setAiTrainingForm(prev => ({ ...prev, epochs: parseInt(e.target.value) }))}
                    disabled={isTrainingAI}
                    min={10}
                    max={1000}
                    step={10}
                  />
                </div>
                
                <button 
                  onClick={trainAIModel}
                  disabled={isTrainingAI || !aiTrainingForm.owner_address}
                  className="action-button"
                >
                  {isTrainingAI ? 'Training...' : 'Train Quantum AI Model'}
                </button>
                
                <div className="ai-models-list">
                  <h4>Trained Models</h4>
                  {aiModels.length === 0 ? (
                    <p>No models trained yet</p>
                  ) : (
                    <table className="models-table">
                      <thead>
                        <tr>
                          <th>Model ID</th>
                          <th>Owner</th>
                          <th>Accuracy</th>
                          <th>Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aiModels.map(model => (
                          <tr key={model.model_id}>
                            <td>{model.model_id.substring(0, 8)}...</td>
                            <td>{model.owner.substring(0, 8)}...</td>
                            <td>{(model.training_result.final_accuracy * 100).toFixed(2)}%</td>
                            <td>{new Date(model.created_at * 1000).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
            
            <div className="optimization-section" style={{ display: 'none' }}>
              <h3>Quantum Optimization</h3>
              <div className="form-group">
                <label>Optimization Target:</label>
                <select 
                  value={optimizationTarget}
                  onChange={(e) => setOptimizationTarget(e.target.value)}
                  disabled={isOptimizing}
                >
                  <option value="transaction_routing">Transaction Routing</option>
                  <option value="block_validation">Block Validation</option>
                </select>
              </div>
              
              <button 
                onClick={optimizeBlockchain}
                disabled={isOptimizing}
                className="action-button"
              >
                {isOptimizing ? 'Optimizing...' : 'Run Quantum Optimization'}
              </button>
            </div>
            
            <div className="security-section" style={{ display: 'none' }}>
              <h3>Quantum Security Analysis</h3>
              <button 
                onClick={analyzeBlockchainSecurity}
                disabled={isAnalyzingSecurity}
                className="action-button"
              >
                {isAnalyzingSecurity ? 'Analyzing...' : 'Analyze Blockchain Security'}
              </button>
              
              {securityAnalysis && (
                <div className="security-results">
                  <h4>Security Analysis Results</h4>
                  <div className="security-metric">
                    <span className="security-label">Vulnerability Score:</span>
                    <span className={`security-value ${securityAnalysis.vulnerability_score > 7 ? 'high' : securityAnalysis.vulnerability_score > 4 ? 'medium' : 'low'}`}>
                      {securityAnalysis.vulnerability_score.toFixed(2)}/10
                    </span>
                  </div>
                  
                  <div className="security-metric">
                    <span className="security-label">Qubits Needed to Break:</span>
                    <span className="security-value">{securityAnalysis.qubits_needed_to_break}</span>
                  </div>
                  
                  <div className="security-metric">
                    <span className="security-label">Estimated Years to Break:</span>
                    <span className="security-value">{securityAnalysis.estimated_quantum_years_to_break.toFixed(2)} years</span>
                  </div>
                  
                  <h4>Recommendations</h4>
                  <ul className="recommendations-list">
                    {securityAnalysis.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .kontour-dashboard {
          padding: 20px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 30px;
        }
        
        h2 {
          color: #333;
          margin-bottom: 20px;
        }
        
        h3 {
          color: #555;
          margin: 15px 0;
        }
        
        h4 {
          color: #666;
          margin: 12px 0;
        }
        
        .dashboard-container {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .control-panel {
          flex: 1;
          min-width: 300px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 5px;
        }
        
        .visualization-panel {
          flex: 2;
          min-width: 500px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 5px;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        
        select, input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .action-button {
          background-color: #4285F4;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          border: none;
          font-weight: 500;
          width: 100%;
          margin-top: 10px;
        }
        
        .action-button:hover {
          background-color: #3367D6;
        }
        
        .action-button:disabled {
          background-color: #A4C2F4;
          cursor: not-allowed;
        }
        
        .connect-wallet-button {
          background-color: #34A853;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          border: none;
          font-weight: 500;
          width: 100%;
        }
        
        .connect-wallet-button:hover {
          background-color: #2E8B57;
        }
        
        .error-message {
          color: #EA4335;
          margin: 10px 0;
          padding: 10px;
          background-color: #FDEDEC;
          border-radius: 4px;
        }
        
        .success-message {
          color: #34A853;
          margin: 10px 0;
          padding: 10px;
          background-color: #E8F5E9;
          border-radius: 4px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 10px;
          margin: 15px 0;
        }
        
        .stat-item {
          padding: 10px;
          background-color: white;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .stat-label {
          font-weight: 500;
          color: #555;
          display: block;
          margin-bottom: 5px;
        }
        
        .stat-value {
          font-size: 18px;
          color: #333;
          font-weight: 500;
        }
        
        .visualization-container {
          margin: 20px 0;
          background-color: white;
          border-radius: 5px;
          padding: 15px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .visualization-canvas {
          width: 100%;
          height: auto;
          background-color: white;
          border: 1px solid #eee;
          border-radius: 4px;
        }
        
        .tabs-container {
          margin-top: 20px;
        }
        
        .tabs {
          display: flex;
          border-bottom: 1px solid #ddd;
        }
        
        .tab-button {
          padding: 10px 20px;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #555;
        }
        
        .tab-button.active {
          color: #4285F4;
          border-bottom-color: #4285F4;
        }
        
        .tab-content {
          padding: 15px;
          background-color: white;
          border-radius: 0 0 5px 5px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .ai-models-list {
          margin-top: 20px;
        }
        
        .models-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        
        .models-table th, .models-table td {
          padding: 8px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        
        .models-table th {
          background-color: #f8f9fa;
          font-weight: 500;
        }
        
        .security-results {
          margin-top: 20px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 5px;
        }
        
        .security-metric {
          margin-bottom: 10px;
        }
        
        .security-label {
          font-weight: 500;
          margin-right: 10px;
        }
        
        .security-value {
          font-weight: 500;
        }
        
        .security-value.high {
          color: #EA4335;
        }
        
        .security-value.medium {
          color: #FBBC05;
        }
        
        .security-value.low {
          color: #34A853;
        }
        
        .recommendations-list {
          margin-top: 10px;
          padding-left: 20px;
        }
        
        .recommendations-list li {
          margin-bottom: 5px;
        }
        
        .account-section, .transaction-section, .mining-section, .web3-integration {
          margin-bottom: 20px;
          padding: 15px;
          background-color: white;
          border-radius: 5px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};