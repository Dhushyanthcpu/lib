/**
 * Kontour Coin Developer Dashboard
 * Client-side JavaScript
 */

// Connect to Socket.IO server
const socket = io();

// DOM elements
const lastUpdateEl = document.getElementById('last-update');
const refreshBtn = document.getElementById('refresh-btn');
const pythonStatusEl = document.getElementById('python-status');
const javaStatusEl = document.getElementById('java-status');
const web3StatusEl = document.getElementById('web3-status');
const chainLengthEl = document.getElementById('chain-length');
const difficultyEl = document.getElementById('difficulty');
const pendingTxEl = document.getElementById('pending-tx');
const processedTxEl = document.getElementById('processed-tx');
const minComplexityEl = document.getElementById('min-complexity');
const blockRewardEl = document.getElementById('block-reward');
const blocksTableBodyEl = document.getElementById('blocks-table-body');
const blockDetailsEl = document.getElementById('block-details');
const modalBlockDetailsEl = document.getElementById('modal-block-details');

// Bootstrap modal
let blockDetailModal;

// Current blocks data
let blocksData = [];

// Initialize dashboard
function initDashboard() {
  // Initialize Bootstrap modal
  blockDetailModal = new bootstrap.Modal(document.getElementById('blockDetailModal'));
  
  // Set up event listeners
  refreshBtn.addEventListener('click', requestUpdate);
  
  // Request initial update
  requestUpdate();
}

// Request dashboard update
function requestUpdate() {
  socket.emit('request-update');
}

// Update dashboard with new data
function updateDashboard(data) {
  // Update last update timestamp
  const timestamp = new Date(data.timestamp);
  lastUpdateEl.textContent = `Last update: ${timestamp.toLocaleTimeString()}`;
  
  // Update service status
  updateServiceStatus('python', data.services.python);
  updateServiceStatus('java', data.services.java);
  updateServiceStatus('web3', data.services.web3);
  
  // Update blockchain stats
  if (data.blockchain) {
    chainLengthEl.textContent = data.blockchain.chainLength || '-';
    difficultyEl.textContent = data.blockchain.difficulty || '-';
    minComplexityEl.textContent = data.blockchain.minContourComplexity?.toFixed(2) || '-';
    blockRewardEl.textContent = data.blockchain.blockReward || '-';
  }
  
  // Update transaction stats
  if (data.services.java) {
    pendingTxEl.textContent = data.services.java.pendingTransactions || '-';
    processedTxEl.textContent = data.services.java.processedTransactions || '-';
  }
  
  // Update blocks table
  if (data.blocks && data.blocks.length > 0) {
    blocksData = data.blocks;
    updateBlocksTable(data.blocks);
  }
}

// Update service status
function updateServiceStatus(service, data) {
  const statusEl = document.getElementById(`${service}-status`);
  const badgeEl = statusEl.querySelector('.badge');
  const progressBarEl = statusEl.querySelector('.progress-bar');
  
  if (data) {
    // Service is online
    badgeEl.className = 'badge badge-online';
    badgeEl.textContent = 'Online';
    progressBarEl.className = 'progress-bar bg-success';
    progressBarEl.style.width = '100%';
    
    // Add service-specific stats
    if (service === 'python' && data.geometric_operations) {
      progressBarEl.textContent = `${data.geometric_operations} ops`;
    } else if (service === 'java' && data.blockchainLength) {
      progressBarEl.textContent = `${data.blockchainLength} blocks`;
    } else if (service === 'web3' && data.version) {
      progressBarEl.textContent = `v${data.version}`;
    }
  } else {
    // Service is offline
    badgeEl.className = 'badge badge-offline';
    badgeEl.textContent = 'Offline';
    progressBarEl.className = 'progress-bar bg-danger';
    progressBarEl.style.width = '100%';
    progressBarEl.textContent = '';
  }
}

// Update blocks table
function updateBlocksTable(blocks) {
  let html = '';
  
  blocks.forEach(block => {
    const timestamp = new Date(block.timestamp).toLocaleString();
    const shortHash = block.hash.substring(0, 10) + '...';
    const shortMiner = block.minerAddress.substring(0, 10) + '...';
    
    html += `
      <tr class="block-row" data-index="${block.index}">
        <td>${block.index}</td>
        <td>${timestamp}</td>
        <td class="hash-cell" title="${block.hash}">${shortHash}</td>
        <td title="${block.minerAddress}">${shortMiner}</td>
        <td>${block.contourComplexity?.toFixed(2) || '-'}</td>
      </tr>
    `;
  });
  
  blocksTableBodyEl.innerHTML = html;
  
  // Add click event listeners to block rows
  document.querySelectorAll('.block-row').forEach(row => {
    row.addEventListener('click', () => {
      const blockIndex = parseInt(row.getAttribute('data-index'), 10);
      showBlockDetails(blockIndex);
    });
  });
}

