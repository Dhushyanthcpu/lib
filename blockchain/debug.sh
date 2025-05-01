#!/bin/bash
echo "Starting Kontour Coin Blockchain Debug Mode..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "Error: Node.js is not installed or not in PATH"
  exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install axios
fi

# Run the debug script
node debug.js

echo "Debug session ended."
