import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { ethers } from 'ethers';
import { PublicKey } from '@solana/web3.js';

// Import quantum components
import { QuantumResistantCrypto, PostQuantumAlgorithm, KeyType } from '../blockchain/quantum-resistant/QuantumResistantCrypto';

const WalletPage: NextPage = () => {
  const { t } = useTranslation();
  const { publicKey, sendTransaction } = useWallet();
  
  const [balance, setBalance] = useState<number | null>(null);
  const [ethBalance, setEthBalance] = useState<string | null>(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [tab, setTab] = useState<'send' | 'receive' | 'swap'>('send');
  const [quantumSignature, setQuantumSignature] = useState<string | null>(null);

  // Initialize quantum-resistant crypto
  const quantumCrypto = new QuantumResistantCrypto({
    defaultAlgorithm: PostQuantumAlgorithm.DILITHIUM,
    securityLevel: 'high',
    hybridMode: true
  });

  useEffect(() => {
    const fetchData = async () => {
      if (publicKey) {
        setIsLoading(true);
        try {
          // Fetch Solana balance
          const balanceResponse = await fetch(`/api/balance/${publicKey.toString()}`);
          const balanceData = await balanceResponse.json();
          setBalance(balanceData.balance);

          // Fetch Solana transactions
          const txResponse = await fetch(`/api/transactions/${publicKey.toString()}`);
          const txData = await txResponse.json();
          setTransactions(txData.transactions || []);

          // Try to fetch Ethereum balance if we have an Ethereum address
          try {
            const provider = new ethers.providers.JsonRpcProvider(
              process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://rpc.ankr.com/eth'
            );
            // This is just a placeholder - in a real app, you'd get the user's ETH address
            const ethAddress = '0x0000000000000000000000000000000000000000';
            const ethBalanceWei = await provider.getBalance(ethAddress);
            setEthBalance(ethers.utils.formatEther(ethBalanceWei));
          } catch (ethError) {
            console.error('Error fetching Ethereum data:', ethError);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          setError('Failed to fetch wallet data');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [publicKey]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey) {
      setError(t('wallet.connectWallet'));
      return;
    }
    
    if (!recipient || !amount) {
      setError(t('wallet.invalidAddress'));
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate recipient address
      let recipientPubkey: PublicKey;
      try {
        recipientPubkey = new PublicKey(recipient);
      } catch (err) {
        setError(t('wallet.invalidAddress'));
        setIsLoading(false);
        return;
      }
      
      // Check if balance is sufficient
      if (balance === null || parseFloat(amount) > balance) {
        setError(t('wallet.insufficientFunds'));
        setIsLoading(false);
        return;
      }
      
      // Generate quantum-resistant signature
      const keyPair = await quantumCrypto.generateKeyPair();
      const message = `Send ${amount} SOL to ${recipient}`;
      const signature = await quantumCrypto.sign(message, keyPair.privateKey);
      setQuantumSignature(signature.value);
      
      // In a real app, you would create and send a transaction here
      // This is just a simulation
      setTimeout(() => {
        setSuccess(t('wallet.transactionSuccess'));
        setIsLoading(false);
        
        // Add the transaction to the list
        const newTx = {
          signature: `simulated_${Date.now()}`,
          slot: Math.floor(Math.random() * 1000000),
          timestamp: Date.now()
        };
        setTransactions([newTx, ...transactions]);
        
        // Reset form
        setRecipient('');
        setAmount('');
      }, 2000);
    } catch (error) {
      console.error('Error sending transaction:', error);
      setError(t('wallet.transactionFailed'));
      setIsLoading(false);
    }
  };

  return (
    <Layout title={t('wallet.myWallet')}>
      <div className="space-y-8">
        <section className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">{t('wallet.myWallet')}</h1>
          
          {!publicKey ? (
            <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-4 rounded-md">
              <p className="text-yellow-700 dark:text-yellow-200">
                {t('wallet.connectWallet')} {t('wallet.dontHaveAccount')}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {balance !== null && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                    <h3 className="font-medium mb-2">{t('wallet.balance')} (SOL)</h3>
                    <p className="text-2xl font-bold">{balance} SOL</p>
                  </div>
                )}
                
                {ethBalance !== null && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                    <h3 className="font-medium mb-2">{t('wallet.balance')} (ETH)</h3>
                    <p className="text-2xl font-bold">{ethBalance} ETH</p>
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <nav className="flex -mb-px">
                    <button
                      className={`py-2 px-4 border-b-2 font-medium text-sm ${
                        tab === 'send'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setTab('send')}
                    >
                      {t('wallet.send')}
                    </button>
                    <button
                      className={`py-2 px-4 border-b-2 font-medium text-sm ${
                        tab === 'receive'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setTab('receive')}
                    >
                      {t('wallet.receive')}
                    </button>
                    <button
                      className={`py-2 px-4 border-b-2 font-medium text-sm ${
                        tab === 'swap'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setTab('swap')}
                    >
                      {t('wallet.swap')}
                    </button>
                  </nav>
                </div>
                
                <div className="mt-6">
                  {tab === 'send' && (
                    <form onSubmit={handleSend} className="space-y-4">
                      <div>
                        <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('wallet.recipient')}
                        </label>
                        <input
                          type="text"
                          id="recipient"
                          value={recipient}
                          onChange={(e) => setRecipient(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                          placeholder="Solana address"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('wallet.amount')}
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="block w-full rounded-md border-gray-300 pr-12 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                            placeholder="0.00"
                            step="0.000000001"
                            min="0"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">SOL</span>
                          </div>
                        </div>
                      </div>
                      
                      {error && (
                        <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-400 p-4 rounded-md">
                          <p className="text-red-700 dark:text-red-200">{error}</p>
                        </div>
                      )}
                      
                      {success && (
                        <div className="bg-green-50 dark:bg-green-900 border-l-4 border-green-400 p-4 rounded-md">
                          <p className="text-green-700 dark:text-green-200">{success}</p>
                        </div>
                      )}
                      
                      {quantumSignature && (
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                          <h4 className="text-sm font-medium mb-2">{t('quantum.quantumSignature')}</h4>
                          <p className="text-xs font-mono break-all">{quantumSignature}</p>
                        </div>
                      )}
                      
                      <div>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {isLoading ? t('common.loading') : t('wallet.send')}
                        </button>
                      </div>
                    </form>
                  )}
                  
                  {tab === 'receive' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('wallet.address')}
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                          <input
                            type="text"
                            readOnly
                            value={publicKey.toString()}
                            className="block w-full rounded-md border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText(publicKey.toString())}
                            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            {t('common.copy')}
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                        <p className="text-sm">
                          {t('wallet.receiveInstructions')}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {tab === 'swap' && (
                    <div className="space-y-4">
                      <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-4 rounded-md">
                        <p className="text-yellow-700 dark:text-yellow-200">
                          {t('wallet.swapComingSoon')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {transactions.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">{t('wallet.transactions')}</h3>
                  <div className="space-y-3">
                    {transactions.slice(0, 10).map((tx, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <p className="text-sm font-mono break-all">{tx.signature}</p>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <span>{t('blockchain.slot')}: {tx.slot}</span>
                          <span>{t('blockchain.confirmed')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
        
        <section className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">{t('quantum.quantumSecurity')}</h2>
          <p className="mb-4">
            {t('quantum.quantumResistant')} {t('quantum.quantumEncryption')}
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
            <h3 className="text-sm font-medium mb-2">{t('quantum.quantumAdvantage')}</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>{t('quantum.quantumResistant')}</li>
              <li>{t('quantum.quantumSignature')}</li>
              <li>{t('quantum.quantumVerification')}</li>
              <li>{t('quantum.quantumEntanglement')}</li>
            </ul>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default WalletPage;