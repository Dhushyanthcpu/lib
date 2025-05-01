# Quantum Blockchain PHP Backend

This is a Laravel-based RESTful API backend for the Quantum Blockchain project. It provides endpoints for blockchain operations, account management, transaction processing, mining, AI model training, and security analysis.

## Features

- RESTful API for blockchain operations
- Admin dashboard for monitoring and management
- MySQL database for data persistence
- Laravel framework for robust application structure
- Docker support for easy deployment

## API Endpoints

- `/blockchain/stats` - Get blockchain statistics
- `/blockchain/blocks` - Get blockchain blocks
- `/blockchain/pending-transactions` - Get pending transactions
- `/accounts/{address}/balance` - Get account balance
- `/accounts/create` - Create a new account
- `/transactions/create` - Create a new transaction
- `/mining/mine-block` - Mine a new block
- `/ai/train` - Train an AI model
- `/ai/predict` - Make predictions with an AI model
- `/optimization/optimize` - Optimize blockchain operations
- `/security/analyze` - Analyze blockchain security

## Setup Instructions

1. Clone the repository
2. Install dependencies: `composer install`
3. Set up environment variables: Copy `.env.example` to `.env` and configure
4. Run migrations: `php artisan migrate`
5. Start the server: `php artisan serve`

## Docker Setup

1. Build the Docker image: `docker build -t quantum-blockchain-php .`
2. Run the container: `docker run -p 8001:8001 quantum-blockchain-php`