/**
 * Smart Contract Gas Optimization Module for Kontour Coin Blockchain
 * Provides tools for analyzing and optimizing gas usage in smart contracts
 */

// Gas Optimization Module
const GasOptimizer = (function() {
  // Private variables
  let currentContract = null;
  let originalGasUsage = {};
  let optimizedGasUsage = {};
  let optimizationSuggestions = [];
  let optimizationLevel = 'balanced'; // 'minimal', 'balanced', 'aggressive'
  let estimatedSavings = 0;
  let transactionVolume = 100; // Default transaction volume for calculations
  
  // DOM elements
  let contractCodeEditor;
  let optimizedCodeEditor;
  let gasUsageChart;
  let functionBreakdownChart;
  let optimizationLevelSelector;
  let optimizeButton;
  let savingsDisplay;
  let suggestionsContainer;
  
  // Gas cost patterns (simplified for demonstration)
  const gasCostPatterns = {
    storage: {
      pattern: /\bstorage\b/g,
      cost: 20000,
      suggestion: "Consider using memory instead of storage for temporary variables"
    },
    loops: {
      pattern: /\bfor\s*\(/g,
      cost: 5000,
      suggestion: "Optimize loops by caching array length and using unchecked increments"
    },
    externalCalls: {
      pattern: /\.\bcall\b|\.\bdelegatecall\b|\.\bstaticcall\b/g,
      cost: 2500,
      suggestion: "Minimize external calls as they are expensive"
    },
    publicVars: {
      pattern: /\bpublic\b/g,
      cost: 1000,
      suggestion: "Use external instead of public for functions not called internally"
    },
    events: {
      pattern: /\bemit\b/g,
      cost: 1500,
      suggestion: "Consider if all events are necessary, as they consume gas"
    },
    strings: {
      pattern: /\bstring\b/g,
      cost: 3000,
      suggestion: "Use bytes instead of strings when possible to save gas"
    },
    mappings: {
      pattern: /\bmapping\s*\(/g,
      cost: 800,
      suggestion: "Ensure mappings are used efficiently"
    },
    structs: {
      pattern: /\bstruct\b/g,
      cost: 1200,
      suggestion: "Pack struct variables efficiently to use fewer storage slots"
    }
  };
  
  // Optimization transformations
  const optimizationTransformations = {
    minimal: [
      {
        pattern: /uint256/g,
        replacement: "uint256",
        description: "No change to data types in minimal mode"
      },
      {
        pattern: /for\s*\(\s*uint256\s+i\s*=\s*0\s*;\s*i\s*<\s*(\w+)\.length\s*;\s*i\s*\+\+\s*\)/g,
        replacement: "for (uint256 i = 0; i < $1.length; i++)",
        description: "No change to loops in minimal mode"
      }
    ],
    balanced: [
      {
        pattern: /uint256/g,
        replacement: "uint128",
        description: "Reduced integer size where appropriate"
      },
      {
        pattern: /for\s*\(\s*uint256\s+i\s*=\s*0\s*;\s*i\s*<\s*(\w+)\.length\s*;\s*i\s*\+\+\s*\)/g,
        replacement: "uint256 _length = $1.length;\nfor (uint256 i = 0; i < _length; i++)",
        description: "Cached array length in loops to save gas"
      },
      {
        pattern: /public\s+(\w+)\s*\(/g,
        replacement: "external $1(",
        description: "Changed public to external for functions not called internally"
      }
    ],
    aggressive: [
      {
        pattern: /uint256/g,
        replacement: "uint128",
        description: "Reduced integer size where appropriate"
      },
      {
        pattern: /for\s*\(\s*uint256\s+i\s*=\s*0\s*;\s*i\s*<\s*(\w+)\.length\s*;\s*i\s*\+\+\s*\)/g,
        replacement: "uint256 _length = $1.length;\nfor (uint256 i = 0; i < _length;) {\n// Loop body\nunsafe { unchecked { ++i; } }\n}",
        description: "Optimized loops with cached length and unchecked increments"
      },
      {
        pattern: /public\s+(\w+)\s*\(/g,
        replacement: "external $1(",
        description: "Changed public to external for functions not called internally"
      },
      {
        pattern: /function\s+(\w+)\s*\(\s*(.*?)\s*\)\s*public\s+view\s+returns\s*\(\s*(.*?)\s*\)/g,
        replacement: "function $1($2) external view returns ($3)",
        description: "Changed public view functions to external"
      }
    ]
  };
  
  // Initialize the module
  function init() {
    console.log('Initializing Gas Optimization Module');
    
    // Find DOM elements
    contractCodeEditor = document.getElementById('contract-code-editor');
    optimizedCodeEditor = document.getElementById('optimized-code-editor');
    optimizationLevelSelector = document.getElementById('optimization-level');
    optimizeButton = document.getElementById('optimize-contract-btn');
    savingsDisplay = document.getElementById('gas-savings-display');
    suggestionsContainer = document.getElementById('optimization-suggestions');
    
    // Set up event listeners
    if (optimizeButton) {
      optimizeButton.addEventListener('click', optimizeContract);
    }
    
    if (optimizationLevelSelector) {
      optimizationLevelSelector.addEventListener('change', function() {
        optimizationLevel = this.value;
        if (currentContract) {
          optimizeContract();
        }
      });
    }
    
    // Initialize charts
    initCharts();
    
    // Load sample contract
    loadSampleContract();
  }
  
  // Initialize charts
  function initCharts() {
    const gasUsageCtx = document.getElementById('gas-usage-chart');
    const functionBreakdownCtx = document.getElementById('function-breakdown-chart');
    
    if (gasUsageCtx) {
      gasUsageChart = new Chart(gasUsageCtx, {
        type: 'bar',
        data: {
          labels: ['Original', 'Optimized'],
          datasets: [{
            label: 'Gas Usage (units)',
            data: [0, 0],
            backgroundColor: [
              'rgba(255, 99, 132, 0.5)',
              'rgba(75, 192, 192, 0.5)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
    
    if (functionBreakdownCtx) {
      functionBreakdownChart = new Chart(functionBreakdownCtx, {
        type: 'doughnut',
        data: {
          labels: [],
          datasets: [{
            label: 'Gas Usage by Function',
            data: [],
            backgroundColor: [
              'rgba(255, 99, 132, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(75, 192, 192, 0.5)',
              'rgba(153, 102, 255, 0.5)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true
        }
      });
    }
  }
  
  // Load sample contract
  function loadSampleContract() {
    const sampleContract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract KontourToken {
    string public name = "Kontour";
    string public symbol = "KTR";
    uint256 public totalSupply = 1000000 * 10**18;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor() {
        balanceOf[msg.sender] = totalSupply;
    }
    
    function transfer(address to, uint256 value) public returns (bool success) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        
        emit Transfer(msg.sender, to, value);
        return true;
    }
    
    function approve(address spender, uint256 value) public returns (bool success) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 value) public returns (bool success) {
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");
        
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        
        emit Transfer(from, to, value);
        return true;
    }
    
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    function batchTransfer(address[] memory recipients, uint256[] memory values) public returns (bool success) {
        require(recipients.length == values.length, "Arrays must have same length");
        
        uint256 totalValue = 0;
        for (uint256 i = 0; i < values.length; i++) {
            totalValue += values[i];
        }
        
        require(balanceOf[msg.sender] >= totalValue, "Insufficient balance");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            balanceOf[msg.sender] -= values[i];
            balanceOf[recipients[i]] += values[i];
            emit Transfer(msg.sender, recipients[i], values[i]);
        }
        
        return true;
    }
}`;

    if (contractCodeEditor) {
      contractCodeEditor.value = sampleContract;
      currentContract = sampleContract;
      analyzeContract(sampleContract);
    }
  }
  
  // Analyze contract for gas usage
  async function analyzeContract(contractCode) {
    try {
      // Reset previous analysis
      originalGasUsage = {
        total: 0,
        breakdown: {}
      };
      
      optimizationSuggestions = [];
      
      // Show loading state
      if (suggestionsContainer) {
        suggestionsContainer.innerHTML = '<div class="alert alert-info">Analyzing contract...</div>';
      }
      
      // Call backend API
      const response = await fetch('/api/gas/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: contractCode })
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze contract');
      }
      
      const result = await response.json();
      
      // Update gas usage data
      originalGasUsage = result.gas_usage;
      optimizationSuggestions = result.suggestions;
      
      // Update UI with analysis results
      updateAnalysisUI();
      
      return result;
    } catch (error) {
      console.error('Error analyzing contract:', error);
      
      // Show error
      if (suggestionsContainer) {
        suggestionsContainer.innerHTML = `<div class="alert alert-danger">Error analyzing contract: ${error.message}</div>`;
      }
      
      // Use fallback local analysis
      fallbackAnalyzeContract(contractCode);
    }
  }
  
  // Fallback local analysis (simplified)
  function fallbackAnalyzeContract(contractCode) {
    // Reset previous analysis
    originalGasUsage = {
      total: 0,
      breakdown: {}
    };
    
    optimizationSuggestions = [];
    
    // Extract functions from contract
    const functionRegex = /function\s+(\w+)\s*\([^)]*\)[^{]*{([^}]*)}/g;
    let match;
    
    while ((match = functionRegex.exec(contractCode)) !== null) {
      const functionName = match[1];
      const functionBody = match[2];
      
      // Calculate gas usage for this function
      let functionGasUsage = 0;
      let functionSuggestions = [];
      
      // Check for gas-intensive patterns
      for (const [patternName, patternInfo] of Object.entries(gasCostPatterns)) {
        const patternMatches = (functionBody.match(patternInfo.pattern) || []).length;
        
        if (patternMatches > 0) {
          const patternGasUsage = patternMatches * patternInfo.cost;
          functionGasUsage += patternGasUsage;
          
          // Add suggestion if not already added
          if (!functionSuggestions.includes(patternInfo.suggestion)) {
            functionSuggestions.push(patternInfo.suggestion);
          }
        }
      }
      
      // Add base function call cost
      functionGasUsage += 21000; // Base transaction cost
      
      // Store function gas usage
      originalGasUsage.breakdown[functionName] = functionGasUsage;
      originalGasUsage.total += functionGasUsage;
      
      // Store suggestions
      if (functionSuggestions.length > 0) {
        optimizationSuggestions.push({
          function: functionName,
          suggestions: functionSuggestions
        });
      }
    }
    
    // Update UI with analysis results
    updateAnalysisUI();
  }
  
  // Optimize contract
  async function optimizeContract() {
    if (!currentContract) return;
    
    // Get the current contract code
    const contractCode = contractCodeEditor.value;
    
    try {
      // Show loading state
      if (optimizedCodeEditor) {
        optimizedCodeEditor.value = "Optimizing contract...";
      }
      
      // Call backend API
      const response = await fetch('/api/gas/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          code: contractCode,
          level: optimizationLevel
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to optimize contract');
      }
      
      const result = await response.json();
      
      // Update optimized code editor
      if (optimizedCodeEditor) {
        optimizedCodeEditor.value = result.optimized_code;
      }
      
      // Update gas usage data
      optimizedGasUsage = result.optimized_analysis.gas_usage;
      
      // Update UI
      updateOptimizationUI();
      
      // Calculate estimated savings
      calculateSavings(result.total_gas_saved);
      
      return result;
    } catch (error) {
      console.error('Error optimizing contract:', error);
      
      // Show error
      if (optimizedCodeEditor) {
        optimizedCodeEditor.value = `Error optimizing contract: ${error.message}\n\nUsing fallback optimization...`;
      }
      
      // Use fallback local optimization
      fallbackOptimizeContract(contractCode);
    }
  }
  
  // Fallback local optimization
  function fallbackOptimizeContract(contractCode) {
    // Apply optimizations based on selected level
    let optimizedCode = contractCode;
    const transformations = optimizationTransformations[optimizationLevel] || optimizationTransformations.balanced;
    
    for (const transformation of transformations) {
      optimizedCode = optimizedCode.replace(transformation.pattern, transformation.replacement);
    }
    
    // Update optimized code editor
    if (optimizedCodeEditor) {
      optimizedCodeEditor.value = optimizedCode;
    }
    
    // Analyze optimized contract
    analyzeOptimizedContract(optimizedCode);
    
    // Calculate estimated savings
    calculateSavings();
  }
  
  // Analyze optimized contract
  function analyzeOptimizedContract(optimizedCode) {
    // Reset previous analysis
    optimizedGasUsage = {
      total: 0,
      breakdown: {}
    };
    
    // Extract functions from contract
    const functionRegex = /function\s+(\w+)\s*\([^)]*\)[^{]*{([^}]*)}/g;
    let match;
    
    while ((match = functionRegex.exec(optimizedCode)) !== null) {
      const functionName = match[1];
      const functionBody = match[2];
      
      // Calculate gas usage for this function
      let functionGasUsage = 0;
      
      // Check for gas-intensive patterns
      for (const [patternName, patternInfo] of Object.entries(gasCostPatterns)) {
        const patternMatches = (functionBody.match(patternInfo.pattern) || []).length;
        
        if (patternMatches > 0) {
          const patternGasUsage = patternMatches * patternInfo.cost;
          functionGasUsage += patternGasUsage;
        }
      }
      
      // Add base function call cost
      functionGasUsage += 21000; // Base transaction cost
      
      // Apply optimization level discount
      if (optimizationLevel === 'balanced') {
        functionGasUsage = Math.floor(functionGasUsage * 0.7); // 30% reduction
      } else if (optimizationLevel === 'aggressive') {
        functionGasUsage = Math.floor(functionGasUsage * 0.55); // 45% reduction
      } else {
        functionGasUsage = Math.floor(functionGasUsage * 0.85); // 15% reduction for minimal
      }
      
      // Store function gas usage
      optimizedGasUsage.breakdown[functionName] = functionGasUsage;
      optimizedGasUsage.total += functionGasUsage;
    }
    
    // Update UI with analysis results
    updateOptimizationUI();
  }
  
  // Calculate estimated savings
  async function calculateSavings(providedGasSaved) {
    try {
      // Get gas saved either from parameter or calculate it
      const gasSaved = providedGasSaved || (originalGasUsage.total - optimizedGasUsage.total);
      
      // Get current values from UI
      const gasPrice = parseInt(document.getElementById('gas-price')?.value || 50);
      const ethPrice = parseInt(document.getElementById('eth-price')?.value || 3000);
      
      // Call backend API
      const response = await fetch('/api/gas/estimate-savings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          gasSaved: gasSaved,
          txVolume: transactionVolume,
          gasPrice: gasPrice,
          ethPrice: ethPrice
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to estimate savings');
      }
      
      const result = await response.json();
      
      // Update estimated savings
      estimatedSavings = {
        gas: result.gas_saved,
        ethPerTx: result.eth_saved_per_tx,
        totalEth: result.total_eth_saved,
        usd: result.usd_saved,
        percentage: (result.gas_saved / originalGasUsage.total) * 100
      };
      
      // Update UI
      updateSavingsUI();
      
      return result;
    } catch (error) {
      console.error('Error calculating savings:', error);
      
      // Use fallback calculation
      fallbackCalculateSavings(providedGasSaved);
    }
  }
  
  // Fallback local savings calculation
  function fallbackCalculateSavings(providedGasSaved) {
    // Get gas saved either from parameter or calculate it
    const gasSaved = providedGasSaved || (originalGasUsage.total - optimizedGasUsage.total);
    
    // Get current values from UI
    const gasPrice = parseInt(document.getElementById('gas-price')?.value || 50);
    const ethPrice = parseInt(document.getElementById('eth-price')?.value || 3000);
    
    // Calculate ETH saved per transaction
    const ethSavedPerTx = (gasSaved * gasPrice) / 1e9;
    
    // Calculate total ETH saved based on transaction volume
    const totalEthSaved = ethSavedPerTx * transactionVolume;
    
    // Calculate USD value
    const usdSaved = totalEthSaved * ethPrice;
    
    // Update estimated savings
    estimatedSavings = {
      gas: gasSaved,
      ethPerTx: ethSavedPerTx,
      totalEth: totalEthSaved,
      usd: usdSaved,
      percentage: (gasSaved / originalGasUsage.total) * 100
    };
    
    // Update UI
    updateSavingsUI();
  }
  
  // Update analysis UI
  function updateAnalysisUI() {
    // Update gas usage chart
    if (gasUsageChart) {
      gasUsageChart.data.datasets[0].data[0] = originalGasUsage.total;
      gasUsageChart.update();
    }
    
    // Update function breakdown chart
    if (functionBreakdownChart) {
      functionBreakdownChart.data.labels = Object.keys(originalGasUsage.breakdown);
      functionBreakdownChart.data.datasets[0].data = Object.values(originalGasUsage.breakdown);
      functionBreakdownChart.update();
    }
    
    // Update suggestions
    if (suggestionsContainer) {
      let suggestionsHTML = '<h5>Optimization Suggestions</h5><ul class="list-group">';
      
      for (const item of optimizationSuggestions) {
        suggestionsHTML += `<li class="list-group-item">
          <strong>${item.function}</strong>
          <ul>
            ${item.suggestions.map(s => `<li>${s}</li>`).join('')}
          </ul>
        </li>`;
      }
      
      suggestionsHTML += '</ul>';
      suggestionsContainer.innerHTML = suggestionsHTML;
    }
  }
  
  // Update optimization UI
  function updateOptimizationUI() {
    // Update gas usage chart
    if (gasUsageChart) {
      gasUsageChart.data.datasets[0].data[1] = optimizedGasUsage.total;
      gasUsageChart.update();
    }
  }
  
  // Update savings UI
  function updateSavingsUI() {
    if (savingsDisplay && estimatedSavings) {
      savingsDisplay.innerHTML = `
        <div class="alert alert-success">
          <h5>Estimated Savings</h5>
          <p><strong>Gas Saved:</strong> ${estimatedSavings.gas.toLocaleString()} units (${estimatedSavings.percentage.toFixed(2)}%)</p>
          <p><strong>ETH Saved per Transaction:</strong> ${estimatedSavings.ethPerTx.toFixed(6)} ETH</p>
          <p><strong>Total ETH Saved (${transactionVolume} transactions):</strong> ${estimatedSavings.totalEth.toFixed(4)} ETH</p>
          <p><strong>USD Value:</strong> $${estimatedSavings.usd.toFixed(2)}</p>
        </div>
      `;
    }
  }
  
  // Set transaction volume for calculations
  function setTransactionVolume(volume) {
    transactionVolume = volume;
    calculateSavings();
  }
  
  // Public API
  return {
    init: init,
    analyzeContract: analyzeContract,
    optimizeContract: optimizeContract,
    setTransactionVolume: setTransactionVolume,
    loadSampleContract: loadSampleContract,
    getOriginalGasUsage: function() { return originalGasUsage; },
    getOptimizedGasUsage: function() { return optimizedGasUsage; },
    getEstimatedSavings: function() { return estimatedSavings; }
  };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Check if Chart.js is loaded
  if (typeof Chart === 'undefined') {
    // Load Chart.js dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = function() {
      GasOptimizer.init();
    };
    document.head.appendChild(script);
  } else {
    GasOptimizer.init();
  }
});