/**
 * Web3 API Server
 * Provides REST API for interacting with the Kontour Coin blockchain
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const BlockchainNetworkManager = require('./BlockchainNetworkManager');
const optimizationApi = require('./optimization-api');
const fs = require('fs');
const path = require('path');

class Web3ApiServer {
  /**
   * Initialize the Web3 API server
   * @param {object} config - Configuration object
   */
  constructor(config) {
    this.config = config;
    this.app = express();
    this.networkManager = new BlockchainNetworkManager(config);
    this.server = null;
    this.io = null;
    this.updateInterval = null;
  }

  /**
   * Start the API server
   * @returns {Promise<void>}
   */
  async start() {
    // Configure Express
    this.app.use(cors());
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    
    // Serve static files from public directory
    this.app.use(express.static(path.join(__dirname, 'public')));

    // Initialize network manager
    await this.networkManager.initialize();

    // Set up routes
    this.setupRoutes();

    // Create HTTP server
    this.server = http.createServer(this.app);
    
    // Initialize Socket.IO
    this.io = socketIo(this.server);
    this.setupSocketIO();

    // Start server
    return new Promise((resolve, reject) => {
      try {
        this.server.listen(this.config.apiPort || 3000, () => {
          console.log(`Web3 API server listening on port ${this.config.apiPort || 3000}`);
          
          // Start real-time updates
          this.startRealTimeUpdates();
          
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Set up API routes
   */
  setupRoutes() {
    // Root endpoint - serve the visualization UI
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
    
    // API status endpoint
    this.app.get('/api/status', (req, res) => {
      res.json({
        name: 'Kontour Coin Web3 API',
        version: '1.0.0',
        status: 'running'
      });
    });
    
    // Blockchain statistics for visualization
    this.app.get('/api/blockchain-stats', async (req, res) => {
      try {
        const stats = await this.getBlockchainStats();
        res.json(stats);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Optimization API routes
    this.app.post('/api/train-model', async (req, res) => {
      try {
        const { modelType, trainingData } = req.body;
        
        if (!modelType || !trainingData) {
          return res.status(400).json({ error: 'Model type and training data are required' });
        }
        
        // Forward to Python backend for training
        const response = await this.networkManager.fetchFromPythonBackend('/train-model', {
          method: 'POST',
          body: JSON.stringify({ modelType, trainingData }),
          headers: { 'Content-Type': 'application/json' }
        });
        
        res.json(response);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    this.app.post('/api/predict', async (req, res) => {
      try {
        const { modelType, inputData } = req.body;
        
        if (!modelType || !inputData) {
          return res.status(400).json({ error: 'Model type and input data are required' });
        }
        
        // Forward to Python backend for prediction
        const response = await this.networkManager.fetchFromPythonBackend('/predict', {
          method: 'POST',
          body: JSON.stringify({ modelType, inputData }),
          headers: { 'Content-Type': 'application/json' }
        });
        
        res.json(response);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    this.app.post('/api/apply-optimization', async (req, res) => {
      try {
        const { optimizationType, parameters } = req.body;
        
        if (!optimizationType || !parameters) {
          return res.status(400).json({ error: 'Optimization type and parameters are required' });
        }
        
        let response;
        
        // Apply optimization to appropriate backend
        switch (optimizationType) {
          case 'transaction':
            // Apply transaction optimization to Java backend
            response = await this.networkManager.fetchFromJavaBackend('/optimize/transaction', {
              method: 'POST',
              body: JSON.stringify(parameters),
              headers: { 'Content-Type': 'application/json' }
            });
            break;
          
          case 'contour':
            // Apply contour optimization to Python backend
            response = await this.networkManager.fetchFromPythonBackend('/optimize/contour', {
              method: 'POST',
              body: JSON.stringify(parameters),
              headers: { 'Content-Type': 'application/json' }
            });
            break;
          
          case 'network':
            // Apply network optimization to both backends
            const javaResponse = await this.networkManager.fetchFromJavaBackend('/optimize/network', {
              method: 'POST',
              body: JSON.stringify(parameters),
              headers: { 'Content-Type': 'application/json' }
            });
            
            const pythonResponse = await this.networkManager.fetchFromPythonBackend('/optimize/network', {
              method: 'POST',
              body: JSON.stringify(parameters),
              headers: { 'Content-Type': 'application/json' }
            });
            
            response = {
              java: javaResponse,
              python: pythonResponse
            };
            break;
          
          default:
            return res.status(400).json({ error: 'Invalid optimization type' });
        }
        
        res.json(response);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Quantum Computing API endpoints
    this.app.get('/api/quantum/status', async (req, res) => {
      try {
        const response = await this.networkManager.fetchFromPythonBackend('/quantum/status');
        res.json(response);
      } catch (error) {
        res.status(500).json({ 
          available: false,
          reason: error.message || 'Failed to get quantum status'
        });
      }
    });
    
    this.app.post('/api/quantum/train', async (req, res) => {
      try {
        const { modelType, trainingData } = req.body;
        
        if (!modelType || !trainingData) {
          return res.status(400).json({ error: 'Model type and training data are required' });
        }
        
        const response = await this.networkManager.fetchFromPythonBackend('/quantum/train', {
          method: 'POST',
          body: JSON.stringify({ modelType, trainingData }),
          headers: { 'Content-Type': 'application/json' }
        });
        
        res.json(response);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    this.app.get('/api/quantum/training-status/:jobId', async (req, res) => {
      try {
        const { jobId } = req.params;
        
        const response = await this.networkManager.fetchFromPythonBackend(`/quantum/training-status/${jobId}`);
        res.json(response);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    this.app.post('/api/quantum/predict', async (req, res) => {
      try {
        const { jobId, inputData } = req.body;
        
        if (!jobId || !inputData) {
          return res.status(400).json({ error: 'Job ID and input data are required' });
        }
        
        const response = await this.networkManager.fetchFromPythonBackend('/quantum/predict', {
          method: 'POST',
          body: JSON.stringify({ jobId, inputData }),
          headers: { 'Content-Type': 'application/json' }
        });
        
        res.json(response);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    this.app.post('/api/quantum/optimize', async (req, res) => {
      try {
        const { optimizationType, parameters } = req.body;
        
        if (!optimizationType || !parameters) {
          return res.status(400).json({ error: 'Optimization type and parameters are required' });
        }
        
        const response = await this.networkManager.fetchFromPythonBackend('/quantum/optimize', {
          method: 'POST',
          body: JSON.stringify({ optimizationType, parameters }),
          headers: { 'Content-Type': 'application/json' }
        });
        
        res.json(response);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Gas Optimizer API endpoints
    this.app.post('/api/gas/analyze', async (req, res) => {
      try {
        const { code } = req.body;
        
        if (!code) {
          return res.status(400).json({ error: 'Contract code is required' });
        }
        
        const response = await this.networkManager.fetchFromPythonBackend('/gas/analyze', {
          method: 'POST',
          body: JSON.stringify({ code }),
          headers: { 'Content-Type': 'application/json' }
        });
        
        res.json(response);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    this.app.post('/api/gas/optimize', async (req, res) => {
      try {
        const { code, level } = req.body;
        
        if (!code) {
          return res.status(400).json({ error: 'Contract code is required' });
        }
        
        const response = await this.networkManager.fetchFromPythonBackend('/gas/optimize', {
          method: 'POST',
          body: JSON.stringify({ code, level: level || 'balanced' }),
          headers: { 'Content-Type': 'application/json' }
        });
        
        res.json(response);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    this.app.post('/api/gas/estimate-savings', async (req, res) => {
      try {
        const { gasSaved, txVolume, gasPrice, ethPrice } = req.body;
        
        if (gasSaved === undefined) {
          return res.status(400).json({ error: 'Gas saved is required' });
        }
        
        const response = await this.networkManager.fetchFromPythonBackend('/gas/estimate-savings', {
          method: 'POST',
          body: JSON.stringify({ 
            gasSaved, 
            txVolume: txVolume || 100, 
            gasPrice: gasPrice || 50, 
            ethPrice: ethPrice || 3000 
          }),
          headers: { 'Content-Type': 'application/json' }
        });
        
        res.json(response);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Network status
    this.app.get('/api/networks', (req, res) => {
      res.json(this.networkManager.getNetworkStatus());
    });
    
    // Network-specific endpoints
    this.app.get('/api/networks/:network', (req, res) => {
      const { network } = req.params;
      
      if (!this.config.networks[network]) {
        return res.status(404).json({ error: `Network ${network} not found` });
      }
      
      res.json(this.networkManager.getNetworkStatus()[network]);
    });
    
    // Blockchain info
    this.app.get('/api/blockchain/:network', async (req, res) => {
      const { network } = req.params;
      
      try {
        const kontourCoin = this.networkManager.getKontourCoin(network);
        const blockchainInfo = await kontourCoin.getBlockchainInfo();
        res.json(blockchainInfo);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Account balance
    this.app.get('/api/balance/:network/:address', async (req, res) => {
      const { network, address } = req.params;
      
      try {
        const kontourCoin = this.networkManager.getKontourCoin(network);
        const balance = await kontourCoin.getBalance(address);
        res.json({ network, address, balance });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Transfer tokens
    this.app.post('/api/transfer/:network', async (req, res) => {
      const { network } = req.params;
      const { to, amount } = req.body;
      
      if (!to || !amount) {
        return res.status(400).json({ error: 'Missing required parameters: to, amount' });
      }
      
      try {
        const kontourCoin = this.networkManager.getKontourCoin(network);
        const receipt = await kontourCoin.transfer(to, amount);
        res.json(receipt);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Add transaction
    this.app.post('/api/transactions/:network', async (req, res) => {
      const { network } = req.params;
      const { to, amount } = req.body;
      
      if (!to || !amount) {
        return res.status(400).json({ error: 'Missing required parameters: to, amount' });
      }
      
      try {
        const kontourCoin = this.networkManager.getKontourCoin(network);
        const result = await kontourCoin.addTransaction(to, amount);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Get transaction status
    this.app.get('/api/transactions/:network/:txHash', async (req, res) => {
      const { network, txHash } = req.params;
      
      try {
        const kontourCoin = this.networkManager.getKontourCoin(network);
        const status = await kontourCoin.getTransactionStatus(txHash);
        res.json(status);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Mine block
    this.app.post('/api/mine/:network', async (req, res) => {
      const { network } = req.params;
      const { data } = req.body;
      
      if (!data) {
        return res.status(400).json({ error: 'Missing required parameter: data' });
      }
      
      try {
        const kontourCoin = this.networkManager.getKontourCoin(network);
        const result = await kontourCoin.mineBlock(data);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Add stake
    this.app.post('/api/stake/:network', async (req, res) => {
      const { network } = req.params;
      const { amount } = req.body;
      
      if (!amount) {
        return res.status(400).json({ error: 'Missing required parameter: amount' });
      }
      
      try {
        const kontourCoin = this.networkManager.getKontourCoin(network);
        const receipt = await kontourCoin.addStake(amount);
        res.json(receipt);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Remove stake
    this.app.post('/api/unstake/:network', async (req, res) => {
      const { network } = req.params;
      const { amount } = req.body;
      
      if (!amount) {
        return res.status(400).json({ error: 'Missing required parameter: amount' });
      }
      
      try {
        const kontourCoin = this.networkManager.getKontourCoin(network);
        const receipt = await kontourCoin.removeStake(amount);
        res.json(receipt);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Backend status
    this.app.get('/api/backends', async (req, res) => {
      try {
        const pythonStats = await this.networkManager.getPythonBackendStats();
        const javaStats = await this.networkManager.getJavaBackendStats();
        
        res.json({
          python: pythonStats,
          java: javaStats
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Sync backends
    this.app.post('/api/sync', async (req, res) => {
      try {
        await this.networkManager.syncBackends();
        res.json({ success: true, message: 'Backends synchronized' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  /**
   * Stop the API server
   */
  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    if (this.io) {
      this.io.close();
      this.io = null;
    }
    
    if (this.server) {
      this.server.close();
      this.server = null;
      console.log('Web3 API server stopped');
    }
    
    this.networkManager.close();
  }
  
  /**
   * Set up Socket.IO
   */
  setupSocketIO() {
    this.io.on('connection', (socket) => {
      console.log('Client connected');
      
      // Send initial data
      this.sendBlockchainUpdate(socket);
      
      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
      
      // Handle update request
      socket.on('request-update', () => {
        this.sendBlockchainUpdate(socket);
      });
    });
  }
  
  /**
   * Start real-time updates
   */
  startRealTimeUpdates() {
    // Send updates every 5 seconds
    this.updateInterval = setInterval(() => {
      this.sendBlockchainUpdate();
    }, 5000);
  }
  
  /**
   * Send blockchain update to clients
   * @param {Socket} [socket] - Optional socket to send to (if not provided, broadcast to all)
   */
  async sendBlockchainUpdate(socket) {
    try {
      // Get blockchain stats
      const stats = await this.getBlockchainStats();
      
      // Send to specific socket or broadcast to all
      if (socket) {
        socket.emit('blockchain-update', stats);
      } else {
        this.io.emit('blockchain-update', stats);
      }
    } catch (error) {
      console.error('Error sending blockchain update:', error);
    }
  }
  
  /**
   * Get blockchain statistics
   * @returns {Promise<object>} Blockchain statistics
   */
  async getBlockchainStats() {
    try {
      // Get data from backends
      const pythonStats = await this.networkManager.getPythonBackendStats();
      const javaStats = await this.networkManager.getJavaBackendStats();
      
      // Process network data
      const networkData = this.generateNetworkData(pythonStats, javaStats);
      
      // Process optimization data
      const optimizationData = this.generateOptimizationData(pythonStats, javaStats);
      
      // Process metrics
      const metricsData = this.generateMetricsData(pythonStats, javaStats);
      
      // Return combined data
      return {
        network: networkData,
        optimization: optimizationData,
        metrics: metricsData
      };
    } catch (error) {
      console.error('Error getting blockchain stats:', error);
      
      // Return sample data
      return this.getSampleData();
    }
  }
  
  /**
   * Generate network data for visualization
   */
  generateNetworkData(pythonStats, javaStats) {
    // Default network structure
    const nodes = [
      { id: 'PythonBackend', type: 'node', size: 15 },
      { id: 'JavaBackend', type: 'node', size: 15 }
    ];
    
    const links = [
      { source: 'PythonBackend', target: 'JavaBackend', value: 2 }
    ];
    
    // Add miners
    nodes.push({ id: 'Miner1', type: 'miner', size: 20 });
    nodes.push({ id: 'Miner2', type: 'miner', size: 20 });
    links.push({ source: 'Miner1', target: 'JavaBackend', value: 2 });
    links.push({ source: 'Miner2', target: 'JavaBackend', value: 2 });
    
    // Add validators
    nodes.push({ id: 'Validator1', type: 'validator', size: 18 });
    nodes.push({ id: 'Validator2', type: 'validator', size: 18 });
    links.push({ source: 'Validator1', target: 'JavaBackend', value: 2 });
    links.push({ source: 'Validator2', target: 'PythonBackend', value: 2 });
    
    // Add blocks and transactions
    nodes.push({ id: 'Block1', type: 'block', size: 12 });
    nodes.push({ id: 'Block2', type: 'block', size: 12 });
    links.push({ source: 'Block1', target: 'Miner1', value: 3 });
    links.push({ source: 'Block2', target: 'Miner2', value: 3 });
    
    nodes.push({ id: 'Tx1', type: 'transaction', size: 8 });
    nodes.push({ id: 'Tx2', type: 'transaction', size: 8 });
    nodes.push({ id: 'Tx3', type: 'transaction', size: 8 });
    links.push({ source: 'Tx1', target: 'Block1', value: 1 });
    links.push({ source: 'Tx2', target: 'Block1', value: 1 });
    links.push({ source: 'Tx3', target: 'Block2', value: 1 });
    
    return { nodes, links };
  }
  
  /**
   * Generate optimization data
   */
  generateOptimizationData(pythonStats, javaStats) {
    // Calculate transaction throughput
    let txThroughput = 0;
    if (javaStats && javaStats.processedTransactions && javaStats.uptime) {
      txThroughput = Math.round(javaStats.processedTransactions / (javaStats.uptime / 1000));
    } else {
      txThroughput = Math.floor(Math.random() * 50) + 10;
    }
    
    // Calculate block time
    let blockTime = 0;
    if (javaStats && javaStats.averageBlockTime) {
      blockTime = Math.round(javaStats.averageBlockTime / 1000);
    } else {
      blockTime = Math.floor(Math.random() * 10) + 5;
    }
    
    // Calculate network efficiency
    let networkEfficiency = 0;
    if (pythonStats && pythonStats.geometric_operations && pythonStats.processing_time) {
      networkEfficiency = Math.min(100, Math.round(pythonStats.geometric_operations / pythonStats.processing_time * 10));
    } else {
      networkEfficiency = Math.floor(Math.random() * 30) + 60;
    }
    
    return {
      txThroughput,
      blockTime,
      networkEfficiency
    };
  }
  
  /**
   * Generate metrics data
   */
  generateMetricsData(pythonStats, javaStats) {
    // Get optimization data
    const optimization = this.generateOptimizationData(pythonStats, javaStats);
    
    // Calculate contour complexity
    let contourComplexity = 0;
    if (pythonStats && pythonStats.average_complexity) {
      contourComplexity = Math.round(pythonStats.average_complexity);
    } else {
      contourComplexity = Math.floor(Math.random() * 30) + 60;
    }
    
    return {
      ...optimization,
      contourComplexity
    };
  }
  
  /**
   * Get sample data for demonstration
   */
  getSampleData() {
    return {
      network: {
        nodes: [
          { id: 'Node1', type: 'node', size: 15 },
          { id: 'Node2', type: 'node', size: 15 },
          { id: 'Node3', type: 'node', size: 15 },
          { id: 'Node4', type: 'node', size: 15 },
          { id: 'Node5', type: 'node', size: 15 },
          { id: 'Miner1', type: 'miner', size: 20 },
          { id: 'Miner2', type: 'miner', size: 20 },
          { id: 'Validator1', type: 'validator', size: 18 },
          { id: 'Validator2', type: 'validator', size: 18 },
          { id: 'Block1', type: 'block', size: 12 },
          { id: 'Block2', type: 'block', size: 12 },
          { id: 'Tx1', type: 'transaction', size: 8 },
          { id: 'Tx2', type: 'transaction', size: 8 },
          { id: 'Tx3', type: 'transaction', size: 8 }
        ],
        links: [
          { source: 'Node1', target: 'Node2', value: 1 },
          { source: 'Node1', target: 'Node3', value: 1 },
          { source: 'Node2', target: 'Node4', value: 1 },
          { source: 'Node3', target: 'Node5', value: 1 },
          { source: 'Node4', target: 'Node5', value: 1 },
          { source: 'Miner1', target: 'Node1', value: 2 },
          { source: 'Miner2', target: 'Node3', value: 2 },
          { source: 'Validator1', target: 'Node2', value: 2 },
          { source: 'Validator2', target: 'Node5', value: 2 },
          { source: 'Block1', target: 'Miner1', value: 3 },
          { source: 'Block2', target: 'Miner2', value: 3 },
          { source: 'Tx1', target: 'Block1', value: 1 },
          { source: 'Tx2', target: 'Block1', value: 1 },
          { source: 'Tx3', target: 'Block2', value: 1 }
        ]
      },
      optimization: {
        txThroughput: 45,
        blockTime: 8,
        networkEfficiency: 75
      },
      metrics: {
        txThroughput: 45,
        blockTime: 8,
        networkEfficiency: 75,
        contourComplexity: 82
      }
    };
  }
}

module.exports = Web3ApiServer;