/**
 * Kontour Coin Debug Console
 * 
 * A command-line interface for managing and monitoring the Kontour Coin blockchain services.
 * This console provides commands to start, stop, and check the status of various services.
 */

import * as readline from 'readline';
import axios from 'axios';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Service configuration
interface Service {
  name: string;
  process: ChildProcess | null;
  running: boolean;
  healthEndpoint: string;
}

const services: Record<string, Service> = {
  python: {
    name: 'Python Backend',
    process: null,
    running: false,
    healthEndpoint: 'http://localhost:8000/health'
  },
  java: {
    name: 'Java Backend',
    process: null,
    running: false,
    healthEndpoint: 'http://localhost:8080/kontourcoin/api/v1/health'
  },
  web3: {
    name: 'Web3 Server',
    process: null,
    running: false,
    healthEndpoint: 'http://localhost:3000/api/health'
  },
  workflow: {
    name: 'Workflow',
    process: null,
    running: false,
    healthEndpoint: 'http://localhost:8001/health'
  }
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'kontourcoin> '
});

// Check service status
async function checkService(name: string, url: string): Promise<boolean> {
  try {
    await axios.get(url, { timeout: 3000 });
    return true;
  } catch (error) {
    return false;
  }
}

// Check all services
async function checkAllServices(): Promise<void> {
  console.log('Checking services status...');
  
  const checks = Object.entries(services).map(async ([key, service]) => {
    service.running = await checkService(key, service.healthEndpoint);
  });
  
  await Promise.all(checks);
  
  console.log('Services status:');
  Object.values(services).forEach(service => {
    console.log(`${service.name}: ${service.running ? 'Running' : 'Stopped'}`);
  });
}

// Start a service
function startService(name: string): void {
  if (services[name].running) {
    console.log(`${name} service is already running`);
    return;
  }
  
  console.log(`Starting ${name} service...`);
  
  const isWindows = process.platform === 'win32';
  const scriptExt = isWindows ? '.bat' : '.sh';
  const command = isWindows ? 'cmd.exe' : 'bash';
  const args = isWindows ? ['/c', `start_${name}${scriptExt}`] : [`start_${name}${scriptExt}`];
  
  try {
    const rootDir = path.resolve(__dirname, '..');
    const cwd = path.join(rootDir, name);
    
    const child = spawn(command, args, {
      cwd: cwd,
      stdio: 'pipe',
      shell: true
    });
    
    services[name].process = child;
    
    child.stdout.on('data', (data) => {
      console.log(`[${name}] ${data.toString().trim()}`);
    });
    
    child.stderr.on('data', (data) => {
      console.error(`[${name}] ${data.toString().trim()}`);
    });
    
    child.on('close', (code) => {
      console.log(`${name} service exited with code ${code}`);
      services[name].running = false;
      services[name].process = null;
    });
    
    services[name].running = true;
  } catch (error) {
    console.error(`Failed to start ${name} service: ${error.message}`);
  }
}

// Stop a service
function stopService(name: string): void {
  if (!services[name].running || !services[name].process) {
    console.log(`${name} service is not running`);
    return;
  }
  
  console.log(`Stopping ${name} service...`);
  
  try {
    services[name].process?.kill();
    services[name].running = false;
    services[name].process = null;
    console.log(`${name} service stopped`);
  } catch (error) {
    console.error(`Failed to stop ${name} service: ${error.message}`);
  }
}

// Process commands
function processCommand(command: string): void {
  const parts = command.trim().split(' ');
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);
  
  switch (cmd) {
    case 'help':
      console.log('Available commands:');
      console.log('  status - Check the status of all services');
      console.log('  start [service|all] - Start a specific service or all services');
      console.log('  stop [service|all] - Stop a specific service or all services');
      console.log('  restart [service|all] - Restart a specific service or all services');
      console.log('  exit - Exit the debug console');
      break;
      
    case 'status':
      checkAllServices();
      break;
      
    case 'start':
      if (args.length === 0 || args[0] === 'all') {
        Object.keys(services).forEach(startService);
      } else if (services[args[0]]) {
        startService(args[0]);
      } else {
        console.log(`Unknown service: ${args[0]}`);
      }
      break;
      
    case 'stop':
      if (args.length === 0 || args[0] === 'all') {
        Object.keys(services).forEach(stopService);
      } else if (services[args[0]]) {
        stopService(args[0]);
      } else {
        console.log(`Unknown service: ${args[0]}`);
      }
      break;
      
    case 'restart':
      if (args.length === 0 || args[0] === 'all') {
        Object.keys(services).forEach(service => {
          stopService(service);
          setTimeout(() => startService(service), 1000);
        });
      } else if (services[args[0]]) {
        stopService(args[0]);
        setTimeout(() => startService(args[0]), 1000);
      } else {
        console.log(`Unknown service: ${args[0]}`);
      }
      break;
      
    case 'exit':
      console.log('Exiting Kontour Coin Debug Console...');
      Object.keys(services).forEach(stopService);
      rl.close();
      process.exit(0);
      break;
      
    default:
      console.log(`Unknown command: ${cmd}`);
      console.log('Type "help" for available commands');
  }
}

// Main function
function main(): void {
  console.clear();
  console.log('Kontour Coin Debug Console');
  console.log('=========================');
  console.log('Type "help" for available commands\n');
  
  checkAllServices();
  
  rl.prompt();
  
  rl.on('line', (line) => {
    processCommand(line);
    rl.prompt();
  }).on('close', () => {
    console.log('Exiting Kontour Coin Debug Console...');
    process.exit(0);
  });
}

// Start the console
}
