# Kontour Coin Developer Tools

This directory contains tools and utilities for Kontour Coin blockchain development.

## Features

- **CLI Tool**: Command-line interface for common development tasks
- **Dashboard**: Real-time monitoring of blockchain components
- **Docker Integration**: Containerized development environment
- **Testing Framework**: Jest-based testing setup
- **Linting**: ESLint configuration for code quality

## Getting Started

### Prerequisites

- Node.js 14+
- npm or yarn
- Docker and Docker Compose (optional, for containerized development)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

Create a `.env` file with the following content:

```
PYTHON_BACKEND_URL=http://localhost:8000
JAVA_BACKEND_URL=http://localhost:8080/kontourcoin/api/v1
WEB3_SERVER_URL=http://localhost:3001
DASHBOARD_PORT=3030
```

### CLI Usage

The CLI tool provides commands for common development tasks:

```bash
# Start all services
node index.js start

# Start only specific services
node index.js start --python-only
node index.js start --java-only
node index.js start --web3-only
node index.js start --workflow-only

# Check service status
node index.js status

# Create a new transaction
node index.js create-transaction

# Mine a new block
node index.js mine-block

# Generate test data
node index.js generate-test-data --transactions 10 --blocks 3

# Set up development environment
node index.js setup
```

### Dashboard

The dashboard provides real-time monitoring of blockchain components:

```bash
# Start the dashboard
node dashboard.js
```

Then open your browser at http://localhost:3030

### Docker

For containerized development:

```bash
# Build containers
docker-compose build

# Start all services
docker-compose up

# Start specific services
docker-compose up python-backend java-backend

# Stop all services
docker-compose down
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Linting

```bash
# Check code quality
npm run lint

# Fix linting issues
npm run lint:fix
```

## Project Structure

- `index.js`: CLI tool entry point
- `dashboard.js`: Dashboard server
- `public/`: Dashboard frontend
- `__tests__/`: Test files
- `.eslintrc.js`: ESLint configuration
- `jest.config.js`: Jest configuration
- `webpack.config.js`: Webpack configuration
- `Dockerfile`: Docker configuration for development tools

## License

MIT# Kontour Coin Developer Tools

This directory contains tools and utilities for Kontour Coin blockchain development.

## Features

- **CLI Tool**: Command-line interface for common development tasks
- **Dashboard**: Real-time monitoring of blockchain components
- **Docker Integration**: Containerized development environment
- **Testing Framework**: Jest-based testing setup
- **Linting**: ESLint configuration for code quality

## Getting Started

### Prerequisites

- Node.js 14+
- npm or yarn
- Docker and Docker Compose (optional, for containerized development)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

Create a `.env` file with the following content:

```
PYTHON_BACKEND_URL=http://localhost:8000
JAVA_BACKEND_URL=http://localhost:8080/kontourcoin/api/v1
WEB3_SERVER_URL=http://localhost:3001
DASHBOARD_PORT=3030
```

### CLI Usage

The CLI tool provides commands for common development tasks:

```bash
# Start all services
node index.js start

# Start only specific services
node index.js start --python-only
node index.js start --java-only
node index.js start --web3-only
node index.js start --workflow-only

# Check service status
node index.js status

# Create a new transaction
node index.js create-transaction

# Mine a new block
node index.js mine-block

# Generate test data
node index.js generate-test-data --transactions 10 --blocks 3

# Set up development environment
node index.js setup
```

### Dashboard

The dashboard provides real-time monitoring of blockchain components:

```bash
# Start the dashboard
node dashboard.js
```

Then open your browser at http://localhost:3030

### Docker

For containerized development:

```bash
# Build containers
docker-compose build

# Start all services
docker-compose up

# Start specific services
docker-compose up python-backend java-backend

# Stop all services
docker-compose down
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Linting

```bash
# Check code quality
npm run lint

# Fix linting issues
npm run lint:fix
```

## Project Structure

- `index.js`: CLI tool entry point
- `dashboard.js`: Dashboard server
- `public/`: Dashboard frontend
- `__tests__/`: Test files
- `.eslintrc.js`: ESLint configuration
- `jest.config.js`: Jest configuration
- `webpack.config.js`: Webpack configuration
- `Dockerfile`: Docker configuration for development tools

## License

MIT