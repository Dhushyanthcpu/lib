import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import Web3 from 'web3';
import { provider } from 'web3-core';

interface Web3ContextProps {
  web3: Web3 | null;
  account: string | null;
  networkId: number | null;
  balance: string | null;
  connected: boolean;
  connecting: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
}

export const Web3Context = createContext<Web3ContextProps>({
  web3: null,
  account: null,
  networkId: null,
  balance: null,
  connected: false,
  connecting: false,
  error: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  refreshBalance: async () => {},
});

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [networkId, setNetworkId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Web3
  useEffect(() => {
    const initWeb3 = async () => {
      // Check if Web3 is injected by MetaMask or similar
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum as provider);
          setWeb3(web3Instance);
          
          // Check if already connected
          const accounts = await web3Instance.eth.getAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            
            const networkId = await web3Instance.eth.net.getId();
            setNetworkId(networkId);
            
            const balance = await web3Instance.eth.getBalance(accounts[0]);
            setBalance(web3Instance.utils.fromWei(balance, 'ether'));
            
            setConnected(true);
          }
        } catch (error) {
          console.error('Error initializing Web3:', error);
          setError('Failed to initialize Web3');
        }
      } else if (window.web3) {
        // Legacy dapp browsers
        const web3Instance = new Web3(window.web3.currentProvider as provider);
        setWeb3(web3Instance);
      } else {
        setError('No Ethereum browser extension detected. Please install MetaMask.');
      }
    };

    initWeb3();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected
          setAccount(null);
          setBalance(null);
          setConnected(false);
        } else if (accounts[0] !== account) {
          // Account changed
          setAccount(accounts[0]);
          if (web3) {
            const balance = await web3.eth.getBalance(accounts[0]);
            setBalance(web3.utils.fromWei(balance, 'ether'));
          }
          setConnected(true);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [account, web3]);

  // Listen for network changes
  useEffect(() => {
    if (window.ethereum) {
      const handleChainChanged = async (chainId: string) => {
        // Convert chainId from hex to decimal
        const networkId = parseInt(chainId, 16);
        setNetworkId(networkId);
        
        // Refresh balance on network change
        if (account && web3) {
          const balance = await web3.eth.getBalance(account);
          setBalance(web3.utils.fromWei(balance, 'ether'));
        }
      };

      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account, web3]);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (!web3) {
      setError('Web3 not initialized');
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        
        const networkId = await web3.eth.net.getId();
        setNetworkId(networkId);
        
        const balance = await web3.eth.getBalance(accounts[0]);
        setBalance(web3.utils.fromWei(balance, 'ether'));
        
        setConnected(true);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError('Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  }, [web3]);

  // Disconnect wallet (for UI purposes only, doesn't actually disconnect MetaMask)
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setBalance(null);
    setConnected(false);
  }, []);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (!web3 || !account) return;

    try {
      const balance = await web3.eth.getBalance(account);
      setBalance(web3.utils.fromWei(balance, 'ether'));
    } catch (error) {
      console.error('Error refreshing balance:', error);
    }
  }, [web3, account]);

  const value = {
    web3,
    account,
    networkId,
    balance,
    connected,
    connecting,
    error,
    connectWallet,
    disconnectWallet,
    refreshBalance,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

// Add type definitions for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
    web3?: any;
  }
}