// Show block details
function showBlockDetails(blockIndex) {
  const block = blocksData.find(b => b.index === blockIndex);
  
  if (!block) {
    return;
  }
  
  const timestamp = new Date(block.timestamp).toLocaleString();
  
  const detailsHtml = `
    <div class="row">
      <div class="col-md-6">
        <div class="detail-item">
          <h6>Index</h6>
          <p>${block.index}</p>
        </div>
      </div>
      <div class="col-md-6">
        <div class="detail-item">
          <h6>Timestamp</h6>
          <p>${timestamp}</p>
        </div>
      </div>
      <div class="col-12">
        <div class="detail-item">
          <h6>Hash</h6>
          <p>${block.hash}</p>
        </div>
      </div>
      <div class="col-12">
        <div class="detail-item">
          <h6>Previous Hash</h6>
          <p>${block.previousHash}</p>
        </div>
      </div>
      <div class="col-12">
        <div class="detail-item">
          <h6>Miner Address</h6>
          <p>${block.minerAddress}</p>
        </div>
      </div>
      <div class="col-md-6">
        <div class="detail-item">
          <h6>Nonce</h6>
          <p>${block.nonce}</p>
        </div>
      </div>
      <div class="col-md-6">
        <div class="detail-item">
          <h6>Contour Complexity</h6>
          <p>${block.contourComplexity?.toFixed(2) || '-'}</p>
        </div>
      </div>
      <div class="col-12">
        <div class="detail-item">
          <h6>Data</h6>
          <p>${block.data}</p>
        </div>
      </div>
    </div>
  `;
  
  // Update both detail sections
  blockDetailsEl.innerHTML = detailsHtml;
  modalBlockDetailsEl.innerHTML = detailsHtml;
  
  // Show modal
  blockDetailModal.show();
}

// Socket.IO event handlers
socket.on('connect', () => {
  console.log('Connected to server');
  requestUpdate();
});

