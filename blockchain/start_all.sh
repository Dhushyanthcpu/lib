#!/bin/bash
echo "Starting Kontour Coin Fullstack System..."

# Start Python backend in background
cd backend
./start_backend.sh &
PYTHON_PID=$!
cd ..

# Start Java backend in background
cd java
./start_java_backend.sh &
JAVA_PID=$!
cd ..

# Wait for backends to start
echo "Waiting for backends to start..."
sleep 30

# Start workflow in background
cd workflow
./start_workflow.sh &
WORKFLOW_PID=$!
cd ..

# Start Web3 server in background
cd web3
./start_web3_server.sh &
WEB3_PID=$!
cd ..

echo "All components started. Press Ctrl+C to stop all components."
echo "Python PID: $PYTHON_PID"
echo "Java PID: $JAVA_PID"
echo "Workflow PID: $WORKFLOW_PID"
echo "Web3 PID: $WEB3_PID"

# Wait for user interrupt
trap "kill $PYTHON_PID $JAVA_PID $WORKFLOW_PID $WEB3_PID; exit" INT
wait