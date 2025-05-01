/**
 * Blockchain Network Manager
 * Manages connections to different blockchain networks and synchronization
 */

const Web3Provider = require('./Web3Provider');
const KontourCoinWeb3 = require('./KontourCoinWeb3');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

class BlockchainNetworkManager extends EventEmitter {
  /**
   * Initialize the blockchain network manager
   * @param {object} config - Configuration object
   */
  constructor(config) {
    super();
    this.config = config;
    this.web3Provider = new Web3Provider(config);
    this.kontourCoinInstances = {};
    this.networkStatus = {};
    this.syncInterval = null;
  }

  /**
   * Initialize the network manager
   * @returns {Promise<void>}
   */
  async initialize() {
    // Initialize network status
    for (const network in this.config.networks) {
      this.networkStatus[network] = {
        connected: false,
        chainId: null,
        blockNumber: null,
        gasPrice: null,
        contractAddress: this.config.networks[network].contractAddress,
        lastSyncTime: null
      };
    }
    
    // Connect to networks
    await this.connectToNetworks();
    
    // Start sync interval
    this.startSync();
  }

  /**
   * Connect to all configured networks
   * @returns {Promise<void>}
   */
  async connectToNetworks() {
    for (const network in this.config.networks) {
      await this.connectToNetwork(network);
    }
  }

