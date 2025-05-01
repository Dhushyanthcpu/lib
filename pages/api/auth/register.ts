import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { QuantumResistantCrypto, PostQuantumAlgorithm, KeyType } from '../../../blockchain/quantum-resistant/QuantumResistantCrypto';

// This is a mock user database for demonstration purposes
// In a real application, you would use a database like MongoDB
const MOCK_USERS = [
  {
    id: '1',
    username: 'demo',
    email: 'demo@example.com',
    // Password: 'password123'
    password: '$2a$10$XQxBZbvA1NNEjvGXGXTmwOGkl3j5fMpQsk9Qgj5U5QH5NgbZJTEQy',
    preferredLanguage: 'en',
    publicKey: '',
    privateKey: ''
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, email, password, language } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email === email || u.username === username);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate quantum-resistant key pair
    const quantumCrypto = new QuantumResistantCrypto({
      defaultAlgorithm: PostQuantumAlgorithm.DILITHIUM,
      securityLevel: 'high',
      hybridMode: true
    });
    
    const keyPair = await quantumCrypto.generateKeyPair(
      PostQuantumAlgorithm.DILITHIUM,
      KeyType.SIGNATURE
    );

    // Create new user
    const newUser = {
      id: (MOCK_USERS.length + 1).toString(),
      username,
      email,
      password: hashedPassword,
      preferredLanguage: language || 'en',
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey
    };

    // In a real application, you would save the user to a database
    MOCK_USERS.push(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username },
      process.env.JWT_SECRET || 'quantum-secret-key',
      { expiresIn: '24h' }
    );

    // Return token and user info
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        preferredLanguage: newUser.preferredLanguage
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}