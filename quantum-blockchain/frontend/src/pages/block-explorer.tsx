import React, { useEffect, useState } from 'react';
import { useKontour } from '../hooks/useKontour';

const BlockExplorerPage: React.FC = () => {
  const { 
    blocks, 
    pendingTransactions, 
    fetchBlocks, 
    fetchPendingTransactions, 
    loading,
    selectedBlock,
    setSelectedBlock,
    selectedTransaction,
    setSelectedTransaction
  } = useKontour();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'block' | 'transaction'>('block');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  
  useEffect(() => {
    fetchBlocks();
    fetchPendingTransactions();
  }, [fetchBlocks, fetchPendingTransactions]);
  
  const handleSearch = () => {
    if (!searchTerm) return;
    
    if (searchType === 'block') {
      // Search for blocks by index or hash
      const results = blocks.filter(block => 
        block.index.toString() === searchTerm || 
        block.hash.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
    } else {
      // Search for transactions by hash
      const results = [];
      
      // Search in pending transactions
      const pendingResults = pendingTransactions.filter(tx => 
        tx.hash.toLowerCase().includes(searchTerm.toLowerCase())
      );
      results.push(...pendingResults);
      
      // Search in confirmed transactions
      for (const block of blocks) {
        const blockTxs = block.transactions.filter(tx => 
          tx.hash.toLowerCase().includes(searchTerm.toLowerCase())
        );
        results.push(...blockTxs);
      }
      
      setSearchResults(results);
    }
    
    setShowSearch(true);
  };
  
  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowSearch(false);
  };
  
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };
  
  const truncateHash = (hash: string) => {
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };
  
  const truncateAddress = (address: string) => {
    return `${address.substring(0, 8)}...${address.substring(address.length - 4)}`;
  };
  
  return (
    <div className="container">
      <h1>Block Explorer</h1>
      
      <div className="search-section">
        <div className="search-container">
          <div className="search-type-selector">
            <button 
              className={`search-type-button ${searchType === 'block' ? 'active' : ''}`}
              onClick={() => setSearchType('block')}
            >
              Block
            </button>
            <button 
              className={`search-type-button ${searchType === 'transaction' ? 'active' : ''}`}
              onClick={() => setSearchType('transaction')}
            >
              Transaction
            </button>
          </div>
          <div className="search-input-container">
            <input 
              type="text" 
              className="search-input" 
              placeholder={searchType === 'block' ? "Search by block index or hash..." : "Search by transaction hash..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="search-button" onClick={handleSearch}>
              <i className="fas fa-search"></i>
            </button>
            {searchTerm && (
              <button className="clear-button" onClick={clearSearch}>
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {showSearch && (
        <div className="search-results">
          <h2>Search Results</h2>
          {searchResults.length === 0 ? (
            <div className="no-results">No results found for "{searchTerm}"</div>
          ) : (
            <div className="results-list">
              {searchType === 'block' ? (
                searchResults.map((block) => (
                  <div 
                    key={block.hash} 
                    className="result-item block-result"
                    onClick={() => {
                      setSelectedBlock(block);
                      setSelectedTransaction(null);
                    }}
                  >
                    <div className="result-header">
                      <span className="result-title">Block #{block.index}</span>
                      <span className="result-timestamp">{formatTimestamp(block.timestamp)}</span>
                    </div>
                    <div className="result-hash">
                      <span className="label">Hash:</span> {truncateHash(block.hash)}
                    </div>
                    <div className="result-details">
                      <span className="label">Transactions:</span> {block.transactions.length}
                      <span className="label ml-3">Difficulty:</span> {block.difficulty}
                      <span className="label ml-3">Quantum Enhanced:</span> {block.quantum_enhanced ? 'Yes' : 'No'}
                    </div>
                  </div>
                ))
              ) : (
                searchResults.map((tx) => (
                  <div 
                    key={tx.hash} 
                    className="result-item transaction-result"
                    onClick={() => {
                      setSelectedTransaction(tx);
                      setSelectedBlock(null);
                    }}
                  >
                    <div className="result-header">
                      <span className="result-title">{tx.type} Transaction</span>
                      <span className="result-timestamp">{formatTimestamp(tx.timestamp)}</span>
                    </div>
                    <div className="result-hash">
                      <span className="label">Hash:</span> {truncateHash(tx.hash)}
                    </div>
                    <div className="result-details">
                      <div>
                        <span className="label">From:</span> {truncateAddress(tx.sender)}
                      </div>
                      <div>
                        <span className="label">To:</span> {truncateAddress(tx.recipient)}
                      </div>
                      <div>
                        <span className="label">Amount:</span> {tx.amount} KTR
                      </div>
                      <div>
                        <span className="label">Status:</span> 
                        <span className={`status-badge ${tx.status}`}>{tx.status}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="explorer-content">
        <div className="blocks-panel">
          <h2>Latest Blocks</h2>
          {loading.blocks ? (
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
              <span>Loading blocks...</span>
            </div>
          ) : (
            <div className="blocks-list">
              {blocks.slice().reverse().slice(0, 10).map((block) => (
                <div 
                  key={block.hash} 
                  className={`block-item ${selectedBlock?.hash === block.hash ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedBlock(block);
                    setSelectedTransaction(null);
                  }}
                >
                  <div className="block-header">
                    <span className="block-index">Block #{block.index}</span>
                    <span className="block-timestamp">{formatTimestamp(block.timestamp)}</span>
                  </div>
                  <div className="block-hash">{truncateHash(block.hash)}</div>
                  <div className="block-details">
                    <span className="label">Txs:</span> {block.transactions.length}
                    <span className="quantum-badge" title="Quantum Enhanced">
                      {block.quantum_enhanced && <i className="fas fa-atom"></i>}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="details-panel">
          {selectedBlock ? (
            <div className="block-details-panel">
              <h2>Block Details</h2>
              <div className="detail-card">
                <div className="detail-header">
                  <h3>Block #{selectedBlock.index}</h3>
                  <span className="timestamp">{formatTimestamp(selectedBlock.timestamp)}</span>
                </div>
                <div className="detail-body">
                  <div className="detail-row">
                    <span className="detail-label">Hash:</span>
                    <span className="detail-value hash">{selectedBlock.hash}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Previous Hash:</span>
                    <span className="detail-value hash">{selectedBlock.previous_hash}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Nonce:</span>
                    <span className="detail-value">{selectedBlock.nonce}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Difficulty:</span>
                    <span className="detail-value">{selectedBlock.difficulty}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Quantum Enhanced:</span>
                    <span className="detail-value">{selectedBlock.quantum_enhanced ? 'Yes' : 'No'}</span>
                  </div>
                  {selectedBlock.quantum_enhanced && selectedBlock.quantum_metrics && (
                    <div className="quantum-metrics">
                      <h4>Quantum Metrics</h4>
                      <div className="detail-row">
                        <span className="detail-label">Mining Speedup:</span>
                        <span className="detail-value">{selectedBlock.quantum_metrics.mining_speedup?.toFixed(2) || 'N/A'}x</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Circuit Depth:</span>
                        <span className="detail-value">{selectedBlock.quantum_metrics.circuit_depth || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Circuit Width:</span>
                        <span className="detail-value">{selectedBlock.quantum_metrics.circuit_width || 'N/A'} qubits</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="transactions-section">
                  <h4>Transactions ({selectedBlock.transactions.length})</h4>
                  {selectedBlock.transactions.length === 0 ? (
                    <div className="no-transactions">No transactions in this block</div>
                  ) : (
                    <div className="transactions-list">
                      {selectedBlock.transactions.map((tx) => (
                        <div 
                          key={tx.hash} 
                          className={`transaction-item ${selectedTransaction?.hash === tx.hash ? 'selected' : ''}`}
                          onClick={() => setSelectedTransaction(tx)}
                        >
                          <div className="transaction-header">
                            <span className="transaction-type">{tx.type}</span>
                            <span className="transaction-timestamp">{formatTimestamp(tx.timestamp)}</span>
                          </div>
                          <div className="transaction-hash">{truncateHash(tx.hash)}</div>
                          <div className="transaction-details">
                            <div className="transaction-addresses">
                              <span className="from">{truncateAddress(tx.sender)}</span>
                              <i className="fas fa-arrow-right"></i>
                              <span className="to">{truncateAddress(tx.recipient)}</span>
                            </div>
                            <div className="transaction-amount">{tx.amount} KTR</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : selectedTransaction ? (
            <div className="transaction-details-panel">
              <h2>Transaction Details</h2>
              <div className="detail-card">
                <div className="detail-header">
                  <h3>{selectedTransaction.type} Transaction</h3>
                  <span className="timestamp">{formatTimestamp(selectedTransaction.timestamp)}</span>
                </div>
                <div className="detail-body">
                  <div className="detail-row">
                    <span className="detail-label">Hash:</span>
                    <span className="detail-value hash">{selectedTransaction.hash}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className={`detail-value status-badge ${selectedTransaction.status}`}>
                      {selectedTransaction.status}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">From:</span>
                    <span className="detail-value address">{selectedTransaction.sender}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">To:</span>
                    <span className="detail-value address">{selectedTransaction.recipient}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Amount:</span>
                    <span className="detail-value">{selectedTransaction.amount} KTR</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">{selectedTransaction.type}</span>
                  </div>
                  
                  {Object.keys(selectedTransaction.data).length > 0 && (
                    <div className="transaction-data">
                      <h4>Transaction Data</h4>
                      <pre className="data-json">
                        {JSON.stringify(selectedTransaction.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <div className="no-selection-content">
                <i className="fas fa-cubes"></i>
                <h3>Select a block or transaction to view details</h3>
                <p>Click on any block or transaction from the list to view its details</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="pending-transactions-section">
        <h2>Pending Transactions</h2>
        {loading.transactions ? (
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <span>Loading transactions...</span>
          </div>
        ) : pendingTransactions.length === 0 ? (
          <div className="no-pending">No pending transactions</div>
        ) : (
          <div className="pending-transactions-list">
            {pendingTransactions.map((tx) => (
              <div 
                key={tx.hash} 
                className={`transaction-item pending ${selectedTransaction?.hash === tx.hash ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedTransaction(tx);
                  setSelectedBlock(null);
                }}
              >
                <div className="transaction-header">
                  <span className="transaction-type">{tx.type}</span>
                  <span className="transaction-timestamp">{formatTimestamp(tx.timestamp)}</span>
                </div>
                <div className="transaction-hash">{truncateHash(tx.hash)}</div>
                <div className="transaction-details">
                  <div className="transaction-addresses">
                    <span className="from">{truncateAddress(tx.sender)}</span>
                    <i className="fas fa-arrow-right"></i>
                    <span className="to">{truncateAddress(tx.recipient)}</span>
                  </div>
                  <div className="transaction-amount">{tx.amount} KTR</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <style jsx>{`
        h1 {
          margin-bottom: 30px;
        }
        
        h2 {
          margin-bottom: 20px;
          color: var(--dark-gray);
        }
        
        .search-section {
          margin-bottom: 30px;
        }
        
        .search-container {
          display: flex;
          flex-direction: column;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .search-type-selector {
          display: flex;
          margin-bottom: 10px;
        }
        
        .search-type-button {
          padding: 8px 15px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          font-weight: 500;
          color: var(--medium-gray);
          transition: all var(--transition-fast);
        }
        
        .search-type-button.active {
          color: var(--primary-color);
          border-bottom-color: var(--primary-color);
        }
        
        .search-input-container {
          display: flex;
          position: relative;
        }
        
        .search-input {
          flex: 1;
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: var(--border-radius-md);
          font-size: 1rem;
        }
        
        .search-button {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--primary-color);
          cursor: pointer;
          font-size: 1.2rem;
        }
        
        .clear-button {
          position: absolute;
          right: 40px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--medium-gray);
          cursor: pointer;
          font-size: 1rem;
        }
        
        .search-results {
          margin-bottom: 30px;
          padding: 20px;
          background-color: var(--white);
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow-md);
        }
        
        .no-results {
          padding: 20px;
          text-align: center;
          color: var(--medium-gray);
        }
        
        .results-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .result-item {
          padding: 15px;
          background-color: var(--light-gray);
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          transition: background-color var(--transition-fast);
        }
        
        .result-item:hover {
          background-color: rgba(66, 133, 244, 0.1);
        }
        
        .result-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        
        .result-title {
          font-weight: 500;
          color: var(--dark-gray);
        }
        
        .result-timestamp {
          font-size: 0.9rem;
          color: var(--medium-gray);
        }
        
        .result-hash {
          font-family: monospace;
          margin-bottom: 10px;
          word-break: break-all;
        }
        
        .result-details {
          font-size: 0.9rem;
          color: var(--medium-gray);
        }
        
        .label {
          font-weight: 500;
          margin-right: 5px;
        }
        
        .ml-3 {
          margin-left: 15px;
        }
        
        .explorer-content {
          display: flex;
          gap: 30px;
          margin-bottom: 30px;
        }
        
        .blocks-panel {
          flex: 1;
          min-width: 300px;
        }
        
        .details-panel {
          flex: 2;
          min-width: 500px;
        }
        
        .loading-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px;
          color: var(--medium-gray);
        }
        
        .loading-spinner i {
          margin-right: 10px;
          font-size: 1.2rem;
        }
        
        .blocks-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .block-item {
          padding: 15px;
          background-color: var(--white);
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
          border-left: 3px solid transparent;
        }
        
        .block-item:hover {
          box-shadow: var(--shadow-md);
          border-left-color: var(--primary-color);
        }
        
        .block-item.selected {
          border-left-color: var(--primary-color);
          background-color: rgba(66, 133, 244, 0.05);
        }
        
        .block-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        
        .block-index {
          font-weight: 500;
          color: var(--dark-gray);
        }
        
        .block-timestamp {
          font-size: 0.9rem;
          color: var(--medium-gray);
        }
        
        .block-hash {
          font-family: monospace;
          font-size: 0.9rem;
          color: var(--primary-color);
          margin-bottom: 8px;
        }
        
        .block-details {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.9rem;
          color: var(--medium-gray);
        }
        
        .quantum-badge {
          color: var(--primary-color);
          font-size: 1rem;
        }
        
        .detail-card {
          background-color: var(--white);
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow-md);
          padding: 20px;
        }
        
        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid var(--light-gray);
        }
        
        .detail-header h3 {
          margin: 0;
          color: var(--dark-gray);
        }
        
        .timestamp {
          color: var(--medium-gray);
          font-size: 0.9rem;
        }
        
        .detail-body {
          margin-bottom: 20px;
        }
        
        .detail-row {
          display: flex;
          margin-bottom: 10px;
          align-items: flex-start;
        }
        
        .detail-label {
          flex: 0 0 150px;
          font-weight: 500;
          color: var(--medium-gray);
        }
        
        .detail-value {
          flex: 1;
          word-break: break-all;
        }
        
        .detail-value.hash,
        .detail-value.address {
          font-family: monospace;
          color: var(--primary-color);
        }
        
        .quantum-metrics {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid var(--light-gray);
        }
        
        .quantum-metrics h4 {
          margin-bottom: 15px;
          color: var(--primary-color);
        }
        
        .transactions-section {
          margin-top: 30px;
        }
        
        .transactions-section h4 {
          margin-bottom: 15px;
        }
        
        .no-transactions {
          padding: 15px;
          text-align: center;
          color: var(--medium-gray);
          background-color: var(--light-gray);
          border-radius: var(--border-radius-sm);
        }
        
        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
          max-height: 400px;
          overflow-y: auto;
        }
        
        .transaction-item {
          padding: 15px;
          background-color: var(--light-gray);
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          transition: background-color var(--transition-fast);
          border-left: 3px solid transparent;
        }
        
        .transaction-item:hover {
          background-color: rgba(66, 133, 244, 0.1);
        }
        
        .transaction-item.selected {
          border-left-color: var(--primary-color);
          background-color: rgba(66, 133, 244, 0.05);
        }
        
        .transaction-item.pending {
          border-left-color: var(--accent-color);
        }
        
        .transaction-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        
        .transaction-type {
          font-weight: 500;
          color: var(--dark-gray);
          text-transform: capitalize;
        }
        
        .transaction-timestamp {
          font-size: 0.9rem;
          color: var(--medium-gray);
        }
        
        .transaction-hash {
          font-family: monospace;
          font-size: 0.9rem;
          color: var(--primary-color);
          margin-bottom: 8px;
        }
        
        .transaction-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
        }
        
        .transaction-addresses {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .from, .to {
          font-family: monospace;
        }
        
        .transaction-amount {
          font-weight: 500;
        }
        
        .status-badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: uppercase;
        }
        
        .status-badge.pending {
          background-color: var(--accent-light);
          color: var(--accent-dark);
        }
        
        .status-badge.confirmed {
          background-color: var(--secondary-light);
          color: var(--secondary-dark);
        }
        
        .status-badge.rejected {
          background-color: var(--error-light);
          color: var(--error-color);
        }
        
        .transaction-data {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid var(--light-gray);
        }
        
        .transaction-data h4 {
          margin-bottom: 15px;
        }
        
        .data-json {
          background-color: var(--light-gray);
          padding: 15px;
          border-radius: var(--border-radius-sm);
          font-family: monospace;
          font-size: 0.9rem;
          overflow-x: auto;
        }
        
        .no-selection {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 400px;
          background-color: var(--white);
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow-md);
        }
        
        .no-selection-content {
          text-align: center;
          color: var(--medium-gray);
          padding: 30px;
        }
        
        .no-selection-content i {
          font-size: 3rem;
          margin-bottom: 20px;
          color: var(--primary-light);
        }
        
        .no-selection-content h3 {
          margin-bottom: 10px;
          color: var(--dark-gray);
        }
        
        .pending-transactions-section {
          margin-top: 30px;
        }
        
        .no-pending {
          padding: 20px;
          text-align: center;
          color: var(--medium-gray);
          background-color: var(--white);
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow-sm);
        }
        
        .pending-transactions-list {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
        }
        
        .pending-transactions-list .transaction-item {
          flex: 1;
          min-width: 300px;
        }
        
        @media (max-width: 768px) {
          .explorer-content {
            flex-direction: column;
          }
          
          .detail-row {
            flex-direction: column;
          }
          
          .detail-label {
            margin-bottom: 5px;
          }
          
          .pending-transactions-list {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default BlockExplorerPage;