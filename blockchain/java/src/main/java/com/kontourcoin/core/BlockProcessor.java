package com.kontourcoin.core;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.nio.ByteBuffer;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * Processes blocks for the Kontour Coin blockchain
 * Handles block creation, validation, and chain management
 */
public class BlockProcessor {
    
    private final GeometricProcessor geometricProcessor;
    private final CopyOnWriteArrayList<Block> blockchain;
    private final ReentrantReadWriteLock chainLock = new ReentrantReadWriteLock();
    private int difficulty;
    private double minContourComplexity;
    private long blockReward;
    private long lastDifficultyAdjustment;
    private long targetBlockTime;
    
    /**
     * Constructor for BlockProcessor
     * 
     * @param dimensions Number of dimensions for geometric processing
     * @param precision Precision level for calculations
     * @param tolerance Error tolerance for verification
     * @param initialDifficulty Initial mining difficulty
     * @param minContourComplexity Minimum contour complexity for mining
     * @param blockReward Block reward amount
     * @param targetBlockTime Target time between blocks in milliseconds
     */
    public BlockProcessor(int dimensions, double precision, double tolerance,
                         int initialDifficulty, double minContourComplexity,
                         long blockReward, long targetBlockTime) {
        this.geometricProcessor = new GeometricProcessor(dimensions, precision, tolerance);
        this.blockchain = new CopyOnWriteArrayList<>();
        this.difficulty = initialDifficulty;
        this.minContourComplexity = minContourComplexity;
        this.blockReward = blockReward;
        this.targetBlockTime = targetBlockTime;
        
        // Create genesis block
        createGenesisBlock();
        this.lastDifficultyAdjustment = System.currentTimeMillis();
    }
    
    /**
     * Create the genesis block
     */
    private void createGenesisBlock() {
        Block genesisBlock = new Block(
            0,
            System.currentTimeMillis(),
            new byte[32], // Empty previous hash
            "Kontour Genesis Block",
            0,
            new byte[32], // Empty merkle root
            new byte[0], // Empty contour hash
            0.0,
            "0x0000000000000000000000000000000000000000" // Genesis miner address
        );
        
        // Calculate block hash
        byte[] hash = calculateBlockHash(genesisBlock);
        genesisBlock.setHash(hash);
        
        // Add to blockchain
        blockchain.add(genesisBlock);
    }
    
    /**
     * Mine a new block
     * 
     * @param data Block data
     * @param nonce Block nonce
     * @param merkleRoot Merkle root of transactions
     * @param contourHash Hash of the contour
     * @param contourComplexity Complexity of the contour
     * @param minerAddress Address of the miner
     * @return The mined block if successful, null otherwise
     */
    public Block mineBlock(String data, long nonce, byte[] merkleRoot,
                          byte[] contourHash, double contourComplexity,
                          String minerAddress) {
        // Check contour complexity
        if (contourComplexity < minContourComplexity) {
            return null;
        }
        
        // Get latest block
        Block latestBlock = getLatestBlock();
        
        // Create new block
        Block newBlock = new Block(
            latestBlock.getIndex() + 1,
            System.currentTimeMillis(),
            latestBlock.getHash(),
            data,
            nonce,
            merkleRoot,
            contourHash,
            contourComplexity,
            minerAddress
        );
        
        // Calculate block hash
        byte[] hash = calculateBlockHash(newBlock);
        newBlock.setHash(hash);
        
        // Verify hash meets difficulty requirement
        if (!meetsHashDifficulty(hash, difficulty)) {
            return null;
        }
        
        // Add block to chain
        chainLock.writeLock().lock();
        try {
            blockchain.add(newBlock);
            
            // Adjust difficulty if needed
            long currentTime = System.currentTimeMillis();
            if (currentTime - lastDifficultyAdjustment > 10 * targetBlockTime) {
                adjustDifficulty();
                lastDifficultyAdjustment = currentTime;
            }
        } finally {
            chainLock.writeLock().unlock();
        }
        
        return newBlock;
    }
    
    /**
     * Calculate the hash of a block
     * 
     * @param block Block to hash
     * @return Hash of the block
     */
    public byte[] calculateBlockHash(Block block) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            
            // Combine block data
            ByteBuffer buffer = ByteBuffer.allocate(1024);
            buffer.putLong(block.getIndex());
            buffer.putLong(block.getTimestamp());
            buffer.put(block.getPreviousHash());
            buffer.put(block.getData().getBytes());
            buffer.putLong(block.getNonce());
            buffer.put(block.getMerkleRoot());
            buffer.put(block.getContourHash());
            buffer.putDouble(block.getContourComplexity());
            buffer.put(block.getMinerAddress().getBytes());
            
