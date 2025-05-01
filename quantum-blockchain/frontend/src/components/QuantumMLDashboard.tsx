import React, { useState, useEffect, useRef } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import axios from 'axios';

interface QuantumMLModel {
  id: string;
  name: string;
  type: string;
  algorithm: string;
  parameters: Record<string, any>;
}

interface QuantumMLAlgorithm {
  id: string;
  name: string;
  description: string;
}

interface TrainingResult {
  model_id: string;
  algorithm: string;
  accuracy?: number;
  loss?: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
  training_time: number;
  convergence_epoch?: number;
  loss_curve?: number[];
  accuracy_curve?: number[];
  confusion_matrix?: Record<string, number>;
  quantum_advantage: Record<string, any>;
  final_energy?: number;
  eigenvalue_error?: number;
  convergence_iteration?: number;
  energy_curve?: number[];
  approximation_ratio?: number;
  optimization_time?: number;
  objective_curve?: number[];
  solution_quality?: Record<string, any>;
  generator_loss?: number;
  discriminator_loss?: number;
  fidelity?: number;
  generator_loss_curve?: number[];
  discriminator_loss_curve?: number[];
  sample_quality?: Record<string, any>;
}

interface PredictionResult {
  model_id: string;
  algorithm: string;
  predictions?: number[];
  probabilities?: number[];
  optimized_parameters?: number[];
  objective_value?: number;
  generated_samples?: number[][];
}

const API_URL = 'http://localhost:8000';

