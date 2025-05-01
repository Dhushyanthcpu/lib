#!/usr/bin/env node
/**
 * Kontour Coin Developer CLI
 * Command-line interface for Kontour Coin blockchain development
 */

require('dotenv').config();
const { program } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const ora = require('ora');
const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  pythonBackendUrl: process.env.PYTHON_BACKEND_URL || 'http://localhost:8000',
  javaBackendUrl: process.env.JAVA_BACKEND_URL || 'http://localhost:8080/kontourcoin/api/v1',
  web3ServerUrl: process.env.WEB3_SERVER_URL || 'http://localhost:3001',
  projectRoot: path.resolve(__dirname, '..')
};

// CLI version
program.version('1.0.0');

// Helper functions
const spinner = ora();

function startService(name, command, args, cwd) {
  spinner.start(`Starting ${name}...`);
  
  const child = spawn(command, args, {
    cwd: cwd || config.projectRoot,
    stdio: 'pipe',
    shell: true
  });
  
  child.stdout.on('data', (data) => {
    console.log(chalk.blue(`[${name}] `) + data.toString().trim());
  });
  
  child.stderr.on('data', (data) => {
    console.error(chalk.red(`[${name}] `) + data.toString().trim());
  });
  
  child.on('close', (code) => {
    if (code === 0) {
      spinner.succeed(`${name} exited successfully`);
    } else {
      spinner.fail(`${name} exited with code ${code}`);
    }
  });
  
  return child;
}

async function checkServiceStatus(name, url) {
  try {
    spinner.start(`Checking ${name} status...`);
    const response = await axios.get(url, { timeout: 5000 });
    spinner.succeed(`${name} is running`);
    return true;
  } catch (error) {
    spinner.fail(`${name} is not running`);
    return false;
  }
}

// Start all services
program
  .command('start')
  .description('Start all Kontour Coin services')
  .option('-p, --python-only', 'Start only Python backend')
  .option('-j, --java-only', 'Start only Java backend')
  .option('-w, --web3-only', 'Start only Web3 server')
  .option('-f, --workflow-only', 'Start only workflow')
  .action(async (options) => {
    console.log(chalk.green('Starting Kontour Coin services...'));
    
    const services = [];
    
    if (options.pythonOnly || (!options.javaOnly && !options.web3Only && !options.workflowOnly)) {
      services.push({
        name: 'Python Backend',
        command: process.platform === 'win32' ? 'start_backend.bat' : './start_backend.sh',
        cwd: path.join(config.projectRoot, 'backend')
      });
    }
    
    if (options.javaOnly || (!options.pythonOnly && !options.web3Only && !options.workflowOnly)) {
      services.push({
        name: 'Java Backend',
        command: process.platform === 'win32' ? 'start_java_backend.bat' : './start_java_backend.sh',
        cwd: path.join(config.projectRoot, 'java')
      });
    }
    
    if (options.web3Only || (!options.pythonOnly && !options.javaOnly && !options.workflowOnly)) {
      services.push({
        name: 'Web3 Server',
        command: process.platform === 'win32' ? 'start_web3_server.bat' : './start_web3_server.sh',
        cwd: path.join(config.projectRoot, 'web3')
      });
    }
    
    if (options.workflowOnly || (!options.pythonOnly && !options.javaOnly && !options.web3Only)) {
      services.push({
        name: 'Workflow',
        command: process.platform === 'win32' ? 'start_workflow.bat' : './start_workflow.sh',
        cwd: path.join(config.projectRoot, 'workflow')
      });
    }
    
    // Start services
    const processes = services.map(service => 
      startService(service.name, service.command, [], service.cwd)
    );
    
    // Handle process termination
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\nShutting down services...'));
      processes.forEach(proc => {
        if (!proc.killed) {
          proc.kill();
        }
      });
      process.exit(0);
    });
  });

// Check status of services
program
  .command('status')
  .description('Check status of Kontour Coin services')
  .action(async () => {
    console.log(chalk.green('Checking Kontour Coin services status...'));
    
    const pythonStatus = await checkServiceStatus('Python Backend', `${config.pythonBackendUrl}/stats`);
    const javaStatus = await checkServiceStatus('Java Backend', `${config.javaBackendUrl}/stats`);
    const web3Status = await checkServiceStatus('Web3 Server', config.web3ServerUrl);
    
    console.log('\nService Status Summary:');
    console.log(`Python Backend: ${pythonStatus ? chalk.green('Running') : chalk.red('Stopped')}`);
    console.log(`Java Backend: ${javaStatus ? chalk.green('Running') : chalk.red('Stopped')}`);
    console.log(`Web3 Server: ${web3Status ? chalk.green('Running') : chalk.red('Stopped')}`);
  });

