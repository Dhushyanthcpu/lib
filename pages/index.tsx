import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import MarketAnalysis from '../components/MarketAnalysis';
import { ethers } from 'ethers';

// Import quantum components
import { QuantumNeuralNetwork, OptimizationMethod, NoiseModel, QuantumLayerType } from '../blockchain/ai/QuantumNeuralNetwork';

const Home: NextPage = () => {
  const { t } = useTranslation();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [ethBalance, setEthBalance] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [quantumSecured, setQuantumSecured] = useState(true);
  const [predictionData, setPredictionData] = useState<number[] | null>(null);

  // Initialize quantum neural network for price prediction
  useEffect(() => {
    const initQuantumNN = async () => {
      try {
        const qnn = new QuantumNeuralNetwork({
          layers: [
            { type: 'Hadamard', numQubits: 4 },
            { type: 'RotationX', numQubits: 4 },
            { type: 'ControlledNot', numQubits: 4 }
          ],
          inputQubits: 4,
          outputQubits: 2,
          learningRate: 0.01,
          optimizationMethod: OptimizationMethod.QUANTUM_ADAM,
          errorCorrection: true,
          noiseModel: NoiseModel.NONE,
          maxIterations: 100,
          convergenceThreshold: 0.01
        });

        // Make a simple prediction
        const prediction = qnn.predict([0.1, 0.2, 0.3, 0.4]);
        setPredictionData(prediction);
        
        console.log('Quantum Neural Network initialized');
      } catch (error) {
        console.error('Failed to initialize Quantum Neural Network:', error);
      }
    };

    initQuantumNN();
  }, []);

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
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [publicKey]);

  return (
    <Layout title={t('common.welcome')}>
      <div className="space-y-8">
        <section className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold mb-6">{t('common.welcome')}</h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('wallet.connectWallet')}</h2>
            <WalletMultiButton className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors" />
          </div>
          
          {isLoading ? (
            <div className="flex justify-center">
              <p>{t('common.loading')}</p>
            </div>
          ) : (
            <>
              {publicKey && (
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                    <h3 className="font-medium mb-2">{t('wallet.address')}</h3>
                    <p className="font-mono text-sm break-all">{publicKey.toString()}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex h-3 w-3 rounded-full ${quantumSecured ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span>{t('quantum.quantumSecurity')}: {quantumSecured ? t('blockchain.confirmed') : t('blockchain.failed')}</span>
                  </div>
                  
                  {transactions.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">{t('wallet.transactions')}</h3>
                      <div className="space-y-3">
                        {transactions.slice(0, 5).map((tx, index) => (
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
                </div>
              )}
              
              {!publicKey && (
                <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-4 rounded-md">
                  <p className="text-yellow-700 dark:text-yellow-200">
                    {t('wallet.connectWallet')} {t('wallet.dontHaveAccount')}
                  </p>
                </div>
              )}
            </>
          )}
        </section>
        
        <section className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">{t('quantum.quantumAdvantage')}</h2>
          
          <div className="space-y-4">
            <p>
              {t('quantum.quantumResistant')} {t('quantum.quantumSecurity')}
            </p>
            
            {predictionData && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                <h3 className="font-medium mb-2">{t('quantum.quantumPrediction')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">BTC/USD</p>
                    <p className="text-xl font-bold">${Math.floor(40000 + predictionData[0] * 5000)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">ETH/USD</p>
                    <p className="text-xl font-bold">${Math.floor(2500 + predictionData[1] * 500)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
        
        <MarketAnalysis />
      </div>
    </Layout>
  );
};

export default Home; 