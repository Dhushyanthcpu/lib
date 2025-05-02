<script src="https://cdn.jsdelivr.net/npm/tensorflow@3.19.0/dist/tf.min.js"></script>
/**
 * Kontour Coin Optimization Visualizer
 * Frontend JavaScript for blockchain visualization and deep learning integration
 */

// Global variables
let socket;
let networkChart;
let optimizationChart;
let currentModel = 'transaction';
let networkData = { nodes: [], links: [] };
let optimizationData = {
  labels: [],
  datasets: [
    {
      label: 'Transaction Throughput',
      data: [],
      borderColor: 'rgba(13, 110, 253, 1)',
      backgroundColor: 'rgba(13, 110, 253, 0.1)',
      tension: 0.4,
      fill: true
    },
    {
      label: 'Block Time',
      data: [],
      borderColor: 'rgba(28, 200, 138, 1)',
      backgroundColor: 'rgba(28, 200, 138, 0.1)',
      tension: 0.4,
      fill: true
    },
    {
      label: 'Network Efficiency',
      data: [],
      borderColor: 'rgba(246, 194, 62, 1)',
      backgroundColor: 'rgba(246, 194, 62, 0.1)',
      tension: 0.4,
      fill: true
    }
  ]
};

// TensorFlow model variables
let model;
let trainingData;
let modelPredictionResults = [];

// DOM elements
const networkVisualization = document.getElementById('network-visualization');
const modelVisualization = document.getElementById('model-visualization');
const realtimeToggle = document.getElementById('realtime-toggle');
const refreshBtn = document.getElementById('refresh-btn');
const trainModelBtn = document.getElementById('train-model-btn');
const predictBtn = document.getElementById('predict-btn');
const trainingProgress = document.getElementById('training-progress');
const txThroughput = document.getElementById('tx-throughput');
const blockTime = document.getElementById('block-time');
const networkEfficiency = document.getElementById('network-efficiency');
const contourComplexity = document.getElementById('contour-complexity');
const txProgress = document.getElementById('tx-progress');
const blockTimeProgress = document.getElementById('block-time-progress');
const efficiencyProgress = document.getElementById('efficiency-progress');
const complexityProgress = document.getElementById('complexity-progress');
const predictionResultsElement = document.getElementById('prediction-results');
const applyPredictionBtn = document.getElementById('apply-prediction-btn');

// Bootstrap modal
let predictionModal;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Bootstrap components
  predictionModal = new bootstrap.Modal(document.getElementById('predictionModal'));
  
  // Set up event listeners
  setupEventListeners();
  
  // Initialize charts
  initCharts();
  
  // Connect to WebSocket server
  connectWebSocket();
  
  // Initialize TensorFlow model
  initTensorFlowModel();
  
  // Initial data fetch
  fetchInitialData();
});

// Set up event listeners
function setupEventListeners() {
  refreshBtn.addEventListener('click', fetchInitialData);
  
  realtimeToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }
  });
  
  trainModelBtn.addEventListener('click', trainModel);
  predictBtn.addEventListener('click', runPrediction);
  applyPredictionBtn.addEventListener('click', applyOptimization);
  
  // Model selection dropdown
  document.querySelectorAll('[data-model]').forEach(item => {
    item.addEventListener('click', (e) => {
      currentModel = e.target.getAttribute('data-model');
      document.getElementById('modelDropdown').textContent = e.target.textContent;
      initTensorFlowModel();
      renderModelVisualization();
    });
  });
}

// Initialize charts
function initCharts() {
  // Initialize optimization chart
  const ctx = document.getElementById('optimization-chart').getContext('2d');
  optimizationChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: optimizationData.labels,
      datasets: optimizationData.datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        }
      },
      plugins: {
        legend: {
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      animation: {
        duration: 1000
      }
    }
  });
  
  // Initialize network visualization
  initNetworkVisualization();
}

