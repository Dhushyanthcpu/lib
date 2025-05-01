#!/bin/bash

echo "Starting Quantum Blockchain System..."

# Start PHP Backend
cd php-backend
./start.sh &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start Frontend
cd ../frontend
npm install && npm run dev &
FRONTEND_PID=$!

echo "Quantum Blockchain System started successfully!"
echo "Backend: http://localhost:8001"
echo "Frontend: http://localhost:3000"
echo "Admin Dashboard: http://localhost:8001/admin"

# Wait for user to press Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait