const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Function to start a process
function startProcess(command, args, name, cwd = null) {
  const process = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, FORCE_COLOR: true },
    cwd: cwd
  });

  console.log(`Started ${name} process`);

  process.on('error', (error) => {
    console.error(`Error starting ${name}:`, error);
  });

  return process;
}

// Check if MongoDB is installed
function checkMongoDB() {
  try {
    const mongoCheck = spawn('mongod', ['--version'], {
      stdio: 'pipe',
      shell: true
    });
    
    mongoCheck.on('close', (code) => {
      if (code !== 0) {
        console.warn('\x1b[33m%s\x1b[0m', 'MongoDB is not installed or not in PATH. Some features may not work correctly.');
        console.warn('\x1b[33m%s\x1b[0m', 'Install MongoDB from https://www.mongodb.com/try/download/community');
      } else {
        console.log('\x1b[32m%s\x1b[0m', 'MongoDB detected');
      }
    });
  } catch (error) {
    console.warn('\x1b[33m%s\x1b[0m', 'Could not check for MongoDB. Some features may not work correctly.');
  }
}

// Start all servers
console.log('\x1b[36m%s\x1b[0m', '=== Starting Quantum Blockchain Development Environment ===');

// Check prerequisites
checkMongoDB();

// Create .env file if it doesn't exist
if (!fs.existsSync(path.join(__dirname, '..', '.env'))) {
  console.log('Creating .env file with default values...');
  const envContent = `
# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Secret
JWT_SECRET=quantum-secret-key

# Blockchain Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
ETHEREUM_RPC_URL=https://rpc.ankr.com/eth

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/quantum-blockchain
`;
  fs.writeFileSync(path.join(__dirname, '..', '.env'), envContent.trim());
  console.log('\x1b[32m%s\x1b[0m', '.env file created successfully');
}

// Start Next.js frontend
const frontend = startProcess('npm', ['run', 'dev'], 'Frontend');

// Start Express backend
const backend = startProcess('npm', ['run', 'server'], 'Backend');

// Start Blockchain server
const blockchain = startProcess('npm', ['run', 'blockchain:start'], 'Blockchain');

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\x1b[36m%s\x1b[0m', 'Shutting down servers...');
  frontend.kill();
  backend.kill();
  blockchain.kill();
  process.exit();
}); 