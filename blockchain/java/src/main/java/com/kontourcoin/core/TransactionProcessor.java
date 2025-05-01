package com.kontourcoin.core;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.PriorityBlockingQueue;
import java.util.Comparator;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.nio.ByteBuffer;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Processes transactions for the Kontour Coin blockchain
 * Handles transaction verification, prioritization, and batch processing
 */
public class TransactionProcessor {
    
    private final GeometricProcessor geometricProcessor;
    private final PriorityBlockingQueue<Transaction> pendingTransactions;
    private final ConcurrentHashMap<String, Transaction> transactionMap;
    private final AtomicLong processedCount = new AtomicLong(0);
    
    /**
     * Constructor for TransactionProcessor
     * 
     * @param dimensions Number of dimensions for geometric processing
     * @param precision Precision level for calculations
     * @param tolerance Error tolerance for verification
     */
    public TransactionProcessor(int dimensions, double precision, double tolerance) {
        this.geometricProcessor = new GeometricProcessor(dimensions, precision, tolerance);
        this.pendingTransactions = new PriorityBlockingQueue<>(100, 
            Comparator.comparingDouble(Transaction::getPriority).reversed());
        this.transactionMap = new ConcurrentHashMap<>();
    }
    
    /**
     * Add a transaction to the processing queue
     * 
     * @param transaction Transaction to add
     * @return Transaction hash
     */
    public String addTransaction(Transaction transaction) {
        // Calculate transaction hash
        String hash = calculateTransactionHash(transaction);
        transaction.setHash(hash);
        
        // Calculate transaction priority
        double priority = calculateTransactionPriority(transaction);
        transaction.setPriority(priority);
        
        // Add to queue and map
        pendingTransactions.add(transaction);
        transactionMap.put(hash, transaction);
        
        return hash;
    }
    
    /**
     * Calculate the hash of a transaction
     * 
     * @param transaction Transaction to hash
     * @return Transaction hash as a hex string
     */
    private String calculateTransactionHash(Transaction transaction) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            
            // Combine transaction data
            ByteBuffer buffer = ByteBuffer.allocate(1024);
            buffer.put(transaction.getFromAddress().getBytes());
            buffer.put(transaction.getToAddress().getBytes());
            buffer.putDouble(transaction.getAmount());
            buffer.putLong(transaction.getTimestamp());
            buffer.putDouble(transaction.getFee());
            buffer.put(transaction.getSignature());
            
            // Calculate hash
            byte[] hash = digest.digest(buffer.array());
            
            // Convert to hex string
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
    
    /**
     * Calculate the priority of a transaction
     * 
     * @param transaction Transaction to prioritize
     * @return Priority value (higher is more important)
     */
    private double calculateTransactionPriority(Transaction transaction) {
        // Base priority on fee and amount
        double feeFactor = transaction.getFee() / transaction.getAmount();
        
        // Add geometric complexity factor
        // Convert signature to points
        List<double[]> signaturePoints = geometricProcessor.signatureToPoints(transaction.getSignature());
        geometricProcessor.clearPoints();
        for (double[] point : signaturePoints) {
            geometricProcessor.addPoint(point);
        }
        List<double[]> contour = geometricProcessor.computeContour("bezier");
        double complexity = geometricProcessor.calculateComplexity(contour) / 100.0;
        
        // Combine factors
        return feeFactor * 0.7 + complexity * 0.3;
    }
    
    /**
     * Verify a transaction using geometric verification
     * 
     * @param transactionHash Hash of the transaction to verify
     * @return Whether the transaction is valid
     */
    public boolean verifyTransaction(String transactionHash) {
        Transaction transaction = transactionMap.get(transactionHash);
        if (transaction == null) {
            return false;
        }
        
        // Prepare data for verification
        ByteBuffer buffer = ByteBuffer.allocate(1024);
        buffer.put(transaction.getFromAddress().getBytes());
        buffer.put(transaction.getToAddress().getBytes());
        buffer.putDouble(transaction.getAmount());
        buffer.putLong(transaction.getTimestamp());
        buffer.putDouble(transaction.getFee());
        
        // Verify signature
        boolean isValid = geometricProcessor.verifySignature(
            buffer.array(),
            transaction.getSignature()
        );
        
        // Update transaction status
        transaction.setVerified(isValid);
        
        // Update processed count
        processedCount.incrementAndGet();
        
        return isValid;
    }
    
    /**
     * Get the next batch of transactions for processing
     * 
     * @param batchSize Maximum number of transactions to include
     * @return List of transaction hashes
     */
    public List<String> getNextBatch(int batchSize) {
        List<String> batch = new ArrayList<>();
        List<Transaction> tempList = new ArrayList<>();
        
        // Get up to batchSize transactions
        Transaction tx;
        while (batch.size() < batchSize && (tx = pendingTransactions.poll()) != null) {
            batch.add(tx.getHash());
            tempList.add(tx);
        }
        
        // Put transactions back in the queue
        pendingTransactions.addAll(tempList);
        
        return batch;
    }
    
    /**
     * Get a transaction by hash
     * 
     * @param hash Transaction hash
     * @return Transaction object or null if not found
     */
    public Transaction getTransaction(String hash) {
        return transactionMap.get(hash);
    }
    
    /**
     * Get the number of pending transactions
     * 
     * @return Number of pending transactions
     */
    public int getPendingCount() {
        return pendingTransactions.size();
    }
    
    /**
     * Get the number of processed transactions
     * 
     * @return Number of processed transactions
     */
    public long getProcessedCount() {
        return processedCount.get();
    }
    
    /**
     * Clear all pending transactions
     */
    public void clearPendingTransactions() {
        pendingTransactions.clear();
    }
    
    /**
     * Transaction class for internal use
     */
    public static class Transaction {
        private String fromAddress;
        private String toAddress;
        private double amount;
        private long timestamp;
        private double fee;
        private byte[] signature;
        private String hash;
        private double priority;
        private boolean verified;
        
        public Transaction(String fromAddress, String toAddress, double amount, 
                          long timestamp, double fee, byte[] signature) {
            this.fromAddress = fromAddress;
            this.toAddress = toAddress;
            this.amount = amount;
            this.timestamp = timestamp;
            this.fee = fee;
            this.signature = signature;
            this.verified = false;
        }
        
        // Getters and setters
        public String getFromAddress() { return fromAddress; }
        public String getToAddress() { return toAddress; }
        public double getAmount() { return amount; }
        public long getTimestamp() { return timestamp; }
        public double getFee() { return fee; }
        public byte[] getSignature() { return signature; }
        public String getHash() { return hash; }
        public void setHash(String hash) { this.hash = hash; }
        public double getPriority() { return priority; }
        public void setPriority(double priority) { this.priority = priority; }
        public boolean isVerified() { return verified; }
        public void setVerified(boolean verified) { this.verified = verified; }
    }
}