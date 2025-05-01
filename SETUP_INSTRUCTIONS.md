# Quantum Blockchain Project Setup Instructions

This document provides detailed instructions for setting up and running the Quantum Blockchain project.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js (v16+)** - [Download Node.js](https://nodejs.org/)
2. **npm (v7+)** - Comes with Node.js
3. **MongoDB (v4.4+)** - [Download MongoDB](https://www.mongodb.com/try/download/community)

## Step 1: Clone the Repository

If you haven't already, clone the repository to your local machine:

```bash
git clone <repository-url>
cd quantum-blockchain
```

## Step 2: Run the Setup Script

The setup script will install all dependencies and create necessary configuration files:

```bash
node scripts/setup.js
```

This script will:
- Install all dependencies for the main project, blockchain, and quantum components
- Create a `.env` file with default configuration
- Create directories for multilingual support
- Check for MongoDB installation

## Step 3: Start MongoDB

Ensure MongoDB is running on your system:

**Windows:**
```bash
# If installed as a service, it should be running automatically
# Otherwise, run:
"C:\Program Files\MongoDB\Server\4.4\bin\mongod.exe" --dbpath="C:\data\db"
```

**macOS/Linux:**
```bash
mongod --dbpath /data/db
```

## Step 4: Start the Development Environment

Start all services (frontend, backend, and blockchain) with a single command:

```bash
npm run dev:all
```

This will start:
- Next.js frontend on http://localhost:3000
- Express backend on http://localhost:3001
- Blockchain services

## Step 5: Access the Application

Open your browser and navigate to:
- Frontend: http://localhost:3000
- API documentation: http://localhost:3001/api/docs (if available)

## Troubleshooting

### MongoDB Connection Issues

If you encounter MongoDB connection issues:

1. Ensure MongoDB is running
2. Check the connection string in your `.env` file
3. Try connecting with MongoDB Compass to verify your installation

### Node.js Version Issues

If you encounter Node.js compatibility issues:

1. Check your Node.js version: `node -v`
2. Use nvm (Node Version Manager) to install the correct version if needed

### Port Conflicts

If ports 3000 or 3001 are already in use:

1. Change the ports in your `.env` file
2. For Next.js, use: `npm run dev -- -p <port>`
3. For Express, modify the PORT variable in the `.env` file

## Development Workflow

1. **Frontend Development**:
   - Edit files in `pages/` and `components/`
   - Changes will be hot-reloaded

2. **Backend Development**:
   - Edit files in `server/` and `pages/api/`
   - The server will restart automatically when changes are detected

3. **Blockchain Development**:
   - Edit files in `blockchain/`
   - You may need to restart the blockchain service: `npm run blockchain:start`

## Additional Commands

- `npm run build` - Build the Next.js application for production
- `npm run start` - Start the production Next.js server
- `npm run blockchain:build` - Build the blockchain components
- `npm run blockchain:test` - Run blockchain tests

## Environment Variables

The `.env` file contains important configuration. Here's what each variable does:

- `PORT` - The port for the Express backend
- `NODE_ENV` - The environment (development, production)
- `JWT_SECRET` - Secret key for JWT authentication
- `SOLANA_RPC_URL` - Solana RPC endpoint
- `ETHEREUM_RPC_URL` - Ethereum RPC endpoint
- `MONGODB_URI` - MongoDB connection string

## Step 6: Verify Installation

To verify that everything is set up correctly, run the test suite:

```bash
npm run test:all
```

This will run tests for the frontend, backend, and blockchain components. All tests should pass if the setup is correct.

If you encounter any failures, check the specific test output and refer to the troubleshooting section below.

## Updating the Project

To update the project to the latest version:

1. Pull the latest changes:
   ```bash
   git pull origin main
   ```

2. Install any new dependencies:
   ```bash
   npm install
   ```

3. Run the setup script again to ensure all components are up to date:
   ```bash
   node scripts/setup.js
   ```

4. Rebuild the project:
   ```bash
   npm run build
   ```

5. Verify the update:
   ```bash
   npm run test:all
   ```

### Troubleshooting Update Issues

- If you encounter merge conflicts during `git pull`, resolve them manually and commit the changes before proceeding.
- If `npm install` fails, try clearing the npm cache:
  ```bash
  npm cache clean --force
  ```
  Then run `npm install` again.
- If tests fail after updating, check the changelog for any breaking changes and update your code accordingly.

## Security Note

Remember to never commit your `.env` file or any private keys to version control. Always use environment variables for sensitive information in production environments.

For additional security measures:

1. Regularly update dependencies to patch known vulnerabilities:
   ```bash
   npm audit fix
   ```

2. Use a .gitignore file to prevent accidental commits of sensitive files.

3. Consider using a secrets management system for production environments.