            // Calculate hash
            return digest.digest(buffer.array());
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
    
    /**
     * Check if a hash meets the difficulty requirement
     * 
     * @param hash Hash to check
     * @param difficulty Difficulty level
     * @return Whether the hash meets the difficulty
     */
    private boolean meetsHashDifficulty(byte[] hash, int difficulty) {
        // Check that the first 'difficulty' bytes are zero
        for (int i = 0; i < difficulty; i++) {
            if (hash[i] != 0) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Adjust mining difficulty based on block time
     */
    private void adjustDifficulty() {
        long timeElapsed = System.currentTimeMillis() - lastDifficultyAdjustment;
        long blocksMined = blockchain.size() - 1; // Exclude genesis block
        long expectedTime = blocksMined * targetBlockTime;
        
        if (timeElapsed < expectedTime * 0.8) {
            // Blocks are being mined too quickly, increase difficulty
            difficulty++;
        } else if (timeElapsed > expectedTime * 1.2) {
            // Blocks are being mined too slowly, decrease difficulty
            if (difficulty > 1) {
                difficulty--;
            }
        }
    }
    
    /**
     * Validate the entire blockchain
     * 
     * @return Whether the blockchain is valid
     */
    public boolean validateChain() {
        chainLock.readLock().lock();
        try {
            for (int i = 1; i < blockchain.size(); i++) {
                Block currentBlock = blockchain.get(i);
                Block previousBlock = blockchain.get(i - 1);
                
                // Verify hash
                byte[] calculatedHash = calculateBlockHash(currentBlock);
                if (!bytesEqual(calculatedHash, currentBlock.getHash())) {
                    return false;
                }
                
                // Verify previous hash
                if (!bytesEqual(currentBlock.getPreviousHash(), previousBlock.getHash())) {
                    return false;
                }
            }
            
            return true;
        } finally {
            chainLock.readLock().unlock();
        }
    }
    
    /**
     * Compare two byte arrays for equality
     * 
     * @param a, b Byte arrays to compare
     * @return Whether the arrays are equal
     */
    private boolean bytesEqual(byte[] a, byte[] b) {
        if (a.length != b.length) {
            return false;
        }
        
        for (int i = 0; i < a.length; i++) {
            if (a[i] != b[i]) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Get the latest block in the chain
     * 
     * @return Latest block
     */
    public Block getLatestBlock() {
        chainLock.readLock().lock();
        try {
            return blockchain.get(blockchain.size() - 1);
        } finally {
            chainLock.readLock().unlock();
        }
    }
    
    /**
     * Get the entire blockchain
     * 
     * @return List of blocks in the chain
     */
    public List<Block> getBlockchain() {
        chainLock.readLock().lock();
        try {
            return new ArrayList<>(blockchain);
        } finally {
            chainLock.readLock().unlock();
        }
    }
    
    /**
     * Get the current difficulty
     * 
     * @return Current mining difficulty
     */
    public int getDifficulty() {
        return difficulty;
    }
    
    /**
     * Get the minimum contour complexity
     * 
     * @return Minimum contour complexity
     */
    public double getMinContourComplexity() {
        return minContourComplexity;
    }
    
    /**
     * Get the block reward
     * 
     * @return Block reward amount
     */
    public long getBlockReward() {
        return blockReward;
    }
    
    /**
     * Block class for internal use
     */
    public static class Block {
        private final long index;
        private final long timestamp;
        private final byte[] previousHash;
        private byte[] hash;
        private final String data;
        private final long nonce;
        private final byte[] merkleRoot;
        private final byte[] contourHash;
        private final double contourComplexity;
        private final String minerAddress;
        
        public Block(long index, long timestamp, byte[] previousHash,
                    String data, long nonce, byte[] merkleRoot,
                    byte[] contourHash, double contourComplexity,
                    String minerAddress) {
            this.index = index;
            this.timestamp = timestamp;
            this.previousHash = previousHash;
            this.data = data;
            this.nonce = nonce;
            this.merkleRoot = merkleRoot;
            this.contourHash = contourHash;
            this.contourComplexity = contourComplexity;
            this.minerAddress = minerAddress;
        }
        
        // Getters and setters
        public long getIndex() { return index; }
        public long getTimestamp() { return timestamp; }
        public byte[] getPreviousHash() { return previousHash; }
        public byte[] getHash() { return hash; }
        public void setHash(byte[] hash) { this.hash = hash; }
        public String getData() { return data; }
        public long getNonce() { return nonce; }
        public byte[] getMerkleRoot() { return merkleRoot; }
        public byte[] getContourHash() { return contourHash; }
        public double getContourComplexity() { return contourComplexity; }
        public String getMinerAddress() { return minerAddress; }
    }
}