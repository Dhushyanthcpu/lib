#!/usr/bin/env node
/**
 * Kontour Coin Web3 Server
 * Main entry point for the Web3 API server
 */

const Web3ApiServer = require('./Web3ApiServer');
const config = require('./config');

// Handle command line arguments
const args = process.argv.slice(2);
const port = args.find(arg => arg.startsWith('--port='))?.split('=')[1];
const pythonUrl = args.find(arg => arg.startsWith('--python-url='))?.split('=')[1];
const javaUrl = args.find(arg => arg.startsWith('--java-url='))?.split('=')[1];

// Update config with command line arguments
if (port) {
  config.apiPort = parseInt(port);
}

if (pythonUrl) {
  config.pythonBackendUrl = pythonUrl;
}

if (javaUrl) {
  config.javaBackendUrl = javaUrl;
}

// Create and start the server
const server = new Web3ApiServer(config);

async function start() {
  try {
    await server.start();
    console.log(`Kontour Coin Web3 Server started on port ${config.apiPort}`);
    console.log(`Python Backend URL: ${config.pythonBackendUrl}`);
    console.log(`Java Backend URL: ${config.javaBackendUrl}`);
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down...');
  server.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down...');
  server.stop();
  process.exit(0);
});

// Start the server
start();