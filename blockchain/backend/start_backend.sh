#!/bin/bash
echo "Starting Kontour Coin Geometric Backend..."

# Activate virtual environment
source venv/bin/activate

# Start the FastAPI server
python -m uvicorn backend:app --host 0.0.0.0 --port 8000

# Deactivate virtual environment on exit
deactivate