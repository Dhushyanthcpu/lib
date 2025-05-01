@echo off
REM Start Advanced Kontour Coin Features
echo Starting Advanced Kontour Coin Features...

REM Check directories
if not exist "quantum-resistant" (
    echo Error: Directory quantum-resistant does not exist.
    exit /b 1
)
if not exist "consensus" (
    echo Error: Directory consensus does not exist.
    exit /b 1
)
if not exist "bridge" (
    echo Error: Directory bridge does not exist.
    exit /b 1
)
if not exist "web3" (
    echo Error: Directory web3 does not exist.
    exit /b 1
)
if not exist "dev\dashboard" (
    echo Error: Directory dev\dashboard does not exist.
    exit /b 1
)

REM Start Quantum-Resistant Cryptography Service
echo Starting Quantum-Resistant Cryptography Service...
start "Quantum-Resistant Cryptography" cmd /c "cd quantum-resistant && npm run start:quantum"

REM Start Proof-of-Contour Consensus Service
echo Starting Proof-of-Contour Consensus Service...
start "Proof-of-Contour Consensus" cmd /c "cd consensus && npm run start:consensus"

REM Start Cross-Chain Bridge Service
echo Starting Cross-Chain Bridge Service...
start "Cross-Chain Bridge" cmd /c "cd bridge && npm run start:bridge"

REM Start Web3 API Server
echo Starting Web3 API Server...
start "Web3 API Server" cmd /c "cd web3 && start_web3_server.bat"

REM Start Dashboard
echo Starting Dashboard...
start "Dashboard" cmd /c "cd dev\dashboard && npm run start:dashboard"

REM Start AI Analytics Service
echo Starting AI Analytics Service...
start "AI Analytics" cmd /c "cd ai && npm run start:ai"

echo All advanced features started successfully!
echo Dashboard available at: http://localhost:3000
echo.
echo Press Ctrl+C in each window to stop individual services
echo or close all command windows to stop all services.