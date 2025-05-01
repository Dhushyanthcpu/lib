import React, { useState, useEffect } from 'react';
import { useKontour } from '../hooks/useKontour';
import { useWeb3 } from '../hooks/useWeb3';
import { Account, AIModel, PredictionResult } from '../types';

const AILabPage: React.FC = () => {
  const { aiModels, fetchAIModels, trainAIModel, predictWithAIModel, accounts, fetchAccounts } = useKontour();
  const { connected, connectWallet } = useWeb3();
  
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [numQubits, setNumQubits] = useState(8);
  const [layers, setLayers] = useState(2);
  const [inputData, setInputData] = useState('');
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  
  useEffect(() => {
    if (connected) {
      fetchAIModels();
      fetchAccounts();
    }
  }, [connected, fetchAIModels, fetchAccounts]);
  
  const handleTrainModel = async () => {
    if (!selectedAccount) {
      alert('Please select an account');
      return;
    }
    
    setIsTraining(true);
    
    try {
      // Generate random training data
      const trainingData = [];
      for (let i = 0; i < 10; i++) {
        const input = Array.from({ length: 5 }, () => Math.random() * 10);
        const output = [Math.random()];
        trainingData.push({ input, output });
      }
      
      const modelConfig = {
        num_qubits: numQubits,
        layers: layers,
      };
      
      const newModel = await trainAIModel(selectedAccount, modelConfig, trainingData);
      
      if (newModel) {
        alert(`Model trained successfully: ${newModel.model_id}`);
        fetchAIModels();
        setSelectedModel(newModel.model_id);
      } else {
        alert('Failed to train model');
      }
    } catch (error) {
      console.error('Error training model:', error);
      alert('Failed to train model');
    } finally {
      setIsTraining(false);
    }
  };
  
  const handlePredict = async () => {
    if (!selectedModel) {
      alert('Please select a model');
      return;
    }
    
    if (!inputData) {
      alert('Please enter input data');
      return;
    }
    
    setIsPredicting(true);
    setPredictionResult(null);
    
    try {
      // Parse input data
      const parsedInputData = inputData.split(',').map(val => parseFloat(val.trim()));
      
      if (parsedInputData.some(isNaN)) {
        alert('Invalid input data. Please enter comma-separated numbers.');
        setIsPredicting(false);
        return;
      }
      
      const result = await predictWithAIModel(selectedModel, parsedInputData);
      setPredictionResult(result);
    } catch (error) {
      console.error('Error making prediction:', error);
      alert('Failed to make prediction');
    } finally {
      setIsPredicting(false);
    }
  };
  
  return (
    <div className="container">
      <h1>AI Lab</h1>
      
      {!connected ? (
        <div className="connect-wallet">
          <p>Connect your wallet to access AI Lab features</p>
          <button className="btn btn-primary" onClick={connectWallet}>
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="ai-lab-content">
          <div className="ai-lab-section">
            <h2>Train New Model</h2>
            
            <div className="form-group">
              <label htmlFor="account">Owner Account</label>
              <select
                id="account"
                className="form-control"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
              >
                <option value="">Select account</option>
                {accounts.map((account) => (
                  <option key={account.address} value={account.address}>
                    {account.address} ({account.balance})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="qubits">Number of Qubits</label>
              <input
                type="range"
                id="qubits"
                className="form-control-range"
                min="4"
                max="20"
                value={numQubits}
                onChange={(e) => setNumQubits(parseInt(e.target.value))}
              />
              <span>{numQubits} qubits</span>
            </div>
            
            <div className="form-group">
              <label htmlFor="layers">Number of Layers</label>
              <input
                type="range"
                id="layers"
                className="form-control-range"
                min="1"
                max="5"
                value={layers}
                onChange={(e) => setLayers(parseInt(e.target.value))}
              />
              <span>{layers} layers</span>
            </div>
            
            <button
              className="btn btn-primary"
              onClick={handleTrainModel}
              disabled={isTraining || !selectedAccount}
            >
              {isTraining ? 'Training...' : 'Train Model'}
            </button>
          </div>
          
          <div className="ai-lab-section">
            <h2>Make Predictions</h2>
            
            <div className="form-group">
              <label htmlFor="model">Select Model</label>
              <select
                id="model"
                className="form-control"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                <option value="">Select model</option>
                {aiModels.map((model) => (
                  <option key={model.model_id} value={model.model_id}>
                    {model.model_id} (Owner: {model.owner.substring(0, 10)}...)
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="input-data">Input Data (comma-separated numbers)</label>
              <input
                type="text"
                id="input-data"
                className="form-control"
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                placeholder="e.g., 1.0, 2.5, 3.7, 4.2, 5.0"
              />
            </div>
            
            <button
              className="btn btn-primary"
              onClick={handlePredict}
              disabled={isPredicting || !selectedModel || !inputData}
            >
              {isPredicting ? 'Predicting...' : 'Make Prediction'}
            </button>
            
            {predictionResult && (
              <div className="prediction-result">
                <h3>Prediction Result</h3>
                <div className="result-card">
                  <div className="result-item">
                    <strong>Output:</strong>
                    <pre>{JSON.stringify(predictionResult.output, null, 2)}</pre>
                  </div>
                  <div className="result-item">
                    <strong>Confidence:</strong>
                    <span>{(predictionResult.confidence * 100).toFixed(2)}%</span>
                  </div>
                  <div className="result-item">
                    <strong>Processing Time:</strong>
                    <span>{predictionResult.processing_time.toFixed(2)}s</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="ai-lab-section">
            <h2>AI Models</h2>
            
            {aiModels.length > 0 ? (
              <table className="models-table">
                <thead>
                  <tr>
                    <th>Model ID</th>
                    <th>Owner</th>
                    <th>Qubits</th>
                    <th>Layers</th>
                    <th>Accuracy</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {aiModels.map((model) => (
                    <tr key={model.model_id}>
                      <td>{model.model_id.substring(0, 10)}...</td>
                      <td>{model.owner.substring(0, 10)}...</td>
                      <td>{model.config.num_qubits}</td>
                      <td>{model.config.layers}</td>
                      <td>{(model.training_result.final_accuracy * 100).toFixed(2)}%</td>
                      <td>{new Date(model.created_at * 1000).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No AI models found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AILabPage;