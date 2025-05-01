/**
 * Kontour Coin Development Dashboard
 * Real-time monitoring of blockchain components
 */

const express = require('express');
const axios = require('axios');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
require('dotenv').config();

// Configuration
const config = {
  port: process.env.DASHBOARD_PORT || 3030,
  pythonBackendUrl: process.env.PYTHON_BACKEND_URL || 'http://localhost:8000',
  javaBackendUrl: process.env.JAVA_BACKEND_URL || 'http://localhost:8080/kontourcoin/api/v1',
  web3ServerUrl: process.env.WEB3_SERVER_URL || 'http://localhost:3001',
  updateInterval: 5000 // 5 seconds
};

// Create Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Main dashboard page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// API endpoints
app.get('/api/status', async (req, res) => {
  try {
    const [pythonStatus, javaStatus, web3Status] = await Promise.allSettled([
      axios.get(`${config.pythonBackendUrl}/stats`),
      axios.get(`${config.javaBackendUrl}/stats`),
      axios.get(`${config.web3ServerUrl}`)
    ]);
    
    res.json({
      python: pythonStatus.status === 'fulfilled' ? pythonStatus.value.data : null,
      java: javaStatus.status === 'fulfilled' ? javaStatus.value.data : null,
      web3: web3Status.status === 'fulfilled' ? web3Status.value.data : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/blockchain', async (req, res) => {
  try {
    const response = await axios.get(`${config.javaBackendUrl}/blockchain`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/blocks', async (req, res) => {
  try {
    const response = await axios.get(`${config.javaBackendUrl}/blocks`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected');
  
  // Send initial data
  updateDashboard(socket);
  
  // Set up interval for updates
  const interval = setInterval(() => {
    updateDashboard(socket);
  }, config.updateInterval);
  
  // Clean up on disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });
});

// Update dashboard data
async function updateDashboard(socket) {
  try {
    // Get status of all services
    const [pythonStatus, javaStatus, web3Status] = await Promise.allSettled([
      axios.get(`${config.pythonBackendUrl}/stats`),
      axios.get(`${config.javaBackendUrl}/stats`),
      axios.get(`${config.web3ServerUrl}`)
    ]);
    
    // Get blockchain data
    const blockchain = await axios.get(`${config.javaBackendUrl}/blockchain`)
      .then(res => res.data)
      .catch(() => null);
    
    // Get latest blocks
    const blocks = await axios.get(`${config.javaBackendUrl}/blocks`)
      .then(res => res.data)
      .catch(() => []);
    
    // Send data to client
    socket.emit('dashboard-update', {
      timestamp: new Date().toISOString(),
      services: {
        python: pythonStatus.status === 'fulfilled' ? pythonStatus.value.data : null,
        java: javaStatus.status === 'fulfilled' ? javaStatus.value.data : null,
        web3: web3Status.status === 'fulfilled' ? web3Status.value.data : null
      },
      blockchain,
      blocks: blocks.slice(0, 10) // Only send the 10 most recent blocks
    });
  } catch (error) {
    console.error('Error updating dashboard:', error.message);
  }
}

// Start server
server.listen(config.port, () => {
  console.log(`Dashboard running at http://localhost:${config.port}`);
});/**
 * Kontour Coin Development Dashboard
 * Real-time monitoring of blockchain components
 */

const express = require('express');
const axios = require('axios');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
require('dotenv').config();

// Configuration
const config = {
  port: process.env.DASHBOARD_PORT || 3030,
  pythonBackendUrl: process.env.PYTHON_BACKEND_URL || 'http://localhost:8000',
  javaBackendUrl: process.env.JAVA_BACKEND_URL || 'http://localhost:8080/kontourcoin/api/v1',
  web3ServerUrl: process.env.WEB3_SERVER_URL || 'http://localhost:3001',
  updateInterval: 5000 // 5 seconds
};

// Create Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Main dashboard page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// API endpoints
app.get('/api/status', async (req, res) => {
  try {
    const [pythonStatus, javaStatus, web3Status] = await Promise.allSettled([
      axios.get(`${config.pythonBackendUrl}/stats`),
      axios.get(`${config.javaBackendUrl}/stats`),
      axios.get(`${config.web3ServerUrl}`)
    ]);
    
    res.json({
      python: pythonStatus.status === 'fulfilled' ? pythonStatus.value.data : null,
      java: javaStatus.status === 'fulfilled' ? javaStatus.value.data : null,
      web3: web3Status.status === 'fulfilled' ? web3Status.value.data : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/blockchain', async (req, res) => {
  try {
    const response = await axios.get(`${config.javaBackendUrl}/blockchain`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/blocks', async (req, res) => {
  try {
    const response = await axios.get(`${config.javaBackendUrl}/blocks`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected');
  
  // Send initial data
  updateDashboard(socket);
  
  // Set up interval for updates
  const interval = setInterval(() => {
    updateDashboard(socket);
  }, config.updateInterval);
  
  // Clean up on disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });
});

// Update dashboard data
async function updateDashboard(socket) {
  try {
    // Get status of all services
    const [pythonStatus, javaStatus, web3Status] = await Promise.allSettled([
      axios.get(`${config.pythonBackendUrl}/stats`),
      axios.get(`${config.javaBackendUrl}/stats`),
      axios.get(`${config.web3ServerUrl}`)
    ]);
    
    // Get blockchain data
    const blockchain = await axios.get(`${config.javaBackendUrl}/blockchain`)
      .then(res => res.data)
      .catch(() => null);
    
    // Get latest blocks
    const blocks = await axios.get(`${config.javaBackendUrl}/blocks`)
      .then(res => res.data)
      .catch(() => []);
    
    // Send data to client
    socket.emit('dashboard-update', {
      timestamp: new Date().toISOString(),
      services: {
        python: pythonStatus.status === 'fulfilled' ? pythonStatus.value.data : null,
        java: javaStatus.status === 'fulfilled' ? javaStatus.value.data : null,
        web3: web3Status.status === 'fulfilled' ? web3Status.value.data : null
      },
      blockchain,
      blocks: blocks.slice(0, 10) // Only send the 10 most recent blocks
    });
  } catch (error) {
    console.error('Error updating dashboard:', error.message);
  }
}

// Start server
server.listen(config.port, () => {
  console.log(`Dashboard running at http://localhost:${config.port}`);
});