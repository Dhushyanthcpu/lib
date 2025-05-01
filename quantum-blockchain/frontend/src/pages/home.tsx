import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useKontour } from '../hooks/useKontour';
import { useWeb3 } from '../hooks/useWeb3';

const HomePage: React.FC = () => {
  const { stats, fetchBlockchainStats, loading } = useKontour();
  const { connected, connectWallet } = useWeb3();
  const [showConnectPrompt, setShowConnectPrompt] = useState(false);
  
  useEffect(() => {
    fetchBlockchainStats();
    
    // Show connect prompt after 2 seconds if not connected
    const timer = setTimeout(() => {
      if (!connected) {
        setShowConnectPrompt(true);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [fetchBlockchainStats, connected]);
  
  return (
    <div className="container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Kontour Coin</h1>
          <h2>Quantum-Enhanced Blockchain with AI Capabilities</h2>
          <p className="hero-description">
            Experience the next generation of blockchain technology with quantum computing integration
            for AI training and optimization. Kontour Coin combines the security of blockchain with
            the power of quantum computing to deliver unprecedented performance and capabilities.
          </p>
          <div className="hero-buttons">
            <Link to="/workflow" className="btn btn-primary btn-lg">
              Get Started
            </Link>
            <Link to="/explorer" className="btn btn-outline-primary btn-lg">
              Explore Blockchain
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="/images/quantum-blockchain.svg" alt="Quantum Blockchain Visualization" />
        </div>
      </section>
      
      {showConnectPrompt && !connected && (
        <div className="connect-prompt slide-in-up">
          <div className="connect-prompt-content">
            <h3>Connect Your Wallet</h3>
            <p>Connect your Web3 wallet to access all features of Kontour Coin.</p>
            <button onClick={connectWallet} className="btn btn-primary">
              Connect Wallet
            </button>
            <button onClick={() => setShowConnectPrompt(false)} className="btn btn-outline-primary">
              Later
            </button>
          </div>
        </div>
      )}
      
      <section className="features-section">
        <h2 className="section-title">Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-cubes"></i>
            </div>
            <h3>Quantum-Enhanced Mining</h3>
            <p>
              Leverage quantum algorithms to optimize mining operations, reducing energy consumption
              and increasing throughput.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <h3>Quantum-Secure Transactions</h3>
            <p>
              Utilize quantum cryptography to ensure transactions remain secure even against
              quantum computing attacks.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-brain"></i>
            </div>
            <h3>AI Training Integration</h3>
            <p>
              Train AI models directly on the blockchain using quantum computing for enhanced
              performance and efficiency.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <h3>Quantum Optimization</h3>
            <p>
              Optimize blockchain operations using quantum algorithms for improved scalability
              and performance.
            </p>
          </div>
        </div>
      </section>
      
      <section className="stats-section">
        <h2 className="section-title">Blockchain Statistics</h2>
        {loading.stats ? (
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <span>Loading statistics...</span>
          </div>
        ) : (
          <div className="stats-grid">
            {stats && (
              <>
                <div className="stat-card">
                  <div className="stat-value">{stats.block_count}</div>
                  <div className="stat-label">Blocks</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.transaction_count}</div>
                  <div className="stat-label">Transactions</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.account_count}</div>
                  <div className="stat-label">Accounts</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.ai_model_count}</div>
                  <div className="stat-label">AI Models</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.avg_block_time.toFixed(2)}s</div>
                  <div className="stat-label">Avg Block Time</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {stats.quantum_metrics.mining_speedup?.mean?.toFixed(2) || '0.00'}x
                  </div>
                  <div className="stat-label">Quantum Speedup</div>
                </div>
              </>
            )}
          </div>
        )}
      </section>
      
      <section className="workflow-section">
        <h2 className="section-title">Quantum Blockchain Workflow</h2>
        <div className="workflow-steps">
          <div className="workflow-step">
            <div className="step-number">1</div>
            <h3>Create Quantum-Enhanced Transactions</h3>
            <p>
              Create transactions that leverage quantum computing for enhanced security and efficiency.
            </p>
          </div>
          <div className="workflow-step">
            <div className="step-number">2</div>
            <h3>Mine Blocks with Quantum Algorithms</h3>
            <p>
              Use quantum algorithms to mine blocks faster and more efficiently than classical methods.
            </p>
          </div>
          <div className="workflow-step">
            <div className="step-number">3</div>
            <h3>Train AI Models on the Blockchain</h3>
            <p>
              Leverage quantum computing to train AI models directly on the blockchain.
            </p>
          </div>
          <div className="workflow-step">
            <div className="step-number">4</div>
            <h3>Optimize Blockchain Operations</h3>
            <p>
              Use quantum optimization to improve the performance and scalability of blockchain operations.
            </p>
          </div>
        </div>
        <div className="workflow-cta">
          <Link to="/workflow" className="btn btn-primary">
            Try the Workflow
          </Link>
        </div>
      </section>
      
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Experience Quantum Blockchain?</h2>
          <p>
            Join the future of blockchain technology with Kontour Coin's quantum-enhanced capabilities.
          </p>
          <div className="cta-buttons">
            <Link to="/wallet" className="btn btn-primary btn-lg">
              Create Wallet
            </Link>
            <Link to="/explorer" className="btn btn-outline-primary btn-lg">
              Explore Blockchain
            </Link>
          </div>
        </div>
      </section>
      
      <style jsx>{`
        .hero-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 40px 0 60px;
          gap: 40px;
        }
        
        .hero-content {
          flex: 1;
        }
        
        .hero-image {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .hero-image img {
          max-width: 100%;
          height: auto;
          max-height: 400px;
        }
        
        h1 {
          font-size: 3rem;
          margin-bottom: 10px;
          color: var(--primary-color);
        }
        
        h2 {
          font-size: 1.8rem;
          margin-bottom: 20px;
          color: var(--dark-gray);
        }
        
        .hero-description {
          font-size: 1.2rem;
          margin-bottom: 30px;
          color: var(--medium-gray);
          line-height: 1.6;
        }
        
        .hero-buttons {
          display: flex;
          gap: 15px;
        }
        
        .section-title {
          text-align: center;
          margin-bottom: 40px;
          font-size: 2rem;
          color: var(--dark-gray);
        }
        
        .features-section {
          margin: 80px 0;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
        }
        
        .feature-card {
          background-color: var(--white);
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow-md);
          padding: 30px;
          text-align: center;
          transition: transform var(--transition-medium), box-shadow var(--transition-medium);
        }
        
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
        }
        
        .feature-icon {
          font-size: 2.5rem;
          color: var(--primary-color);
          margin-bottom: 20px;
        }
        
        .feature-card h3 {
          margin-bottom: 15px;
          font-size: 1.3rem;
        }
        
        .feature-card p {
          color: var(--medium-gray);
        }
        
        .stats-section {
          margin: 80px 0;
        }
        
        .loading-spinner {
          text-align: center;
          padding: 40px;
          font-size: 1.2rem;
          color: var(--medium-gray);
        }
        
        .loading-spinner i {
          margin-right: 10px;
        }
        
        .workflow-section {
          margin: 80px 0;
        }
        
        .workflow-steps {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        
        .workflow-step {
          flex: 1;
          min-width: 200px;
          padding: 20px;
          margin: 10px;
          background-color: var(--white);
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow-md);
          position: relative;
        }
        
        .step-number {
          position: absolute;
          top: -20px;
          left: 20px;
          width: 40px;
          height: 40px;
          background-color: var(--primary-color);
          color: var(--white);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: bold;
        }
        
        .workflow-step h3 {
          margin-top: 15px;
          margin-bottom: 10px;
          font-size: 1.2rem;
        }
        
        .workflow-step p {
          color: var(--medium-gray);
        }
        
        .workflow-cta {
          text-align: center;
          margin-top: 30px;
        }
        
        .cta-section {
          background-color: var(--primary-color);
          color: var(--white);
          padding: 60px 40px;
          border-radius: var(--border-radius-lg);
          margin: 80px 0 40px;
          text-align: center;
        }
        
        .cta-content h2 {
          color: var(--white);
          margin-bottom: 20px;
        }
        
        .cta-content p {
          font-size: 1.2rem;
          margin-bottom: 30px;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .cta-buttons {
          display: flex;
          justify-content: center;
          gap: 20px;
        }
        
        .connect-prompt {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: var(--white);
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow-lg);
          padding: 20px;
          max-width: 300px;
          z-index: 1000;
        }
        
        .connect-prompt h3 {
          margin-top: 0;
          margin-bottom: 10px;
        }
        
        .connect-prompt p {
          margin-bottom: 15px;
          color: var(--medium-gray);
        }
        
        .connect-prompt button {
          margin-right: 10px;
        }
        
        @media (max-width: 768px) {
          .hero-section {
            flex-direction: column;
          }
          
          .hero-image {
            order: -1;
          }
          
          .workflow-steps {
            flex-direction: column;
          }
          
          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }
          
          .cta-buttons .btn {
            margin-bottom: 10px;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;