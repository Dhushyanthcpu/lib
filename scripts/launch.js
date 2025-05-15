/**
 * Launch script for the Quantum Blockchain project
 * This script initializes and starts all necessary services
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Configuration
const config = {
  frontend: {
    path: path.join(__dirname, '../quantum-blockchain/frontend'),
    command: 'npm',
    args: ['run', 'dev'],
    name: 'Frontend'
  },
  backend: {
    path: path.join(__dirname, '../quantum-blockchain/backend'),
    command: os.platform() === 'win32' ? 'start_backend.bat' : './start_backend.sh',
    args: [],
    name: 'Backend'
  },
  blockchain: {
    path: path.join(__dirname, '../blockchain'),
    command: os.platform() === 'win32' ? 'start_all.bat' : './start_all.sh',
    args: [],
    name: 'Blockchain'
  }
};

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Print a formatted message to the console
 * @param {string} serviceName - Name of the service
 * @param {string} message - Message to print
 * @param {string} color - ANSI color code
 */
function log(serviceName, message, color = colors.reset) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${colors.dim}[${timestamp}]${colors.reset} ${color}[${serviceName}]${colors.reset} ${message}`);
}

/**
 * Launch a service
 * @param {Object} service - Service configuration
 */
function launchService(service) {
  log('Launcher', `Starting ${service.name}...`, colors.cyan);
  
  const isWindows = os.platform() === 'win32';
  let child;
  
  if (isWindows && !service.command.includes('npm')) {
    // For Windows batch files
    child = spawn('cmd.exe', ['/c', service.command, ...service.args], {
      cwd: service.path,
      shell: true,
      stdio: 'pipe'
    });
  } else if (!isWindows && !service.command.includes('npm')) {
    // For Unix shell scripts
    child = spawn(service.command, service.args, {
      cwd: service.path,
      shell: true,
      stdio: 'pipe'
    });
  } else {
    // For npm commands
    child = spawn(service.command, service.args, {
      cwd: service.path,
      shell: true,
      stdio: 'pipe'
    });
  }

  child.stdout.on('data', (data) => {
    data.toString().split('\n').forEach(line => {
      if (line.trim()) {
        log(service.name, line.trim(), colors.green);
      }
    });
  });

  child.stderr.on('data', (data) => {
    data.toString().split('\n').forEach(line => {
      if (line.trim()) {
        log(service.name, line.trim(), colors.red);
      }
    });
  });

  child.on('close', (code) => {
    if (code !== 0) {
      log(service.name, `Process exited with code ${code}`, colors.red);
    } else {
      log(service.name, 'Process completed successfully', colors.green);
    }
  });

  child.on('error', (err) => {
    log(service.name, `Failed to start: ${err.message}`, colors.red);
  });

  return child;
}

/**
 * Check if required dependencies are installed
 * @returns {Promise<boolean>} - True if all dependencies are installed
 */
async function checkDependencies() {
  log('Launcher', 'Checking dependencies...', colors.cyan);
  
  return new Promise((resolve) => {
    // Check if Node.js is installed
    exec('node --version', (error) => {
      if (error) {
        log('Launcher', 'Node.js is not installed or not in PATH', colors.red);
        resolve(false);
        return;
      }
      
      // Check if npm is installed
      exec('npm --version', (error) => {
        if (error) {
          log('Launcher', 'npm is not installed or not in PATH', colors.red);
          resolve(false);
          return;
        }
        
        // Check if Python is installed (for backend)
        exec('python --version', (error) => {
          if (error) {
            log('Launcher', 'Python is not installed or not in PATH (required for backend)', colors.yellow);
            // Continue anyway as Python might not be required for all components
          }
          
          resolve(true);
        });
      });
    });
  });
}

/**
 * Main function to start all services
 */
async function main() {
  console.log(`${colors.bright}${colors.cyan}=== Quantum Blockchain Launcher ===${colors.reset}`);
  
  // Check dependencies
  const dependenciesInstalled = await checkDependencies();
  if (!dependenciesInstalled) {
    log('Launcher', 'Please install required dependencies and try again', colors.red);
    process.exit(1);
  }
  
  // Launch services
  log('Launcher', 'Starting all services...', colors.cyan);
  
  // Start backend first
  const backendProcess = launchService(config.backend);
  
  // Wait a bit before starting frontend to allow backend to initialize
  setTimeout(() => {
    const frontendProcess = launchService(config.frontend);
    
    // Start blockchain services
    setTimeout(() => {
      const blockchainProcess = launchService(config.blockchain);
      
      // Handle process termination
      process.on('SIGINT', () => {
        log('Launcher', 'Shutting down all services...', colors.yellow);
        backendProcess.kill();
        frontendProcess.kill();
        blockchainProcess.kill();
        setTimeout(() => process.exit(0), 1000);
      });
    }, 3000);
  }, 3000);
  
  log('Launcher', 'All services started. Press Ctrl+C to stop.', colors.cyan);
}

// Run the main function
main().catch(error => {
  log('Launcher', `Error: ${error.message}`, colors.red);
  process.exit(1);
});