import React, { useState, useEffect, useRef } from 'react';
import { QuantumBridge } from '../utils/quantum_bridge';
import axios from 'axios';
import { ethers } from 'ethers';
import { useWeb3 } from '../hooks/useWeb3';

// Define interfaces for our component
interface CircuitGate {
  type: string;
  qubits: number[];
  parameters?: number[];
  position: number;
}

interface CircuitLayer {
  gates: CircuitGate[];
  depth: number;
}

interface QuantumCircuit {
  numQubits: number;
  layers: CircuitLayer[];
  depth: number;
  fidelity: number;
  errorRate: number;
}

interface OptimizationResult {
  originalCircuit: QuantumCircuit;
  optimizedCircuit: QuantumCircuit;
  fidelityImprovement: number;
  depthReduction: number;
  gateReduction: number;
  optimizationTime: number;
  technique: string;
}

// Deep learning model types
interface DeepLearningModel {
  id: string;
  name: string;
  description: string;
  type: 'reinforcement' | 'supervised' | 'unsupervised' | 'hybrid';
  parameters: Record<string, any>;
}

// Web3 transaction interface
interface Web3Transaction {
  hash: string;
  blockNumber: number;
  timestamp: number;
  from: string;
  to: string;
  value: string;
  gasUsed?: string;
  status: 'pending' | 'confirmed' | 'failed';
}

interface CircuitVisualizerProps {
  apiUrl?: string;
}

