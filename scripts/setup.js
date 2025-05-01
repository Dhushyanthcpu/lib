const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, type = 'info') {
  const color = type === 'success' ? colors.green 
    : type === 'warning' ? colors.yellow 
    : type === 'error' ? colors.red 
    : type === 'highlight' ? colors.blue
    : '';
  console.log(`${color}${message}${colors.reset}`);
}

// Function to check if a command exists
function commandExists(command) {
  try {
    if (process.platform === 'win32') {
      execSync(`where ${command}`);
    } else {
      execSync(`which ${command}`);
    }
    return true;
  } catch (e) {
    return false;
  }
}

// Function to create .env file if it doesn't exist
function createEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    const envContent = `# Server Configuration
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
    fs.writeFileSync(envPath, envContent);
    log('Created .env file with default configuration', 'success');
  } else {
    log('Using existing .env file', 'info');
  }
}

// Function to create public/locales directory if it doesn't exist
function createLocalesDirectories() {
  const localesPath = path.join(__dirname, '..', 'public', 'locales');
  
  if (!fs.existsSync(localesPath)) {
    fs.mkdirSync(localesPath, { recursive: true });
    log('Created locales directory', 'success');
    
    // Create language subdirectories
    const languages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi', 'tr', 'nl', 'sv'];
    
    languages.forEach(lang => {
      const langPath = path.join(localesPath, lang);
      if (!fs.existsSync(langPath)) {
        fs.mkdirSync(langPath, { recursive: true });
      }
    });
    
    log(`Created directories for ${languages.length} languages`, 'success');
  }
}

// Function to check MongoDB
function checkMongoDB() {
  try {
    if (process.platform === 'win32') {
      execSync('mongod --version', { stdio: 'pipe' });
    } else {
      execSync('mongod --version', { stdio: 'pipe' });
    }
    log('MongoDB is installed', 'success');
    return true;
  } catch (e) {
    log('MongoDB is not installed or not in PATH. Some features may not work correctly.', 'warning');
    log('Install MongoDB from https://www.mongodb.com/try/download/community', 'info');
    return false;
  }
}

// Function to check Node.js version
function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0], 10);
  
  log(`Node.js version: ${nodeVersion}`, 'info');
  
  if (majorVersion < 14) {
    log('Node.js version 14 or higher is recommended for this project', 'warning');
  } else {
    log('Node.js version is compatible', 'success');
  }
}

// Function to install dependencies
function installDependencies() {
  log('Installing main project dependencies...', 'highlight');
  execSync('npm install', { stdio: 'inherit' });
  
  // Check if blockchain directory has package.json
  const blockchainPackageJson = path.join(__dirname, '..', 'blockchain', 'package.json');
  if (fs.existsSync(blockchainPackageJson)) {
    log('Installing blockchain dependencies...', 'highlight');
    execSync('cd blockchain && npm install', { stdio: 'inherit' });
  }
  
  // Check if quantum-blockchain directory has package.json
  const quantumPackageJson = path.join(__dirname, '..', 'quantum-blockchain', 'package.json');
  if (fs.existsSync(quantumPackageJson)) {
    log('Installing quantum-blockchain dependencies...', 'highlight');
    execSync('cd quantum-blockchain && npm install', { stdio: 'inherit' });
  }
}

// Main setup function
async function setup() {
  log('\n=== Quantum Blockchain Project Setup ===', 'highlight');

  // Check Node.js version
  checkNodeVersion();

  // Check npm version
  const npmVersion = execSync('npm -v').toString().trim();
  log(`npm version: ${npmVersion}`, 'info');

  // Check MongoDB
  checkMongoDB();

  // Install dependencies
  installDependencies();

  // Create .env file
  createEnvFile();
  
  // Create locales directories
  createLocalesDirectories();

  log('\n=== Setup completed successfully! ===', 'success');
  log('\nTo start the development environment:', 'highlight');
  log('npm run dev:all', 'info');
  log('\nThis will start the Next.js frontend, Express backend, and blockchain services.', 'info');
}

// Run setup
setup().catch(error => {
  log(`Setup failed: ${error.message}`, 'error');
  process.exit(1);
}); 