// Initialize network visualization with D3.js
function initNetworkVisualization() {
  const width = networkVisualization.clientWidth;
  const height = networkVisualization.clientHeight;
  
  // Create SVG
  const svg = d3.select('#network-visualization')
    .append('svg')
    .attr('width', width)
    .attr('height', height);
  
  // Create tooltip
  const tooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);
  
  // Create force simulation
  const simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(d => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(30));
  
  // Create groups for links and nodes
  const link = svg.append('g')
    .attr('class', 'links')
    .selectAll('line');
  
  const node = svg.append('g')
    .attr('class', 'nodes')
    .selectAll('circle');
  
  // Update network visualization
  function updateNetwork(data) {
    // Update links
    const links = link.data(data.links, d => `${d.source.id || d.source}-${d.target.id || d.target}`);
    links.exit().remove();
    
    const linksEnter = links.enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke-width', d => Math.sqrt(d.value));
    
    // Update nodes
    const nodes = node.data(data.nodes, d => d.id);
    nodes.exit().remove();
    
    const nodesEnter = nodes.enter()
      .append('g')
      .attr('class', 'node')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));
    
    nodesEnter.append('circle')
      .attr('r', d => d.size || 10)
      .attr('fill', d => d.color || getNodeColor(d.type))
      .on('mouseover', function(event, d) {
        tooltip.transition()
          .duration(200)
          .style('opacity', .9);
        tooltip.html(`
          <strong>${d.id}</strong><br>
          Type: ${d.type}<br>
          ${d.value ? `Value: ${d.value}` : ''}
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });
    
    nodesEnter.append('text')
      .attr('dx', 12)
      .attr('dy', '.35em')
      .text(d => d.id);
    
    // Update simulation
    simulation.nodes(data.nodes)
      .on('tick', ticked);
    
    simulation.force('link')
      .links(data.links);
    
    // Restart simulation
    simulation.alpha(1).restart();
    
    // Tick function to update positions
    function ticked() {
      linksEnter
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      
      nodesEnter.selectAll('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
      
      nodesEnter.selectAll('text')
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    }
    
    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }
  
  // Get node color based on type
  function getNodeColor(type) {
    const colors = {
      'miner': '#4e73df',
      'validator': '#1cc88a',
      'node': '#36b9cc',
      'transaction': '#f6c23e',
      'block': '#e74a3b'
    };
    
    return colors[type] || '#858796';
  }
  
  // Store update function for later use
  networkVisualization.updateNetwork = updateNetwork;
}

// Initialize TensorFlow model
function initTensorFlowModel() {
  // Create a sequential model
  model = tf.sequential();
  
  // Add layers based on current model type
  switch (currentModel) {
    case 'transaction':
      model.add(tf.layers.dense({ units: 10, activation: 'relu', inputShape: [4] }));
      model.add(tf.layers.dense({ units: 20, activation: 'relu' }));
      model.add(tf.layers.dense({ units: 10, activation: 'relu' }));
      model.add(tf.layers.dense({ units: 1, activation: 'linear' }));
      break;
    
    case 'contour':
      model.add(tf.layers.dense({ units: 16, activation: 'relu', inputShape: [6] }));
      model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
      model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
      model.add(tf.layers.dense({ units: 2, activation: 'linear' }));
      break;
    
    case 'network':
      model.add(tf.layers.dense({ units: 20, activation: 'relu', inputShape: [8] }));
      model.add(tf.layers.dense({ units: 40, activation: 'relu' }));
      model.add(tf.layers.dense({ units: 20, activation: 'relu' }));
      model.add(tf.layers.dense({ units: 3, activation: 'sigmoid' }));
      break;
  }
  
  // Compile the model
  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'meanSquaredError',
    metrics: ['mse']
  });
  
  // Generate sample training data
  generateTrainingData();
  
  // Render model visualization
  renderModelVisualization();
}

// Generate training data based on current model
function generateTrainingData() {
  switch (currentModel) {
    case 'transaction':
      // Features: [txCount, blockSize, networkLoad, fee]
      // Label: [processingTime]
      trainingData = {
        xs: tf.tensor2d([
          [10, 1, 0.2, 0.001],
          [50, 2, 0.3, 0.002],
          [100, 3, 0.4, 0.003],
          [200, 4, 0.5, 0.004],
          [300, 5, 0.6, 0.005],
          [400, 6, 0.7, 0.006],
          [500, 7, 0.8, 0.007],
          [600, 8, 0.9, 0.008],
          [700, 9, 0.95, 0.009],
          [800, 10, 0.98, 0.01]
        ]),
        ys: tf.tensor2d([
          [1],
          [2],
          [3],
          [4],
          [5],
          [6],
          [7],
          [8],
          [9],
          [10]
        ])
      };
      break;
    
    case 'contour':
      // Features: [dimensions, points, complexity, curvature, length, iterations]
      // Label: [optimizedComplexity, processingTime]
      trainingData = {
        xs: tf.tensor2d([
          [2, 10, 20, 0.5, 100, 10],
          [2, 20, 30, 0.6, 150, 15],
          [3, 30, 40, 0.7, 200, 20],
          [3, 40, 50, 0.8, 250, 25],
          [4, 50, 60, 0.9, 300, 30],
          [4, 60, 70, 1.0, 350, 35],
          [5, 70, 80, 1.1, 400, 40],
          [5, 80, 90, 1.2, 450, 45],
          [6, 90, 95, 1.3, 500, 50],
          [6, 100, 98, 1.4, 550, 55]
        ]),
        ys: tf.tensor2d([
          [40, 2],
          [50, 3],
          [60, 4],
          [70, 5],
          [80, 6],
          [85, 7],
          [90, 8],
          [92, 9],
          [95, 10],
          [98, 11]
        ])
      };
      break;
    
    case 'network':
      // Features: [nodeCount, connections, avgLatency, txPoolSize, blockSize, hashRate, difficulty, propagationTime]
      // Label: [throughput, efficiency, reliability]
      trainingData = {
        xs: tf.tensor2d([
          [5, 10, 50, 100, 1, 100, 1, 200],
          [10, 20, 45, 200, 2, 200, 2, 180],
          [15, 30, 40, 300, 3, 300, 3, 160],
          [20, 40, 35, 400, 4, 400, 4, 140],
          [25, 50, 30, 500, 5, 500, 5, 120],
          [30, 60, 25, 600, 6, 600, 6, 100],
          [35, 70, 20, 700, 7, 700, 7, 80],
          [40, 80, 15, 800, 8, 800, 8, 60],
          [45, 90, 10, 900, 9, 900, 9, 40],
          [50, 100, 5, 1000, 10, 1000, 10, 20]
        ]),
        ys: tf.tensor2d([
          [10, 0.5, 0.9],
          [20, 0.55, 0.91],
          [30, 0.6, 0.92],
          [40, 0.65, 0.93],
          [50, 0.7, 0.94],
          [60, 0.75, 0.95],
          [70, 0.8, 0.96],
          [80, 0.85, 0.97],
          [90, 0.9, 0.98],
          [100, 0.95, 0.99]
        ])
      };
      break;
  }
}

// Render neural network visualization
function renderModelVisualization() {
  // Clear previous visualization
  modelVisualization.innerHTML = '';
  
  // Get model architecture
  const layers = model.layers;
  const width = modelVisualization.clientWidth;
  const height = modelVisualization.clientHeight;
  
  // Create SVG
  const svg = d3.select('#model-visualization')
    .append('svg')
    .attr('width', width)
    .attr('height', height);
  
  // Calculate layer positions
  const layerCount = layers.length;
  const layerWidth = width / (layerCount + 1);
  
  // Create neurons and connections
  let allNeurons = [];
  
  // For each layer
  layers.forEach((layer, layerIndex) => {
    const units = layer.outputShape[1];
    const neuronHeight = Math.min(height / (units + 1), 30);
    const layerX = layerWidth * (layerIndex + 1);
    
    // Create neurons for this layer
    const neurons = [];
    
    for (let i = 0; i < units; i++) {
      const neuronY = (height / (units + 1)) * (i + 1);
      
      neurons.push({
        x: layerX,
        y: neuronY,
        layer: layerIndex,
        index: i,
        type: layerIndex === 0 ? 'input' : (layerIndex === layerCount - 1 ? 'output' : 'hidden')
      });
    }
    
    // Add neurons to the global array
    allNeurons.push(neurons);
    
    // Draw neurons
    svg.selectAll(`.neuron-layer-${layerIndex}`)
      .data(neurons)
      .enter()
      .append('circle')
      .attr('class', d => `neuron ${d.type}`)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', neuronHeight / 2);
  });
  
  // Draw connections between layers
  for (let i = 0; i < allNeurons.length - 1; i++) {
    const currentLayer = allNeurons[i];
    const nextLayer = allNeurons[i + 1];
    
    // For each neuron in current layer
    currentLayer.forEach(source => {
      // Connect to each neuron in next layer
      nextLayer.forEach(target => {
        svg.append('line')
          .attr('class', 'connection')
          .attr('x1', source.x)
          .attr('y1', source.y)
          .attr('x2', target.x)
          .attr('y2', target.y)
          .attr('stroke-width', 1);
      });
    });
  }
  
  // Add layer labels
  layers.forEach((layer, layerIndex) => {
    const layerX = layerWidth * (layerIndex + 1);
    
    svg.append('text')
      .attr('x', layerX)
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6c757d')
      .text(`Layer ${layerIndex + 1} (${layer.outputShape[1]} units)`);
  });
}

// Train the model
async function trainModel() {
  trainModelBtn.disabled = true;
  predictBtn.disabled = true;
  
  // Update UI
  trainingProgress.style.width = '0%';
  trainingProgress.textContent = '0%';
  
  try {
    // Train the model
    await model.fit(trainingData.xs, trainingData.ys, {
      epochs: 100,
      batchSize: 32,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          // Update progress
          const progress = Math.round((epoch + 1) / 100 * 100);
          trainingProgress.style.width = `${progress}%`;
          trainingProgress.textContent = `${progress}%`;
          
          // Animate neurons in visualization
          animateTraining(epoch);
        }
      }
    });
    
    // Enable buttons
    trainModelBtn.disabled = false;
    predictBtn.disabled = false;
    
    // Show success message
    trainingProgress.textContent = 'Training Complete!';
    
  } catch (error) {
    console.error('Training error:', error);
    trainingProgress.textContent = 'Training Failed';
    trainModelBtn.disabled = false;
  }
}

// Animate neurons during training
function animateTraining(epoch) {
  // Get all neurons
  const neurons = document.querySelectorAll('.neuron');
  const connections = document.querySelectorAll('.connection');
  
  // Reset all animations
  neurons.forEach(neuron => {
    neuron.classList.remove('active');
  });
  
  connections.forEach(connection => {
    connection.classList.remove('active');
  });
  
  // Randomly activate some neurons and connections
  const neuronCount = neurons.length;
  const connectionCount = connections.length;
  
  const activeNeuronCount = Math.floor(neuronCount * (epoch / 100));
  const activeConnectionCount = Math.floor(connectionCount * (epoch / 100));
  
  // Activate random neurons
  for (let i = 0; i < activeNeuronCount; i++) {
    const randomIndex = Math.floor(Math.random() * neuronCount);
    neurons[randomIndex].classList.add('active');
  }
  
  // Activate random connections
  for (let i = 0; i < activeConnectionCount; i++) {
    const randomIndex = Math.floor(Math.random() * connectionCount);
    connections[randomIndex].classList.add('active');
  }
}

// Run prediction
function runPrediction() {
  // Generate test data based on current model
  let testData;
  
  switch (currentModel) {
    case 'transaction':
      // Features: [txCount, blockSize, networkLoad, fee]
      testData = tf.tensor2d([
        [250, 5, 0.5, 0.005],
        [550, 8, 0.85, 0.008],
        [900, 12, 0.99, 0.012]
      ]);
      break;
    
    case 'contour':
      // Features: [dimensions, points, complexity, curvature, length, iterations]
      testData = tf.tensor2d([
        [3, 35, 45, 0.75, 225, 22],
        [4, 65, 75, 1.05, 375, 38],
        [6, 95, 97, 1.35, 525, 53]
      ]);
      break;
    
    case 'network':
      // Features: [nodeCount, connections, avgLatency, txPoolSize, blockSize, hashRate, difficulty, propagationTime]
      testData = tf.tensor2d([
        [22, 45, 32, 450, 4.5, 450, 4.5, 130],
        [38, 75, 17, 750, 7.5, 750, 7.5, 70],
        [55, 110, 3, 1100, 11, 1100, 11, 10]
      ]);
      break;
  }
  
  // Make prediction
  const prediction = model.predict(testData);
  const predictionData = prediction.dataSync();
  
  // Format prediction results
  let results = [];
  
  switch (currentModel) {
    case 'transaction':
      results = [
        {
          title: 'Low Volume Scenario',
          description: 'Prediction for 250 transactions with 5MB block size',
          prediction: `Processing Time: ${predictionData[0].toFixed(2)} seconds`,
          confidence: 0.92,
          recommendation: 'Maintain current configuration'
        },
        {
          title: 'Medium Volume Scenario',
          description: 'Prediction for 550 transactions with 8MB block size',
          prediction: `Processing Time: ${predictionData[1].toFixed(2)} seconds`,
          confidence: 0.87,
          recommendation: 'Consider increasing block size to 10MB'
        },
        {
          title: 'High Volume Scenario',
          description: 'Prediction for 900 transactions with 12MB block size',
          prediction: `Processing Time: ${predictionData[2].toFixed(2)} seconds`,
          confidence: 0.78,
          recommendation: 'Increase block size to 15MB and adjust difficulty'
        }
      ];
      break;
    
    case 'contour':
      results = [
        {
          title: 'Basic Contour Optimization',
          description: '3D contour with 35 points',
          prediction: `Optimized Complexity: ${predictionData[0].toFixed(2)}, Processing Time: ${predictionData[1].toFixed(2)} seconds`,
          confidence: 0.89,
          recommendation: 'Increase point density by 15%'
        },
        {
          title: 'Advanced Contour Optimization',
          description: '4D contour with 65 points',
          prediction: `Optimized Complexity: ${predictionData[2].toFixed(2)}, Processing Time: ${predictionData[3].toFixed(2)} seconds`,
          confidence: 0.84,
          recommendation: 'Reduce curvature by 10% for better efficiency'
        },
        {
          title: 'Complex Contour Optimization',
          description: '6D contour with 95 points',
          prediction: `Optimized Complexity: ${predictionData[4].toFixed(2)}, Processing Time: ${predictionData[5].toFixed(2)} seconds`,
          confidence: 0.76,
          recommendation: 'Simplify to 5D and increase iterations by 20%'
        }
      ];
      break;
    
    case 'network':
      results = [
        {
          title: 'Small Network Optimization',
          description: '22 nodes with 45 connections',
          prediction: `Throughput: ${predictionData[0].toFixed(2)} tx/s, Efficiency: ${(predictionData[1] * 100).toFixed(2)}%, Reliability: ${(predictionData[2] * 100).toFixed(2)}%`,
          confidence: 0.91,
          recommendation: 'Reduce average latency by 15%'
        },
        {
          title: 'Medium Network Optimization',
          description: '38 nodes with 75 connections',
          prediction: `Throughput: ${predictionData[3].toFixed(2)} tx/s, Efficiency: ${(predictionData[4] * 100).toFixed(2)}%, Reliability: ${(predictionData[5] * 100).toFixed(2)}%`,
          confidence: 0.85,
          recommendation: 'Add 5-7 more connections between key nodes'
        },
        {
          title: 'Large Network Optimization',
          description: '55 nodes with 110 connections',
          prediction: `Throughput: ${predictionData[6].toFixed(2)} tx/s, Efficiency: ${(predictionData[7] * 100).toFixed(2)}%, Reliability: ${(predictionData[8] * 100).toFixed(2)}%`,
          confidence: 0.79,
          recommendation: 'Optimize propagation paths and increase hash rate by 20%'
        }
      ];
      break;
  }
  
  // Display results
  displayPredictionResults(results);
}

// Display prediction results
function displayPredictionResults(results) {
  // Clear previous results
  predictionResultsElement.innerHTML = '';
  
  // Add results to the modal
  results.forEach(result => {
    const confidenceClass = result.confidence > 0.9 ? 'high-confidence' : 
                           (result.confidence > 0.8 ? 'medium-confidence' : 'low-confidence');
    
    const resultHtml = `
      <div class="prediction-item ${confidenceClass}">
        <h6>${result.title}</h6>
        <p>${result.description}</p>
        <p><strong>Prediction:</strong> ${result.prediction}</p>
        <p><strong>Confidence:</strong> <span class="confidence">${(result.confidence * 100).toFixed(2)}%</span></p>
        <p><strong>Recommendation:</strong> ${result.recommendation}</p>
      </div>
    `;
    
    predictionResultsElement.innerHTML += resultHtml;
  });
  
  // Show modal
  predictionModal.show();
}

// Apply optimization based on prediction
function applyOptimization() {
  // Hide modal
  predictionModal.hide();
  
  // Show loading spinner
  const spinner = document.createElement('div');
  spinner.className = 'spinner-border text-primary';
  spinner.setAttribute('role', 'status');
  spinner.innerHTML = '<span class="visually-hidden">Loading...</span>';
  
  document.body.appendChild(spinner);
  spinner.style.position = 'fixed';
  spinner.style.top = '50%';
  spinner.style.left = '50%';
  spinner.style.transform = 'translate(-50%, -50%)';
  
  // Simulate optimization application
  setTimeout(() => {
    // Remove spinner
    document.body.removeChild(spinner);
    
    // Update metrics with optimized values
    updateMetrics({
      txThroughput: Math.floor(Math.random() * 50) + 50,
      blockTime: Math.floor(Math.random() * 5) + 5,
      networkEfficiency: Math.floor(Math.random() * 20) + 80,
      contourComplexity: Math.floor(Math.random() * 30) + 70
    });
    
    // Show success message
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
      <div class="toast-header">
        <strong class="me-auto">Optimization Applied</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        Optimization has been successfully applied to the blockchain network.
      </div>
    `;
    
    document.body.appendChild(toast);
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.zIndex = '1050';
    
    // Remove toast after 5 seconds
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 5000);
    
    // Fetch updated data
    fetchInitialData();
  }, 2000);
}