export const QuantumMLDashboard: React.FC = () => {
  // State for available models and algorithms
  const [availableModels, setAvailableModels] = useState<QuantumMLModel[]>([]);
  const [availableAlgorithms, setAvailableAlgorithms] = useState<QuantumMLAlgorithm[]>([]);
  
  // State for selected model and parameters
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [hyperParameters, setHyperParameters] = useState<Record<string, any>>({});
  
  // State for dataset configuration
  const [datasetSize, setDatasetSize] = useState<number>(100);
  const [datasetFeatures, setDatasetFeatures] = useState<number>(4);
  const [datasetType, setDatasetType] = useState<string>('classification');
  
  // State for training and prediction
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [trainingProgress, setTrainingProgress] = useState<number>(0);
  const [trainingResult, setTrainingResult] = useState<TrainingResult | null>(null);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  
  // State for error handling
  const [error, setError] = useState<string | null>(null);
  
  // Canvas refs for visualizations
  const trainingCanvasRef = useRef<HTMLCanvasElement>(null);
  const predictionCanvasRef = useRef<HTMLCanvasElement>(null);
  const advantageCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Web3 integration
  const { connected, account, connectWallet } = useWeb3();
  
  // Fetch available models and algorithms on component mount
  useEffect(() => {
    fetchAvailableModels();
    fetchAvailableAlgorithms();
  }, []);
  
  // Update hyperparameters when selected model changes
  useEffect(() => {
    if (selectedModel && availableModels.length > 0) {
      const model = availableModels.find(m => m.id === selectedModel);
      if (model) {
        // Initialize hyperparameters with default values from the model
        const initialHyperParams: Record<string, any> = {};
        Object.entries(model.parameters).forEach(([key, value]) => {
          initialHyperParams[key] = value;
        });
        setHyperParameters(initialHyperParams);
      }
    }
  }, [selectedModel, availableModels]);
  
  // Draw training visualization when training result changes
  useEffect(() => {
    if (trainingResult && trainingCanvasRef.current) {
      drawTrainingVisualization();
    }
  }, [trainingResult]);
  
  // Draw prediction visualization when prediction result changes
  useEffect(() => {
    if (predictionResult && predictionCanvasRef.current) {
      drawPredictionVisualization();
    }
  }, [predictionResult]);
  
  // Draw quantum advantage visualization when training result changes
  useEffect(() => {
    if (trainingResult && advantageCanvasRef.current) {
      drawQuantumAdvantageVisualization();
    }
  }, [trainingResult]);
  
  const fetchAvailableModels = async () => {
    try {
      const response = await axios.get(`${API_URL}/quantum-ml/available_models`);
      setAvailableModels(response.data.models);
      if (response.data.models.length > 0) {
        setSelectedModel(response.data.models[0].id);
      }
    } catch (err) {
      setError('Failed to fetch available models');
      console.error(err);
    }
  };
  
  const fetchAvailableAlgorithms = async () => {
    try {
      const response = await axios.get(`${API_URL}/quantum-ml/algorithms`);
      setAvailableAlgorithms(response.data.algorithms);
    } catch (err) {
      setError('Failed to fetch available algorithms');
      console.error(err);
    }
  };
  
  const handleHyperParameterChange = (param: string, value: any) => {
    setHyperParameters(prev => ({
      ...prev,
      [param]: value
    }));
  };
  
  const generateDataset = () => {
    // Generate a simulated dataset based on the selected parameters
    const dataset: Record<string, any> = {
      num_samples: datasetSize,
      num_features: datasetFeatures,
      type: datasetType
    };
    
    // For classification datasets, add class distribution
    if (datasetType === 'classification') {
      dataset.num_classes = 2;
      dataset.class_distribution = [0.5, 0.5];
    }
    
    // For regression datasets, add target range
    if (datasetType === 'regression') {
      dataset.target_range = [-1, 1];
    }
    
    // For optimization problems, add problem definition
    if (datasetType === 'optimization') {
      dataset.problem_type = 'maxcut';
      dataset.graph_nodes = datasetFeatures;
      dataset.graph_edges = datasetFeatures * 2;
    }
    
    return dataset;
  };
  
  const trainModel = async () => {
    setError(null);
    setIsTraining(true);
    setTrainingProgress(0);
    
    try {
      // Generate a simulated dataset
      const dataset = generateDataset();
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setTrainingProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 500);
      
      // Send training request to the backend
      const response = await axios.post(`${API_URL}/quantum-ml/train`, {
        model_id: selectedModel,
        dataset,
        hyperparams: hyperParameters
      });
      
      clearInterval(progressInterval);
      setTrainingProgress(100);
      setTrainingResult(response.data);
      
      // Wait a bit before resetting the training state
      setTimeout(() => {
        setIsTraining(false);
      }, 1000);
    } catch (err) {
      setError('Failed to train model');
      console.error(err);
      setIsTraining(false);
    }
  };
  
  const predictWithModel = async () => {
    if (!trainingResult) {
      setError('Please train a model first');
      return;
    }
    
    setError(null);
    setIsPredicting(true);
    
    try {
      // Generate input data for prediction
      const inputData: Record<string, any> = {
        num_samples: 5,
        num_features: datasetFeatures
      };
      
      // Send prediction request to the backend
      const response = await axios.post(`${API_URL}/quantum-ml/predict`, {
        model_id: selectedModel,
        input_data: inputData
      });
      
      setPredictionResult(response.data);
      
      // Wait a bit before resetting the prediction state
      setTimeout(() => {
        setIsPredicting(false);
      }, 1000);
    } catch (err) {
      setError('Failed to make predictions');
      console.error(err);
      setIsPredicting(false);
    }
  };
  
  const drawTrainingVisualization = () => {
    if (!trainingCanvasRef.current || !trainingResult) return;
    
    const canvas = trainingCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Determine which curves to draw based on the algorithm
    if (trainingResult.loss_curve && trainingResult.accuracy_curve) {
      // Draw loss and accuracy curves for classification models
      drawLearningCurves(ctx, canvas, trainingResult.loss_curve, trainingResult.accuracy_curve);
    } else if (trainingResult.energy_curve) {
      // Draw energy curve for VQE
      drawEnergyCurve(ctx, canvas, trainingResult.energy_curve);
    } else if (trainingResult.objective_curve) {
      // Draw objective curve for QAOA
      drawObjectiveCurve(ctx, canvas, trainingResult.objective_curve);
    } else if (trainingResult.generator_loss_curve && trainingResult.discriminator_loss_curve) {
      // Draw GAN curves
      drawGANCurves(ctx, canvas, trainingResult.generator_loss_curve, trainingResult.discriminator_loss_curve);
    }
  };
  
  const drawLearningCurves = (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    lossCurve: number[], 
    accuracyCurve: number[]
  ) => {
    const padding = 40;
    const width = canvas.width - 2 * padding;
    const height = canvas.height - 2 * padding;
    
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Draw loss curve (red)
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    for (let i = 0; i < lossCurve.length; i++) {
      const x = padding + (i / (lossCurve.length - 1)) * width;
      const y = canvas.height - padding - (1 - lossCurve[i]) * height;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    
    // Draw accuracy curve (blue)
    ctx.beginPath();
    ctx.strokeStyle = 'blue';
    for (let i = 0; i < accuracyCurve.length; i++) {
      const x = padding + (i / (accuracyCurve.length - 1)) * width;
      const y = canvas.height - padding - accuracyCurve[i] * height;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    
    // Draw legend
    ctx.font = '12px Arial';
    ctx.fillStyle = 'red';
    ctx.fillText('Loss', padding + 10, padding + 20);
    ctx.fillStyle = 'blue';
    ctx.fillText('Accuracy', padding + 60, padding + 20);
    
    // Draw axes labels
    ctx.fillStyle = 'black';
    ctx.fillText('Epochs', canvas.width / 2, canvas.height - 10);
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Value', 0, 0);
    ctx.restore();
  };
  
  const drawEnergyCurve = (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    energyCurve: number[]
  ) => {
    const padding = 40;
    const width = canvas.width - 2 * padding;
    const height = canvas.height - 2 * padding;
    
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Find min and max energy values
    const minEnergy = Math.min(...energyCurve);
    const maxEnergy = Math.max(...energyCurve);
    const range = maxEnergy - minEnergy;
    
    // Draw energy curve (green)
    ctx.beginPath();
    ctx.strokeStyle = 'green';
    for (let i = 0; i < energyCurve.length; i++) {
      const x = padding + (i / (energyCurve.length - 1)) * width;
      const normalizedEnergy = (energyCurve[i] - minEnergy) / (range || 1);
      const y = canvas.height - padding - (1 - normalizedEnergy) * height;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    
    // Draw legend
    ctx.font = '12px Arial';
    ctx.fillStyle = 'green';
    ctx.fillText('Energy', padding + 10, padding + 20);
    
    // Draw axes labels
    ctx.fillStyle = 'black';
    ctx.fillText('Iterations', canvas.width / 2, canvas.height - 10);
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Energy', 0, 0);
    ctx.restore();
  };
  
  const drawObjectiveCurve = (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    objectiveCurve: number[]
  ) => {
    const padding = 40;
    const width = canvas.width - 2 * padding;
    const height = canvas.height - 2 * padding;
    
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Draw objective curve (purple)
    ctx.beginPath();
    ctx.strokeStyle = 'purple';
    for (let i = 0; i < objectiveCurve.length; i++) {
      const x = padding + (i / (objectiveCurve.length - 1)) * width;
      const y = canvas.height - padding - objectiveCurve[i] * height;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    
    // Draw legend
    ctx.font = '12px Arial';
    ctx.fillStyle = 'purple';
    ctx.fillText('Objective Value', padding + 10, padding + 20);
    
    // Draw axes labels
    ctx.fillStyle = 'black';
    ctx.fillText('Iterations', canvas.width / 2, canvas.height - 10);
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Objective', 0, 0);
    ctx.restore();
  };
  
  const drawGANCurves = (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    generatorLossCurve: number[], 
    discriminatorLossCurve: number[]
  ) => {
    const padding = 40;
    const width = canvas.width - 2 * padding;
    const height = canvas.height - 2 * padding;
    
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Draw generator loss curve (orange)
    ctx.beginPath();
    ctx.strokeStyle = 'orange';
    for (let i = 0; i < generatorLossCurve.length; i++) {
      const x = padding + (i / (generatorLossCurve.length - 1)) * width;
      const y = canvas.height - padding - (1 - generatorLossCurve[i]) * height;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    
    // Draw discriminator loss curve (teal)
    ctx.beginPath();
    ctx.strokeStyle = 'teal';
    for (let i = 0; i < discriminatorLossCurve.length; i++) {
      const x = padding + (i / (discriminatorLossCurve.length - 1)) * width;
      const y = canvas.height - padding - (1 - discriminatorLossCurve[i]) * height;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    
    // Draw legend
    ctx.font = '12px Arial';
    ctx.fillStyle = 'orange';
    ctx.fillText('Generator Loss', padding + 10, padding + 20);
    ctx.fillStyle = 'teal';
    ctx.fillText('Discriminator Loss', padding + 120, padding + 20);
    
    // Draw axes labels
    ctx.fillStyle = 'black';
    ctx.fillText('Epochs', canvas.width / 2, canvas.height - 10);
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Loss', 0, 0);
    ctx.restore();
  };
  
  const drawPredictionVisualization = () => {
    if (!predictionCanvasRef.current || !predictionResult) return;
    
    const canvas = predictionCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Determine what to visualize based on the algorithm
    if (predictionResult.predictions && predictionResult.probabilities) {
      // Visualize classification predictions
      drawClassificationPredictions(ctx, canvas, predictionResult.predictions, predictionResult.probabilities);
    } else if (predictionResult.optimized_parameters) {
      // Visualize optimization results
      drawOptimizationResults(ctx, canvas, predictionResult.optimized_parameters, predictionResult.objective_value);
    } else if (predictionResult.generated_samples) {
      // Visualize generated samples
      drawGeneratedSamples(ctx, canvas, predictionResult.generated_samples);
    }
  };
  
  const drawClassificationPredictions = (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    predictions: number[], 
    probabilities: number[]
  ) => {
    const padding = 40;
    const barWidth = (canvas.width - 2 * padding) / predictions.length;
    const maxBarHeight = canvas.height - 2 * padding;
    
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Draw prediction bars
    for (let i = 0; i < predictions.length; i++) {
      const x = padding + i * barWidth;
      const barHeight = probabilities[i] * maxBarHeight;
      
      // Draw bar
      ctx.fillStyle = predictions[i] === 1 ? 'rgba(0, 128, 255, 0.7)' : 'rgba(255, 99, 132, 0.7)';
      ctx.fillRect(x, canvas.height - padding - barHeight, barWidth - 5, barHeight);
      
      // Draw label
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.fillText(`Sample ${i+1}`, x + barWidth / 2 - 30, canvas.height - padding + 15);
      ctx.fillText(`${(probabilities[i] * 100).toFixed(1)}%`, x + barWidth / 2 - 20, canvas.height - padding - barHeight - 5);
    }
    
    // Draw legend
    ctx.font = '12px Arial';
    ctx.fillStyle = 'rgba(0, 128, 255, 0.7)';
    ctx.fillRect(padding, padding, 15, 15);
    ctx.fillStyle = 'black';
    ctx.fillText('Class 1', padding + 20, padding + 12);
    
    ctx.fillStyle = 'rgba(255, 99, 132, 0.7)';
    ctx.fillRect(padding + 100, padding, 15, 15);
    ctx.fillStyle = 'black';
    ctx.fillText('Class 0', padding + 120, padding + 12);
    
    // Draw axes labels
    ctx.fillStyle = 'black';
    ctx.fillText('Samples', canvas.width / 2, canvas.height - 10);
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Probability', 0, 0);
    ctx.restore();
  };
  
  const drawOptimizationResults = (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    parameters: number[], 
    objectiveValue?: number
  ) => {
    const padding = 40;
    const barWidth = (canvas.width - 2 * padding) / parameters.length;
    const maxBarHeight = canvas.height - 2 * padding - 40;  // Leave room for objective value
    
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding - 40);
    ctx.lineTo(canvas.width - padding, canvas.height - padding - 40);
    ctx.stroke();
    
    // Draw parameter bars
    for (let i = 0; i < parameters.length; i++) {
      const x = padding + i * barWidth;
      // Normalize parameter to [0, 1] range for visualization
      const normalizedParam = (parameters[i] + 1) / 2;  // Assuming parameters are in [-1, 1]
      const barHeight = normalizedParam * maxBarHeight;
      
      // Draw bar
      ctx.fillStyle = `hsl(${(i * 360 / parameters.length) % 360}, 70%, 60%)`;
      ctx.fillRect(x, canvas.height - padding - 40 - barHeight, barWidth - 5, barHeight);
      
      // Draw label
      ctx.fillStyle = 'black';
      ctx.font = '10px Arial';
      ctx.fillText(`θ${i}`, x + barWidth / 2 - 5, canvas.height - padding - 25);
      ctx.fillText(`${parameters[i].toFixed(2)}`, x + barWidth / 2 - 15, canvas.height - padding - 40 - barHeight - 5);
    }
    
    // Draw objective value
    if (objectiveValue !== undefined) {
      ctx.fillStyle = 'black';
      ctx.font = '14px Arial';
      ctx.fillText(`Objective Value: ${objectiveValue.toFixed(4)}`, padding, canvas.height - padding + 15);
    }
    
    // Draw axes labels
    ctx.fillStyle = 'black';
    ctx.fillText('Parameters', canvas.width / 2, canvas.height - 10);
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Value', 0, 0);
    ctx.restore();
  };
  
  const drawGeneratedSamples = (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    samples: number[][]
  ) => {
    const padding = 40;
    const plotWidth = canvas.width - 2 * padding;
    const plotHeight = canvas.height - 2 * padding;
    
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Draw samples as points in 2D space (using first two features)
    for (let i = 0; i < samples.length; i++) {
      const sample = samples[i];
      // Use first two features for x and y coordinates
      const x = padding + sample[0] * plotWidth;
      const y = canvas.height - padding - sample[1] * plotHeight;
      
      // Draw point
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = `hsl(${(i * 360 / samples.length) % 360}, 70%, 60%)`;
      ctx.fill();
      
      // Draw label
      ctx.fillStyle = 'black';
      ctx.font = '10px Arial';
      ctx.fillText(`Sample ${i+1}`, x + 10, y);
    }
    
    // Draw axes labels
    ctx.fillStyle = 'black';
    ctx.fillText('Feature 1', canvas.width / 2, canvas.height - 10);
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Feature 2', 0, 0);
    ctx.restore();
  };
  
  const drawQuantumAdvantageVisualization = () => {
    if (!advantageCanvasRef.current || !trainingResult?.quantum_advantage) return;
    
    const canvas = advantageCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const advantage = trainingResult.quantum_advantage;
    
    // Draw a bar chart comparing classical vs quantum
    const padding = 40;
    const barWidth = 60;
    const maxBarHeight = canvas.height - 2 * padding;
    
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Draw speedup bar (logarithmic scale)
    const speedupX = padding + 50;
    const speedupRatio = Math.min(advantage.speedup_ratio, 1000);  // Cap for visualization
    const speedupHeight = Math.min(maxBarHeight * Math.log10(speedupRatio + 1) / 3, maxBarHeight);
    
    ctx.fillStyle = 'rgba(0, 128, 255, 0.7)';
    ctx.fillRect(speedupX, canvas.height - padding - speedupHeight, barWidth, speedupHeight);
    
    // Draw memory bar (logarithmic scale)
    const memoryX = speedupX + barWidth + 50;
    const memoryRatio = Math.min(advantage.memory_ratio, 1000);  // Cap for visualization
    const memoryHeight = Math.min(maxBarHeight * Math.log10(memoryRatio + 1) / 3, maxBarHeight);
    
    ctx.fillStyle = 'rgba(255, 99, 132, 0.7)';
    ctx.fillRect(memoryX, canvas.height - padding - memoryHeight, barWidth, memoryHeight);
    
    // Draw labels
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.fillText('Speedup', speedupX + barWidth / 2 - 25, canvas.height - padding + 15);
    ctx.fillText(`${advantage.speedup_ratio.toFixed(1)}x`, speedupX + barWidth / 2 - 15, canvas.height - padding - speedupHeight - 5);
    
    ctx.fillText('Memory', memoryX + barWidth / 2 - 25, canvas.height - padding + 15);
    ctx.fillText(`${advantage.memory_ratio.toFixed(1)}x`, memoryX + barWidth / 2 - 15, canvas.height - padding - memoryHeight - 5);
    
    // Draw quantum circuit info
    ctx.fillStyle = 'black';
    ctx.font = '14px Arial';
    ctx.fillText(`Quantum Circuit: ${advantage.num_qubits} qubits, depth ${advantage.circuit_depth}`, padding, padding - 10);
    
    // Draw axes labels
    ctx.fillStyle = 'black';
    ctx.fillText('Quantum Advantage (log scale)', canvas.width / 2 - 80, canvas.height - 10);
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Ratio (Quantum vs Classical)', 0, 0);
    ctx.restore();
  };
  
  return (
    <div className="quantum-ml-dashboard">
      <h2>Quantum Machine Learning Dashboard</h2>
      
      <div className="dashboard-container">
        <div className="control-panel">
          <h3>Model Configuration</h3>
          
          <div className="form-group">
            <label>Quantum ML Model:</label>
            <select 
              value={selectedModel} 
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={isTraining}
            >
              {availableModels.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.type})
                </option>
              ))}
            </select>
          </div>
          
          {selectedModel && (
            <div className="algorithm-info">
              <h4>Algorithm Information</h4>
              {availableAlgorithms.map(algo => {
                const model = availableModels.find(m => m.id === selectedModel);
                if (model && algo.id === model.algorithm) {
                  return (
                    <div key={algo.id} className="algorithm-description">
                      <p><strong>{algo.name}</strong></p>
                      <p>{algo.description}</p>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
          
          <h3>Hyperparameters</h3>
          {Object.entries(hyperParameters).map(([param, value]) => (
            <div key={param} className="form-group">
              <label>{param.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</label>
              {typeof value === 'number' ? (
                <input 
                  type="number" 
                  value={value}
                  onChange={(e) => handleHyperParameterChange(param, parseFloat(e.target.value))}
                  disabled={isTraining}
                  min={0}
                  step={param.includes('rate') ? 0.001 : 1}
                />
              ) : typeof value === 'string' ? (
                <input 
                  type="text" 
                  value={value}
                  onChange={(e) => handleHyperParameterChange(param, e.target.value)}
                  disabled={isTraining}
                />
              ) : Array.isArray(value) ? (
                <input 
                  type="text" 
                  value={value.join(', ')}
                  onChange={(e) => handleHyperParameterChange(param, e.target.value.split(',').map(v => parseInt(v.trim())))}
                  disabled={isTraining}
                />
              ) : (
                <input 
                  type="text" 
                  value={JSON.stringify(value)}
                  disabled={true}
                />
              )}
            </div>
          ))}
          
          <h3>Dataset Configuration</h3>
          <div className="form-group">
            <label>Dataset Type:</label>
            <select 
              value={datasetType} 
              onChange={(e) => setDatasetType(e.target.value)}
              disabled={isTraining}
            >
              <option value="classification">Classification</option>
              <option value="regression">Regression</option>
              <option value="optimization">Optimization</option>
              <option value="generative">Generative</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Dataset Size:</label>
            <input 
              type="number" 
              value={datasetSize}
              onChange={(e) => setDatasetSize(parseInt(e.target.value))}
              disabled={isTraining}
              min={10}
              max={1000}
              step={10}
            />
          </div>
          
          <div className="form-group">
            <label>Features/Dimensions:</label>
            <input 
              type="number" 
              value={datasetFeatures}
              onChange={(e) => setDatasetFeatures(parseInt(e.target.value))}
              disabled={isTraining}
              min={2}
              max={20}
              step={1}
            />
          </div>
          
          <div className="web3-integration">
            <h3>Web3 Integration</h3>
            {!connected ? (
              <button 
                onClick={connectWallet}
                disabled={isTraining}
                className="connect-wallet-button"
              >
                Connect Wallet for Quantum Computing Credits
              </button>
            ) : (
              <div className="connected-wallet">
                <p>Connected: {account?.substring(0, 6)}...{account?.substring(account!.length - 4)}</p>
                <p>Quantum Computing Credits: 100 QCC</p>
              </div>
            )}
          </div>
          
          <div className="action-buttons">
            <button 
              onClick={trainModel}
              disabled={isTraining || !selectedModel}
              className="primary-button"
            >
              {isTraining ? 'Training...' : 'Train Model'}
            </button>
            
            <button 
              onClick={predictWithModel}
              disabled={isPredicting || isTraining || !trainingResult}
              className="primary-button"
            >
              {isPredicting ? 'Predicting...' : 'Make Predictions'}
            </button>
          </div>
        </div>
        
        <div className="visualization-panel">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {isTraining && (
            <div className="training-progress">
              <h3>Training Progress</h3>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${trainingProgress}%` }}
                ></div>
              </div>
              <div className="progress-text">
                {trainingProgress}%
              </div>
            </div>
          )}
          
          {trainingResult && (
            <div className="training-results">
              <h3>Training Results</h3>
              
              <div className="visualization-container">
                <h4>Training Visualization</h4>
                <canvas 
                  ref={trainingCanvasRef} 
                  width={500} 
                  height={300} 
                  className="visualization-canvas"
                ></canvas>
              </div>
              
              <div className="metrics-grid">
                {trainingResult.accuracy !== undefined && (
                  <div className="metric-item">
                    <span className="metric-label">Accuracy:</span>
                    <span className="metric-value">{(trainingResult.accuracy * 100).toFixed(2)}%</span>
                  </div>
                )}
                
                {trainingResult.loss !== undefined && (
                  <div className="metric-item">
                    <span className="metric-label">Loss:</span>
                    <span className="metric-value">{trainingResult.loss.toFixed(4)}</span>
                  </div>
                )}
                
                {trainingResult.precision !== undefined && (
                  <div className="metric-item">
                    <span className="metric-label">Precision:</span>
                    <span className="metric-value">{(trainingResult.precision * 100).toFixed(2)}%</span>
                  </div>
                )}
                
                {trainingResult.recall !== undefined && (
                  <div className="metric-item">
                    <span className="metric-label">Recall:</span>
                    <span className="metric-value">{(trainingResult.recall * 100).toFixed(2)}%</span>
                  </div>
                )}
                
                {trainingResult.f1_score !== undefined && (
                  <div className="metric-item">
                    <span className="metric-label">F1 Score:</span>
                    <span className="metric-value">{(trainingResult.f1_score * 100).toFixed(2)}%</span>
                  </div>
                )}
                
                {trainingResult.final_energy !== undefined && (
                  <div className="metric-item">
                    <span className="metric-label">Final Energy:</span>
                    <span className="metric-value">{trainingResult.final_energy.toFixed(4)}</span>
                  </div>
                )}
                
                {trainingResult.approximation_ratio !== undefined && (
                  <div className="metric-item">
                    <span className="metric-label">Approximation Ratio:</span>
                    <span className="metric-value">{(trainingResult.approximation_ratio * 100).toFixed(2)}%</span>
                  </div>
                )}
                
                {trainingResult.fidelity !== undefined && (
                  <div className="metric-item">
                    <span className="metric-label">Fidelity:</span>
                    <span className="metric-value">{(trainingResult.fidelity * 100).toFixed(2)}%</span>
                  </div>
                )}
                
                <div className="metric-item">
                  <span className="metric-label">Training Time:</span>
                  <span className="metric-value">{trainingResult.training_time.toFixed(3)} seconds</span>
                </div>
              </div>
              
              <div className="quantum-advantage">
                <h4>Quantum Advantage</h4>
                <canvas 
                  ref={advantageCanvasRef} 
                  width={500} 
                  height={250} 
                  className="advantage-canvas"
                ></canvas>
              </div>
            </div>
          )}
          
          {predictionResult && (
            <div className="prediction-results">
              <h3>Prediction Results</h3>
              
              <div className="visualization-container">
                <h4>Prediction Visualization</h4>
                <canvas 
                  ref={predictionCanvasRef} 
                  width={500} 
                  height={300} 
                  className="visualization-canvas"
                ></canvas>
              </div>
              
              {predictionResult.predictions && (
                <div className="prediction-details">
                  <h4>Classification Results</h4>
                  <table className="prediction-table">
                    <thead>
                      <tr>
                        <th>Sample</th>
                        <th>Predicted Class</th>
                        <th>Probability</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predictionResult.predictions.map((pred, index) => (
                        <tr key={index}>
                          <td>Sample {index + 1}</td>
                          <td>{pred}</td>
                          <td>{(predictionResult.probabilities![index] * 100).toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {predictionResult.optimized_parameters && (
                <div className="prediction-details">
                  <h4>Optimization Results</h4>
                  <p><strong>Objective Value:</strong> {predictionResult.objective_value?.toFixed(4)}</p>
                  <p><strong>Optimized Parameters:</strong></p>
                  <div className="parameters-grid">
                    {predictionResult.optimized_parameters.map((param, index) => (
                      <div key={index} className="parameter-item">
                        <span className="parameter-label">θ{index}:</span>
                        <span className="parameter-value">{param.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {predictionResult.generated_samples && (
                <div className="prediction-details">
                  <h4>Generated Samples</h4>
                  <table className="prediction-table">
                    <thead>
                      <tr>
                        <th>Sample</th>
                        <th>Features</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predictionResult.generated_samples.map((sample, index) => (
                        <tr key={index}>
                          <td>Sample {index + 1}</td>
                          <td>[{sample.map(v => v.toFixed(3)).join(', ')}]</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .quantum-ml-dashboard {
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
        
        .algorithm-info {
          margin: 15px 0;
          padding: 10px;
          background-color: #f0f8ff;
          border-radius: 5px;
          border-left: 3px solid #4285F4;
        }
        
        .algorithm-description {
          font-size: 14px;
        }
        
        .web3-integration {
          margin: 20px 0;
          padding: 15px;
          background-color: #f0f8ff;
          border-radius: 5px;
          border: 1px solid #d0e0ff;
        }
        
        .connected-wallet {
          font-size: 14px;
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
        
        .action-buttons {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        
        .primary-button {
          flex: 1;
          background-color: #4285F4;
          color: white;
          padding: 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .primary-button:hover {
          background-color: #3367D6;
        }
        
        .primary-button:disabled {
          background-color: #A4C2F4;
          cursor: not-allowed;
        }
        
        .error-message {
          color: #EA4335;
          margin: 10px 0;
          padding: 10px;
          background-color: #FDEDEC;
          border-radius: 4px;
        }
        
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
        
        .training-results, .prediction-results {
          margin-top: 20px;
        }
        
        .visualization-container {
          margin: 15px 0;
          background-color: white;
          border-radius: 5px;
          padding: 10px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .visualization-canvas, .advantage-canvas {
          width: 100%;
          height: auto;
          background-color: white;
          border: 1px solid #eee;
          border-radius: 4px;
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 10px;
          margin: 15px 0;
        }
        
        .metric-item {
          padding: 10px;
          background-color: white;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .metric-label {
          font-weight: 500;
          color: #555;
          display: block;
          margin-bottom: 5px;
        }
        
        .metric-value {
          font-size: 16px;
          color: #333;
          font-weight: 500;
        }
        
        .quantum-advantage {
          margin: 15px 0;
          background-color: white;
          border-radius: 5px;
          padding: 10px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .prediction-details {
          margin: 15px 0;
          padding: 15px;
          background-color: white;
          border-radius: 5px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .prediction-table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
        }
        
        .prediction-table th, .prediction-table td {
          padding: 8px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        
        .prediction-table th {
          background-color: #f8f9fa;
          font-weight: 500;
        }
        
        .parameters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 10px;
          margin: 10px 0;
        }
        
        .parameter-item {
          padding: 8px;
          background-color: #f8f9fa;
          border-radius: 4px;
        }
        
        .parameter-label {
          font-weight: 500;
          color: #555;
          display: block;
          margin-bottom: 5px;
          font-size: 12px;
        }
        
        .parameter-value {
          font-size: 14px;
          color: #333;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};