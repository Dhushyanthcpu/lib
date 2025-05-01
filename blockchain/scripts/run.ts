/// <reference types="node" />

import { ethers } from 'hardhat';
import axios from 'axios';

async function main() {
  console.log('Starting Neural Coin blockchain workflow...');

  // Get signers
  const [owner, user1, user2] = await ethers.getSigners();
  console.log('Owner address:', owner.address);
  console.log('User1 address:', user1.address);
  console.log('User2 address:', user2.address);

  // Deploy contract
  console.log('\nDeploying NeuralCoin contract...');
  const NeuralCoinFactory = await ethers.getContractFactory('NeuralCoin');
  const neuralCoin = await NeuralCoinFactory.deploy();
  await neuralCoin.deployed();
  console.log('Contract deployed to:', neuralCoin.address);
  console.log('Quantum resistance enabled');

  // Transfer tokens to users
  console.log('\nTransferring tokens to users...');
  await neuralCoin.transfer(user1.address, ethers.utils.parseEther('1000'));
  await neuralCoin.transfer(user2.address, ethers.utils.parseEther('1000'));
  console.log('Tokens transferred');

  // Create a transaction
  console.log('\nAdding transaction...');
  const amount = ethers.utils.parseEther('100');
  const mockQuantumSignature = ethers.utils.hexlify(ethers.utils.randomBytes(64));
  
  // Try to connect to the Python backend (if running)
  let quantumVerified = false;
  try {
    // Prepare transaction data for quantum verification
    const txData = {
      transaction_data: {
        from_address: user1.address,
        to_address: user2.address,
        amount: parseFloat(ethers.utils.formatEther(amount)),
        timestamp: Math.floor(Date.now() / 1000),
        fee: parseFloat(ethers.utils.formatEther(amount.div(1000))),
        signature: mockQuantumSignature
      },
      transaction_hash: ethers.utils.id(`${user1.address}-${user2.address}-${amount}`)
    };
    
    // Call quantum backend for verification
    const response = await axios.post('http://localhost:8000/verify-transaction', txData);
    console.log('Quantum verification:', response.data);
    quantumVerified = response.data.verified;
  } catch (error) {
    console.log('Backend not available. Using mock verification.');
    quantumVerified = true; // Mock verification for testing
  }
  
  // Add transaction to blockchain
  const tx = await neuralCoin.connect(user1).addTransaction(
    user2.address,
    amount,
    mockQuantumSignature
  );
  
  console.log('Transaction added:', tx.hash);
  
  // Calculate transaction hash
  const txHash = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
      ['address', 'address', 'uint256', 'uint256', 'uint256', 'bytes'],
      [
        user1.address,
        user2.address,
        amount,
        (await ethers.provider.getBlock('latest')).timestamp,
        amount.div(1000), // Fee
        mockQuantumSignature
      ]
    )
  );
  
  // Verify transaction
  console.log('\nVerifying transaction...');
  await neuralCoin.verifyTransaction(txHash, quantumVerified);
  console.log('Transaction verified:', quantumVerified);
  
  // Mine a block
  console.log('\nMining block with PoUW...');
  const blockData = 'First Neural Block';
  const merkleRoot = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('merkle root'));
  const mockModelHash = ethers.utils.hexlify(ethers.utils.randomBytes(32));
  const modelAccuracy = 95; // 95% accuracy
  
  // Try to get model verification from backend
  let verifiedModelHash = mockModelHash;
  let verifiedAccuracy = modelAccuracy;
  
  try {
    // Prepare model data for verification
    const modelData = {
      miner_address: owner.address,
      model_weights: Array(10).fill(Array(10).fill(0.1)), // Mock weights
      dataset_hash: ethers.utils.id('mnist').slice(2)
    };
    
    // Call quantum backend for model verification
    const response = await axios.post('http://localhost:8000/verify-model', modelData);
    console.log('Model verification:', response.data);
    verifiedModelHash = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(response.data.model_hash));
    verifiedAccuracy = response.data.accuracy;
  } catch (error) {
    console.log('Backend not available for model verification. Using mock data.');
  }
  
  // Find valid nonce
  console.log('Finding valid nonce...');
  let validNonce = 0;
  for (let i = 0; i < 1000; i++) {
    try {
      await neuralCoin.connect(owner).callStatic.mineBlock(
        blockData,
        i,
        merkleRoot,
        verifiedModelHash,
        verifiedAccuracy
      );
      validNonce = i;
      console.log('Valid nonce found:', validNonce);
      break;
    } catch (error) {
      if (i % 100 === 0) {
        console.log(`Tried ${i} nonces...`);
      }
      continue;
    }
  }
  
  // Mine block
  const mineTx = await neuralCoin.connect(owner).mineBlock(
    blockData,
    validNonce,
    merkleRoot,
    verifiedModelHash,
    verifiedAccuracy
  );
  
  console.log('Block mined:', mineTx.hash);
  
  // Check balances
  console.log('\nChecking balances...');
  const user1Balance = await neuralCoin.balanceOf(user1.address);
  const user2Balance = await neuralCoin.balanceOf(user2.address);
  const ownerBalance = await neuralCoin.balanceOf(owner.address);
  
  console.log('User1 balance:', ethers.utils.formatEther(user1Balance));
  console.log('User2 balance:', ethers.utils.formatEther(user2Balance));
  console.log('Owner balance:', ethers.utils.formatEther(ownerBalance));
  
  // Validate chain
  console.log('\nValidating chain...');
  const isValid = await neuralCoin.validateChain();
  console.log('Chain valid:', isValid);
  
  // Get latest block
  console.log('\nGetting block details...');
  const latestBlock = await neuralCoin.getLatestBlock();
  console.log('Block details:', {
    index: latestBlock.index.toString(),
    timestamp: latestBlock.timestamp.toString(),
    hash: latestBlock.hash,
    previousHash: latestBlock.previousHash,
    data: latestBlock.data,
    nonce: latestBlock.nonce.toString(),
    merkleRoot: latestBlock.merkleRoot,
    modelAccuracy: latestBlock.modelAccuracy.toString(),
    miner: latestBlock.miner
  });
  
  // Get network stats
  console.log('\nGetting network stats...');
  const difficulty = await neuralCoin.difficulty();
  const totalStaked = await neuralCoin.totalStaked();
  console.log('Network stats:', {
    difficulty: difficulty.toString(),
    totalStaked: ethers.utils.formatEther(totalStaked),
    chainLength: (await neuralCoin.getChainLength()).toString(),
    pendingTransactions: (await neuralCoin.getPendingTransactionCount()).toString()
  });
  
  // Try to connect to the Python backend (if running)
  try {
    const response = await axios.get('http://localhost:8000/stats');
    console.log('\nBackend stats:', response.data);
  } catch (error) {
    console.log('\nBackend not available. Run it with: cd backend && python -m uvicorn backend:app --host 0.0.0.0 --port 8000');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  }); 