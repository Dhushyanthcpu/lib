#!/bin/bash
echo "Starting Kontour Coin Real-time Workflow..."

# Activate Python virtual environment
cd ..
source backend/venv/bin/activate

# Start the workflow
python workflow/realtime_workflow.py

# Deactivate virtual environment on exit
deactivate

