# Quantum Blockchain

A quantum-enhanced blockchain platform with AI integration and advanced security features.

## Features

- Quantum-enhanced blockchain operations
- AI model training and prediction
- Advanced security analysis
- Real-time transaction processing
- Modern UI with React and Tailwind CSS
- PHP Laravel backend with MySQL database
- RESTful API for blockchain operations
- Admin dashboard for monitoring and management

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PHP (v8.1 or higher)
- Composer
- MySQL

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd quantum-blockchain
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../php-backend
composer install
```

4. Configure the backend:
```bash
cp .env.example .env
php artisan key:generate
```

5. Set up the database:
```bash
# Update .env file with your database credentials
php artisan migrate
php artisan db:seed
```

## Running the Application

### Using the start scripts

1. Start the entire system (Windows):
```bash
start_all.bat
```

Or on Linux/Mac:
```bash
chmod +x start_all.sh
./start_all.sh
```

### Manual startup

1. Start the PHP backend:
```bash
cd php-backend
php artisan serve --port=8001
```

2. Start the frontend:
```bash
cd frontend
npm run dev
```

3. Access the application:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8001](http://localhost:8001)
   - Admin Dashboard: [http://localhost:8001/admin](http://localhost:8001/admin)

## API Endpoints

### Blockchain
- `GET /api/blockchain/stats` - Get blockchain statistics
- `GET /api/blockchain/blocks` - Get blockchain blocks
- `GET /api/blockchain/pending-transactions` - Get pending transactions

### Accounts
- `GET /api/accounts/{address}/balance` - Get account balance
- `POST /api/accounts/create` - Create a new account
- `GET /api/accounts` - Get all accounts

### Transactions
- `POST /api/transactions/create` - Create a new transaction
- `GET /api/transactions/{hash}` - Get transaction by hash

### Mining
- `POST /api/mining/mine-block` - Mine a new block

### AI
- `POST /api/ai/train` - Train an AI model
- `POST /api/ai/predict` - Make predictions with an AI model
- `GET /api/ai/models` - Get all AI models
- `GET /api/ai/models/{modelId}` - Get AI model by ID

### Optimization
- `POST /api/optimization/optimize` - Optimize blockchain operations

### Security
- `POST /api/security/analyze` - Analyze blockchain security
- `GET /api/security/latest` - Get latest security analysis

## Technologies Used

### Frontend
- React
- TypeScript
- Next.js
- Tailwind CSS
- Axios

### Backend
- PHP
- Laravel
- MySQL
- RESTful API
- Docker

## License

MIT