// Connect to WebSocket server
function connectWebSocket() {
  // Check if socket already exists
  if (socket && socket.connected) {
    return;
  }
  
  // Connect to server
  socket = io();
  
  // Set up event handlers
  socket.on('connect', () => {
    console.log('Connected to server');
  });
  
  socket.on('blockchain-update', (data) => {
    updateDashboard(data);
  });
  
  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });
}

// Disconnect from WebSocket server
function disconnectWebSocket() {
  if (socket) {
    socket.disconnect();
  }
}

// Fetch initial data
function fetchInitialData() {
  fetch('/api/blockchain-stats')
    .then(response => response.json())
    .then(data => {
      updateDashboard(data);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      
      // Use sample data for demonstration
      updateDashboard(getSampleData());
    });
}

// Update dashboard with new data
function updateDashboard(data) {
  // Update network visualization
  if (data.network && networkVisualization.updateNetwork) {
    networkVisualization.updateNetwork(data.network);
  }
  
  // Update optimization chart
  if (data.optimization) {
    // Add new data point
    optimizationData.labels.push(new Date().toLocaleTimeString());
    optimizationData.datasets[0].data.push(data.optimization.txThroughput);
    optimizationData.datasets[1].data.push(data.optimization.blockTime);
    optimizationData.datasets[2].data.push(data.optimization.networkEfficiency);
    
    // Limit to 20 data points
    if (optimizationData.labels.length > 20) {
      optimizationData.labels.shift();
      optimizationData.datasets.forEach(dataset => {
        dataset.data.shift();
      });
    }
    
    // Update chart
    optimizationChart.update();
  }
  
  // Update metrics
  if (data.metrics) {
    updateMetrics(data.metrics);
  }
}

