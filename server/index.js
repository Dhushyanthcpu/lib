const express = require('express');
const cors = require('cors');
const { Connection, PublicKey } = require('@solana/web3.js');
const { ethers } = require('ethers');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import quantum-resistant cryptography
const { QuantumResistantCrypto, PostQuantumAlgorithm, KeyType } = require('../blockchain/quantum-resistant/QuantumResistantCrypto');

// Initialize quantum-resistant crypto
const quantumCrypto = new QuantumResistantCrypto({
  defaultAlgorithm: PostQuantumAlgorithm.DILITHIUM,
  securityLevel: 'high',
  hybridMode: true
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quantum-blockchain', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Define User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  walletAddresses: {
    ethereum: { type: String, default: '' },
    solana: { type: String, default: '' }
  },
  publicKey: { type: String, default: '' },
  privateKey: { type: String, default: '' },
  preferredLanguage: { type: String, default: 'en' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Define Transaction Schema
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['send', 'receive', 'swap'], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  fromAddress: { type: String, required: true },
  toAddress: { type: String, required: true },
  hash: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  timestamp: { type: Date, default: Date.now },
  quantumSecured: { type: Boolean, default: true }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  jwt.verify(token, process.env.JWT_SECRET || 'quantum-secret-key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Initialize blockchain connections
const solanaConnection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
);

const ethereumProvider = new ethers.providers.JsonRpcProvider(
  process.env.ETHEREUM_RPC_URL || 'https://rpc.ankr.com/eth'
);

// Load supported languages
const supportedLanguages = [
  'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 
  'ar', 'hi', 'tr', 'nl', 'sv'
];

// Translation files
const translations = {};
supportedLanguages.forEach(lang => {
  try {
    const filePath = path.join(__dirname, `../public/locales/${lang}/translation.json`);
    if (fs.existsSync(filePath)) {
      translations[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } else {
      console.warn(`Translation file for ${lang} not found`);
      translations[lang] = {};
    }
  } catch (error) {
    console.error(`Error loading translation for ${lang}:`, error);
    translations[lang] = {};
  }
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, language } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Generate quantum-resistant key pair
    const keyPair = await quantumCrypto.generateKeyPair(
      PostQuantumAlgorithm.DILITHIUM,
      KeyType.SIGNATURE
    );
    
    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
      preferredLanguage: language || 'en'
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || 'quantum-secret-key',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        preferredLanguage: user.preferredLanguage
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Validate password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || 'quantum-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        preferredLanguage: user.preferredLanguage
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User routes
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -privateKey');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/user/wallet', authenticateToken, async (req, res) => {
  try {
    const { ethereum, solana } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (ethereum) user.walletAddresses.ethereum = ethereum;
    if (solana) user.walletAddresses.solana = solana;
    
    await user.save();
    
    res.json({
      walletAddresses: user.walletAddresses
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Blockchain routes
app.get('/api/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { blockchain } = req.query;
    
    if (blockchain === 'ethereum') {
      const balance = await ethereumProvider.getBalance(address);
      return res.json({ balance: ethers.utils.formatEther(balance) });
    } else {
      // Default to Solana
      const publicKey = new PublicKey(address);
      const balance = await solanaConnection.getBalance(publicKey);
      return res.json({ balance: balance / 1e9 }); // Convert lamports to SOL
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/transactions/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { blockchain } = req.query;
    
    if (blockchain === 'ethereum') {
      // For Ethereum, we'd typically use Etherscan API or similar
      // This is a simplified version
      return res.json({ transactions: [] });
    } else {
      // Default to Solana
      const publicKey = new PublicKey(address);
      const transactions = await solanaConnection.getConfirmedSignaturesForAddress2(publicKey);
      return res.json({ transactions });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Transaction routes
app.post('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const { type, amount, currency, fromAddress, toAddress, hash } = req.body;
    
    const transaction = new Transaction({
      userId: req.user.id,
      type,
      amount,
      currency,
      fromAddress,
      toAddress,
      hash,
      quantumSecured: true
    });
    
    await transaction.save();
    
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ timestamp: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Quantum cryptography routes
app.post('/api/quantum/sign', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const signature = await quantumCrypto.sign(message, user.privateKey);
    
    res.json({ signature });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/quantum/verify', async (req, res) => {
  try {
    const { message, signature, publicKey } = req.body;
    
    const isValid = await quantumCrypto.verify(message, signature, publicKey);
    
    res.json({ isValid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Language routes
app.get('/api/languages', (req, res) => {
  res.json({ languages: supportedLanguages });
});

app.get('/api/translations/:lang', (req, res) => {
  const { lang } = req.params;
  
  if (!supportedLanguages.includes(lang)) {
    return res.status(400).json({ error: 'Language not supported' });
  }
  
  res.json(translations[lang] || {});
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 