const QuantumCircuitVisualizer: React.FC<CircuitVisualizerProps> = ({ apiUrl = 'http://localhost:8000' }) => {
  // Basic circuit state
  const [circuit, setCircuit] = useState<QuantumCircuit | null>(null);
  const [optimizedCircuit, setOptimizedCircuit] = useState<QuantumCircuit | null>(null);
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptimization, setSelectedOptimization] = useState<string>('gate_cancellation');
  const [numQubits, setNumQubits] = useState<number>(4);
  const [circuitComplexity, setCircuitComplexity] = useState<string>('medium');
  const [showStateEvolution, setShowStateEvolution] = useState<boolean>(false);
  const [stateVisualizationData, setStateVisualizationData] = useState<any[]>([]);
  
  // Deep learning integration
  const [useDeepLearning, setUseDeepLearning] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('rl-qopt-1');
  const [learningRate, setLearningRate] = useState<number>(0.001);
  const [epochs, setEpochs] = useState<number>(50);
  const [trainingProgress, setTrainingProgress] = useState<number>(0);
  const [modelMetrics, setModelMetrics] = useState<Record<string, number>>({});
  
  // Web3 integration
  const { 
    provider, 
    signer, 
    account, 
    connected, 
    connecting, 
    connectWallet, 
    disconnectWallet 
  } = useWeb3();
  const [web3Enabled, setWeb3Enabled] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Web3Transaction[]>([]);
  const [optimizationCost, setOptimizationCost] = useState<string>('0.001');
  const [transactionPending, setTransactionPending] = useState<boolean>(false);
  
  // Canvas refs
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const optimizedCanvasRef = useRef<HTMLCanvasElement>(null);
  const stateCanvasRef = useRef<HTMLCanvasElement>(null);
  const trainingCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const bridge = new QuantumBridge(apiUrl);
  
  // Available deep learning models
  const availableModels: DeepLearningModel[] = [
    {
      id: 'rl-qopt-1',
      name: 'RL Quantum Optimizer',
      description: 'Reinforcement learning model for quantum circuit optimization',
      type: 'reinforcement',
      parameters: {
        learningRate: 0.001,
        batchSize: 32,
        hiddenLayers: [128, 64],
        activation: 'relu'
      }
    },
    {
      id: 'qnn-optimizer',
      name: 'Quantum Neural Network',
      description: 'Hybrid quantum-classical neural network for circuit optimization',
      type: 'hybrid',
      parameters: {
        quantumLayers: 2,
        classicalLayers: 3,
        qubits: 4,
        measurementBasis: 'z'
      }
    },
    {
      id: 'transformer-qc',
      name: 'Transformer QC',
      description: 'Transformer-based model for quantum circuit analysis',
      type: 'supervised',
      parameters: {
        attention: 'multi-head',
        heads: 8,
        embedDim: 512,
        dropout: 0.1
      }
    }
  ];

  // Generate a random circuit for demonstration
  const generateRandomCircuit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would call the backend
      // For now, we'll generate a mock circuit on the frontend
      const complexity = {
        'simple': { maxDepth: 5, gatesPerLayer: 2 },
        'medium': { maxDepth: 10, gatesPerLayer: 3 },
        'complex': { maxDepth: 20, gatesPerLayer: 4 }
      }[circuitComplexity];
      
      const mockCircuit = generateMockCircuit(numQubits, complexity.maxDepth, complexity.gatesPerLayer);
      setCircuit(mockCircuit);
      setOptimizedCircuit(null);
      setOptimizationResults(null);
      
      // In a real implementation, we would fetch this from the backend
      // const response = await axios.post(`${apiUrl}/quantum/generate_circuit`, {
      //   num_qubits: numQubits,
      //   complexity: circuitComplexity
      // });
      // setCircuit(response.data.circuit);
    } catch (err: any) {
      setError(`Failed to generate circuit: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Optimize the current circuit
  const optimizeCircuit = async () => {
    if (!circuit) {
      setError('No circuit to optimize');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Check if Web3 integration is enabled and handle transaction
      if (web3Enabled) {
        if (!connected) {
          throw new Error('Please connect your wallet to use Web3 integration');
        }
        
        await processWeb3Transaction();
      }
      
      // Determine optimization approach based on settings
      if (useDeepLearning) {
        await optimizeWithDeepLearning();
      } else {
        await optimizeWithClassicalMethod();
      }
      
      // Generate state evolution data if enabled
      if (showStateEvolution && optimizedCircuit) {
        generateStateEvolutionData(optimizedCircuit);
      }
    } catch (err: any) {
      setError(`Failed to optimize circuit: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Classical optimization method
  const optimizeWithClassicalMethod = async () => {
    const optimizationTechniques = {
      'gate_cancellation': { depthReduction: 0.2, gateReduction: 0.3, fidelityImprovement: 0.15 },
      'circuit_rewriting': { depthReduction: 0.3, gateReduction: 0.25, fidelityImprovement: 0.1 },
      'template_matching': { depthReduction: 0.15, gateReduction: 0.2, fidelityImprovement: 0.05 },
      'commutation_analysis': { depthReduction: 0.1, gateReduction: 0.15, fidelityImprovement: 0.2 }
    };
    
    const technique = optimizationTechniques[selectedOptimization as keyof typeof optimizationTechniques];
    
    // Create a deep copy of the circuit
    const optimized = JSON.parse(JSON.stringify(circuit));
    
    // Apply simulated optimization
    optimized.depth = Math.max(1, Math.floor(optimized.depth * (1 - technique.depthReduction)));
    optimized.fidelity = Math.min(0.99, optimized.fidelity * (1 + technique.fidelityImprovement));
    optimized.errorRate = optimized.errorRate * 0.8; // Reduce error rate
    
    // Reduce gates in each layer
    optimized.layers = optimized.layers.slice(0, optimized.depth).map(layer => {
      return {
        ...layer,
        gates: layer.gates.slice(0, Math.max(1, Math.floor(layer.gates.length * (1 - technique.gateReduction))))
      };
    });
    
    setOptimizedCircuit(optimized);
    
    // Create optimization results
    const results: OptimizationResult = {
      originalCircuit: circuit!,
      optimizedCircuit: optimized,
      fidelityImprovement: technique.fidelityImprovement,
      depthReduction: technique.depthReduction,
      gateReduction: technique.gateReduction,
      optimizationTime: Math.random() * 2 + 0.5, // Random time between 0.5 and 2.5 seconds
      technique: selectedOptimization
    };
    
    setOptimizationResults(results);
    
    // In a real implementation, we would call the backend
    // const response = await axios.post(`${apiUrl}/quantum/optimize_circuit`, {
    //   circuit: circuit,
    //   technique: selectedOptimization
    // });
    // setOptimizedCircuit(response.data.optimizedCircuit);
    // setOptimizationResults(response.data.results);
  };
  
  // Deep learning optimization method
  const optimizeWithDeepLearning = async () => {
    // Get the selected model
    const model = availableModels.find(m => m.id === selectedModel);
    if (!model) {
      throw new Error('Selected model not found');
    }
    
    // Simulate training progress
    setTrainingProgress(0);
    const totalEpochs = epochs;
    
    for (let i = 1; i <= totalEpochs; i++) {
      // Simulate epoch training
      await new Promise(resolve => setTimeout(resolve, 100));
      setTrainingProgress(Math.floor((i / totalEpochs) * 100));
      
      // Update training visualization every 5 epochs
      if (i % 5 === 0 || i === totalEpochs) {
        updateTrainingVisualization(i, totalEpochs);
      }
    }
    
    // Apply deep learning optimization (simulated)
    // In a real implementation, this would use the trained model to optimize the circuit
    
    // Create a deep copy of the circuit
    const optimized = JSON.parse(JSON.stringify(circuit));
    
    // Apply simulated optimization with better results than classical methods
    // Deep learning typically achieves better results
    const depthReduction = 0.35 + (Math.random() * 0.15); // 35-50% reduction
    const gateReduction = 0.4 + (Math.random() * 0.2); // 40-60% reduction
    const fidelityImprovement = 0.25 + (Math.random() * 0.15); // 25-40% improvement
    
    optimized.depth = Math.max(1, Math.floor(optimized.depth * (1 - depthReduction)));
    optimized.fidelity = Math.min(0.99, optimized.fidelity * (1 + fidelityImprovement));
    optimized.errorRate = optimized.errorRate * 0.6; // 40% error reduction
    
    // Apply more sophisticated gate reductions
    optimized.layers = optimized.layers.slice(0, optimized.depth).map(layer => {
      // More intelligent gate selection based on "importance"
      const gateImportance = layer.gates.map((gate, idx) => ({
        gate,
        importance: Math.random() // In a real model, this would be a learned importance score
      }));
      
      // Sort by importance and keep the most important gates
      gateImportance.sort((a, b) => b.importance - a.importance);
      const keptGates = gateImportance
        .slice(0, Math.max(1, Math.floor(layer.gates.length * (1 - gateReduction))))
        .map(g => g.gate);
      
      return {
        ...layer,
        gates: keptGates
      };
    });
    
    setOptimizedCircuit(optimized);
    
    // Generate model metrics
    setModelMetrics({
      loss: 0.05 + (Math.random() * 0.05),
      accuracy: 0.9 + (Math.random() * 0.09),
      precision: 0.85 + (Math.random() * 0.14),
      recall: 0.88 + (Math.random() * 0.11),
      f1Score: 0.87 + (Math.random() * 0.12),
      convergenceEpoch: Math.floor(totalEpochs * 0.7) + Math.floor(Math.random() * (totalEpochs * 0.3))
    });
    
    // Create optimization results
    const results: OptimizationResult = {
      originalCircuit: circuit!,
      optimizedCircuit: optimized,
      fidelityImprovement: fidelityImprovement,
      depthReduction: depthReduction,
      gateReduction: gateReduction,
      optimizationTime: 2 + (Math.random() * 3), // 2-5 seconds for deep learning
      technique: `deep-learning-${model.type}`
    };
    
    setOptimizationResults(results);
  };
  
  // Process Web3 transaction for optimization
  const processWeb3Transaction = async () => {
    if (!signer || !account) {
      throw new Error('Wallet not connected');
    }
    
    try {
      setTransactionPending(true);
      
      // Convert ETH amount to wei
      const weiAmount = ethers.parseEther(optimizationCost);
      
      // In a real implementation, this would send ETH to a smart contract
      // that handles the optimization service payment
      // For now, we'll simulate a transaction to a demo address
      
      const demoServiceAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
      
      // Create transaction
      const tx = await signer.sendTransaction({
        to: demoServiceAddress,
        value: weiAmount,
        gasLimit: 100000n
      });
      
      // Add transaction to list
      const newTransaction: Web3Transaction = {
        hash: tx.hash,
        blockNumber: 0, // Will be updated when confirmed
        timestamp: Date.now(),
        from: account,
        to: demoServiceAddress,
        value: ethers.utils.formatEther(weiAmount),
        gasUsed: '0', // Will be updated when confirmed
        status: 'pending'
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      // Update transaction status
      setTransactions(prev => 
        prev.map(t => 
          t.hash === tx.hash 
            ? {
                ...t,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString(),
                status: 'confirmed'
              } 
            : t
        )
      );
      
      setTransactionPending(false);
      
      // In a real implementation, the backend would verify the transaction
      // and then perform the optimization
      
    } catch (error) {
      setTransactionPending(false);
      throw error;
    }
  };
  
  // Update training visualization
  const updateTrainingVisualization = (currentEpoch: number, totalEpochs: number) => {
    if (!trainingCanvasRef.current) return;
    
    const canvas = trainingCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas dimensions
    canvas.width = 600;
    canvas.height = 300;
    
    // Draw background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw title
    ctx.font = '16px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText('Deep Learning Training Progress', canvas.width / 2, 30);
    
    // Draw axes
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const width = canvas.width - margin.left - margin.right;
    const height = canvas.height - margin.top - margin.bottom;
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, canvas.height - margin.bottom);
    ctx.lineTo(margin.left + width, canvas.height - margin.bottom);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, canvas.height - margin.bottom);
    ctx.stroke();
    
    // X-axis label
    ctx.font = '14px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText('Epochs', margin.left + width / 2, canvas.height - 10);
    
    // Y-axis label
    ctx.save();
    ctx.translate(15, margin.top + height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Loss / Accuracy', 0, 0);
    ctx.restore();
    
    // Generate simulated training data
    const lossData: [number, number][] = [];
    const accuracyData: [number, number][] = [];
    
    for (let i = 0; i <= currentEpoch; i++) {
      // Simulated loss (decreasing)
      const progress = i / totalEpochs;
      const noise = Math.random() * 0.05;
      const loss = 0.5 * Math.exp(-3 * progress) + noise;
      lossData.push([i, loss]);
      
      // Simulated accuracy (increasing)
      const accuracy = 0.5 + 0.45 * (1 - Math.exp(-5 * progress)) + (Math.random() * 0.05 - 0.025);
      accuracyData.push([i, accuracy]);
    }
    
    // Draw loss curve
    ctx.strokeStyle = '#EA4335'; // Red
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    lossData.forEach((point, index) => {
      const x = margin.left + (point[0] / totalEpochs) * width;
      const y = margin.top + height - (point[1] * height);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw accuracy curve
    ctx.strokeStyle = '#34A853'; // Green
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    accuracyData.forEach((point, index) => {
      const x = margin.left + (point[0] / totalEpochs) * width;
      const y = margin.top + height - (point[1] * height);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw legend
    ctx.font = '12px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'left';
    
    // Loss legend
    ctx.fillStyle = '#EA4335';
    ctx.fillRect(margin.left + 10, margin.top + 10, 15, 15);
    ctx.fillStyle = '#333';
    ctx.fillText('Loss', margin.left + 35, margin.top + 22);
    
    // Accuracy legend
    ctx.fillStyle = '#34A853';
    ctx.fillRect(margin.left + 10, margin.top + 35, 15, 15);
    ctx.fillStyle = '#333';
    ctx.fillText('Accuracy', margin.left + 35, margin.top + 47);
    
    // Current values
    if (lossData.length > 0 && accuracyData.length > 0) {
      const currentLoss = lossData[lossData.length - 1][1].toFixed(4);
      const currentAccuracy = accuracyData[accuracyData.length - 1][1].toFixed(4);
      
      ctx.textAlign = 'right';
      ctx.fillText(`Loss: ${currentLoss}`, margin.left + width - 10, margin.top + 22);
      ctx.fillText(`Accuracy: ${currentAccuracy}`, margin.left + width - 10, margin.top + 47);
    }
  };

  // Generate mock circuit for demonstration
  const generateMockCircuit = (numQubits: number, maxDepth: number, maxGatesPerLayer: number): QuantumCircuit => {
    const gateTypes = ['h', 'x', 'y', 'z', 'cx', 'cz', 'rx', 'ry', 'rz', 'swap'];
    const layers: CircuitLayer[] = [];
    
    for (let d = 0; d < maxDepth; d++) {
      const numGates = Math.floor(Math.random() * maxGatesPerLayer) + 1;
      const gates: CircuitGate[] = [];
      
      for (let g = 0; g < numGates; g++) {
        const gateType = gateTypes[Math.floor(Math.random() * gateTypes.length)];
        let qubits: number[];
        
        if (gateType.startsWith('c') || gateType === 'swap') {
          // Two-qubit gate
          const qubit1 = Math.floor(Math.random() * numQubits);
          let qubit2;
          do {
            qubit2 = Math.floor(Math.random() * numQubits);
          } while (qubit2 === qubit1);
          
          qubits = [qubit1, qubit2];
        } else {
          // Single-qubit gate
          qubits = [Math.floor(Math.random() * numQubits)];
        }
        
        const parameters = gateType.startsWith('r') ? [Math.random() * Math.PI * 2] : undefined;
        
        gates.push({
          type: gateType,
          qubits,
          parameters,
          position: g
        });
      }
      
      layers.push({
        gates,
        depth: d
      });
    }
    
    return {
      numQubits,
      layers,
      depth: maxDepth,
      fidelity: 0.8 + Math.random() * 0.15, // Random fidelity between 0.8 and 0.95
      errorRate: 0.01 + Math.random() * 0.04 // Random error rate between 1% and 5%
    };
  };

  // Generate state evolution data for visualization
  const generateStateEvolutionData = (circuit: QuantumCircuit) => {
    // In a real implementation, this would come from the backend
    // For now, we'll generate mock data
    const stateData = [];
    const numStates = Math.pow(2, circuit.numQubits);
    
    // Initial state (|0...0⟩)
    const initialState = Array(numStates).fill(0);
    initialState[0] = 1;
    stateData.push({
      step: 0,
      label: 'Initial State',
      amplitudes: initialState
    });
    
    // Generate state after each layer
    for (let i = 0; i < circuit.layers.length; i++) {
      const layer = circuit.layers[i];
      
      // Simulate state evolution (very simplified)
      const newState = Array(numStates).fill(0);
      
      // Distribute probability amplitudes based on gate operations (simplified)
      for (let j = 0; j < numStates; j++) {
        // This is a very simplified model - in reality, quantum state evolution
        // would be calculated using matrix operations on complex amplitudes
        const basisState = j.toString(2).padStart(circuit.numQubits, '0');
        
        // Apply a simplified transformation based on gates in this layer
        let amplitude = Math.random();
        
        // Ensure probabilities sum to 1 (approximately)
        newState[j] = amplitude;
      }
      
      // Normalize
      const sum = newState.reduce((a, b) => a + b * b, 0);
      const normalizedState = newState.map(a => a / Math.sqrt(sum));
      
      stateData.push({
        step: i + 1,
        label: `After Layer ${i + 1}`,
        amplitudes: normalizedState
      });
    }
    
    setStateVisualizationData(stateData);
  };

  // Draw circuit on canvas
  useEffect(() => {
    if (circuit && originalCanvasRef.current) {
      drawCircuit(originalCanvasRef.current, circuit);
    }
    
    if (optimizedCircuit && optimizedCanvasRef.current) {
      drawCircuit(optimizedCanvasRef.current, optimizedCircuit);
    }
    
    if (showStateEvolution && stateVisualizationData.length > 0 && stateCanvasRef.current) {
      drawStateEvolution(stateCanvasRef.current, stateVisualizationData);
    }
  }, [circuit, optimizedCircuit, stateVisualizationData, showStateEvolution]);

  // Draw quantum circuit on canvas
  const drawCircuit = (canvas: HTMLCanvasElement, circuit: QuantumCircuit) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas dimensions based on circuit size
    canvas.width = Math.max(800, circuit.depth * 60 + 100);
    canvas.height = circuit.numQubits * 60 + 60;
    
    // Draw background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw qubit lines
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < circuit.numQubits; i++) {
      const y = 40 + i * 60;
      
      // Qubit label
      ctx.font = '14px Arial';
      ctx.fillStyle = '#000';
      ctx.textAlign = 'right';
      ctx.fillText(`q${i}: `, 40, y + 5);
      
      // Qubit line
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(canvas.width - 50, y);
      ctx.stroke();
    }
    
    // Draw gates
    circuit.layers.forEach((layer, layerIndex) => {
      const x = 80 + layerIndex * 60;
      
      layer.gates.forEach(gate => {
        drawGate(ctx, gate, x);
      });
    });
    
    // Draw circuit stats
    ctx.font = '14px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'left';
    ctx.fillText(`Depth: ${circuit.depth}`, 50, 20);
    ctx.fillText(`Fidelity: ${(circuit.fidelity * 100).toFixed(2)}%`, 200, 20);
    ctx.fillText(`Error Rate: ${(circuit.errorRate * 100).toFixed(2)}%`, 400, 20);
  };

  // Draw a quantum gate
  const drawGate = (ctx: CanvasRenderingContext2D, gate: CircuitGate, x: number) => {
    const gateColors: Record<string, string> = {
      'h': '#4285F4',  // Hadamard - blue
      'x': '#EA4335',  // Pauli-X - red
      'y': '#FBBC05',  // Pauli-Y - yellow
      'z': '#34A853',  // Pauli-Z - green
      'cx': '#4285F4', // CNOT - blue
      'cz': '#34A853', // CZ - green
      'rx': '#EA4335', // RX - red
      'ry': '#FBBC05', // RY - yellow
      'rz': '#34A853', // RZ - green
      'swap': '#9C27B0' // SWAP - purple
    };
    
    const color = gateColors[gate.type] || '#757575';
    
    if (gate.qubits.length === 1) {
      // Single-qubit gate
      const y = 40 + gate.qubits[0] * 60;
      
      // Gate box
      ctx.fillStyle = color;
      ctx.fillRect(x - 15, y - 15, 30, 30);
      
      // Gate label
      ctx.font = '14px Arial';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText(gate.type, x, y + 5);
      
      // Draw parameter if present
      if (gate.parameters && gate.parameters.length > 0) {
        ctx.font = '10px Arial';
        ctx.fillText(`(${gate.parameters[0].toFixed(2)})`, x, y + 20);
      }
    } else if (gate.qubits.length === 2) {
      // Two-qubit gate
      const y1 = 40 + gate.qubits[0] * 60;
      const y2 = 40 + gate.qubits[1] * 60;
      
      if (gate.type === 'swap') {
        // SWAP gate
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y1, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y2, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Connection line
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.stroke();
        
        // X symbols
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        
        // X in first circle
        ctx.beginPath();
        ctx.moveTo(x - 5, y1 - 5);
        ctx.lineTo(x + 5, y1 + 5);
        ctx.moveTo(x + 5, y1 - 5);
        ctx.lineTo(x - 5, y1 + 5);
        ctx.stroke();
        
        // X in second circle
        ctx.beginPath();
        ctx.moveTo(x - 5, y2 - 5);
        ctx.lineTo(x + 5, y2 + 5);
        ctx.moveTo(x + 5, y2 - 5);
        ctx.lineTo(x - 5, y2 + 5);
        ctx.stroke();
      } else {
        // Control gate (like CNOT, CZ)
        
        // Control point
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y1, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Target gate
        ctx.fillStyle = color;
        if (gate.type === 'cx') {
          // CNOT gate (circle with plus)
          ctx.beginPath();
          ctx.arc(x, y2, 15, 0, Math.PI * 2);
          ctx.stroke();
          
          // Plus symbol
          ctx.beginPath();
          ctx.moveTo(x - 10, y2);
          ctx.lineTo(x + 10, y2);
          ctx.moveTo(x, y2 - 10);
          ctx.lineTo(x, y2 + 10);
          ctx.stroke();
        } else {
          // Other controlled gates
          ctx.fillRect(x - 15, y2 - 15, 30, 30);
          
          // Gate label
          ctx.font = '14px Arial';
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.fillText(gate.type.substring(1), x, y2 + 5);
        }
        
        // Connection line
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.stroke();
      }
    }
  };

  // Draw quantum state evolution
  const drawStateEvolution = (canvas: HTMLCanvasElement, stateData: any[]) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas dimensions
    canvas.width = 800;
    canvas.height = 400;
    
    // Draw background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw title
    ctx.font = '16px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText('Quantum State Evolution', canvas.width / 2, 30);
    
    // Calculate dimensions
    const margin = { top: 50, right: 30, bottom: 50, left: 50 };
    const width = canvas.width - margin.left - margin.right;
    const height = canvas.height - margin.top - margin.bottom;
    
    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, canvas.height - margin.bottom);
    ctx.lineTo(margin.left + width, canvas.height - margin.bottom);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, canvas.height - margin.bottom);
    ctx.stroke();
    
    // X-axis label
    ctx.font = '14px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText('Basis States', margin.left + width / 2, canvas.height - 10);
    
    // Y-axis label
    ctx.save();
    ctx.translate(15, margin.top + height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Probability', 0, 0);
    ctx.restore();
    
    // Draw state evolution
    const numStates = stateData[0].amplitudes.length;
    const barWidth = width / numStates / stateData.length * 0.8;
    const groupWidth = width / stateData.length;
    
    stateData.forEach((state, stateIndex) => {
      // Draw group label
      ctx.font = '12px Arial';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.fillText(
        state.label,
        margin.left + stateIndex * groupWidth + groupWidth / 2,
        canvas.height - margin.bottom + 20
      );
      
      // Draw bars for each basis state
      state.amplitudes.forEach((amplitude: number, basisIndex: number) => {
        const probability = amplitude * amplitude; // Convert amplitude to probability
        const barHeight = probability * height;
        
        // Calculate position
        const x = margin.left + stateIndex * groupWidth + basisIndex * barWidth + barWidth * 0.1;
        const y = canvas.height - margin.bottom - barHeight;
        
        // Draw bar
        ctx.fillStyle = `hsl(${(basisIndex * 360 / numStates) % 360}, 70%, 60%)`;
        ctx.fillRect(x, y, barWidth * 0.8, barHeight);
        
        // Draw basis state label for the first group only
        if (stateIndex === 0 && numStates <= 16) { // Only show labels if we have few states
          ctx.font = '10px Arial';
          ctx.fillStyle = '#333';
          ctx.textAlign = 'center';
          ctx.fillText(
            basisIndex.toString(2).padStart(Math.log2(numStates), '0'),
            x + barWidth * 0.4,
            canvas.height - margin.bottom + 35
          );
        }
      });
    });
  };

  return (
    <div className="quantum-circuit-visualizer">
      <h2>Quantum Circuit Optimization Visualizer</h2>
      
      <div className="tabs">
        <button 
          className={`tab-button ${!useDeepLearning && !web3Enabled ? 'active' : ''}`}
          onClick={() => { setUseDeepLearning(false); setWeb3Enabled(false); }}
          disabled={loading}
        >
          Classical Optimization
        </button>
        <button 
          className={`tab-button ${useDeepLearning ? 'active' : ''}`}
          onClick={() => { setUseDeepLearning(true); setWeb3Enabled(false); }}
          disabled={loading}
        >
          Deep Learning Optimization
        </button>
        <button 
          className={`tab-button ${web3Enabled ? 'active' : ''}`}
          onClick={() => { setWeb3Enabled(true); }}
          disabled={loading}
        >
          Web3 Integration
        </button>
      </div>
      
      <div className="control-panel">
        <div className="form-group">
          <label>Number of Qubits:</label>
          <select 
            value={numQubits} 
            onChange={(e) => setNumQubits(parseInt(e.target.value))}
            disabled={loading}
          >
            <option value={2}>2 qubits</option>
            <option value={3}>3 qubits</option>
            <option value={4}>4 qubits</option>
            <option value={5}>5 qubits</option>
            <option value={6}>6 qubits</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Circuit Complexity:</label>
          <select 
            value={circuitComplexity} 
            onChange={(e) => setCircuitComplexity(e.target.value)}
            disabled={loading}
          >
            <option value="simple">Simple</option>
            <option value="medium">Medium</option>
            <option value="complex">Complex</option>
          </select>
        </div>
        
        {!useDeepLearning && !web3Enabled && (
          <div className="form-group">
            <label>Optimization Technique:</label>
            <select 
              value={selectedOptimization} 
              onChange={(e) => setSelectedOptimization(e.target.value)}
              disabled={loading}
            >
              <option value="gate_cancellation">Gate Cancellation</option>
              <option value="circuit_rewriting">Circuit Rewriting</option>
              <option value="template_matching">Template Matching</option>
              <option value="commutation_analysis">Commutation Analysis</option>
            </select>
          </div>
        )}
        
        {useDeepLearning && (
          <>
            <div className="form-group">
              <label>Deep Learning Model:</label>
              <select 
                value={selectedModel} 
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={loading}
              >
                {availableModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name} ({model.type})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Learning Rate:</label>
              <input 
                type="number" 
                min="0.0001" 
                max="0.1" 
                step="0.0001"
                value={learningRate}
                onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>Training Epochs:</label>
              <input 
                type="number" 
                min="10" 
                max="1000" 
                step="10"
                value={epochs}
                onChange={(e) => setEpochs(parseInt(e.target.value))}
                disabled={loading}
              />
            </div>
          </>
        )}
        
        {web3Enabled && (
          <div className="web3-panel">
            <div className="wallet-status">
              {!connected ? (
                <button 
                  onClick={connectWallet}
                  disabled={connecting || loading}
                  className="connect-wallet-button"
                >
                  {connecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              ) : (
                <div className="connected-wallet">
                  <span className="wallet-address">
                    Connected: {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
                  </span>
                  <button 
                    onClick={disconnectWallet}
                    className="disconnect-wallet-button"
                    disabled={loading}
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label>Optimization Cost (ETH):</label>
              <input 
                type="number" 
                min="0.0001" 
                max="1" 
                step="0.0001"
                value={optimizationCost}
                onChange={(e) => setOptimizationCost(e.target.value)}
                disabled={loading || !connected}
              />
            </div>
            
            {transactions.length > 0 && (
              <div className="transactions-list">
                <h4>Recent Transactions</h4>
                <div className="transaction-items">
                  {transactions.slice(0, 3).map(tx => (
                    <div key={tx.hash} className={`transaction-item ${tx.status}`}>
                      <div className="tx-hash">
                        {tx.hash.substring(0, 10)}...{tx.hash.substring(tx.hash.length - 8)}
                      </div>
                      <div className="tx-value">{tx.value} ETH</div>
                      <div className="tx-status">{tx.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="form-group">
          <label>
            <input 
              type="checkbox" 
              checked={showStateEvolution} 
              onChange={(e) => setShowStateEvolution(e.target.checked)}
              disabled={loading}
            />
            Show Quantum State Evolution
          </label>
        </div>
        
        <div className="button-group">
          <button 
            onClick={generateRandomCircuit} 
            disabled={loading}
            className="primary-button"
          >
            Generate Circuit
          </button>
          
          <button 
            onClick={optimizeCircuit} 
            disabled={loading || !circuit || (web3Enabled && !connected)}
            className="primary-button"
          >
            {web3Enabled 
              ? `Optimize with Web3 (${optimizationCost} ETH)` 
              : useDeepLearning 
                ? 'Optimize with Deep Learning' 
                : 'Optimize Circuit'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {loading && (
        <div className="loading-indicator">
          {useDeepLearning ? (
            <div className="training-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${trainingProgress}%` }}
                ></div>
              </div>
              <div className="progress-text">
                Training Progress: {trainingProgress}%
              </div>
            </div>
          ) : (
            "Processing..."
          )}
        </div>
      )}
      
      {circuit && (
        <div className="circuit-container">
          <h3>Original Circuit</h3>
          <div className="canvas-container">
            <canvas ref={originalCanvasRef} className="circuit-canvas"></canvas>
          </div>
        </div>
      )}
      
      {optimizedCircuit && (
        <div className="circuit-container">
          <h3>Optimized Circuit</h3>
          <div className="canvas-container">
            <canvas ref={optimizedCanvasRef} className="circuit-canvas"></canvas>
          </div>
        </div>
      )}
      
      {useDeepLearning && trainingProgress > 0 && (
        <div className="training-visualization">
          <h3>Deep Learning Training</h3>
          <div className="canvas-container">
            <canvas ref={trainingCanvasRef} className="training-canvas"></canvas>
          </div>
          
          {Object.keys(modelMetrics).length > 0 && (
            <div className="model-metrics">
              <h4>Model Performance Metrics</h4>
              <div className="metrics-grid">
                {Object.entries(modelMetrics).map(([key, value]) => (
                  <div key={key} className="metric-item">
                    <span className="metric-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                    <span className="metric-value">
                      {typeof value === 'number' && key !== 'convergenceEpoch' 
                        ? value.toFixed(4) 
                        : value.toString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {optimizationResults && (
        <div className="optimization-results">
          <h3>Optimization Results</h3>
          <div className="results-grid">
            <div className="result-item">
              <span className="result-label">Technique:</span>
              <span className="result-value">{optimizationResults.technique.replace(/_/g, ' ')}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Depth Reduction:</span>
              <span className="result-value">{(optimizationResults.depthReduction * 100).toFixed(2)}%</span>
            </div>
            <div className="result-item">
              <span className="result-label">Gate Reduction:</span>
              <span className="result-value">{(optimizationResults.gateReduction * 100).toFixed(2)}%</span>
            </div>
            <div className="result-item">
              <span className="result-label">Fidelity Improvement:</span>
              <span className="result-value">{(optimizationResults.fidelityImprovement * 100).toFixed(2)}%</span>
            </div>
            <div className="result-item">
              <span className="result-label">Optimization Time:</span>
              <span className="result-value">{optimizationResults.optimizationTime.toFixed(3)} seconds</span>
            </div>
          </div>
        </div>
      )}
      
      {showStateEvolution && stateVisualizationData.length > 0 && (
        <div className="state-evolution-container">
          <h3>Quantum State Evolution</h3>
          <div className="canvas-container">
            <canvas ref={stateCanvasRef} className="state-canvas"></canvas>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .quantum-circuit-visualizer {
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
        
        /* Tabs */
        .tabs {
          display: flex;
          border-bottom: 1px solid #ddd;
          margin-bottom: 20px;
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
          transition: all 0.2s;
        }
        
        .tab-button:hover {
          color: #4285F4;
        }
        
        .tab-button.active {
          color: #4285F4;
          border-bottom-color: #4285F4;
        }
        
        .tab-button:disabled {
          color: #999;
          cursor: not-allowed;
        }
        
        /* Control Panel */
        .control-panel {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 20px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 5px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          min-width: 150px;
        }
        
        label {
          margin-bottom: 5px;
          font-weight: 500;
        }
        
        select, input {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        input[type="number"] {
          width: 100px;
        }
        
        .button-group {
          display: flex;
          gap: 10px;
          margin-left: auto;
          align-self: flex-end;
        }
        
        button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .primary-button {
          background-color: #4285F4;
          color: white;
        }
        
        .primary-button:hover {
          background-color: #3367D6;
        }
        
        .primary-button:disabled {
          background-color: #A4C2F4;
          cursor: not-allowed;
        }
        
        /* Web3 Integration */
        .web3-panel {
          display: flex;
          flex-direction: column;
          gap: 15px;
          padding: 15px;
          background-color: #f0f8ff;
          border-radius: 5px;
          border: 1px solid #d0e0ff;
          min-width: 300px;
        }
        
        .wallet-status {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .connect-wallet-button {
          background-color: #34A853;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          border: none;
          font-weight: 500;
        }
        
        .connect-wallet-button:hover {
          background-color: #2E8B57;
        }
        
        .connect-wallet-button:disabled {
          background-color: #A3D9A5;
          cursor: not-allowed;
        }
        
        .connected-wallet {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .wallet-address {
          font-family: monospace;
          background-color: #f5f5f5;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .disconnect-wallet-button {
          background-color: #EA4335;
          color: white;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 12px;
        }
        
        .disconnect-wallet-button:hover {
          background-color: #D32F2F;
        }
        
        .transactions-list {
          margin-top: 10px;
        }
        
        .transaction-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 150px;
          overflow-y: auto;
        }
        
        .transaction-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          border-radius: 4px;
          font-size: 12px;
          background-color: white;
        }
        
        .transaction-item.pending {
          border-left: 3px solid #FBBC05;
        }
        
        .transaction-item.confirmed {
          border-left: 3px solid #34A853;
        }
        
        .transaction-item.failed {
          border-left: 3px solid #EA4335;
        }
        
        .tx-hash {
          font-family: monospace;
          color: #555;
        }
        
        .tx-value {
          font-weight: 500;
        }
        
        .tx-status {
          text-transform: capitalize;
          font-weight: 500;
        }
        
        .tx-status.pending {
          color: #FBBC05;
        }
        
        .tx-status.confirmed {
          color: #34A853;
        }
        
        .tx-status.failed {
          color: #EA4335;
        }
        
        /* Deep Learning */
        .training-progress {
          margin: 20px 0;
        }
        
        .progress-bar {
          width: 100%;
          height: 20px;
          background-color: #f5f5f5;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 10px;
        }
        
        .progress-fill {
          height: 100%;
          background-color: #4285F4;
          transition: width 0.3s ease;
        }
        
        .progress-text {
          text-align: center;
          font-size: 14px;
          color: #555;
        }
        
        .training-visualization {
          margin-top: 20px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 5px;
        }
        
        .training-canvas {
          min-width: 100%;
          min-height: 300px;
        }
        
        .model-metrics {
          margin-top: 15px;
          padding: 15px;
          background-color: white;
          border-radius: 5px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 10px;
          margin-top: 10px;
        }
        
        .metric-item {
          padding: 8px;
          background-color: #f8f9fa;
          border-radius: 4px;
        }
        
        .metric-label {
          font-weight: 500;
          color: #555;
          display: block;
          margin-bottom: 5px;
          font-size: 12px;
        }
        
        .metric-value {
          font-size: 14px;
          color: #333;
          font-weight: 500;
        }
        
        /* Error and Loading */
        .error-message {
          color: #EA4335;
          margin: 10px 0;
          padding: 10px;
          background-color: #FDEDEC;
          border-radius: 4px;
        }
        
        .loading-indicator {
          margin: 20px 0;
          text-align: center;
          color: #666;
        }
        
        /* Circuit Visualization */
        .circuit-container, .state-evolution-container {
          margin-top: 20px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 5px;
        }
        
        .canvas-container {
          overflow-x: auto;
          margin-top: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: white;
        }
        
        .circuit-canvas, .state-canvas {
          min-width: 100%;
          min-height: 200px;
        }
        
        /* Optimization Results */
        .optimization-results {
          margin-top: 20px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 5px;
        }
        
        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 10px;
        }
        
        .result-item {
          background-color: white;
          padding: 10px;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .result-label {
          font-weight: 500;
          color: #555;
          display: block;
          margin-bottom: 5px;
        }
        
        .result-value {
          font-size: 1.1em;
          color: #333;
        }
        
        pre {
          background-color: #f5f5f5;
          padding: 10px;
          border-radius: 4px;
          overflow-x: auto;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
};

export default QuantumCircuitVisualizer;