socket.on('dashboard-update', (data) => {
  updateDashboard(data);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);/**
 * Kontour Coin Developer Dashboard
 * Client-side JavaScript
 */

// Connect to Socket.IO server
const socket = io();

// DOM elements
const lastUpdateEl = document.getElementById('last-update');
const refreshBtn = document.getElementById('refresh-btn');
const pythonStatusEl = document.getElementById('python-status');
const javaStatusEl = document.getElementById('java-status');
const web3StatusEl = document.getElementById('web3-status');
const chainLengthEl = document.getElementById('chain-length');
const difficultyEl = document.getElementById('difficulty');
const pendingTxEl = document.getElementById('pending-tx');
const processedTxEl = document.getElementById('processed-tx');
const minComplexityEl = document.getElementById('min-complexity');
const blockRewardEl = document.getElementById('block-reward');
const blocksTableBodyEl = document.getElementById('blocks-table-body');
const blockDetailsEl = document.getElementById('block-details');
const modalBlockDetailsEl = document.getElementById('modal-block-details');

// Bootstrap modal
let blockDetailModal;

// Current blocks data
let blocksData = [];

// Initialize dashboard
function initDashboard() {
  // Initialize Bootstrap modal
  blockDetailModal = new bootstrap.Modal(document.getElementById('blockDetailModal'));
  
  // Set up event listeners
  refreshBtn.addEventListener('click', requestUpdate);
  
  // Request initial update
  requestUpdate();
}

// Request dashboard update
function requestUpdate() {
  socket.emit('request-update');
}

// Update dashboard with new data
function updateDashboard(data) {
  // Update last update timestamp
  const timestamp = new Date(data.timestamp);
  lastUpdateEl.textContent = `Last update: ${timestamp.toLocaleTimeString()}`;
  
  // Update service status
  updateServiceStatus('python', data.services.python);
  updateServiceStatus('java', data.services.java);
  updateServiceStatus('web3', data.services.web3);
  
  // Update blockchain stats
  if (data.blockchain) {
    chainLengthEl.textContent = data.blockchain.chainLength || '-';
    difficultyEl.textContent = data.blockchain.difficulty || '-';
    minComplexityEl.textContent = data.blockchain.minContourComplexity?.toFixed(2) || '-';
    blockRewardEl.textContent = data.blockchain.blockReward || '-';
  }
  
  // Update transaction stats
  if (data.services.java) {
    pendingTxEl.textContent = data.services.java.pendingTransactions || '-';
    processedTxEl.textContent = data.services.java.processedTransactions || '-';
  }
  
  // Update blocks table
  if (data.blocks && data.blocks.length > 0) {
    blocksData = data.blocks;
    updateBlocksTable(data.blocks);
  }
}

// Update service status
function updateServiceStatus(service, data) {
  const statusEl = document.getElementById(`${service}-status`);
  const badgeEl = statusEl.querySelector('.badge');
  const progressBarEl = statusEl.querySelector('.progress-bar');
  
  if (data) {
    // Service is online
    badgeEl.className = 'badge badge-online';
    badgeEl.textContent = 'Online';
    progressBarEl.className = 'progress-bar bg-success';
    progressBarEl.style.width = '100%';
    
    // Add service-specific stats
    if (service === 'python' && data.geometric_operations) {
      progressBarEl.textContent = `${data.geometric_operations} ops`;
    } else if (service === 'java' && data.blockchainLength) {
      progressBarEl.textContent = `${data.blockchainLength} blocks`;
    } else if (service === 'web3' && data.version) {
      progressBarEl.textContent = `v${data.version}`;
    }
  } else {
    // Service is offline
    badgeEl.className = 'badge badge-offline';
    badgeEl.textContent = 'Offline';
    progressBarEl.className = 'progress-bar bg-danger';
    progressBarEl.style.width = '100%';
    progressBarEl.textContent = '';
  }
}

// Update blocks table
function updateBlocksTable(blocks) {
  let html = '';
  
  blocks.forEach(block => {
    const timestamp = new Date(block.timestamp).toLocaleString();
    const shortHash = block.hash.substring(0, 10) + '...';
    const shortMiner = block.minerAddress.substring(0, 10) + '...';
    
    html += `
      <tr class="block-row" data-index="${block.index}">
        <td>${block.index}</td>
        <td>${timestamp}</td>
        <td class="hash-cell" title="${block.hash}">${shortHash}</td>
        <td title="${block.minerAddress}">${shortMiner}</td>
        <td>${block.contourComplexity?.toFixed(2) || '-'}</td>
      </tr>
    `;
  });
  
  blocksTableBodyEl.innerHTML = html;
  
  // Add click event listeners to block rows
  document.querySelectorAll('.block-row').forEach(row => {
    row.addEventListener('click', () => {
      const blockIndex = parseInt(row.getAttribute('data-index'), 10);
      showBlockDetails(blockIndex);
    });
  });
}

// Show block details
function showBlockDetails(blockIndex) {
  const block = blocksData.find(b => b.index === blockIndex);
  
  if (!block) {
    return;
  }
  
  const timestamp = new Date(block.timestamp).toLocaleString();
  
  const detailsHtml = `
    <div class="row">
      <div class="col-md-6">
        <div class="detail-item">
          <h6>Index</h6>
          <p>${block.index}</p>
        </div>
      </div>
      <div class="col-md-6">
        <div class="detail-item">
          <h6>Timestamp</h6>
          <p>${timestamp}</p>
        </div>
      </div>
      <div class="col-12">
        <div class="detail-item">
          <h6>Hash</h6>
          <p>${block.hash}</p>
        </div>
      </div>
      <div class="col-12">
        <div class="detail-item">
          <h6>Previous Hash</h6>
          <p>${block.previousHash}</p>
        </div>
      </div>
      <div class="col-12">
        <div class="detail-item">
          <h6>Miner Address</h6>
          <p>${block.minerAddress}</p>
        </div>
      </div>
      <div class="col-md-6">
        <div class="detail-item">
          <h6>Nonce</h6>
          <p>${block.nonce}</p>
        </div>
      </div>
      <div class="col-md-6">
        <div class="detail-item">
          <h6>Contour Complexity</h6>
          <p>${block.contourComplexity?.toFixed(2) || '-'}</p>
        </div>
      </div>
      <div class="col-12">
        <div class="detail-item">
          <h6>Data</h6>
          <p>${block.data}</p>
        </div>
      </div>
    </div>
  `;
  
  // Update both detail sections
  blockDetailsEl.innerHTML = detailsHtml;
  modalBlockDetailsEl.innerHTML = detailsHtml;
  
  // Show modal
  blockDetailModal.show();
}

// Socket.IO event handlers
socket.on('connect', () => {
  console.log('Connected to server');
  requestUpdate();
});

socket.on('dashboard-update', (data) => {
  updateDashboard(data);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);