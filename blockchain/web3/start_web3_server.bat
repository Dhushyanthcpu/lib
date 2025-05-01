@echo off
echo Starting Kontour Coin Web3 Server with debugging enabled...

:: Install dependencies if needed
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

:: Start the server with debugging enabled
node --inspect server.js