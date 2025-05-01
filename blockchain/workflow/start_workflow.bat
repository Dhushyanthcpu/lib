@echo off
echo Starting Kontour Coin Real-time Workflow...

:: Activate Python virtual environment
cd ..
call backend\venv\Scripts\activate.bat

:: Start the workflow
python workflow\realtime_workflow.py

:: Deactivate virtual environment on exit
call backend\venv\Scripts\deactivate.bat