import React, { useState } from 'react';
import WorkflowManager from '../components/WorkflowManager';
import QuantumCircuitVisualizer from '../components/QuantumCircuitVisualizer';
import { QuantumMLDashboard } from '../components/QuantumMLDashboard';
import { KontourDashboard } from '../components/KontourDashboard';

export default function WorkflowPage() {
  const [activeTab, setActiveTab] = useState<'workflow' | 'circuit' | 'quantum-ml' | 'kontour'>('workflow');

  return (
    <div className="container">
      <h1>Quantum Blockchain Workflow</h1>
      
      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'workflow' ? 'active' : ''}`}
          onClick={() => setActiveTab('workflow')}
        >
          Workflow Manager
        </button>
        <button 
          className={`tab-button ${activeTab === 'circuit' ? 'active' : ''}`}
          onClick={() => setActiveTab('circuit')}
        >
          Circuit Optimization
        </button>
        <button 
          className={`tab-button ${activeTab === 'quantum-ml' ? 'active' : ''}`}
          onClick={() => setActiveTab('quantum-ml')}
        >
          Quantum ML
        </button>
        <button 
          className={`tab-button ${activeTab === 'kontour' ? 'active' : ''}`}
          onClick={() => setActiveTab('kontour')}
        >
          Kontour Coin
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'workflow' && <WorkflowManager />}
        {activeTab === 'circuit' && <QuantumCircuitVisualizer />}
        {activeTab === 'quantum-ml' && <QuantumMLDashboard />}
        {activeTab === 'kontour' && <KontourDashboard />}
      </div>
      
      <style jsx>{`
        .container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        h1 {
          margin-bottom: 20px;
          color: #333;
        }
        
        .tabs {
          display: flex;
          border-bottom: 1px solid #ddd;
          margin-bottom: 20px;
        }
        
        .tab-button {
          padding: 10px 20px;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          color: #555;
          transition: all 0.2s;
        }
        
        .tab-button:hover {
          color: #4285F4;
        }
        
        .tab-button.active {
          color: #4285F4;
          border-bottom-color: #4285F4;
        }
        
        .tab-content {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