  /**
   * Connect to a specific network
   * @param {string} network - Network name
   * @returns {Promise<boolean>} - Whether connection was successful
   */
  async connectToNetwork(network) {
    try {
      const web3 = this.web3Provider.getWeb3(network);
      
      // Check connection
      const isConnected = await web3.eth.net.isListening();
      if (!isConnected) {
        throw new Error(`Failed to connect to ${network}`);
      }
      
      // Get network information
      const [chainId, blockNumber, gasPrice] = await Promise.all([
        web3.eth.getChainId(),
        web3.eth.getBlockNumber(),
        web3.eth.getGasPrice()
      ]);
      
      // Update network status
      this.networkStatus[network] = {
        ...this.networkStatus[network],
        connected: true,
        chainId,
        blockNumber,
        gasPrice,
        lastSyncTime: Date.now()
      };
      
      // Fix backend connection issues
      let retries = 3;
      while (retries > 0) {
        try {
          // Create KontourCoin instance
          const networkConfig = this.config.networks[network];
          this.kontourCoinInstances[network] = new KontourCoinWeb3(
            networkConfig.providerUrl,
            networkConfig.contractAddress,
            this.config.pythonBackendUrl,
            this.config.javaBackendUrl
          );
          
          console.log(`Connected to ${network}`);
          this.networkStatus[network].connected = true;
          this.emit('networkConnected', { network });
          return true;
        } catch (connectionError) {
          retries--;
          if (retries === 0) throw connectionError;
          console.log(`Connection attempt failed, retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    } catch (error) {
      console.error(`Error connecting to ${network}:`, error.message);
      this.networkStatus[network].connected = false;
      this.emit('networkError', { network, error: error.message });
      return false;
    }
  }

  /**
   * Start synchronization interval
   */
  startSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(() => {
      this.syncNetworks();
    }, this.config.syncIntervalMs || 30000);
    
    console.log(`Network sync started (interval: ${this.config.syncIntervalMs || 30000}ms)`);
  }

  /**
   * Stop synchronization interval
   */
  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Network sync stopped');
    }
  }

  /**
   * Synchronize all networks
   * @returns {Promise<void>}
   */
  async syncNetworks() {
    for (const network in this.config.networks) {
      if (this.networkStatus[network].connected) {
        await this.syncNetwork(network);
      } else {
        // Try to reconnect
        await this.connectToNetwork(network);
      }
    }
    
    // Sync backends
    await this.syncBackends();
  }

  /**
   * Synchronize a specific network
   * @param {string} network - Network name
   * @returns {Promise<void>}
   */
  async syncNetwork(network) {
    try {
      const web3 = this.web3Provider.getWeb3(network);
      
      // Get latest block number
      const blockNumber = await web3.eth.getBlockNumber();
      
      // If new blocks are available, process them
      if (blockNumber > this.networkStatus[network].blockNumber) {
        console.log(`New blocks on ${network}: ${this.networkStatus[network].blockNumber} -> ${blockNumber}`);
        
        // Process new blocks
        for (let i = this.networkStatus[network].blockNumber + 1; i <= blockNumber; i++) {
          const block = await web3.eth.getBlock(i, true);
          this.emit('newBlock', { network, block });
          
          // Process transactions in the block
          if (block && block.transactions) {
            for (const tx of block.transactions) {
              this.emit('newTransaction', { network, transaction: tx });
            }
          }
        }
        
        // Update network status
        this.networkStatus[network].blockNumber = blockNumber;
      }
      
      // Update gas price
      const gasPrice = await web3.eth.getGasPrice();
      this.networkStatus[network].gasPrice = gasPrice;
      
      // Update last sync time
      this.networkStatus[network].lastSyncTime = Date.now();
      
      this.emit('networkSynced', { network, blockNumber });
    } catch (error) {
      console.error(`Error syncing ${network}:`, error.message);
      this.emit('syncError', { network, error: error.message });
      
      // Mark as disconnected if sync fails
      this.networkStatus[network].connected = false;
    }
  }

  /**
   * Synchronize Java and Python backends
   * @returns {Promise<void>}
   */
  async syncBackends() {
    try {
      // Get Python backend stats
      const pythonStats = await this.getPythonBackendStats();
      
      // Get Java backend stats
      const javaStats = await this.getJavaBackendStats();
      
      // Compare and sync if needed
      if (pythonStats && javaStats) {
        // Check if Java backend is ahead of Python backend
        if (javaStats.blockchainLength > pythonStats.java_backend?.blockchainLength) {
          console.log('Java backend ahead of Python backend, syncing...');
          await this.syncPythonWithJava();
        }
        
        // Check if any network is ahead of Java backend
        for (const network in this.networkStatus) {
          if (this.networkStatus[network].connected && 
              this.networkStatus[network].blockNumber > javaStats.blockchainLength) {
            console.log(`Network ${network} ahead of Java backend, syncing...`);
            await this.syncJavaWithNetwork(network);
          }
        }
      }
    } catch (error) {
      console.error('Error syncing backends:', error.message);
    }
  }

  /**
   * Get Python backend statistics
   * @returns {Promise<object>} - Backend statistics
   */
  async getPythonBackendStats() {
    try {
      const response = await axios.get(`${this.config.pythonBackendUrl}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error getting Python backend stats:', error.message);
      return null;
    }
  }

  /**
   * Get Java backend statistics
   * @returns {Promise<object>} - Backend statistics
   */
  async getJavaBackendStats() {
    try {
      const response = await axios.get(`${this.config.javaBackendUrl}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error getting Java backend stats:', error.message);
      return null;
    }
  }

  /**
   * Synchronize Python backend with Java backend
   * @returns {Promise<void>}
   */
  async syncPythonWithJava() {
    try {
      // Get Java blockchain info
      const response = await axios.get(`${this.config.javaBackendUrl}/blockchain`);
      const blockchainInfo = response.data;
      
      // Get latest block
      const latestBlock = blockchainInfo.latestBlock;
      
      // Sync latest block to Python backend
      await axios.post(`${this.config.pythonBackendUrl}/sync-block`, {
        block_data: latestBlock
      });
      
      console.log('Python backend synced with Java backend');
    } catch (error) {
      console.error('Error syncing Python with Java:', error.message);
    }
  }

  /**
   * Synchronize Java backend with a network
   * @param {string} network - Network name
   * @returns {Promise<void>}
   */
  async syncJavaWithNetwork(network) {
    try {
      const kontourCoin = this.getKontourCoin(network);
      const blockchainInfo = await kontourCoin.getBlockchainInfo();
      
      // Get latest block from contract
      const latestBlock = blockchainInfo.latestBlock;
      
      // Sync latest block to Java backend
      await axios.post(`${this.config.javaBackendUrl}/sync-block`, {
        block_data: {
          index: latestBlock.index,
          timestamp: latestBlock.timestamp,
          hash: latestBlock.hash,
          previousHash: latestBlock.previousHash,
          data: `Synced from ${network}`,
          nonce: 0,
          merkleRoot: '0x0000000000000000000000000000000000000000000000000000000000000000',
          contourHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
          contourComplexity: 0,
          minerAddress: latestBlock.miner
        }
      });
      
      console.log(`Java backend synced with ${network}`);
    } catch (error) {
      console.error(`Error syncing Java with ${network}:`, error.message);
    }
  }

  /**
   * Get KontourCoin instance for a specific network
   * @param {string} network - Network name
   * @returns {KontourCoinWeb3} - KontourCoin instance
   */
  getKontourCoin(network) {
    if (!this.kontourCoinInstances[network]) {
      throw new Error(`KontourCoin instance not found for ${network}`);
    }
    return this.kontourCoinInstances[network];
  }

  /**
   * Get network status
   * @returns {object} - Network status
   */
  getNetworkStatus() {
    return this.networkStatus;
  }

  /**
   * Close all connections
   */
  close() {
    this.stopSync();
    this.web3Provider.closeProviders();
    console.log('Blockchain network manager closed');
  }
}

module.exports = BlockchainNetworkManager;
