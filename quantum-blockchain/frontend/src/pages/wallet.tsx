import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import { useKontour } from '../hooks/useKontour';
import { Account, Transaction } from '../types';

const WalletPage: React.FC = () => {
  const { account, balance, connected, connectWallet, disconnectWallet, refreshBalance } = useWeb3();
  const { accounts, fetchAccounts, createAccount, createTransaction } = useKontour();
  
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [transactionStatus, setTransactionStatus] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    message: string;
  }>({
    status: 'idle',
    message: '',
  });
  
  useEffect(() => {
    if (connected) {
      fetchAccounts();
    }
  }, [connected, fetchAccounts]);
  
  const handleCreateAccount = async () => {
    try {
      const newAddress = await createAccount();
      if (newAddress) {
        alert(`New account created: ${newAddress}`);
        fetchAccounts();
      }
    } catch (error) {
      console.error('Error creating account:', error);
      alert('Failed to create account');
    }
  };
  
  const handleSendTransaction = async () => {
    if (!selectedAccount || !recipient || !amount) {
      setTransactionStatus({
        status: 'error',
        message: 'Please fill in all fields',
      });
      return;
    }
    
    setTransactionStatus({
      status: 'loading',
      message: 'Sending transaction...',
    });
    
    try {
      const transaction = await createTransaction(
        selectedAccount,
        recipient,
        parseFloat(amount)
      );
      
      if (transaction) {
        setTransactionStatus({
          status: 'success',
          message: `Transaction sent: ${transaction.hash}`,
        });
        
        // Reset form
        setRecipient('');
        setAmount('');
        
        // Refresh accounts
        fetchAccounts();
      } else {
        setTransactionStatus({
          status: 'error',
          message: 'Transaction failed',
        });
      }
    } catch (error) {
      console.error('Error sending transaction:', error);
      setTransactionStatus({
        status: 'error',
        message: 'Transaction failed',
      });
    }
  };
  
  return (
    <div className="container">
      <h1>Wallet</h1>
      
      <div className="wallet-section">
        <h2>Web3 Wallet</h2>
        
        {connected ? (
          <div className="wallet-info">
            <div className="wallet-address">
              <h3>Address</h3>
              <p>{account}</p>
            </div>
            
            <div className="wallet-balance">
              <h3>Balance</h3>
              <p>{balance} ETH</p>
            </div>
            
            <div className="wallet-actions">
              <button className="btn btn-primary" onClick={refreshBalance}>
                Refresh Balance
              </button>
              <button className="btn btn-secondary" onClick={disconnectWallet}>
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <div className="wallet-connect">
            <p>Connect your wallet to access Web3 features</p>
            <button className="btn btn-primary" onClick={connectWallet}>
              Connect Wallet
            </button>
          </div>
        )}
      </div>
      
      <div className="wallet-section">
        <h2>Kontour Accounts</h2>
        
        <div className="accounts-list">
          <h3>Your Accounts</h3>
          
          {accounts.length > 0 ? (
            <table className="accounts-table">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Balance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.address}>
                    <td>{account.address}</td>
                    <td>{account.balance}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => setSelectedAccount(account.address)}
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No accounts found</p>
          )}
          
          <button className="btn btn-primary" onClick={handleCreateAccount}>
            Create New Account
          </button>
        </div>
        
        <div className="send-transaction">
          <h3>Send Transaction</h3>
          
          <div className="form-group">
            <label htmlFor="from">From</label>
            <select
              id="from"
              className="form-control"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
            >
              <option value="">Select account</option>
              {accounts.map((account) => (
                <option key={account.address} value={account.address}>
                  {account.address} ({account.balance})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="to">To</label>
            <input
              type="text"
              id="to"
              className="form-control"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Recipient address"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              className="form-control"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              min="0.00000001"
              step="0.00000001"
            />
          </div>
          
          <button
            className="btn btn-primary"
            onClick={handleSendTransaction}
            disabled={!selectedAccount || !recipient || !amount || transactionStatus.status === 'loading'}
          >
            {transactionStatus.status === 'loading' ? 'Sending...' : 'Send'}
          </button>
          
          {transactionStatus.status !== 'idle' && (
            <div className={`transaction-status ${transactionStatus.status}`}>
              {transactionStatus.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;