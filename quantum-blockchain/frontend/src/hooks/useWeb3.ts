import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface Web3State {
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  account: string | null;
  chainId: number | null;
  connected: boolean;
  connecting: boolean;
  error: Error | null;
}

export function useWeb3() {
  const [web3State, setWeb3State] = useState<Web3State>({
    provider: null,
    signer: null,
    account: null,
    chainId: null,
    connected: false,
    connecting: false,
    error: null
  });

  const connectWallet = async () => {
    if (!window.ethereum) {
      setWeb3State(prev => ({
        ...prev,
        error: new Error('No Ethereum wallet found. Please install MetaMask or another compatible wallet.')
      }));
      return;
    }

    try {
      setWeb3State(prev => ({ ...prev, connecting: true }));
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Get provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const network = await provider.getNetwork();
      
      setWeb3State({
        provider,
        signer,
        account: accounts[0],
        chainId: network.chainId,
        connected: true,
        connecting: false,
        error: null
      });
    } catch (error) {
      setWeb3State(prev => ({
        ...prev,
        connecting: false,
        error: error as Error
      }));
    }
  };

  const disconnectWallet = () => {
    setWeb3State({
      provider: null,
      signer: null,
      account: null,
      chainId: null,
      connected: false,
      connecting: false,
      error: null
    });
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          disconnectWallet();
        } else if (web3State.connected) {
          // User switched accounts
          setWeb3State(prev => ({
            ...prev,
            account: accounts[0]
          }));
        }
      };

      const handleChainChanged = (chainId: string) => {
        // Handle chain change - reload the page as recommended by MetaMask
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Cleanup listeners
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [web3State.connected]);

  return {
    ...web3State,
    connectWallet,
    disconnectWallet
  };
}

// Add this to make TypeScript recognize the ethereum object on window
declare global {
  interface Window {
    ethereum: any;
  }
}