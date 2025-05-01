# PowerShell script to download and install Node.js

# Define the Node.js version to install
$nodeVersion = "18.16.0"
$nodeUrl = "https://nodejs.org/dist/v$nodeVersion/node-v$nodeVersion-x64.msi"
$nodeInstallerPath = "$env:TEMP\node-installer.msi"

Write-Host "Downloading Node.js v$nodeVersion..."
Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeInstallerPath

Write-Host "Installing Node.js..."
Start-Process -FilePath "msiexec.exe" -ArgumentList "/i", $nodeInstallerPath, "/quiet", "/norestart" -Wait

# Refresh environment variables
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

Write-Host "Node.js installation completed."
Write-Host "Node.js version: $(node -v)"
Write-Host "npm version: $(npm -v)"

# Install project dependencies
Set-Location -Path "d:/lib/blockchain"
Write-Host "Installing project dependencies..."
npm install

Write-Host "Setup completed successfully."