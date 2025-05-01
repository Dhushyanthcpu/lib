@echo off
echo Starting Kontour Coin Geometric Backend...

:: Activate virtual environment
call venv\Scripts\activate.bat

:: Start the FastAPI server
python -m uvicorn backend:app --host 0.0.0.0 --port 8000

:: Deactivate virtual environment on exit
call venv\Scripts\deactivate.bat