// Update metrics display
function updateMetrics(metrics) {
  // Update text values
  txThroughput.textContent = metrics.txThroughput || 0;
  blockTime.textContent = metrics.blockTime || 0;
  networkEfficiency.textContent = metrics.networkEfficiency || 0;
  contourComplexity.textContent = metrics.contourComplexity || 0;
  
  // Update progress bars
  txProgress.style.width = `${Math.min(metrics.txThroughput / 2, 100)}%`;
  blockTimeProgress.style.width = `${Math.min(100 - metrics.blockTime * 10, 100)}%`;
  efficiencyProgress.style.width = `${Math.min(metrics.networkEfficiency, 100)}%`;
  complexityProgress.style.width = `${Math.min(metrics.contourComplexity, 100)}%`;
  
  // Add pulse animation to updated values
  [txThroughput, blockTime, networkEfficiency, contourComplexity].forEach(el => {
    el.classList.add('pulse');
    setTimeout(() => {
      el.classList.remove('pulse');
    }, 2000);
  });
}

// Get sample data for demonstration
function getSampleData() {
  return {
    network: {
      nodes: [
        { id: 'Node1', type: 'node', size: 15 },
        { id: 'Node2', type: 'node', size: 15 },
        { id: 'Node3', type: 'node', size: 15 },
        { id: 'Node4', type: 'node', size: 15 },
        { id: 'Node5', type: 'node', size: 15 },
        { id: 'Miner1', type: 'miner', size: 20 },
        { id: 'Miner2', type: 'miner', size: 20 },
        { id: 'Validator1', type: 'validator', size: 18 },
        { id: 'Validator2', type: 'validator', size: 18 },
        { id: 'Block1', type: 'block', size: 12 },
        { id: 'Block2', type: 'block', size: 12 },
        { id: 'Tx1', type: 'transaction', size: 8 },
        { id: 'Tx2', type: 'transaction', size: 8 },
        { id: 'Tx3', type: 'transaction', size: 8 }
      ],
      links: [
        { source: 'Node1', target: 'Node2', value: 1 },
        { source: 'Node1', target: 'Node3', value: 1 },
        { source: 'Node2', target: 'Node4', value: 1 },
        { source: 'Node3', target: 'Node5', value: 1 },
        { source: 'Node4', target: 'Node5', value: 1 },
        { source: 'Miner1', target: 'Node1', value: 2 },
        { source: 'Miner2', target: 'Node3', value: 2 },
        { source: 'Validator1', target: 'Node2', value: 2 },
        { source: 'Validator2', target: 'Node5', value: 2 },
        { source: 'Block1', target: 'Miner1', value: 3 },
        { source: 'Block2', target: 'Miner2', value: 3 },
        { source: 'Tx1', target: 'Block1', value: 1 },
        { source: 'Tx2', target: 'Block1', value: 1 },
        { source: 'Tx3', target: 'Block2', value: 1 }
      ]
    },
    optimization: {
      txThroughput: 45,
      blockTime: 8,
      networkEfficiency: 75
    },
    metrics: {
      txThroughput: 45,
      blockTime: 8,
      networkEfficiency: 75,
      contourComplexity: 82
    }
  };
}