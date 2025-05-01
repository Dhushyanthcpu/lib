import { useState, useEffect } from 'react';
import { WalletManager, WalletInfo } from '../WalletManager';

interface WalletStatus {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  walletInfo: WalletInfo | null;
  networkStatus: 'online' | 'offline' | 'syncing';
  lastSync: Date | null;
}

export function useWalletStatus(address?: string) {
  const [status, setStatus] = useState<WalletStatus>({
    isConnected: false,
    isConnecting: false,
    error: null,
    walletInfo: null,
    networkStatus: 'offline',
    lastSync: null,
  });

  useEffect(() => {
    if (!address) return;

    const walletManager = WalletManager.getInstance();
    const checkStatus = async () => {
      try {
        setStatus(prev => ({ ...prev, isConnecting: true, error: null }));
        const walletInfo = walletManager.getWalletInfo(address);

        if (!walletInfo) {
          throw new Error('Wallet not found');
        }

        // Check network connection
        const online = navigator.onLine;
        const networkStatus = online ? 'online' : 'offline';

        setStatus({
          isConnected: true,
          isConnecting: false,
          error: null,
          walletInfo,
          networkStatus,
          lastSync: new Date(),
        });
      } catch (err) {
        setStatus(prev => ({
          ...prev,
          isConnecting: false,
          error: err instanceof Error ? err.message : 'Unknown error',
          networkStatus: 'offline',
        }));
      }
    };

    // Initial check
    checkStatus();

    // Set up network status listeners
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, networkStatus: 'online' }));
      checkStatus();
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, networkStatus: 'offline' }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set up periodic status check
    const intervalId = setInterval(checkStatus, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [address]);

  return status;
} 