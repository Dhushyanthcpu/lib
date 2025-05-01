/**
 * KontourCoinWeb3
 * Web3 interface for interacting with the Kontour Coin blockchain
 */

const Web3 = require('web3');
const axios = require('axios');

class KontourCoinWeb3 {
  /**
   * Initialize the KontourCoin Web3 interface
   * @param {string} providerUrl - Web3 provider URL
   * @param {string} contractAddress - Kontour Coin contract address
   * @param {string} pythonBackendUrl - Python backend URL
   * @param {string} javaBackendUrl - Java backend URL
   */
  constructor(providerUrl, contractAddress, pythonBackendUrl, javaBackendUrl) {
    this.web3 = new Web3(providerUrl);
    this.contractAddress = contractAddress;
    this.pythonBackendUrl = pythonBackendUrl;
    this.javaBackendUrl = javaBackendUrl;
    
    // Initialize contract ABI
    this.contractAbi = [
      // Add contract ABI here
      {
        "constant": true,
        "inputs": [],
        "name": "getBlockchainInfo",
        "outputs": [{"name": "", "type": "object"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [{"name": "address", "type": "address"}],
        "name": "getBalance",
        "outputs": [{"name": "", "type": "uint256"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}],
        "name": "transfer",
        "outputs": [{"name": "", "type": "bool"}],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}],
        "name": "addTransaction",
        "outputs": [{"name": "", "type": "string"}],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [{"name": "txHash", "type": "string"}],
        "name": "getTransactionStatus",
        "outputs": [{"name": "", "type": "object"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [{"name": "data", "type": "string"}],
        "name": "mineBlock",
        "outputs": [{"name": "", "type": "object"}],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [{"name": "amount", "type": "uint256"}],
        "name": "addStake",
        "outputs": [{"name": "", "type": "bool"}],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [{"name": "amount", "type": "uint256"}],
        "name": "removeStake",
        "outputs": [{"name": "", "type": "bool"}],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ];
    
    // Initialize contract
    this.contract = new this.web3.eth.Contract(this.contractAbi, this.contractAddress);
  }

  /**
   * Get blockchain information
   * @returns {Promise<object>} - Blockchain information
   */
  async getBlockchainInfo() {
    try {
      // Try to get from contract
      const blockchainInfo = await this.contract.methods.getBlockchainInfo().call();
      return blockchainInfo;
    } catch (error) {
      console.error('Error getting blockchain info from contract:', error.message);
      
      // Fallback to Python backend
      try {
        const response = await axios.get(`${this.pythonBackendUrl}/blockchain`);
        return response.data;
      } catch (pythonError) {
        console.error('Error getting blockchain info from Python backend:', pythonError.message);
        
        // Fallback to Java backend
        try {
          const response = await axios.get(`${this.javaBackendUrl}/blockchain`);
          return response.data;
        } catch (javaError) {
          console.error('Error getting blockchain info from Java backend:', javaError.message);
          throw new Error('Failed to get blockchain info from any source');
        }
      }
    }
  }

  /**
   * Get account balance
   * @param {string} address - Account address
   * @returns {Promise<string>} - Account balance
   */
  async getBalance(address) {
    try {
      // Try to get from contract
      const balance = await this.contract.methods.getBalance(address).call();
      return balance;
    } catch (error) {
      console.error('Error getting balance from contract:', error.message);
      
      // Fallback to Python backend
      try {
        const response = await axios.get(`${this.pythonBackendUrl}/balance/${address}`);
        return response.data.balance;
      } catch (pythonError) {
        console.error('Error getting balance from Python backend:', pythonError.message);
        
        // Fallback to Java backend
        try {
          const response = await axios.get(`${this.javaBackendUrl}/balance/${address}`);
          return response.data.balance;
        } catch (javaError) {
          console.error('Error getting balance from Java backend:', javaError.message);
          throw new Error('Failed to get balance from any source');
        }
      }
    }
  }

  /**
   * Transfer tokens
   * @param {string} to - Recipient address
   * @param {number} amount - Amount to transfer
   * @returns {Promise<object>} - Transaction receipt
   */
  async transfer(to, amount) {
    try {
      // Get default account
      const accounts = await this.web3.eth.getAccounts();
      const from = accounts[0];
      
      // Transfer tokens
      const receipt = await this.contract.methods.transfer(to, amount).send({ from });
      return receipt;
    } catch (error) {
      console.error('Error transferring tokens:', error.message);
      
      // Fallback to Python backend
      try {
        const response = await axios.post(`${this.pythonBackendUrl}/transfer`, {
          to,
          amount
        });
        return response.data;
      } catch (pythonError) {
        console.error('Error transferring tokens via Python backend:', pythonError.message);
        
        // Fallback to Java backend
        try {
          const response = await axios.post(`${this.javaBackendUrl}/transfer`, {
            to,
            amount
          });
          return response.data;
        } catch (javaError) {
          console.error('Error transferring tokens via Java backend:', javaError.message);
          throw new Error('Failed to transfer tokens via any source');
        }
      }
    }
  }

  /**
   * Add transaction
   * @param {string} to - Recipient address
   * @param {number} amount - Amount to transfer
   * @returns {Promise<object>} - Transaction result
   */
  async addTransaction(to, amount) {
    try {
      // Get default account
      const accounts = await this.web3.eth.getAccounts();
      const from = accounts[0];
      
      // Add transaction
      const result = await this.contract.methods.addTransaction(to, amount).send({ from });
      return result;
    } catch (error) {
      console.error('Error adding transaction:', error.message);
      
      // Fallback to Python backend
      try {
        const response = await axios.post(`${this.pythonBackendUrl}/transactions`, {
          to,
          amount
        });
        return response.data;
      } catch (pythonError) {
        console.error('Error adding transaction via Python backend:', pythonError.message);
        
        // Fallback to Java backend
        try {
          const response = await axios.post(`${this.javaBackendUrl}/transactions`, {
            to,
            amount
          });
          return response.data;
        } catch (javaError) {
          console.error('Error adding transaction via Java backend:', javaError.message);
          throw new Error('Failed to add transaction via any source');
        }
      }
    }
  }

  /**
   * Get transaction status
   * @param {string} txHash - Transaction hash
   * @returns {Promise<object>} - Transaction status
   */
  async getTransactionStatus(txHash) {
    try {
      // Try to get from contract
      const status = await this.contract.methods.getTransactionStatus(txHash).call();
      return status;
    } catch (error) {
      console.error('Error getting transaction status from contract:', error.message);
      
      // Fallback to Python backend
      try {
        const response = await axios.get(`${this.pythonBackendUrl}/transactions/${txHash}`);
        return response.data;
      } catch (pythonError) {
        console.error('Error getting transaction status from Python backend:', pythonError.message);
        
        // Fallback to Java backend
        try {
          const response = await axios.get(`${this.javaBackendUrl}/transactions/${txHash}`);
          return response.data;
        } catch (javaError) {
          console.error('Error getting transaction status from Java backend:', javaError.message);
          throw new Error('Failed to get transaction status from any source');
        }
      }
    }
  }

  /**
   * Mine a block
   * @param {string} data - Block data
   * @returns {Promise<object>} - Mining result
   */
  async mineBlock(data) {
    try {
      // Get default account
      const accounts = await this.web3.eth.getAccounts();
      const from = accounts[0];
      
      // Mine block
      const result = await this.contract.methods.mineBlock(data).send({ from });
      return result;
    } catch (error) {
      console.error('Error mining block:', error.message);
      
      // Fallback to Python backend
      try {
        const response = await axios.post(`${this.pythonBackendUrl}/mine`, {
          data
        });
        return response.data;
      } catch (pythonError) {
        console.error('Error mining block via Python backend:', pythonError.message);
        
        // Fallback to Java backend
        try {
          const response = await axios.post(`${this.javaBackendUrl}/mine`, {
            data
          });
          return response.data;
        } catch (javaError) {
          console.error('Error mining block via Java backend:', javaError.message);
          throw new Error('Failed to mine block via any source');
        }
      }
    }
  }

  /**
   * Add stake
   * @param {number} amount - Amount to stake
   * @returns {Promise<object>} - Staking result
   */
  async addStake(amount) {
    try {
      // Get default account
      const accounts = await this.web3.eth.getAccounts();
      const from = accounts[0];
      
      // Add stake
      const result = await this.contract.methods.addStake(amount).send({ from });
      return result;
    } catch (error) {
      console.error('Error adding stake:', error.message);
      
      // Fallback to Python backend
      try {
        const response = await axios.post(`${this.pythonBackendUrl}/stake`, {
          amount
        });
        return response.data;
      } catch (pythonError) {
        console.error('Error adding stake via Python backend:', pythonError.message);
        
        // Fallback to Java backend
        try {
          const response = await axios.post(`${this.javaBackendUrl}/stake`, {
            amount
          });
          return response.data;
        } catch (javaError) {
          console.error('Error adding stake via Java backend:', javaError.message);
          throw new Error('Failed to add stake via any source');
        }
      }
    }
  }

  /**
   * Remove stake
   * @param {number} amount - Amount to unstake
   * @returns {Promise<object>} - Unstaking result
   */
  async removeStake(amount) {
    try {
      // Get default account
      const accounts = await this.web3.eth.getAccounts();
      const from = accounts[0];
      
      // Remove stake
      const result = await this.contract.methods.removeStake(amount).send({ from });
      return result;
    } catch (error) {
      console.error('Error removing stake:', error.message);
      
      // Fallback to Python backend
      try {
        const response = await axios.post(`${this.pythonBackendUrl}/unstake`, {
          amount
        });
        return response.data;
      } catch (pythonError) {
        console.error('Error removing stake via Python backend:', pythonError.message);
        
        // Fallback to Java backend
        try {
          const response = await axios.post(`${this.javaBackendUrl}/unstake`, {
            amount
          });
          return response.data;
        } catch (javaError) {
          console.error('Error removing stake via Java backend:', javaError.message);
          throw new Error('Failed to remove stake via any source');
        }
      }
    }
  }
}

module.exports = KontourCoinWeb3;
