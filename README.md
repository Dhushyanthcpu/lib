# Quantum Blockchain Project

A next-generation blockchain platform with quantum-resistant cryptography, multilingual support, and advanced AI features.

## Features

- **Quantum-Resistant Cryptography**: Secure against quantum computing attacks
- **Multilingual Support**: 15 languages supported out of the box
- **Advanced AI**: Quantum neural networks for market prediction
- **Cross-Chain Compatibility**: Support for Solana, Ethereum, and more
- **Modern UI**: Built with Next.js and Tailwind CSS
- **MongoDB Integration**: For user management and data persistence

## Prerequisites

- Node.js 16+ and npm
- MongoDB (optional, but recommended for full functionality)
- Phantom wallet browser extension (for Solana integration)
- MetaMask (for Ethereum integration)

## Setup

1. Run the setup script to install dependencies and create configuration files:
```bash
node scripts/setup.js
```

2. The setup script will create a `.env` file with default configuration. You can modify this file to customize your environment:
```env
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
```

3. Start the development environment (frontend, backend, and blockchain services):
```bash
npm run dev:all
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

- Frontend runs on port 3000
- Backend API runs on port 3001
- The application uses Solana's devnet and Ethereum's testnet by default
- MongoDB runs on the default port 27017

## Technologies Used

- Next.js 14
- React 18
- Express.js
- MongoDB & Mongoose
- Solana Web3.js
- Ethers.js
- Tailwind CSS
- TypeScript
- i18next for internationalization

## Project Structure

```
quantum-blockchain/
├── blockchain/            # Blockchain implementation
│   ├── ai/                # AI and ML components
│   ├── market/            # Market analysis
│   ├── quantum-resistant/ # Quantum-resistant cryptography
│   └── ...
├── components/            # React components
├── pages/                 # Next.js pages
│   ├── api/               # API routes
│   └── ...
├── public/                # Static assets
│   └── locales/           # Translation files
├── scripts/               # Utility scripts
├── server/                # Express backend
├── styles/                # CSS styles
└── utils/                 # Utility functions
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Blockchain
- `GET /api/balance/:address` - Get wallet balance
- `GET /api/transactions/:address` - Get transaction history

### Quantum Cryptography
- `POST /api/quantum/sign` - Sign a message with quantum-resistant cryptography
- `POST /api/quantum/verify` - Verify a quantum-resistant signature

## Multilingual Support

The application supports 15 languages:
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Russian (ru)
- Chinese (zh)
- Japanese (ja)
- Korean (ko)
- Arabic (ar)
- Hindi (hi)
- Turkish (tr)
- Dutch (nl)
- Swedish (sv)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 