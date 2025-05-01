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
};

function log(message, type = 'info') {
  const color = type === 'success' ? colors.green 
    : type === 'warning' ? colors.yellow 
    : type === 'error' ? colors.red 
    : '';
  console.log(`${color}${message}${colors.reset}`);
}

async function main() {
  try {
    // Check Node.js version
    const nodeVersion = process.version;
    log(`Node.js version: ${nodeVersion}`);
    
    if (!nodeVersion.startsWith('v16') && !nodeVersion.startsWith('v18')) {
      throw new Error('Node.js v16 or v18 is required');
    }

    // Install dependencies
    log('Installing npm dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    // Check if Rust is installed
    try {
      execSync('rustc --version', { stdio: 'inherit' });
    } catch (error) {
      log('Rust is not installed. Please install Rust from https://rustup.rs/', 'warning');
      process.exit(1);
    }

    // Check if Solana CLI is installed
    try {
      execSync('solana --version', { stdio: 'inherit' });
    } catch (error) {
      log('Solana CLI is not installed. Please install it from https://docs.solana.com/cli/install-solana-cli-tools', 'warning');
      process.exit(1);
    }

    // Check if Anchor is installed
    try {
      execSync('anchor --version', { stdio: 'inherit' });
    } catch (error) {
      log('Installing Anchor CLI...');
      execSync('npm install -g @project-serum/anchor-cli', { stdio: 'inherit' });
    }

    // Create .env.local if it doesn't exist
    if (!fs.existsSync('.env.local')) {
      log('Creating .env.local file...');
      const envContent = `NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_PROGRAM_ID=11111111111111111111111111111111`;
      fs.writeFileSync('.env.local', envContent);
    }

    // Build Anchor program
    log('Building Anchor program...');
    execSync('anchor build', { stdio: 'inherit' });

    log('Setup completed successfully!', 'success');
    log('\nNext steps:', 'info');
    log('1. Start the development server: npm run dev');
    log('2. Start the Express server: npm run server');
    log('3. Open http://localhost:3000 in your browser');

  } catch (error) {
    log(`Error: ${error.message}`, 'error');
    process.exit(1);
  }
}

main(); 