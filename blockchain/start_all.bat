@echo off
echo Starting Kontour Coin Fullstack System...

:: Start Python backend in a new window
start cmd /k "cd backend && call start_backend.bat"

:: Start Java backend in a new window
start cmd /k "cd java && call start_java_backend.bat"

:: Wait for backends to start
echo Waiting for backends to start...
timeout /t 30

:: Start workflow in a new window
start cmd /k "cd workflow && call start_workflow.bat"

:: Start Web3 server in a new window
start cmd /k "cd web3 && call start_web3_server.bat"

echo All components started. Press any key to stop all components.
pause

:: Kill all processes
taskkill /f /im java.exe
taskkill /f /im python.exe
taskkill /f /im node.exe