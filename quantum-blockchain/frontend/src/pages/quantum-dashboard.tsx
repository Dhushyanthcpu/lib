import React, { useEffect, useState, useRef } from 'react';
import { useKontour } from '../hooks/useKontour';
import { useWeb3 } from '../hooks/useWeb3';
import Chart from 'chart.js/auto';

const QuantumDashboardPage: React.FC = () => {
  const { stats, fetchBlockchainStats, loading, analyzeBlockchainSecurity, securityAnalysis } = useKontour();
  const { connected, connectWallet } = useWeb3();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'mining' | 'ai' | 'security'>('overview');
  const [isAnalyzingSecurity, setIsAnalyzingSecurity] = useState(false);
  
  // Chart refs
  const miningSpeedupChartRef = useRef<HTMLCanvasElement>(null);
  const miningSpeedupChart = useRef<Chart | null>(null);
  
  const verificationAccuracyChartRef = useRef<HTMLCanvasElement>(null);
  const verificationAccuracyChart = useRef<Chart | null>(null);
  
  const aiTrainingEfficiencyChartRef = useRef<HTMLCanvasElement>(null);
  const aiTrainingEfficiencyChart = useRef<Chart | null>(null);
  
  const optimizationQualityChartRef = useRef<HTMLCanvasElement>(null);
  const optimizationQualityChart = useRef<Chart | null>(null);
  
  const securityVulnerabilityChartRef = useRef<HTMLCanvasElement>(null);
  const securityVulnerabilityChart = useRef<Chart | null>(null);
  
  useEffect(() => {
    fetchBlockchainStats();
  }, [fetchBlockchainStats]);
  
  // Initialize and update charts when stats change
  useEffect(() => {
    if (stats && miningSpeedupChartRef.current) {
      updateMiningSpeedupChart();
    }
    
    if (stats && verificationAccuracyChartRef.current) {
      updateVerificationAccuracyChart();
    }
    
    if (stats && aiTrainingEfficiencyChartRef.current) {
      updateAITrainingEfficiencyChart();
    }
    
    if (stats && optimizationQualityChartRef.current) {
      updateOptimizationQualityChart();
    }
  }, [stats, activeTab]);
  
  // Update security vulnerability chart when security analysis changes
  useEffect(() => {
    if (securityAnalysis && securityVulnerabilityChartRef.current) {
      updateSecurityVulnerabilityChart();
    }
  }, [securityAnalysis, activeTab]);
  
  const updateMiningSpeedupChart = () => {
    if (!stats || !miningSpeedupChartRef.current) return;
    
    const ctx = miningSpeedupChartRef.current.getContext('2d');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (miningSpeedupChart.current) {
      miningSpeedupChart.current.destroy();
    }
    
    const miningSpeedup = stats.quantum_metrics.mining_speedup || { recent: [], mean: 0 };
    
    miningSpeedupChart.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({ length: miningSpeedup.recent.length }, (_, i) => `Block ${i + 1}`),
        datasets: [
          {
            label: 'Mining Speedup',
            data: miningSpeedup.recent,
            borderColor: '#4285F4',
            backgroundColor: 'rgba(66, 133, 244, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Speedup: ${context.parsed.y.toFixed(2)}x`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Speedup Factor (x)'
            }
          }
        }
      }
    });
  };
  
  const updateVerificationAccuracyChart = () => {
    if (!stats || !verificationAccuracyChartRef.current) return;
    
    const ctx = verificationAccuracyChartRef.current.getContext('2d');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (verificationAccuracyChart.current) {
      verificationAccuracyChart.current.destroy();
    }
    
    const verificationAccuracy = stats.quantum_metrics.verification_accuracy || { recent: [], mean: 0 };
    
    verificationAccuracyChart.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({ length: verificationAccuracy.recent.length }, (_, i) => `Tx ${i + 1}`),
        datasets: [
          {
            label: 'Verification Accuracy',
            data: verificationAccuracy.recent,
            borderColor: '#34A853',
            backgroundColor: 'rgba(52, 168, 83, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Accuracy: ${(context.parsed.y * 100).toFixed(2)}%`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 1,
            title: {
              display: true,
              text: 'Accuracy'
            },
            ticks: {
              callback: function(value) {
                return (value * 100) + '%';
              }
            }
          }
        }
      }
    });
  };
  
  const updateAITrainingEfficiencyChart = () => {
    if (!stats || !aiTrainingEfficiencyChartRef.current) return;
    
    const ctx = aiTrainingEfficiencyChartRef.current.getContext('2d');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (aiTrainingEfficiencyChart.current) {
      aiTrainingEfficiencyChart.current.destroy();
    }
    
    const aiTrainingEfficiency = stats.quantum_metrics.ai_training_efficiency || { recent: [], mean: 0 };
    
    aiTrainingEfficiencyChart.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({ length: aiTrainingEfficiency.recent.length }, (_, i) => `Model ${i + 1}`),
        datasets: [
          {
            label: 'AI Training Efficiency',
            data: aiTrainingEfficiency.recent,
            borderColor: '#FBBC05',
            backgroundColor: 'rgba(251, 188, 5, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Efficiency: ${context.parsed.y.toFixed(2)}x`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Efficiency Factor (x)'
            }
          }
        }
      }
    });
  };
  
  const updateOptimizationQualityChart = () => {
    if (!stats || !optimizationQualityChartRef.current) return;
    
    const ctx = optimizationQualityChartRef.current.getContext('2d');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (optimizationQualityChart.current) {
      optimizationQualityChart.current.destroy();
    }
    
    const optimizationQuality = stats.quantum_metrics.optimization_quality || { recent: [], mean: 0 };
    
    optimizationQualityChart.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({ length: optimizationQuality.recent.length }, (_, i) => `Opt ${i + 1}`),
        datasets: [
          {
            label: 'Optimization Quality',
            data: optimizationQuality.recent,
            borderColor: '#EA4335',
            backgroundColor: 'rgba(234, 67, 53, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Quality: ${context.parsed.y.toFixed(2)}x`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Quality Ratio (x)'
            }
          }
        }
      }
    });
  };
  
  const updateSecurityVulnerabilityChart = () => {
    if (!securityAnalysis || !securityVulnerabilityChartRef.current) return;
    
    const ctx = securityVulnerabilityChartRef.current.getContext('2d');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (securityVulnerabilityChart.current) {
      securityVulnerabilityChart.current.destroy();
    }
    
    securityVulnerabilityChart.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Secure', 'Vulnerable'],
        datasets: [
          {
            data: [10 - securityAnalysis.vulnerability_score, securityAnalysis.vulnerability_score],
            backgroundColor: [
              'rgba(52, 168, 83, 0.7)',
              'rgba(234, 67, 53, 0.7)'
            ],
            borderColor: [
              'rgba(52, 168, 83, 1)',
              'rgba(234, 67, 53, 1)'
            ],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw as number;
                return `${label}: ${value.toFixed(2)}/10`;
              }
            }
          }
        }
      }
    });
  };
  
  const handleSecurityAnalysis = async () => {
    setIsAnalyzingSecurity(true);
    try {
      await analyzeBlockchainSecurity();
    } finally {
      setIsAnalyzingSecurity(false);
    }
  };
  
  return (
    <div className="container">
      <h1>Quantum Dashboard</h1>
      
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'mining' ? 'active' : ''}`}
          onClick={() => setActiveTab('mining')}
        >
          Mining
        </button>
        <button 
          className={`tab-button ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          AI Training
        </button>
        <button 
          className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
      </div>
      
      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="quantum-stats-grid">
              {stats && (
                <>
                  <div className="quantum-stat-card">
                    <div className="stat-icon mining">
                      <i className="fas fa-cubes"></i>
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">
                        {stats.quantum_metrics.mining_speedup?.mean?.toFixed(2) || '0.00'}x
                      </div>
                      <div className="stat-label">Mining Speedup</div>
                      <div className="stat-description">
                        Average speedup compared to classical mining
                      </div>
                    </div>
                  </div>
                  
                  <div className="quantum-stat-card">
                    <div className="stat-icon verification">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">
                        {(stats.quantum_metrics.verification_accuracy?.mean * 100)?.toFixed(2) || '0.00'}%
                      </div>
                      <div className="stat-label">Verification Accuracy</div>
                      <div className="stat-description">
                        Average accuracy of quantum transaction verification
                      </div>
                    </div>
                  </div>
                  
                  <div className="quantum-stat-card">
                    <div className="stat-icon ai">
                      <i className="fas fa-brain"></i>
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">
                        {stats.quantum_metrics.ai_training_efficiency?.mean?.toFixed(2) || '0.00'}x
                      </div>
                      <div className="stat-label">AI Training Efficiency</div>
                      <div className="stat-description">
                        Average efficiency compared to classical AI training
                      </div>
                    </div>
                  </div>
                  
                  <div className="quantum-stat-card">
                    <div className="stat-icon optimization">
                      <i className="fas fa-chart-line"></i>
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">
                        {stats.quantum_metrics.optimization_quality?.mean?.toFixed(2) || '0.00'}x
                      </div>
                      <div className="stat-label">Optimization Quality</div>
                      <div className="stat-description">
                        Average quality ratio compared to classical optimization
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="overview-charts">
              <div className="chart-container">
                <h3>Mining Speedup Trend</h3>
                <canvas ref={miningSpeedupChartRef}></canvas>
              </div>
              
              <div className="chart-container">
                <h3>Verification Accuracy Trend</h3>
                <canvas ref={verificationAccuracyChartRef}></canvas>
              </div>
            </div>
            
            <div className="quantum-advantage-section">
              <h2>Quantum Advantage</h2>
              <p className="section-description">
                Quantum computing provides significant advantages over classical computing in various blockchain operations.
                The charts below show the performance improvements achieved through quantum integration.
              </p>
              
              <div className="advantage-grid">
                <div className="advantage-card">
                  <h3>Mining</h3>
                  <div className="advantage-value">
                    {stats?.quantum_metrics.mining_speedup?.mean > 1 ? (
                      <>
                        <span className="value">{stats?.quantum_metrics.mining_speedup?.mean?.toFixed(2) || '0.00'}x</span>
                        <span className="label">faster</span>
                      </>
                    ) : (
                      <span className="no-advantage">No advantage yet</span>
                    )}
                  </div>
                  <p>
                    Quantum algorithms can search for valid nonces more efficiently than classical algorithms,
                    resulting in faster block mining and reduced energy consumption.
                  </p>
                </div>
                
                <div className="advantage-card">
                  <h3>Transaction Verification</h3>
                  <div className="advantage-value">
                    {stats?.quantum_metrics.verification_accuracy?.mean > 0.5 ? (
                      <>
                        <span className="value">{((stats?.quantum_metrics.verification_accuracy?.mean - 0.5) / 0.5 * 100)?.toFixed(2) || '0.00'}%</span>
                        <span className="label">more accurate</span>
                      </>
                    ) : (
                      <span className="no-advantage">No advantage yet</span>
                    )}
                  </div>
                  <p>
                    Quantum verification can detect fraudulent transactions with higher accuracy,
                    enhancing the security and reliability of the blockchain.
                  </p>
                </div>
                
                <div className="advantage-card">
                  <h3>AI Training</h3>
                  <div className="advantage-value">
                    {stats?.quantum_metrics.ai_training_efficiency?.mean > 1 ? (
                      <>
                        <span className="value">{stats?.quantum_metrics.ai_training_efficiency?.mean?.toFixed(2) || '0.00'}x</span>
                        <span className="label">more efficient</span>
                      </>
                    ) : (
                      <span className="no-advantage">No advantage yet</span>
                    )}
                  </div>
                  <p>
                    Quantum machine learning algorithms can train models faster and with better accuracy,
                    enabling more sophisticated AI applications on the blockchain.
                  </p>
                </div>
                
                <div className="advantage-card">
                  <h3>Optimization</h3>
                  <div className="advantage-value">
                    {stats?.quantum_metrics.optimization_quality?.mean > 1 ? (
                      <>
                        <span className="value">{stats?.quantum_metrics.optimization_quality?.mean?.toFixed(2) || '0.00'}x</span>
                        <span className="label">better quality</span>
                      </>
                    ) : (
                      <span className="no-advantage">No advantage yet</span>
                    )}
                  </div>
                  <p>
                    Quantum optimization algorithms can find better solutions to complex problems,
                    improving the efficiency and performance of blockchain operations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'mining' && (
          <div className="mining-tab">
            <div className="tab-header">
              <h2>Quantum Mining</h2>
              <p className="tab-description">
                Quantum-enhanced mining uses quantum algorithms to find valid nonces more efficiently than classical methods.
                This results in faster block creation and reduced energy consumption.
              </p>
            </div>
            
            <div className="mining-stats">
              <div className="mining-stat-card">
                <div className="stat-title">Average Speedup</div>
                <div className="stat-value">
                  {stats?.quantum_metrics.mining_speedup?.mean?.toFixed(2) || '0.00'}x
                </div>
                <div className="stat-description">
                  Compared to classical mining
                </div>
              </div>
              
              <div className="mining-stat-card">
                <div className="stat-title">Maximum Speedup</div>
                <div className="stat-value">
                  {stats?.quantum_metrics.mining_speedup?.max?.toFixed(2) || '0.00'}x
                </div>
                <div className="stat-description">
                  Best performance achieved
                </div>
              </div>
              
              <div className="mining-stat-card">
                <div className="stat-title">Mining Operations</div>
                <div className="stat-value">
                  {stats?.quantum_metrics.mining_speedup?.count || 0}
                </div>
                <div className="stat-description">
                  Total quantum mining operations
                </div>
              </div>
            </div>
            
            <div className="mining-chart-container">
              <h3>Mining Speedup History</h3>
              <canvas ref={miningSpeedupChartRef}></canvas>
            </div>
            
            <div className="mining-explanation">
              <h3>How Quantum Mining Works</h3>
              <div className="explanation-content">
                <div className="explanation-text">
                  <p>
                    Quantum mining leverages the principles of quantum superposition and entanglement to search
                    for valid nonces more efficiently than classical algorithms.
                  </p>
                  <p>
                    The process involves creating a quantum circuit that encodes the mining problem, applying
                    quantum operations to explore multiple potential solutions simultaneously, and measuring
                    the result to obtain a valid nonce.
                  </p>
                  <p>
                    Key advantages of quantum mining include:
                  </p>
                  <ul>
                    <li>Quadratic speedup for search problems (Grover's algorithm)</li>
                    <li>Reduced energy consumption</li>
                    <li>Ability to handle higher difficulty levels efficiently</li>
                    <li>Resistance to certain types of mining attacks</li>
                  </ul>
                </div>
                <div className="explanation-image">
                  <img src="/images/quantum-mining.svg" alt="Quantum Mining Illustration" />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'ai' && (
          <div className="ai-tab">
            <div className="tab-header">
              <h2>Quantum AI Training</h2>
              <p className="tab-description">
                Quantum AI training uses quantum computing to enhance machine learning models,
                providing faster training times and improved model accuracy.
              </p>
            </div>
            
            <div className="ai-stats">
              <div className="ai-stat-card">
                <div className="stat-title">Average Efficiency</div>
                <div className="stat-value">
                  {stats?.quantum_metrics.ai_training_efficiency?.mean?.toFixed(2) || '0.00'}x
                </div>
                <div className="stat-description">
                  Compared to classical training
                </div>
              </div>
              
              <div className="ai-stat-card">
                <div className="stat-title">Maximum Efficiency</div>
                <div className="stat-value">
                  {stats?.quantum_metrics.ai_training_efficiency?.max?.toFixed(2) || '0.00'}x
                </div>
                <div className="stat-description">
                  Best performance achieved
                </div>
              </div>
              
              <div className="ai-stat-card">
                <div className="stat-title">AI Models Trained</div>
                <div className="stat-value">
                  {stats?.quantum_metrics.ai_training_efficiency?.count || 0}
                </div>
                <div className="stat-description">
                  Total quantum AI models
                </div>
              </div>
            </div>
            
            <div className="ai-chart-container">
              <h3>AI Training Efficiency History</h3>
              <canvas ref={aiTrainingEfficiencyChartRef}></canvas>
            </div>
            
            <div className="ai-algorithms">
              <h3>Quantum AI Algorithms</h3>
              <div className="algorithms-grid">
                <div className="algorithm-card">
                  <h4>Quantum Neural Networks (QNN)</h4>
                  <p>
                    Neural networks that use quantum circuits as computational units,
                    enabling more complex feature representations and faster training.
                  </p>
                </div>
                
                <div className="algorithm-card">
                  <h4>Quantum Support Vector Machines (QSVM)</h4>
                  <p>
                    Enhanced version of classical SVMs that use quantum kernels to perform
                    calculations in higher-dimensional feature spaces more efficiently.
                  </p>
                </div>
                
                <div className="algorithm-card">
                  <h4>Quantum Boltzmann Machines (QBM)</h4>
                  <p>
                    Quantum version of Boltzmann machines that can model more complex probability
                    distributions and learn more efficiently than classical counterparts.
                  </p>
                </div>
                
                <div className="algorithm-card">
                  <h4>Quantum Generative Adversarial Networks (QGAN)</h4>
                  <p>
                    GANs that use quantum generators and discriminators to create and evaluate
                    synthetic data with higher quality and diversity.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="ai-applications">
              <h3>Blockchain AI Applications</h3>
              <div className="applications-list">
                <div className="application-item">
                  <div className="application-icon">
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <div className="application-content">
                    <h4>Fraud Detection</h4>
                    <p>
                      Quantum AI models can detect fraudulent transactions with higher accuracy,
                      identifying subtle patterns that classical models might miss.
                    </p>
                  </div>
                </div>
                
                <div className="application-item">
                  <div className="application-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <div className="application-content">
                    <h4>Price Prediction</h4>
                    <p>
                      Quantum machine learning can analyze market data more effectively,
                      providing more accurate cryptocurrency price predictions.
                    </p>
                  </div>
                </div>
                
                <div className="application-item">
                  <div className="application-icon">
                    <i className="fas fa-network-wired"></i>
                  </div>
                  <div className="application-content">
                    <h4>Network Optimization</h4>
                    <p>
                      Quantum AI can optimize blockchain network parameters in real-time,
                      improving throughput, latency, and resource allocation.
                    </p>
                  </div>
                </div>
                
                <div className="application-item">
                  <div className="application-icon">
                    <i className="fas fa-user-shield"></i>
                  </div>
                  <div className="application-content">
                    <h4>Identity Verification</h4>
                    <p>
                      Quantum-enhanced biometric models can provide more secure and
                      accurate identity verification for blockchain applications.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'security' && (
          <div className="security-tab">
            <div className="tab-header">
              <h2>Quantum Security</h2>
              <p className="tab-description">
                Quantum computing presents both challenges and opportunities for blockchain security.
                This dashboard provides insights into the quantum security posture of Kontour Coin.
              </p>
            </div>
            
            {!securityAnalysis ? (
              <div className="security-analysis-prompt">
                <div className="prompt-content">
                  <h3>Analyze Blockchain Security</h3>
                  <p>
                    Run a quantum security analysis to assess the vulnerability of the blockchain
                    to quantum computing attacks and receive recommendations for improvement.
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={handleSecurityAnalysis}
                    disabled={isAnalyzingSecurity}
                  >
                    {isAnalyzingSecurity ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Analyzing...
                      </>
                    ) : (
                      'Run Security Analysis'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="security-analysis-results">
                <div className="security-stats">
                  <div className="security-stat-card">
                    <div className="stat-title">Vulnerability Score</div>
                    <div className={`stat-value ${securityAnalysis.vulnerability_score > 7 ? 'high' : securityAnalysis.vulnerability_score > 4 ? 'medium' : 'low'}`}>
                      {securityAnalysis.vulnerability_score.toFixed(2)}/10
                    </div>
                    <div className="stat-description">
                      {securityAnalysis.vulnerability_score > 7 ? 'High Risk' : securityAnalysis.vulnerability_score > 4 ? 'Medium Risk' : 'Low Risk'}
                    </div>
                  </div>
                  
                  <div className="security-stat-card">
                    <div className="stat-title">Qubits to Break</div>
                    <div className="stat-value">
                      {securityAnalysis.qubits_needed_to_break.toLocaleString()}
                    </div>
                    <div className="stat-description">
                      Qubits needed to break cryptography
                    </div>
                  </div>
                  
                  <div className="security-stat-card">
                    <div className="stat-title">Time to Break</div>
                    <div className="stat-value">
                      {securityAnalysis.estimated_quantum_years_to_break < 1 ? 
                        `${(securityAnalysis.estimated_quantum_years_to_break * 12).toFixed(1)} months` : 
                        `${securityAnalysis.estimated_quantum_years_to_break.toFixed(1)} years`}
                    </div>
                    <div className="stat-description">
                      Estimated time with quantum computers
                    </div>
                  </div>
                </div>
                
                <div className="security-chart-container">
                  <h3>Vulnerability Assessment</h3>
                  <div className="chart-wrapper">
                    <canvas ref={securityVulnerabilityChartRef}></canvas>
                  </div>
                </div>
                
                <div className="security-recommendations">
                  <h3>Security Recommendations</h3>
                  <ul className="recommendations-list">
                    {securityAnalysis.recommendations.map((recommendation, index) => (
                      <li key={index} className="recommendation-item">
                        <i className="fas fa-check-circle"></i>
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="security-explanation">
                  <h3>Quantum Threats & Mitigations</h3>
                  <div className="threats-grid">
                    <div className="threat-card">
                      <div className="threat-header">
                        <i className="fas fa-key"></i>
                        <h4>Shor's Algorithm</h4>
                      </div>
                      <p>
                        Quantum algorithm that can break RSA and ECC cryptography by efficiently
                        factoring large numbers and computing discrete logarithms.
                      </p>
                      <div className="mitigation">
                        <strong>Mitigation:</strong> Use post-quantum cryptography like lattice-based
                        or hash-based signatures.
                      </div>
                    </div>
                    
                    <div className="threat-card">
                      <div className="threat-header">
                        <i className="fas fa-search"></i>
                        <h4>Grover's Algorithm</h4>
                      </div>
                      <p>
                        Provides a quadratic speedup for search problems, potentially weakening
                        hash functions and symmetric encryption.
                      </p>
                      <div className="mitigation">
                        <strong>Mitigation:</strong> Double key sizes for symmetric encryption
                        and use stronger hash functions.
                      </div>
                    </div>
                    
                    <div className="threat-card">
                      <div className="threat-header">
                        <i className="fas fa-random"></i>
                        <h4>Quantum Randomness Attacks</h4>
                      </div>
                      <p>
                        Attacks on random number generators that could compromise key generation
                        and other cryptographic operations.
                      </p>
                      <div className="mitigation">
                        <strong>Mitigation:</strong> Use quantum random number generators (QRNGs)
                        for true randomness.
                      </div>
                    </div>
                    
                    <div className="threat-card">
                      <div className="threat-header">
                        <i className="fas fa-history"></i>
                        <h4>Retroactive Decryption</h4>
                      </div>
                      <p>
                        Future quantum computers could decrypt data that was encrypted in the past
                        using current cryptographic methods.
                      </p>
                      <div className="mitigation">
                        <strong>Mitigation:</strong> Implement crypto-agility to quickly update
                        cryptographic algorithms when needed.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <style jsx>{`
        h1 {
          margin-bottom: 30px;
        }
        
        .dashboard-tabs {
          display: flex;
          border-bottom: 1px solid #ddd;
          margin-bottom: 30px;
        }
        
        .tab-button {
          padding: 12px 20px;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          color: var(--medium-gray);
          transition: all var(--transition-fast);
        }
        
        .tab-button:hover {
          color: var(--primary-color);
        }
        
        .tab-button.active {
          color: var(--primary-color);
          border-bottom-color: var(--primary-color);
        }
        
        .dashboard-content {
          background-color: var(--white);
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow-md);
          padding: 30px;
        }
        
        .tab-header {
          margin-bottom: 30px;
        }
        
        .tab-description {
          color: var(--medium-gray);
          font-size: 1.1rem;
          max-width: 800px;
        }
        
        .quantum-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        
        .quantum-stat-card {
          display: flex;
          align-items: center;
          background-color: var(--light-gray);
          border-radius: var(--border-radius-md);
          padding: 20px;
          transition: transform var(--transition-medium), box-shadow var(--transition-medium);
        }
        
        .quantum-stat-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-md);
        }
        
        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          margin-right: 20px;
        }
        
        .stat-icon.mining {
          background-color: rgba(66, 133, 244, 0.1);
          color: var(--primary-color);
        }
        
        .stat-icon.verification {
          background-color: rgba(52, 168, 83, 0.1);
          color: var(--secondary-color);
        }
        
        .stat-icon.ai {
          background-color: rgba(251, 188, 5, 0.1);
          color: var(--accent-color);
        }
        
        .stat-icon.optimization {
          background-color: rgba(234, 67, 53, 0.1);
          color: var(--error-color);
        }
        
        .stat-content {
          flex: 1;
        }
        
        .stat-value {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 5px;
        }
        
        .stat-label {
          font-weight: 500;
          margin-bottom: 5px;
        }
        
        .stat-description {
          font-size: 0.9rem;
          color: var(--medium-gray);
        }
        
        .overview-charts {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 30px;
          margin-bottom: 40px;
        }
        
        .chart-container {
          background-color: var(--light-gray);
          border-radius: var(--border-radius-md);
          padding: 20px;
          box-shadow: var(--shadow-sm);
        }
        
        .chart-container h3 {
          margin-bottom: 20px;
          color: var(--dark-gray);
        }
        
        .quantum-advantage-section {
          margin-top: 40px;
        }
        
        .section-description {
          color: var(--medium-gray);
          margin-bottom: 30px;
          max-width: 800px;
        }
        
        .advantage-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }
        
        .advantage-card {
          background-color: var(--light-gray);
          border-radius: var(--border-radius-md);
          padding: 20px;
          box-shadow: var(--shadow-sm);
        }
        
        .advantage-card h3 {
          margin-bottom: 15px;
          color: var(--dark-gray);
        }
        
        .advantage-value {
          margin-bottom: 15px;
          height: 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .advantage-value .value {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--primary-color);
        }
        
        .advantage-value .label {
          font-size: 1rem;
          color: var(--medium-gray);
        }
        
        .no-advantage {
          font-size: 1.2rem;
          color: var(--medium-gray);
          font-style: italic;
        }
        
        .advantage-card p {
          color: var(--medium-gray);
          font-size: 0.9rem;
        }
        
        .mining-stats,
        .ai-stats,
        .security-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .mining-stat-card,
        .ai-stat-card,
        .security-stat-card {
          background-color: var(--light-gray);
          border-radius: var(--border-radius-md);
          padding: 20px;
          text-align: center;
          box-shadow: var(--shadow-sm);
        }
        
        .stat-title {
          font-weight: 500;
          margin-bottom: 10px;
        }
        
        .mining-chart-container,
        .ai-chart-container,
        .security-chart-container {
          background-color: var(--light-gray);
          border-radius: var(--border-radius-md);
          padding: 20px;
          margin-bottom: 30px;
          box-shadow: var(--shadow-sm);
        }
        
        .mining-chart-container h3,
        .ai-chart-container h3,
        .security-chart-container h3 {
          margin-bottom: 20px;
        }
        
        .mining-explanation,
        .security-explanation {
          margin-top: 40px;
        }
        
        .explanation-content {
          display: flex;
          gap: 30px;
          align-items: center;
        }
        
        .explanation-text {
          flex: 3;
        }
        
        .explanation-image {
          flex: 2;
          display: flex;
          justify-content: center;
        }
        
        .explanation-image img {
          max-width: 100%;
          height: auto;
          max-height: 300px;
        }
        
        .explanation-text p {
          margin-bottom: 15px;
          color: var(--medium-gray);
        }
        
        .explanation-text ul {
          padding-left: 20px;
          color: var(--medium-gray);
        }
        
        .explanation-text li {
          margin-bottom: 5px;
        }
        
        .ai-algorithms {
          margin-top: 40px;
          margin-bottom: 40px;
        }
        
        .algorithms-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }
        
        .algorithm-card {
          background-color: var(--light-gray);
          border-radius: var(--border-radius-md);
          padding: 20px;
          box-shadow: var(--shadow-sm);
        }
        
        .algorithm-card h4 {
          margin-bottom: 10px;
          color: var(--primary-color);
        }
        
        .algorithm-card p {
          color: var(--medium-gray);
          font-size: 0.9rem;
        }
        
        .ai-applications {
          margin-top: 40px;
        }
        
        .applications-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .application-item {
          display: flex;
          align-items: flex-start;
          background-color: var(--light-gray);
          border-radius: var(--border-radius-md);
          padding: 20px;
          box-shadow: var(--shadow-sm);
        }
        
        .application-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: rgba(66, 133, 244, 0.1);
          color: var(--primary-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-right: 15px;
        }
        
        .application-content {
          flex: 1;
        }
        
        .application-content h4 {
          margin-bottom: 10px;
          color: var(--dark-gray);
        }
        
        .application-content p {
          color: var(--medium-gray);
          font-size: 0.9rem;
        }
        
        .security-analysis-prompt {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 300px;
        }
        
        .prompt-content {
          text-align: center;
          max-width: 500px;
        }
        
        .prompt-content h3 {
          margin-bottom: 15px;
        }
        
        .prompt-content p {
          margin-bottom: 20px;
          color: var(--medium-gray);
        }
        
        .security-stat-card .stat-value.high {
          color: var(--error-color);
        }
        
        .security-stat-card .stat-value.medium {
          color: var(--accent-color);
        }
        
        .security-stat-card .stat-value.low {
          color: var(--secondary-color);
        }
        
        .chart-wrapper {
          max-width: 400px;
          margin: 0 auto;
        }
        
        .security-recommendations {
          margin-top: 40px;
          margin-bottom: 40px;
        }
        
        .recommendations-list {
          list-style: none;
          padding: 0;
        }
        
        .recommendation-item {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
          background-color: var(--light-gray);
          padding: 15px;
          border-radius: var(--border-radius-sm);
        }
        
        .recommendation-item i {
          color: var(--secondary-color);
          margin-right: 15px;
          font-size: 1.2rem;
        }
        
        .threats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }
        
        .threat-card {
          background-color: var(--light-gray);
          border-radius: var(--border-radius-md);
          padding: 20px;
          box-shadow: var(--shadow-sm);
        }
        
        .threat-header {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .threat-header i {
          color: var(--primary-color);
          font-size: 1.5rem;
          margin-right: 15px;
        }
        
        .threat-header h4 {
          margin: 0;
          color: var(--dark-gray);
        }
        
        .threat-card p {
          color: var(--medium-gray);
          margin-bottom: 15px;
          font-size: 0.9rem;
        }
        
        .mitigation {
          background-color: rgba(52, 168, 83, 0.1);
          padding: 10px;
          border-radius: var(--border-radius-sm);
          font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
          .dashboard-tabs {
            flex-wrap: wrap;
          }
          
          .tab-button {
            flex: 1;
            min-width: 120px;
            text-align: center;
          }
          
          .overview-charts {
            grid-template-columns: 1fr;
          }
          
          .explanation-content {
            flex-direction: column;
          }
          
          .explanation-image {
            order: -1;
            margin-bottom: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default QuantumDashboardPage;