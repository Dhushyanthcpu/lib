import type { NextApiRequest, NextApiResponse } from 'next';
import { QuantumResistantCrypto, Signature } from '../../../blockchain/quantum-resistant/QuantumResistantCrypto';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, signature, publicKey } = req.body;

    if (!message || !signature || !publicKey) {
      return res.status(400).json({ error: 'Message, signature, and publicKey are required' });
    }

    // Initialize quantum-resistant crypto
    const quantumCrypto = new QuantumResistantCrypto();
    
    // Verify signature
    const isValid = await quantumCrypto.verify(
      message,
      signature as Signature,
      publicKey
    );
    
    res.status(200).json({ isValid });
  } catch (error) {
    console.error('Quantum verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}