// Create a new transaction
program
  .command('create-transaction')
  .description('Create a new transaction')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'fromAddress',
        message: 'From address:',
        default: '0x1234567890123456789012345678901234567890'
      },
      {
        type: 'input',
        name: 'toAddress',
        message: 'To address:',
        default: '0x0987654321098765432109876543210987654321'
      },
      {
        type: 'number',
        name: 'amount',
        message: 'Amount:',
        default: 1.0
      },
      {
        type: 'number',
        name: 'fee',
        message: 'Fee:',
        default: 0.01
      }
    ]);
    
    // Generate a dummy signature for testing
    const signature = Buffer.from('test-signature').toString('base64');
    
    const transaction = {
      fromAddress: answers.fromAddress,
      toAddress: answers.toAddress,
      amount: answers.amount,
      fee: answers.fee,
      timestamp: Date.now(),
      signature
    };
    
    spinner.start('Creating transaction...');
    
    try {
      const response = await axios.post(`${config.javaBackendUrl}/transactions`, transaction);
      spinner.succeed('Transaction created successfully');
      console.log(chalk.green('Transaction Hash:'), response.data.hash);
    } catch (error) {
      spinner.fail('Failed to create transaction');
      console.error(chalk.red('Error:'), error.response?.data?.error || error.message);
    }
  });

// Mine a block
program
  .command('mine-block')
  .description('Mine a new block')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'data',
        message: 'Block data:',
        default: 'Mined via developer CLI'
      },
      {
        type: 'input',
        name: 'minerAddress',
        message: 'Miner address:',
        default: '0x1234567890123456789012345678901234567890'
      }
    ]);
    
    // Generate dummy values for testing
    const blockData = {
      data: answers.data,
      nonce: Math.floor(Math.random() * 1000000),
      merkleRoot: Buffer.from('merkle-root').toString('base64'),
      contourHash: Buffer.from('contour-hash').toString('base64'),
      contourComplexity: 75.0,
      minerAddress: answers.minerAddress
    };
    
    spinner.start('Mining block...');
    
    try {
      const response = await axios.post(`${config.javaBackendUrl}/mine`, blockData);
      spinner.succeed('Block mined successfully');
      console.log(chalk.green('Block:'), response.data.block);
      console.log(chalk.green('Reward:'), response.data.reward);
    } catch (error) {
      spinner.fail('Failed to mine block');
      console.error(chalk.red('Error:'), error.response?.data?.error || error.message);
    }
  });

// Generate test data
program
  .command('generate-test-data')
  .description('Generate test data for development')
  .option('-t, --transactions <number>', 'Number of transactions to generate', '10')
  .option('-b, --blocks <number>', 'Number of blocks to mine', '3')
  .action(async (options) => {
    const numTransactions = parseInt(options.transactions, 10);
    const numBlocks = parseInt(options.blocks, 10);
    
    console.log(chalk.green(`Generating ${numTransactions} transactions and mining ${numBlocks} blocks...`));
    
    // Generate transactions
    spinner.start('Generating transactions...');
    
    const addresses = [
      '0x1234567890123456789012345678901234567890',
      '0x0987654321098765432109876543210987654321',
      '0x5555555555555555555555555555555555555555',
      '0x7777777777777777777777777777777777777777',
      '0x9999999999999999999999999999999999999999'
    ];
    
    for (let i = 0; i < numTransactions; i++) {
      const fromIndex = Math.floor(Math.random() * addresses.length);
      let toIndex = Math.floor(Math.random() * addresses.length);
      
      // Ensure from and to addresses are different
      while (toIndex === fromIndex) {
        toIndex = Math.floor(Math.random() * addresses.length);
      }
      
      const transaction = {
        fromAddress: addresses[fromIndex],
        toAddress: addresses[toIndex],
        amount: Math.random() * 10 + 0.1,
        fee: Math.random() * 0.1,
        timestamp: Date.now(),
        signature: Buffer.from(`test-signature-${i}`).toString('base64')
      };
      
      try {
        await axios.post(`${config.javaBackendUrl}/transactions`, transaction);
        spinner.text = `Generated transaction ${i + 1}/${numTransactions}`;
      } catch (error) {
        spinner.fail(`Failed to create transaction ${i + 1}`);
        console.error(chalk.red('Error:'), error.response?.data?.error || error.message);
      }
    }
    
    spinner.succeed(`Generated ${numTransactions} transactions`);
    
    // Mine blocks
    for (let i = 0; i < numBlocks; i++) {
      spinner.start(`Mining block ${i + 1}/${numBlocks}...`);
      
      const blockData = {
        data: `Test block ${i + 1}`,
        nonce: Math.floor(Math.random() * 1000000),
        merkleRoot: Buffer.from(`merkle-root-${i}`).toString('base64'),
        contourHash: Buffer.from(`contour-hash-${i}`).toString('base64'),
        contourComplexity: 75.0 + Math.random() * 25.0,
        minerAddress: addresses[Math.floor(Math.random() * addresses.length)]
      };
      
      try {
        await axios.post(`${config.javaBackendUrl}/mine`, blockData);
        spinner.succeed(`Mined block ${i + 1}/${numBlocks}`);
      } catch (error) {
        spinner.fail(`Failed to mine block ${i + 1}`);
        console.error(chalk.red('Error:'), error.response?.data?.error || error.message);
      }
    }
    
    console.log(chalk.green('Test data generation complete!'));
  });

