import { ethers } from 'hardhat';
import { expect } from 'chai';
import { Contract, ContractFactory } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('NeuralCoin Blockchain', function () {
  let NeuralCoin: ContractFactory;
  let neuralCoin: Contract;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  
  // Mock quantum signature
  const mockQuantumSignature = ethers.utils.hexlify(ethers.utils.randomBytes(64));
  
  // Mock model hash
  const mockModelHash = ethers.utils.hexlify(ethers.utils.randomBytes(32));
  
  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy contract
    NeuralCoin = await ethers.getContractFactory('NeuralCoin');
    neuralCoin = await NeuralCoin.deploy();
    await neuralCoin.deployed();
    
    // Transfer some tokens to users for testing
    await neuralCoin.transfer(user1.address, ethers.utils.parseEther('1000'));
    await neuralCoin.transfer(user2.address, ethers.utils.parseEther('1000'));
  });
  
  it('should initialize with genesis block', async function () {
    // Check token details
    expect(await neuralCoin.name()).to.equal('Neural Coin');
    expect(await neuralCoin.symbol()).to.equal('NEURAL');
    
    // Check chain length
    expect(await neuralCoin.getChainLength()).to.equal(1);
    
    // Check genesis block
    const latestBlock = await neuralCoin.getLatestBlock();
    expect(latestBlock.index).to.equal(0);
    expect(latestBlock.data).to.equal('Genesis Block');
  });
  
  it('should add and verify transactions with quantum AI', async function () {
    // Add transaction
    const amount = ethers.utils.parseEther('100');
    const txHash = await neuralCoin.connect(user1).addTransaction(
      user2.address,
      amount,
      mockQuantumSignature
    );
    
    // Check pending transactions
    expect(await neuralCoin.getPendingTransactionCount()).to.equal(1);
    
    // Verify transaction
    await neuralCoin.verifyTransaction(
      ethers.utils.keccak256(
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
      ),
      true
    );
  });
  
  it('should mine block with PoUW', async function () {
    // Add transaction
    const amount = ethers.utils.parseEther('100');
    await neuralCoin.connect(user1).addTransaction(
      user2.address,
      amount,
      mockQuantumSignature
    );
    
    // Verify transaction
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
    await neuralCoin.verifyTransaction(txHash, true);
    
    // Mine block with PoUW
    // In a real implementation, this would involve training an ANN
    // For testing, we'll just use mock values
    const blockData = 'Test Block';
    const nonce = 12345;
    const merkleRoot = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('merkle root'));
    const modelAccuracy = 95; // 95% accuracy
    
    // We need to find a nonce that satisfies the difficulty
    // For testing, we'll just try different nonces until we find one that works
    let validNonce = 0;
    let validHash = '';
    
    for (let i = 0; i < 1000; i++) {
      try {
        // Try to mine block with current nonce
        await neuralCoin.connect(owner).callStatic.mineBlock(
          blockData,
          i,
          merkleRoot,
          mockModelHash,
          modelAccuracy
        );
        
        // If we get here, the nonce is valid
        validNonce = i;
        break;
      } catch (error) {
        // Nonce is invalid, try next one
        continue;
      }
    }
    
    // Mine block with valid nonce
    await neuralCoin.connect(owner).mineBlock(
      blockData,
      validNonce,
      merkleRoot,
      mockModelHash,
      modelAccuracy
    );
    
    // Check chain length
    expect(await neuralCoin.getChainLength()).to.equal(2);
    
    // Check latest block
    const latestBlock = await neuralCoin.getLatestBlock();
    expect(latestBlock.index).to.equal(1);
    expect(latestBlock.data).to.equal(blockData);
    expect(latestBlock.nonce).to.equal(validNonce);
  });
  
  it('should track balances correctly', async function () {
    // Add transaction
    const amount = ethers.utils.parseEther('100');
    await neuralCoin.connect(user1).addTransaction(
      user2.address,
      amount,
      mockQuantumSignature
    );
    
    // Verify transaction
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
    await neuralCoin.verifyTransaction(txHash, true);
    
    // Mine block
    const blockData = 'Test Block';
    const nonce = 12345;
    const merkleRoot = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('merkle root'));
    const modelAccuracy = 95; // 95% accuracy
    
    // Find valid nonce
    let validNonce = 0;
    for (let i = 0; i < 1000; i++) {
      try {
        await neuralCoin.connect(owner).callStatic.mineBlock(
          blockData,
          i,
          merkleRoot,
          mockModelHash,
          modelAccuracy
        );
        validNonce = i;
        break;
      } catch (error) {
        continue;
      }
    }
    
    // Mine block
    await neuralCoin.connect(owner).mineBlock(
      blockData,
      validNonce,
      merkleRoot,
      mockModelHash,
      modelAccuracy
    );
    
    // Check balances
    const fee = amount.div(1000);
    const user1Balance = await neuralCoin.balanceOf(user1.address);
    const user2Balance = await neuralCoin.balanceOf(user2.address);
    const ownerBalance = await neuralCoin.balanceOf(owner.address);
    
    // User1 should have initial balance - amount
    expect(user1Balance).to.equal(ethers.utils.parseEther('1000').sub(amount));
    
    // User2 should have initial balance + amount - fee
    expect(user2Balance).to.equal(ethers.utils.parseEther('1000').add(amount).sub(fee));
    
    // Owner should have received the fee + block reward
    expect(ownerBalance).to.be.gt(ethers.utils.parseEther('998000').add(fee));
  });
  
  it('should validate the blockchain', async function () {
    // Add transaction
    const amount = ethers.utils.parseEther('100');
    await neuralCoin.connect(user1).addTransaction(
      user2.address,
      amount,
      mockQuantumSignature
    );
    
    // Verify transaction
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
    await neuralCoin.verifyTransaction(txHash, true);
    
    // Mine block
    const blockData = 'Test Block';
    const nonce = 12345;
    const merkleRoot = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('merkle root'));
    const modelAccuracy = 95; // 95% accuracy
    
    // Find valid nonce
    let validNonce = 0;
    for (let i = 0; i < 1000; i++) {
      try {
        await neuralCoin.connect(owner).callStatic.mineBlock(
          blockData,
          i,
          merkleRoot,
          mockModelHash,
          modelAccuracy
        );
        validNonce = i;
        break;
      } catch (error) {
        continue;
      }
    }
    
    // Mine block
    await neuralCoin.connect(owner).mineBlock(
      blockData,
      validNonce,
      merkleRoot,
      mockModelHash,
      modelAccuracy
    );
    
    // Validate chain
    expect(await neuralCoin.validateChain()).to.equal(true);
  });
  
  it('should adjust difficulty dynamically', async function () {
    // Get initial difficulty
    const initialDifficulty = await neuralCoin.difficulty();
    
    // Add transaction
    const amount = ethers.utils.parseEther('100');
    await neuralCoin.connect(user1).addTransaction(
      user2.address,
      amount,
      mockQuantumSignature
    );
    
    // Verify transaction
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
    await neuralCoin.verifyTransaction(txHash, true);
    
    // Increase time to trigger difficulty adjustment
    await ethers.provider.send('evm_increaseTime', [7000]); // Increase time by more than 10 * blockTime
    await ethers.provider.send('evm_mine', []);
    
    // Mine block
    const blockData = 'Test Block';
    const nonce = 12345;
    const merkleRoot = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('merkle root'));
    const modelAccuracy = 95; // 95% accuracy
    
    // Find valid nonce
    let validNonce = 0;
    for (let i = 0; i < 1000; i++) {
      try {
        await neuralCoin.connect(owner).callStatic.mineBlock(
          blockData,
          i,
          merkleRoot,
          mockModelHash,
          modelAccuracy
        );
        validNonce = i;
        break;
      } catch (error) {
        continue;
      }
    }
    
    // Mine block
    await neuralCoin.connect(owner).mineBlock(
      blockData,
      validNonce,
      merkleRoot,
      mockModelHash,
      modelAccuracy
    );
    
    // Check if difficulty was adjusted
    const newDifficulty = await neuralCoin.difficulty();
    expect(newDifficulty).to.not.equal(initialDifficulty);
  });
  
  it('should handle staking and rewards', async function () {
    // Add stake
    const stakeAmount = ethers.utils.parseEther('100');
    await neuralCoin.connect(user1).addStake(stakeAmount);
    
    // Check stake
    expect(await neuralCoin.stakes(user1.address)).to.equal(stakeAmount);
    expect(await neuralCoin.totalStaked()).to.equal(stakeAmount);
    
    // Add transaction
    const txAmount = ethers.utils.parseEther('50');
    await neuralCoin.connect(user2).addTransaction(
      user1.address,
      txAmount,
      mockQuantumSignature
    );
    
    // Verify transaction
    const txHash = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ['address', 'address', 'uint256', 'uint256', 'uint256', 'bytes'],
        [
          user2.address,
          user1.address,
          txAmount,
          (await ethers.provider.getBlock('latest')).timestamp,
          txAmount.div(1000), // Fee
          mockQuantumSignature
        ]
      )
    );
    await neuralCoin.verifyTransaction(txHash, true);
    
    // Mine block
    const blockData = 'Test Block';
    const nonce = 12345;
    const merkleRoot = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('merkle root'));
    const modelAccuracy = 95; // 95% accuracy
    
    // Find valid nonce
    let validNonce = 0;
    for (let i = 0; i < 1000; i++) {
      try {
        await neuralCoin.connect(owner).callStatic.mineBlock(
          blockData,
          i,
          merkleRoot,
          mockModelHash,
          modelAccuracy
        );
        validNonce = i;
        break;
      } catch (error) {
        continue;
      }
    }
    
    // Mine block
    await neuralCoin.connect(owner).mineBlock(
      blockData,
      validNonce,
      merkleRoot,
      mockModelHash,
      modelAccuracy
    );
    
    // Remove stake
    await neuralCoin.connect(user1).removeStake(stakeAmount);
    
    // Check stake
    expect(await neuralCoin.stakes(user1.address)).to.equal(0);
    expect(await neuralCoin.totalStaked()).to.equal(0);
  });
});