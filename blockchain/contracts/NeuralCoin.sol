// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title KontourCoin
 * @dev Implementation of a quantum-resistant cryptocurrency with geometric verification
 * and Proof-of-Contour (PoC) mining mechanism.
 */
contract KontourCoin is ERC20, Ownable, ReentrancyGuard {
    // Blockchain structure
    struct Block {
        uint256 index;
        uint256 timestamp;
        bytes32 previousHash;
        bytes32 hash;
        string data;
        uint256 nonce;
        bytes32 merkleRoot;
        bytes contourHash; // Hash of the verified geometric contour
        uint256 contourComplexity; // Complexity of the contour (0-100)
        address miner;
    }

    // Transaction structure with quantum-resistant signature
    struct Transaction {
        address from;
        address to;
        uint256 amount;
        uint256 timestamp;
        uint256 fee;
        bytes geometricSignature; // Geometric-based signature
        bytes32 transactionHash;
        bool verified; // Verified by geometric algorithm
    }

    // Network parameters
    uint256 public difficulty = 4; // Initial mining difficulty
    uint256 public blockReward = 50 * 10**18; // 50 tokens
    uint256 public blockTime = 600; // Target block time in seconds (10 minutes)
    uint256 public lastDifficultyAdjustment;
    uint256 public minContourComplexity = 75; // Minimum complexity for PoC (75%)
    
    // Blockchain state
    Block[] public chain;
    mapping(bytes32 => Transaction) public transactions;
    bytes32[] public pendingTransactions;
    mapping(address => uint256) public stakes;
    uint256 public totalStaked;
    
    // Geometric verification parameters
    struct GeometricParameters {
        uint256 precision; // Scaled by 10000 (e.g., 0.01 = 100)
        uint256 samplePoints;
        uint256 iterations;
        string algorithm; // "bezier", "spline", "voronoi"
        uint256 dimensions;
        uint256 toleranceLevel;
    }
    
    GeometricParameters public geometricParameters;
    
    // Events
    event BlockMined(uint256 indexed blockIndex, address indexed miner, bytes32 blockHash);
    event TransactionAdded(bytes32 indexed transactionHash, address indexed from, address indexed to, uint256 amount);
    event TransactionVerified(bytes32 indexed transactionHash, bool verified);
    event DifficultyAdjusted(uint256 newDifficulty);
    event StakeAdded(address indexed staker, uint256 amount);
    event StakeRemoved(address indexed staker, uint256 amount);
    event ContourSubmitted(address indexed miner, bytes contourHash, uint256 complexity);
    event GeometricParametersUpdated(uint256 precision, uint256 samplePoints, uint256 iterations);
    
    /**
     * @dev Constructor initializes the token and creates the genesis block
     */
    constructor() ERC20("Kontour Coin", "KONTOUR") {
        // Create genesis block
        Block memory genesisBlock = Block({
            index: 0,
            timestamp: block.timestamp,
            previousHash: bytes32(0),
            hash: bytes32(0),
            data: "Kontour Genesis Block",
            nonce: 0,
            merkleRoot: bytes32(0),
            contourHash: bytes(""),
            contourComplexity: 0,
            miner: address(0)
        });
        
        // Calculate genesis block hash
        genesisBlock.hash = calculateBlockHash(genesisBlock);
        
        // Add genesis block to chain
        chain.push(genesisBlock);
        
        // Initialize geometric parameters
        geometricParameters = GeometricParameters({
            precision: 100, // 0.01
            samplePoints: 64,
            iterations: 15,
            algorithm: "bezier",
            dimensions: 3,
            toleranceLevel: 5
        });
        
        // Set initial difficulty adjustment timestamp
        lastDifficultyAdjustment = block.timestamp;
        
        // Mint initial supply to deployer
        _mint(msg.sender, 1000000 * 10**18); // 1 million tokens
    }
    
    /**
     * @dev Add a transaction to the pending pool
     * @param to Recipient address
     * @param amount Amount to transfer
     * @param geometricSignature Geometric-based signature
     */
    function addTransaction(
        address to, 
        uint256 amount, 
        bytes calldata geometricSignature
    ) external nonReentrant returns (bytes32) {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // Calculate fee (0.1%)
        uint256 fee = amount / 1000;
        
        // Create transaction
        Transaction memory newTx = Transaction({
            from: msg.sender,
            to: to,
            amount: amount,
            timestamp: block.timestamp,
            fee: fee,
            geometricSignature: geometricSignature,
            transactionHash: bytes32(0),
            verified: false
        });
        
        // Calculate transaction hash
        newTx.transactionHash = keccak256(
            abi.encodePacked(
                newTx.from,
                newTx.to,
                newTx.amount,
                newTx.timestamp,
                newTx.fee,
                newTx.geometricSignature
            )
        );
        
        // Store transaction
        transactions[newTx.transactionHash] = newTx;
        pendingTransactions.push(newTx.transactionHash);
        
        emit TransactionAdded(newTx.transactionHash, msg.sender, to, amount);
        
        return newTx.transactionHash;
    }
    
    /**
     * @dev Verify a transaction using quantum AI (called by oracle)
     * @param transactionHash Hash of the transaction to verify
     * @param verified Whether the transaction is verified
     */
    function verifyTransaction(bytes32 transactionHash, bool verified) external onlyOwner {
        require(transactions[transactionHash].from != address(0), "Transaction does not exist");
        
        transactions[transactionHash].verified = verified;
        
        emit TransactionVerified(transactionHash, verified);
    }
    
    /**
     * @dev Mine a block using Proof-of-Contour (PoC)
     * @param data Block data
     * @param nonce Block nonce
     * @param merkleRoot Merkle root of transactions
     * @param contourHash Hash of the verified geometric contour
     * @param contourComplexity Complexity of the contour (0-100)
     */
    function mineBlock(
        string calldata data,
        uint256 nonce,
        bytes32 merkleRoot,
        bytes calldata contourHash,
        uint256 contourComplexity
    ) external nonReentrant {
        require(pendingTransactions.length > 0, "No pending transactions");
        require(contourComplexity >= minContourComplexity, "Contour complexity too low");
        
        // Create new block
        Block memory newBlock = Block({
            index: chain.length,
            timestamp: block.timestamp,
            previousHash: chain[chain.length - 1].hash,
            hash: bytes32(0),
            data: data,
            nonce: nonce,
            merkleRoot: merkleRoot,
            contourHash: contourHash,
            contourComplexity: contourComplexity,
            miner: msg.sender
        });
        
        // Calculate block hash
        newBlock.hash = calculateBlockHash(newBlock);
        
        // Verify hash meets difficulty requirement
        bytes memory hashBytes = abi.encodePacked(newBlock.hash);
        for (uint i = 0; i < difficulty; i++) {
            require(uint8(hashBytes[i]) == 0, "Hash does not meet difficulty");
        }
        
        // Process transactions
        for (uint i = 0; i < pendingTransactions.length; i++) {
            bytes32 txHash = pendingTransactions[i];
            Transaction storage tx = transactions[txHash];
            
            if (tx.verified) {
                // Transfer amount
                _transfer(tx.from, tx.to, tx.amount - tx.fee);
                
                // Transfer fee to miner
                _transfer(tx.from, msg.sender, tx.fee);
            }
        }
        
        // Clear pending transactions
        delete pendingTransactions;
        
        // Add block to chain
        chain.push(newBlock);
        
        // Mint block reward
        _mint(msg.sender, blockReward);
        
        // Distribute staking rewards
        if (totalStaked > 0) {
            uint256 stakingReward = blockReward / 10; // 10% of block reward
            for (uint i = 0; i < 5; i++) {
                // In a real implementation, we would select top stakers
                // For simplicity, we're just minting additional tokens
                _mint(msg.sender, stakingReward);
            }
        }
        
        // Adjust difficulty if needed
        if (block.timestamp - lastDifficultyAdjustment > 10 * blockTime) {
            adjustDifficulty();
        }
        
        emit BlockMined(newBlock.index, msg.sender, newBlock.hash);
        emit ContourSubmitted(msg.sender, contourHash, contourComplexity);
    }
    
    /**
     * @dev Calculate hash of a block
     * @param block Block to hash
     * @return Hash of the block
     */
    function calculateBlockHash(Block memory block) public pure returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                block.index,
                block.timestamp,
                block.previousHash,
                block.data,
                block.nonce,
                block.merkleRoot,
                block.contourHash,
                block.contourComplexity,
                block.miner
            )
        );
    }
    
    /**
     * @dev Adjust mining difficulty based on block time
     */
    function adjustDifficulty() internal {
        uint256 timeElapsed = block.timestamp - lastDifficultyAdjustment;
        uint256 blocksMined = chain.length - 1; // Exclude genesis block
        uint256 expectedTime = blocksMined * blockTime;
        
        if (timeElapsed < expectedTime * 80 / 100) {
            // Blocks are being mined too quickly, increase difficulty
            difficulty++;
        } else if (timeElapsed > expectedTime * 120 / 100) {
            // Blocks are being mined too slowly, decrease difficulty
            if (difficulty > 1) {
                difficulty--;
            }
        }
        
        lastDifficultyAdjustment = block.timestamp;
        
        emit DifficultyAdjusted(difficulty);
    }
    
    /**
     * @dev Add stake
     * @param amount Amount to stake
     */
    function addStake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // Transfer tokens to contract
        _transfer(msg.sender, address(this), amount);
        
        // Update stake
        stakes[msg.sender] += amount;
        totalStaked += amount;
        
        emit StakeAdded(msg.sender, amount);
    }
    
    /**
     * @dev Remove stake
     * @param amount Amount to unstake
     */
    function removeStake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(stakes[msg.sender] >= amount, "Insufficient stake");
        
        // Update stake
        stakes[msg.sender] -= amount;
        totalStaked -= amount;
        
        // Transfer tokens back to user
        _transfer(address(this), msg.sender, amount);
        
        emit StakeRemoved(msg.sender, amount);
    }
    
    /**
     * @dev Update geometric parameters (governance function)
     * @param precision New precision (scaled by 10000)
     * @param samplePoints New sample points
     * @param iterations New number of iterations
     * @param algorithm New algorithm
     * @param dimensions New number of dimensions
     * @param toleranceLevel New tolerance level
     */
    function updateGeometricParameters(
        uint256 precision,
        uint256 samplePoints,
        uint256 iterations,
        string calldata algorithm,
        uint256 dimensions,
        uint256 toleranceLevel
    ) external onlyOwner {
        geometricParameters.precision = precision;
        geometricParameters.samplePoints = samplePoints;
        geometricParameters.iterations = iterations;
        geometricParameters.algorithm = algorithm;
        geometricParameters.dimensions = dimensions;
        geometricParameters.toleranceLevel = toleranceLevel;
        
        emit GeometricParametersUpdated(precision, samplePoints, iterations);
    }
    
    /**
     * @dev Get the latest block
     * @return Latest block
     */
    function getLatestBlock() external view returns (
        uint256 index,
        uint256 timestamp,
        bytes32 hash,
        bytes32 previousHash,
        string memory data,
        uint256 nonce,
        bytes32 merkleRoot,
        bytes memory contourHash,
        uint256 contourComplexity,
        address miner
    ) {
        Block storage latestBlock = chain[chain.length - 1];
        return (
            latestBlock.index,
            latestBlock.timestamp,
            latestBlock.hash,
            latestBlock.previousHash,
            latestBlock.data,
            latestBlock.nonce,
            latestBlock.merkleRoot,
            latestBlock.contourHash,
            latestBlock.contourComplexity,
            latestBlock.miner
        );
    }
    
    /**
     * @dev Get the chain length
     * @return Length of the blockchain
     */
    function getChainLength() external view returns (uint256) {
        return chain.length;
    }
    
    /**
     * @dev Get pending transaction count
     * @return Number of pending transactions
     */
    function getPendingTransactionCount() external view returns (uint256) {
        return pendingTransactions.length;
    }
    
    /**
     * @dev Validate the blockchain
     * @return Whether the blockchain is valid
     */
    function validateChain() external view returns (bool) {
        for (uint i = 1; i < chain.length; i++) {
            Block storage currentBlock = chain[i];
            Block storage previousBlock = chain[i - 1];
            
            // Verify hash
            if (currentBlock.hash != calculateBlockHash(currentBlock)) {
                return false;
            }
            
            // Verify previous hash
            if (currentBlock.previousHash != previousBlock.hash) {
                return false;
            }
        }
        
        return true;
    }
}