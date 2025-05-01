import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  QuantumBridge, 
  TransactionData, 
  WorkflowConfig, 
  WorkflowStats 
} from '../utils/quantum_bridge';

// Add a function to run the complete workflow
const runCompleteWorkflow = async (apiUrl: string) => {
  try {
    // Initialize the quantum bridge
    const bridge = new QuantumBridge(apiUrl);
    
    // Step 1: Start the workflow
    const workflowConfig: WorkflowConfig = {
      difficulty: 4,
      auto_mine: true,
      verification_algorithm: 'bezier'
    };
    const startResult = await bridge.startWorkflow(workflowConfig);
    console.log('Workflow started:', startResult);
    
    // Step 2: Verify a transaction
    const transactionData: TransactionData = {
      sender: '0x1234567890123456789012345678901234567890',
      recipient: '0x0987654321098765432109876543210987654321',
      amount: 100,
      fee: 10,
      timestamp: Math.floor(Date.now() / 1000),
      balance: 1000,
      expectedHash: '12345678'.repeat(8)
    };
    const verifyResult = await bridge.verifyTransaction(transactionData);
    console.log('Transaction verification result:', verifyResult);
    
    // Step 3: Mine a block
    const mineResult = await bridge.mineBlock(
      `Block data ${Date.now()}`,
      4,
      100
    );
    console.log('Block mining result:', mineResult);
    
    return {
      workflow: startResult,
      transaction: verifyResult,
      mining: mineResult
    };
  } catch (error) {
    console.error('Complete workflow execution failed:', error);
    throw error;
  }
};

const WorkflowManager: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<WorkflowStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState('http://localhost:8000');
  const [statusInterval, setStatusInterval] = useState<NodeJS.Timeout | null>(null);
  const [completeWorkflowResult, setCompleteWorkflowResult] = useState<any>(null);

  const startWorkflow = async () => {
    setLoading(true);
    setError(null);
    try {
      const bridge = new QuantumBridge(apiUrl);
      const config: WorkflowConfig = {
        difficulty: 4,
        auto_mine: true,
        verification_algorithm: 'bezier'
      };
      
      const result = await bridge.startWorkflow(config);
      if (result) {
        setIsRunning(true);
        startStatusPolling();
      }
    } catch (err) {
      setError('Failed to start workflow');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stopWorkflow = async () => {
    setLoading(true);
    setError(null);
    try {
      const bridge = new QuantumBridge(apiUrl);
      const result = await bridge.stopWorkflow();
      
      if (result) {
        setIsRunning(false);
        stopStatusPolling();
      }
    } catch (err) {
      setError('Failed to stop workflow');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const bridge = new QuantumBridge(apiUrl);
      const stats = await bridge.getWorkflowStats();
      setStats(stats);
    } catch (err) {
      console.error('Failed to fetch workflow stats:', err);
    }
  };

  const startStatusPolling = () => {
    if (statusInterval) {
      clearInterval(statusInterval);
    }
    const interval = setInterval(fetchStats, 5000);
    setStatusInterval(interval);
  };

  const stopStatusPolling = () => {
    if (statusInterval) {
      clearInterval(statusInterval);
      setStatusInterval(null);
    }
  };

  const verifyTransaction = async () => {
    setLoading(true);
    setError(null);
    try {
      const bridge = new QuantumBridge(apiUrl);
      const data: TransactionData = {
        sender: '0x1234567890123456789012345678901234567890',
        recipient: '0x0987654321098765432109876543210987654321',
        amount: 100,
        fee: 10,
        timestamp: Math.floor(Date.now() / 1000),
        balance: 1000,
        expectedHash: '12345678'.repeat(8)
      };
      const result = await bridge.verifyTransaction(data);
      console.log('Transaction verification result:', result);
      alert(`Transaction verified: ${result.valid ? 'Success' : 'Failed'}`);
    } catch (err) {
      setError('Failed to verify transaction');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const mineBlock = async () => {
    setLoading(true);
    setError(null);
    try {
      const bridge = new QuantumBridge(apiUrl);
      const result = await bridge.mineBlock(
        `Block data ${Date.now()}`,
        4,
        100
      );
      
      console.log('Mining result:', result);
      alert(`Block mined with nonce: ${result.nonce}`);
    } catch (err) {
      setError('Failed to mine block');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const executeCompleteWorkflow = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await runCompleteWorkflow(apiUrl);
      setCompleteWorkflowResult(result);
      alert('Complete workflow executed successfully!');
    } catch (err) {
      setError('Failed to execute complete workflow');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if workflow is running on component mount
    const checkStatus = async () => {
      try {
        const response = await axios.get(`${apiUrl}/workflow/status`);
        setIsRunning(response.data.running);
        if (response.data.running) {
          startStatusPolling();
        }
      } catch (err) {
        console.error('Failed to check workflow status:', err);
      }
    };
    
    checkStatus();
    
    return () => {
      stopStatusPolling();
    };
  }, []);

  return (
    <div className="workflow-manager">
      <h2>Quantum Blockchain Workflow Manager</h2>
      
      <div className="controls">
        <button 
          onClick={startWorkflow} 
          disabled={isRunning || loading}
        >
          Start Workflow
        </button>
        
        <button 
          onClick={stopWorkflow} 
          disabled={!isRunning || loading}
        >
          Stop Workflow
        </button>
        
        <button 
          onClick={verifyTransaction} 
          disabled={loading}
        >
          Verify Transaction
        </button>
        
        <button 
          onClick={mineBlock} 
          disabled={loading}
        >
          Mine Block
        </button>
        
        <button 
          onClick={executeCompleteWorkflow} 
          disabled={loading}
        >
          Run Complete Workflow
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {stats && (
        <div className="stats">
          <h3>Workflow Statistics</h3>
          <ul>
            <li>Transactions Processed: {stats.transactions_processed}</li>
            <li>Blocks Mined: {stats.blocks_mined}</li>
            <li>Contours Verified: {stats.contours_verified}</li>
            <li>Sync Errors: {stats.sync_errors}</li>
          </ul>
        </div>
      )}
      
      <div className="status">
        Workflow Status: {isRunning ? 'Running' : 'Stopped'}
      </div>

      {completeWorkflowResult && (
        <div className="complete-workflow-results">
          <h3>Complete Workflow Results</h3>
          <pre>{JSON.stringify(completeWorkflowResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default WorkflowManager;