// Setup development environment
program
  .command('setup')
  .description('Setup development environment')
  .action(async () => {
    console.log(chalk.green('Setting up Kontour Coin development environment...'));
    
    // Install dependencies
    spinner.start('Installing dependencies...');
    
    const directories = ['web3', 'dev', 'backend', 'workflow'];
    
    for (const dir of directories) {
      spinner.text = `Installing dependencies for ${dir}...`;
      
      try {
        await new Promise((resolve, reject) => {
          const npm = spawn(
            process.platform === 'win32' ? 'npm.cmd' : 'npm',
            ['install', '--no-optional'],
            { cwd: path.join(config.projectRoot, dir), stdio: 'pipe' }
          );
          
          npm.on('close', code => {
            if (code === 0) {
              resolve();
            } else {
              reject(new Error(`npm install failed with code ${code}`));
            }
          });
        });
      } catch (error) {
        spinner.fail(`Failed to install dependencies for ${dir}`);
        console.error(chalk.red('Error:'), error.message);
        return;
      }
    }
    
    spinner.succeed('Dependencies installed');
    
    // Create .env file if it doesn't exist
    const envPath = path.join(config.projectRoot, 'dev', '.env');
    
    if (!fs.existsSync(envPath)) {
      spinner.start('Creating .env file...');
      
      const envContent = `
PYTHON_BACKEND_URL=http://localhost:8000
JAVA_BACKEND_URL=http://localhost:8080/kontourcoin/api/v1
WEB3_SERVER_URL=http://localhost:3001
      `.trim();
      
      fs.writeFileSync(envPath, envContent);
      spinner.succeed('.env file created');
    }
    
    console.log(chalk.green('\nDevelopment environment setup complete!'));
    console.log(chalk.blue('\nNext steps:'));
    console.log('1. Run `node index.js start` to start all services');
    console.log('2. Run `node index.js status` to check service status');
    console.log('3. Run `node index.js generate-test-data` to generate test data');
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no command is provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

/**
 * Kontour Coin Debug Console
 * Interactive debugging tool for Kontour Coin blockchain
 */
const readline = require('readline');
const axios = require('axios');
const chalk = require('chalk');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  pythonBackendUrl: process.env.PYTHON_BACKEND_URL || 'http://localhost:8000',
  javaBackendUrl: process.env.JAVA_BACKEND_URL || 'http://localhost:8080/kontourcoin/api/v1',
  web3ServerUrl: process.env.WEB3_SERVER_URL || 'http://localhost:3001'
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'kontourcoin> '
});

// Service status tracking
const services = {
  python: { running: false, process: null },
  java: { running: false, process: null },
  web3: { running: false, process: null },
  workflow: { running: false, process: null }
};

// Helper function to check service status
async function checkService(name, url) {
  try {
    await axios.get(url);
    services[name].running = true;
    return true;
  } catch (error) {
    services[name].running = false;
    return false;
  }
}

// Start a service
function startService(name) {
  if (services[name].running) {
    console.log(chalk.yellow(`${name} service is already running`));
    return;
  }

  let command, args, cwd;
  
  switch(name) {
    case 'python':
      command = process.platform === 'win32' ? 'start_backend.bat' : './start_backend.sh';
      cwd = path.join(__dirname, 'backend');
      break;
    case 'java':
      command = process.platform === 'win32' ? 'start_java_backend.bat' : './start_java_backend.sh';
      cwd = path.join(__dirname, 'java');
      break;
    case 'web3':
      command = process.platform === 'win32' ? 'start_web3_server.bat' : './start_web3_server.sh';
      cwd = path.join(__dirname, 'web3');
      break;
    case 'workflow':
      command = process.platform === 'win32' ? 'start_workflow.bat' : './start_workflow.sh';
      cwd = path.join(__dirname, 'workflow');
      break;
  }

  console.log(chalk.blue(`Starting ${name} service...`));
  
  const child = spawn(command, args, {
    cwd: cwd,
    stdio: 'pipe',
    shell: true
  });
  
  services[name].process = child;
  
  child.stdout.on('data', (data) => {
    console.log(chalk.blue(`[${name}] `) + data.toString().trim());
  });
  
  child.stderr.on('data', (data) => {
    console.error(chalk.red(`[${name}] `) + data.toString().trim());
  });
  
  child.on('close', (code) => {
    console.log(chalk.yellow(`${name} service exited with code ${code}`));
    services[name].running = false;
    services[name].process = null;
  });
  
  services[name].running = true;
}

