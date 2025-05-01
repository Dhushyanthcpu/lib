/**
 * Web3 Provider Service
 * Manages Web3 connections and network interactions
 */

const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');
const path = require('path');

class Web3Provider {
  /**
   * Initialize the Web3 provider service
   * @param {object} config - Configuration object
   */
  constructor(config) {
    this.config = config;
    this.providers = {};
    this.web3Instances = {};
  }

  /**
   * Get a Web3 instance for a specific network
   * @param {string} network - Network name (e.g., 'mainnet', 'testnet', 'local')
   * @returns {Web3} - Web3 instance
   */
  getWeb3(network) {
    if (!this.web3Instances[network]) {
      const provider = this.getProvider(network);
      this.web3Instances[network] = new Web3(provider);
    }
    return this.web3Instances[network];
  }

  /**
   * Get a provider for a specific network
   * @param {string} network - Network name
   * @returns {object} - Web3 provider
   */
  getProvider(network) {
    if (!this.providers[network]) {
      const networkConfig = this.config.networks[network];
      
      if (!networkConfig) {
        throw new Error(`Network configuration not found for ${network}`);
      }
      
      if (networkConfig.useWallet && this.config.mnemonic) {
        // Use HD wallet provider for networks that require signing
        this.providers[network] = new HDWalletProvider({
          mnemonic: this.config.mnemonic,
          providerOrUrl: networkConfig.providerUrl,
          chainId: networkConfig.chainId
        });
      } else {
        // Use HTTP provider for local or read-only connections
        this.providers[network] = new Web3.providers.HttpProvider(networkConfig.providerUrl);
      }
    }
    
    return this.providers[network];
  }

  /**
   * Get network ID for a specific network
   * @param {string} network - Network name
   * @returns {Promise<number>} - Network ID
   */
  async getNetworkId(network) {
    const web3 = this.getWeb3(network);
    return await web3.eth.net.getId();
  }

  /**
   * Get accounts for a specific network
   * @param {string} network - Network name
   * @returns {Promise<Array<string>>} - List of accounts
   */
  async getAccounts(network) {
    const web3 = this.getWeb3(network);
    return await web3.eth.getAccounts();
  }

  /**
   * Get gas price for a specific network
   * @param {string} network - Network name
   * @returns {Promise<string>} - Gas price in wei
   */
  async getGasPrice(network) {
    const web3 = this.getWeb3(network);
    return await web3.eth.getGasPrice();
  }

  /**
   * Get contract instance for a specific network
   * @param {string} network - Network name
   * @param {string} contractName - Contract name
   * @param {string} contractAddress - Contract address
   * @returns {object} - Contract instance
   */
  getContract(network, contractName, contractAddress) {
    const web3 = this.getWeb3(network);
    
    // Load contract ABI
    const contractJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, `../artifacts/contracts/${contractName}.sol/${contractName}.json`))
    );
    
    return new web3.eth.Contract(contractJson.abi, contractAddress);
  }

  /**
   * Close all providers
   */
  closeProviders() {
    for (const network in this.providers) {
      const provider = this.providers[network];
      if (provider.engine && provider.engine.stop) {
        provider.engine.stop();
      }
    }
  }
}

module.exports = Web3Provider;