import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import WorkflowPage from './pages/workflow';
import { Web3Provider } from './contexts/Web3Context';
import { KontourProvider } from './contexts/KontourContext';
import HomePage from './pages/home';
import BlockExplorerPage from './pages/block-explorer';
import WalletPage from './pages/wallet';
import AILabPage from './pages/ai-lab';
import QuantumDashboardPage from './pages/quantum-dashboard';

// Define types for the components to fix the "JSX element implicitly has type 'any'" error
declare module './pages/home' {
  const HomePage: React.FC;
  export default HomePage;
}

declare module './pages/workflow' {
  const WorkflowPage: React.FC;
  export default WorkflowPage;
}

declare module './pages/block-explorer' {
  const BlockExplorerPage: React.FC;
  export default BlockExplorerPage;
}

declare module './pages/wallet' {
  const WalletPage: React.FC;
  export default WalletPage;
}

declare module './pages/ai-lab' {
  const AILabPage: React.FC;
  export default AILabPage;
}

declare module './pages/quantum-dashboard' {
  const QuantumDashboardPage: React.FC;
  export default QuantumDashboardPage;
}

const App: React.FC = () => {
  return (
    <Web3Provider>
      <KontourProvider>
        <Router>
          <div className="app">
            <header className="app-header">
              <div className="container">
                <div className="app-logo">
                  <img src="/images/kontour-logo.svg" alt="Kontour Coin Logo" />
                  <h1>Kontour Coin</h1>
                </div>
                <nav className="app-nav">
                  <ul>
                    <li>
                      <Link to="/">Home</Link>
                    </li>
                    <li>
                      <Link to="/workflow">Workflow</Link>
                    </li>
                    <li>
                      <Link to="/explorer">Block Explorer</Link>
                    </li>
                    <li>
                      <Link to="/wallet">Wallet</Link>
                    </li>
                    <li>
                      <Link to="/ai-lab">AI Lab</Link>
                    </li>
                    <li>
                      <Link to="/quantum">Quantum Dashboard</Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </header>

            <main className="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/workflow" element={<WorkflowPage />} />
                <Route path="/explorer" element={<BlockExplorerPage />} />
                <Route path="/wallet" element={<WalletPage />} />
                <Route path="/ai-lab" element={<AILabPage />} />
                <Route path="/quantum" element={<QuantumDashboardPage />} />
              </Routes>
            </main>

            <footer className="app-footer">
              <div className="container">
                <div className="footer-content">
                  <div className="footer-section">
                    <h3 className="footer-title">Kontour Coin</h3>
                    <p>
                      Next-generation blockchain with quantum computing integration for AI training and optimization.
                    </p>
                  </div>
                  <div className="footer-section">
                    <h3 className="footer-title">Resources</h3>
                    <ul className="footer-links">
                      <li><a href="/docs">Documentation</a></li>
                      <li><a href="/whitepaper">Whitepaper</a></li>
                      <li><a href="/api">API Reference</a></li>
                      <li><a href="/tutorials">Tutorials</a></li>
                    </ul>
                  </div>
                  <div className="footer-section">
                    <h3 className="footer-title">Community</h3>
                    <ul className="footer-links">
                      <li><a href="https://github.com/kontourcoin" target="_blank" rel="noopener noreferrer">GitHub</a></li>
                      <li><a href="https://discord.gg/kontourcoin" target="_blank" rel="noopener noreferrer">Discord</a></li>
                      <li><a href="https://twitter.com/kontourcoin" target="_blank" rel="noopener noreferrer">Twitter</a></li>
                      <li><a href="https://t.me/kontourcoin" target="_blank" rel="noopener noreferrer">Telegram</a></li>
                    </ul>
                  </div>
                </div>
                <div className="footer-bottom">
                  <p>&copy; {new Date().getFullYear()} Kontour Coin. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </KontourProvider>
    </Web3Provider>
  );
};

export default App;