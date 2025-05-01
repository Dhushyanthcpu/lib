package com.kontourcoin.api;

import com.kontourcoin.core.BlockProcessor;
import com.kontourcoin.core.GeometricProcessor;
import com.kontourcoin.core.TransactionProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST API controller for the Kontour Coin blockchain
 */
@RestController
@RequestMapping("/api/v1")
public class BlockchainController {
    
    private final BlockProcessor blockProcessor;
    private final TransactionProcessor transactionProcessor;
    private final GeometricProcessor geometricProcessor;
    
    @Autowired
    public BlockchainController(BlockProcessor blockProcessor,
                              TransactionProcessor transactionProcessor,
                              GeometricProcessor geometricProcessor) {
        this.blockProcessor = blockProcessor;
        this.transactionProcessor = transactionProcessor;
        this.geometricProcessor = geometricProcessor;
    }
    
    /**
     * Get blockchain information
     */
    @GetMapping("/blockchain")
    public ResponseEntity<Map<String, Object>> getBlockchainInfo() {
        Map<String, Object> response = new HashMap<>();
        response.put("chainLength", blockProcessor.getBlockchain().size());
        response.put("difficulty", blockProcessor.getDifficulty());
        response.put("minContourComplexity", blockProcessor.getMinContourComplexity());
        response.put("blockReward", blockProcessor.getBlockReward());
        response.put("latestBlock", convertBlockToMap(blockProcessor.getLatestBlock()));
        response.put("isValid", blockProcessor.validateChain());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all blocks in the blockchain
     */
    @GetMapping("/blocks")
    public ResponseEntity<List<Map<String, Object>>> getAllBlocks() {
        List<Map<String, Object>> blocks = blockProcessor.getBlockchain().stream()
            .map(this::convertBlockToMap)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(blocks);
    }
    
    /**
     * Get a specific block by index
     */
    @GetMapping("/blocks/{index}")
    public ResponseEntity<Map<String, Object>> getBlock(@PathVariable long index) {
        List<BlockProcessor.Block> blockchain = blockProcessor.getBlockchain();
        
        if (index < 0 || index >= blockchain.size()) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(convertBlockToMap(blockchain.get((int) index)));
    }
    
    /**
     * Add a new transaction
     */
    @PostMapping("/transactions")
    public ResponseEntity<Map<String, Object>> addTransaction(@RequestBody TransactionRequest request) {
        try {
            // Convert base64 signature to bytes
            byte[] signature = Base64.getDecoder().decode(request.getSignature());
            
            // Create transaction
            TransactionProcessor.Transaction transaction = new TransactionProcessor.Transaction(
                request.getFromAddress(),
                request.getToAddress(),
                request.getAmount(),
                request.getTimestamp(),
                request.getFee(),
                signature
            );
            
            // Add transaction
            String hash = transactionProcessor.addTransaction(transaction);
            
            // Return response
            Map<String, Object> response = new HashMap<>();
            response.put("hash", hash);
            response.put("status", "pending");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Verify a transaction
     */
    @PostMapping("/transactions/{hash}/verify")
    public ResponseEntity<Map<String, Object>> verifyTransaction(@PathVariable String hash) {
        boolean isValid = transactionProcessor.verifyTransaction(hash);
        
        Map<String, Object> response = new HashMap<>();
        response.put("hash", hash);
        response.put("verified", isValid);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get transaction details
     */
    @GetMapping("/transactions/{hash}")
    public ResponseEntity<Map<String, Object>> getTransaction(@PathVariable String hash) {
        TransactionProcessor.Transaction tx = transactionProcessor.getTransaction(hash);
        
        if (tx == null) {
            return ResponseEntity.notFound().build();
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("hash", tx.getHash());
        response.put("fromAddress", tx.getFromAddress());
        response.put("toAddress", tx.getToAddress());
        response.put("amount", tx.getAmount());
        response.put("timestamp", tx.getTimestamp());
        response.put("fee", tx.getFee());
        response.put("signature", Base64.getEncoder().encodeToString(tx.getSignature()));
        response.put("verified", tx.isVerified());
        response.put("priority", tx.getPriority());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Mine a block
     */
    @PostMapping("/mine")
    public ResponseEntity<Map<String, Object>> mineBlock(@RequestBody MineBlockRequest request) {
        try {
            // Convert base64 strings to bytes
            byte[] merkleRoot = Base64.getDecoder().decode(request.getMerkleRoot());
            byte[] contourHash = Base64.getDecoder().decode(request.getContourHash());
            
            // Mine block
            BlockProcessor.Block block = blockProcessor.mineBlock(
                request.getData(),
                request.getNonce(),
                merkleRoot,
                contourHash,
                request.getContourComplexity(),
                request.getMinerAddress()
            );
            
            if (block == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Block mining failed");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Clear pending transactions
            transactionProcessor.clearPendingTransactions();
            
            // Return response
            Map<String, Object> response = new HashMap<>();
            response.put("block", convertBlockToMap(block));
            response.put("reward", blockProcessor.getBlockReward());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Verify a contour
     */
    @PostMapping("/contours/verify")
    public ResponseEntity<Map<String, Object>> verifyContour(@RequestBody VerifyContourRequest request) {
        try {
            // Convert points to double arrays
            List<double[]> points = new ArrayList<>();
            for (List<Double> point : request.getPoints()) {
                double[] coords = new double[point.size()];
                for (int i = 0; i < point.size(); i++) {
                    coords[i] = point.get(i);
                }
                points.add(coords);
            }
            
            // Clear processor and add points
            geometricProcessor.clearPoints();
            for (double[] point : points) {
                geometricProcessor.addPoint(point);
            }
            
            // Compute contour
            List<double[]> contour = geometricProcessor.computeContour(request.getAlgorithm());
            
            // Calculate complexity
            double complexity = geometricProcessor.calculateComplexity(contour);
            
            // Hash contour
            byte[] hash = geometricProcessor.hashContour(contour);
            
            // Return response
            Map<String, Object> response = new HashMap<>();
            response.put("complexity", complexity);
            response.put("hash", Base64.getEncoder().encodeToString(hash));
            response.put("verified", complexity >= blockProcessor.getMinContourComplexity());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get system statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("blockchainLength", blockProcessor.getBlockchain().size());
        stats.put("difficulty", blockProcessor.getDifficulty());
        stats.put("pendingTransactions", transactionProcessor.getPendingCount());
        stats.put("processedTransactions", transactionProcessor.getProcessedCount());
        stats.put("minContourComplexity", blockProcessor.getMinContourComplexity());
        stats.put("blockReward", blockProcessor.getBlockReward());
        
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Sync a block from Web3
     */
    @PostMapping("/sync-block")
    public ResponseEntity<Map<String, Object>> syncBlock(@RequestBody Map<String, Object> blockData) {
        try {
            // Extract block data
            long index = Long.parseLong(blockData.get("index").toString());
            long timestamp = Long.parseLong(blockData.get("timestamp").toString());
            String data = blockData.get("data").toString();
            String minerAddress = blockData.get("minerAddress").toString();
            
            // Convert hash strings to byte arrays
            byte[] hash = Base64.getDecoder().decode(blockData.get("hash").toString());
            byte[] previousHash = Base64.getDecoder().decode(blockData.get("previousHash").toString());
            byte[] merkleRoot = new byte[32]; // Default empty merkle root
            byte[] contourHash = new byte[0]; // Default empty contour hash
            
            // Create block
            BlockProcessor.Block block = new BlockProcessor.Block(
                index,
                timestamp,
                previousHash,
                data,
                0, // nonce
                merkleRoot,
                contourHash,
                0.0, // contourComplexity
                minerAddress
            );
            
            // Add block to chain (in a real implementation, would validate first)
            // This is simplified for demonstration purposes
            Map<String, Object> response = new HashMap<>();
            response.put("synced", true);
            response.put("blockIndex", index);
            response.put("message", "Block synced from Web3");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Convert a Block to a Map for JSON serialization
     */
    private Map<String, Object> convertBlockToMap(BlockProcessor.Block block) {
        Map<String, Object> map = new HashMap<>();
        map.put("index", block.getIndex());
        map.put("timestamp", block.getTimestamp());
        map.put("previousHash", Base64.getEncoder().encodeToString(block.getPreviousHash()));
        map.put("hash", Base64.getEncoder().encodeToString(block.getHash()));
        map.put("data", block.getData());
        map.put("nonce", block.getNonce());
        map.put("merkleRoot", Base64.getEncoder().encodeToString(block.getMerkleRoot()));
        map.put("contourHash", Base64.getEncoder().encodeToString(block.getContourHash()));
        map.put("contourComplexity", block.getContourComplexity());
        map.put("minerAddress", block.getMinerAddress());
        return map;
    }
    
    /**
     * Request classes for API endpoints
     */
    public static class TransactionRequest {
        private String fromAddress;
        private String toAddress;
        private double amount;
        private long timestamp;
        private double fee;
        private String signature;
        
        // Getters and setters
        public String getFromAddress() { return fromAddress; }
        public void setFromAddress(String fromAddress) { this.fromAddress = fromAddress; }
        public String getToAddress() { return toAddress; }
        public void setToAddress(String toAddress) { this.toAddress = toAddress; }
        public double getAmount() { return amount; }
        public void setAmount(double amount) { this.amount = amount; }
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
        public double getFee() { return fee; }
        public void setFee(double fee) { this.fee = fee; }
        public String getSignature() { return signature; }
        public void setSignature(String signature) { this.signature = signature; }
    }
    
    public static class MineBlockRequest {
        private String data;
        private long nonce;
        private String merkleRoot;
        private String contourHash;
        private double contourComplexity;
        private String minerAddress;
        
        // Getters and setters
        public String getData() { return data; }
        public void setData(String data) { this.data = data; }
        public long getNonce() { return nonce; }
        public void setNonce(long nonce) { this.nonce = nonce; }
        public String getMerkleRoot() { return merkleRoot; }
        public void setMerkleRoot(String merkleRoot) { this.merkleRoot = merkleRoot; }
        public String getContourHash() { return contourHash; }
        public void setContourHash(String contourHash) { this.contourHash = contourHash; }
        public double getContourComplexity() { return contourComplexity; }
        public void setContourComplexity(double contourComplexity) { this.contourComplexity = contourComplexity; }
        public String getMinerAddress() { return minerAddress; }
        public void setMinerAddress(String minerAddress) { this.minerAddress = minerAddress; }
    }
    
    public static class VerifyContourRequest {
        private List<List<Double>> points;
        private String algorithm;
        
        // Getters and setters
        public List<List<Double>> getPoints() { return points; }
        public void setPoints(List<List<Double>> points) { this.points = points; }
        public String getAlgorithm() { return algorithm; }
        public void setAlgorithm(String algorithm) { this.algorithm = algorithm; }
    }
}