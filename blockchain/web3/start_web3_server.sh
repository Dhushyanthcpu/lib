#!/bin/bash
echo "Starting Kontour Coin Web3 Server with debugging enabled..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the server with debugging enabled
node --inspect server.js