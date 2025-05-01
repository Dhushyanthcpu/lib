@echo off
echo Starting Quantum Blockchain System...

REM Start PHP Backend
start cmd /k "cd php-backend && start.bat"

REM Wait for backend to start
timeout /t 5

REM Start Frontend
start cmd /k "cd frontend && npm install && npm run dev"

echo Quantum Blockchain System started successfully!
echo Backend: http://localhost:8001
echo Frontend: http://localhost:3000
echo Admin Dashboard: http://localhost:8001/admin