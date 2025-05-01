import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';

interface Transaction {
  signature: string;
  slot: number;
  timestamp?: number;
  blockTime?: number;
  fee?: number;
  status: 'confirmed' | 'pending' | 'failed';
}

const TransactionsPage: NextPage = () => {
  const { t } = useTranslation();
  const { publicKey } = useWallet();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'failed'>('all');

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!publicKey) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/transactions/${publicKey.toString()}`);
        const data = await response.json();
        
        if (data.transactions) {
          // Transform the data to match our Transaction interface
          const formattedTransactions: Transaction[] = data.transactions.map((tx: any) => ({
            signature: tx.signature,
            slot: tx.slot,
            blockTime: tx.blockTime,
            fee: tx.fee,
            status: 'confirmed' // Assuming all returned transactions are confirmed
          }));
          
          setTransactions(formattedTransactions);
        } else {
          setTransactions([]);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setError(t('blockchain.fetchError'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTransactions();
  }, [publicKey, t]);

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.status === filter;
  });

  return (
    <Layout title={t('wallet.transactions')}>
      <div className="space-y-6">
        <section className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{t('wallet.transactions')}</h1>
            
            <div className="flex space-x-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="all">{t('blockchain.all')}</option>
                <option value="confirmed">{t('blockchain.confirmed')}</option>
                <option value="pending">{t('blockchain.pending')}</option>
                <option value="failed">{t('blockchain.failed')}</option>
              </select>
            </div>
          </div>
          
          {!publicKey ? (
            <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-4 rounded-md">
              <p className="text-yellow-700 dark:text-yellow-200">
                {t('wallet.connectWallet')} {t('wallet.dontHaveAccount')}
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-8">
              <p>{t('common.loading')}</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-400 p-4 rounded-md">
              <p className="text-red-700 dark:text-red-200">{error}</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md text-center">
              <p>{t('blockchain.noTransactions')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('blockchain.signature')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('blockchain.slot')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('blockchain.timestamp')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('blockchain.status')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTransactions.map((tx, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                        <span className="truncate block max-w-xs">{tx.signature}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {tx.slot}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          tx.status === 'confirmed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : tx.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {t(`blockchain.${tx.status}`)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        
        <section className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">{t('quantum.quantumVerification')}</h2>
          <p className="mb-4">
            {t('quantum.quantumResistant')} {t('quantum.quantumSecurity')}
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
            <h3 className="text-sm font-medium mb-2">{t('quantum.quantumAdvantage')}</h3>
            <p className="text-sm">
              {t('quantum.quantumVerificationExplanation')}
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default TransactionsPage;