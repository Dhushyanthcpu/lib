/// <reference types="node" />

import { ethers } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

export async function setupTestEnvironment(hre: HardhatRuntimeEnvironment) {
  // Reset the Hardhat network
  await hre.network.provider.send('hardhat_reset', []);

  // Get signers
  const [owner, user1, user2] = await ethers.getSigners();

  // Deploy the contract
  const LuciferCoinFactory = await ethers.getContractFactory('LuciferCoin');
  const luciferCoin = await LuciferCoinFactory.deploy(
    '0x2222222222222222222222222222222222222222', // bridgeContract
    '0x1111111111111111111111111111111111111111'  // quantumVerifier
  );
  await luciferCoin.deployed();

  return {
    luciferCoin,
    owner,
    user1,
    user2
  };
}

export const quantumApiUrl = 'http://localhost:8000';

export async function verifyQuantumTransaction(txData: any) {
  try {
    const response = await fetch(`${quantumApiUrl}/verify_transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(txData)
    });
    return await response.json();
  } catch (error) {
    console.warn('Quantum backend not running, using mock response');
    return {
      valid: true,
      tx_hash: '0x1234567890abcdef'
    };
  }
} 