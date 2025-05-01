#!/usr/bin/env node
/**
 * Dependency Update Script
 * Updates dependencies for all components of the Kontour Coin blockchain
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const ora = require('ora');
const chalk = require('chalk');

// Configuration
const projectRoot = path.resolve(__dirname, '..');
const components = [
  { name: 'Web3 Server', dir: 'web3', type: 'npm' },
  { name: 'Development Tools', dir: 'dev', type: 'npm' }
];

// Check if Python components have requirements.txt
if (fs.existsSync(path.join(projectRoot, 'backend', 'requirements.txt'))) {
  components.push({ name: 'Python Backend', dir: 'backend', type: 'pip' });
}

if (fs.existsSync(path.join(projectRoot, 'workflow', 'requirements.txt'))) {
  components.push({ name: 'Workflow', dir: 'workflow', type: 'pip' });
}

// Check if Java components have build.gradle or pom.xml
if (fs.existsSync(path.join(projectRoot, 'java', 'build.gradle'))) {
  components.push({ name: 'Java Backend', dir: 'java', type: 'gradle' });
} else if (fs.existsSync(path.join(projectRoot, 'java', 'pom.xml'))) {
  components.push({ name: 'Java Backend', dir: 'java', type: 'maven' });
}

// Update dependencies for a component
async function updateDependencies(component) {
  const spinner = ora(`Updating dependencies for ${component.name}...`).start();
  
  try {
    const componentPath = path.join(projectRoot, component.dir);
    
    if (component.type === 'npm') {
      // Update npm dependencies
      await runCommand('npm', ['update'], componentPath);
      
      // Check for outdated dependencies
      const outdated = await runCommand('npm', ['outdated'], componentPath, true);
      
      if (outdated.trim()) {
        spinner.warn(`${component.name} has outdated dependencies`);
        console.log(outdated);
      } else {
        spinner.succeed(`${component.name} dependencies are up to date`);
      }
    } else if (component.type === 'pip') {
      // Update pip dependencies
      await runCommand('pip', ['install', '--upgrade', '-r', 'requirements.txt'], componentPath);
      spinner.succeed(`${component.name} dependencies updated`);
    } else if (component.type === 'gradle') {
      // For Gradle, we just check for updates
      await runCommand('./gradlew', ['dependencyUpdates'], componentPath);
      spinner.succeed(`${component.name} dependencies checked`);
    } else if (component.type === 'maven') {
      // For Maven, we check for updates
      await runCommand('mvn', ['versions:display-dependency-updates'], componentPath);
      spinner.succeed(`${component.name} dependencies checked`);
    }
  } catch (error) {
    spinner.fail(`Failed to update dependencies for ${component.name}`);
    console.error(chalk.red(error.message));
  }
}

// Run a command and return its output
function runCommand(command, args, cwd, captureOutput = false) {
  return new Promise((resolve, reject) => {
    const cmd = spawn(
      process.platform === 'win32' && command !== './gradlew' ? `${command}.cmd` : command,
      args,
      { cwd, shell: true }
    );
    
    let output = '';
    
    if (captureOutput) {
      cmd.stdout.on('data', (data) => {
        output += data.toString();
      });
    } else {
      cmd.stdout.on('data', (data) => {
        process.stdout.write(chalk.blue(`[${command}] `) + data.toString());
      });
    }
    
    cmd.stderr.on('data', (data) => {
      process.stderr.write(chalk.red(`[${command}] `) + data.toString());
    });
    
    cmd.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

// Main function
async function main() {
  console.log(chalk.green('Updating dependencies for Kontour Coin components...'));
  
  for (const component of components) {
    await updateDependencies(component);
  }
  
  console.log(chalk.green('\nDependency update complete!'));
}

// Run the main function
main().catch((error) => {
  console.error(chalk.red('Error updating dependencies:'), error);
  process.exit(1);
});#!/usr/bin/env node
/**
 * Dependency Update Script
 * Updates dependencies for all components of the Kontour Coin blockchain
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const ora = require('ora');
const chalk = require('chalk');

// Configuration
const projectRoot = path.resolve(__dirname, '..');
const components = [
  { name: 'Web3 Server', dir: 'web3', type: 'npm' },
  { name: 'Development Tools', dir: 'dev', type: 'npm' }
];

// Check if Python components have requirements.txt
if (fs.existsSync(path.join(projectRoot, 'backend', 'requirements.txt'))) {
  components.push({ name: 'Python Backend', dir: 'backend', type: 'pip' });
}

if (fs.existsSync(path.join(projectRoot, 'workflow', 'requirements.txt'))) {
  components.push({ name: 'Workflow', dir: 'workflow', type: 'pip' });
}

// Check if Java components have build.gradle or pom.xml
if (fs.existsSync(path.join(projectRoot, 'java', 'build.gradle'))) {
  components.push({ name: 'Java Backend', dir: 'java', type: 'gradle' });
} else if (fs.existsSync(path.join(projectRoot, 'java', 'pom.xml'))) {
  components.push({ name: 'Java Backend', dir: 'java', type: 'maven' });
}

// Update dependencies for a component
async function updateDependencies(component) {
  const spinner = ora(`Updating dependencies for ${component.name}...`).start();
  
  try {
    const componentPath = path.join(projectRoot, component.dir);
    
    if (component.type === 'npm') {
      // Update npm dependencies
      await runCommand('npm', ['update'], componentPath);
      
      // Check for outdated dependencies
      const outdated = await runCommand('npm', ['outdated'], componentPath, true);
      
      if (outdated.trim()) {
        spinner.warn(`${component.name} has outdated dependencies`);
        console.log(outdated);
      } else {
        spinner.succeed(`${component.name} dependencies are up to date`);
      }
    } else if (component.type === 'pip') {
      // Update pip dependencies
      await runCommand('pip', ['install', '--upgrade', '-r', 'requirements.txt'], componentPath);
      spinner.succeed(`${component.name} dependencies updated`);
    } else if (component.type === 'gradle') {
      // For Gradle, we just check for updates
      await runCommand('./gradlew', ['dependencyUpdates'], componentPath);
      spinner.succeed(`${component.name} dependencies checked`);
    } else if (component.type === 'maven') {
      // For Maven, we check for updates
      await runCommand('mvn', ['versions:display-dependency-updates'], componentPath);
      spinner.succeed(`${component.name} dependencies checked`);
    }
  } catch (error) {
    spinner.fail(`Failed to update dependencies for ${component.name}`);
    console.error(chalk.red(error.message));
  }
}

// Run a command and return its output
function runCommand(command, args, cwd, captureOutput = false) {
  return new Promise((resolve, reject) => {
    const cmd = spawn(
      process.platform === 'win32' && command !== './gradlew' ? `${command}.cmd` : command,
      args,
      { cwd, shell: true }
    );
    
    let output = '';
    
    if (captureOutput) {
      cmd.stdout.on('data', (data) => {
        output += data.toString();
      });
    } else {
      cmd.stdout.on('data', (data) => {
        process.stdout.write(chalk.blue(`[${command}] `) + data.toString());
      });
    }
    
    cmd.stderr.on('data', (data) => {
      process.stderr.write(chalk.red(`[${command}] `) + data.toString());
    });
    
    cmd.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

// Main function
async function main() {
  console.log(chalk.green('Updating dependencies for Kontour Coin components...'));
  
  for (const component of components) {
    await updateDependencies(component);
  }
  
  console.log(chalk.green('\nDependency update complete!'));
}

// Run the main function
main().catch((error) => {
  console.error(chalk.red('Error updating dependencies:'), error);
  process.exit(1);
});