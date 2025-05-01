#!/bin/bash

# Start Advanced Kontour Coin Features
echo "Starting Advanced Kontour Coin Features..."

# Function to check if a directory exists
check_dir() {
  if [ ! -d "$1" ]; then
    echo "Error: Directory $1 does not exist."
    exit 1
  fi
}

# Function to check if a file exists
check_file() {
  if [ ! -f "$1" ]; then
    echo "Error: File $1 does not exist."
    exit 1
  fi
}

# Check directories
check_dir "quantum-resistant"
check_dir "consensus"
check_dir "bridge"
check_dir "web3"
check_dir "dev/dashboard"

# Start Quantum-Resistant Cryptography Service
echo "Starting Quantum-Resistant Cryptography Service..."
cd quantum-resistant
npm run start:quantum &
QUANTUM_PID=$!
cd ..
echo "Quantum-Resistant Cryptography Service started with PID: $QUANTUM_PID"

# Start Proof-of-Contour Consensus Service
echo "Starting Proof-of-Contour Consensus Service..."
cd consensus
npm run start:consensus &
CONSENSUS_PID=$!
cd ..
echo "Proof-of-Contour Consensus Service started with PID: $CONSENSUS_PID"

# Start Cross-Chain Bridge Service
echo "Starting Cross-Chain Bridge Service..."
cd bridge
npm run start:bridge &
BRIDGE_PID=$!
cd ..
echo "Cross-Chain Bridge Service started with PID: $BRIDGE_PID"

# Start Web3 API Server
echo "Starting Web3 API Server..."
cd web3
./start_web3_server.sh &
WEB3_PID=$!
cd ..
echo "Web3 API Server started with PID: $WEB3_PID"

# Start Dashboard
echo "Starting Dashboard..."
cd dev/dashboard
npm run start:dashboard &
DASHBOARD_PID=$!
cd ../..
echo "Dashboard started with PID: $DASHBOARD_PID"

# Start AI Analytics Service
echo "Starting AI Analytics Service..."
cd ai
npm run start:ai &
AI_PID=$!
cd ..
echo "AI Analytics Service started with PID: $AI_PID"

# Register PIDs for cleanup
echo "$QUANTUM_PID $CONSENSUS_PID $BRIDGE_PID $WEB3_PID $DASHBOARD_PID $AI_PID" > .advanced_pids

echo "All advanced features started successfully!"
echo "Dashboard available at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to press Ctrl+C
trap "echo 'Stopping all services...'; kill $(cat .advanced_pids); rm .advanced_pids; echo 'All services stopped.'; exit 0" INT
wait