// Stop a service
function stopService(name) {
  if (!services[name].running || !services[name].process) {
    console.log(chalk.yellow(`${name} service is not running`));
    return;
  }
  
  console.log(chalk.blue(`Stopping ${name} service...`));
  services[name].process.kill();
}

// Check all services
async function checkAllServices() {
  console.log(chalk.blue('Checking services status...'));
  
  const pythonStatus = await checkService('python', `${config.pythonBackendUrl}/health`);
  const javaStatus = await checkService('java', `${config.javaBackendUrl}/health`);
  const web3Status = await checkService('web3', `${config.web3ServerUrl}/health`);
  
  console.log(chalk.blue('Services status:'));
  console.log(`Python Backend: ${pythonStatus ? chalk.green('Running') : chalk.red('Stopped')}`);
  console.log(`Java Backend: ${javaStatus ? chalk.green('Running') : chalk.red('Stopped')}`);
  console.log(`Web3 Server: ${web3Status ? chalk.green('Running') : chalk.red('Stopped')}`);
  console.log(`Workflow: ${services.workflow.running ? chalk.green('Running') : chalk.red('Stopped')}`);
}

// Display help
function showHelp() {
  console.log(chalk.green('\nKontour Coin Debug Console Commands:'));
  console.log('  help                - Show this help message');
  console.log('  status              - Check status of all services');
  console.log('  start <service>     - Start a service (python, java, web3, workflow, all)');
  console.log('  stop <service>      - Stop a service (python, java, web3, workflow, all)');
  console.log('  restart <service>   - Restart a service (python, java, web3, workflow, all)');
  console.log('  logs <service>      - Show logs for a service');
  console.log('  clear               - Clear the console');
  console.log('  exit                - Exit the debug console\n');
}

// Process commands
function processCommand(cmd) {
  const args = cmd.trim().split(' ');
  const command = args[0].toLowerCase();
  
  switch(command) {
    case 'help':
      showHelp();
      break;
    case 'status':
      checkAllServices();
      break;
    case 'start':
      if (args[1] === 'all') {
        startService('python');
        startService('java');
        setTimeout(() => {
          startService('workflow');
          startService('web3');
        }, 5000);
      } else if (['python', 'java', 'web3', 'workflow'].includes(args[1])) {
        startService(args[1]);
      } else {
        console.log(chalk.red('Invalid service. Use python, java, web3, workflow, or all'));
      }
      break;
    case 'stop':
      if (args[1] === 'all') {
        stopService('web3');
        stopService('workflow');
        stopService('java');
        stopService('python');
      } else if (['python', 'java', 'web3', 'workflow'].includes(args[1])) {
        stopService(args[1]);
      } else {
        console.log(chalk.red('Invalid service. Use python, java, web3, workflow, or all'));
      }
      break;
    case 'restart':
      if (args[1] === 'all') {
        stopService('web3');
        stopService('workflow');
        stopService('java');
        stopService('python');
        setTimeout(() => {
          startService('python');
          startService('java');
          setTimeout(() => {
            startService('workflow');
            startService('web3');
          }, 5000);
        }, 2000);
      } else if (['python', 'java', 'web3', 'workflow'].includes(args[1])) {
        stopService(args[1]);
        setTimeout(() => startService(args[1]), 2000);
      } else {
        console.log(chalk.red('Invalid service. Use python, java, web3, workflow, or all'));
      }
      break;
    case 'clear':
      console.clear();
      break;
    case 'exit':
      console.log(chalk.green('Exiting Kontour Coin Debug Console...'));
      stopService('web3');
      stopService('workflow');
      stopService('java');
      stopService('python');
      setTimeout(() => process.exit(0), 2000);
      break;
    default:
      console.log(chalk.red('Unknown command. Type "help" for available commands'));
  }
}

// Main function
function main() {
  console.clear();
  console.log(chalk.green('Kontour Coin Debug Console'));
  console.log(chalk.green('========================='));
  console.log('Type "help" for available commands\n');
  
  checkAllServices();
  
  rl.prompt();
  
  rl.on('line', (line) => {
    processCommand(line);
    rl.prompt();
  }).on('close', () => {
    console.log(chalk.green('Exiting Kontour Coin Debug Console...'));
    process.exit(0);
  });
}

// Start the console
main();
}
