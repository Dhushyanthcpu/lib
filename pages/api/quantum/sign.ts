import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { QuantumResistantCrypto } from '../../../blockchain/quantum-resistant/QuantumResistantCrypto';

// This is a mock user database for demonstration purposes
// In a real application, you would use a database like MongoDB
const MOCK_USERS = [
  {
    id: '1',
    username: 'demo',
    email: 'demo@example.com',
    password: '$2a$10$XQxBZbvA1NNEjvGXGXTmwOGkl3j5fMpQsk9Qgj5U5QH5NgbZJTEQy',
    preferredLanguage: 'en',
    publicKey: 'DILITHIUM_PUB_1234567890_abcdef',
    privateKey: 'DILITHIUM_PRV_1234567890_abcdef'
  }
];

// Authentication middleware
const authenticateToken = (req: NextApiRequest): { authenticated: boolean; userId?: string } => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return { authenticated: false };
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'quantum-secret-key') as { id: string };
    return { authenticated: true, userId: decoded.id };
  } catch (error) {
    return { authenticated: false };
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authenticate user
  const auth = authenticateToken(req);
  if (!auth.authenticated) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Find user
    const user = MOCK_USERS.find(u => u.id === auth.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize quantum-resistant crypto
    const quantumCrypto = new QuantumResistantCrypto();
    
    // Sign message
    const signature = await quantumCrypto.sign(message, user.privateKey);
    
    res.status(200).json({ signature });
  } catch (error) {
    console.error('Quantum signing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}