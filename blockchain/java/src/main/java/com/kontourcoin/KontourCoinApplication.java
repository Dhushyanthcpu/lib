package com.kontourcoin;

import com.kontourcoin.core.BlockProcessor;
import com.kontourcoin.core.GeometricProcessor;
import com.kontourcoin.core.TransactionProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main application class for Kontour Coin Java backend
 */
@SpringBootApplication
@EnableScheduling
public class KontourCoinApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(KontourCoinApplication.class, args);
    }
    
    /**
     * Create GeometricProcessor bean
     */
    @Bean
    public GeometricProcessor geometricProcessor() {
        // 3 dimensions, 0.01 precision, 0.05 tolerance
        return new GeometricProcessor(3, 0.01, 0.05);
    }
    
    /**
     * Create TransactionProcessor bean
     */
    @Bean
    public TransactionProcessor transactionProcessor(GeometricProcessor geometricProcessor) {
        // 3 dimensions, 0.01 precision, 0.05 tolerance
        return new TransactionProcessor(3, 0.01, 0.05);
    }
    
    /**
     * Create BlockProcessor bean
     */
    @Bean
    public BlockProcessor blockProcessor(GeometricProcessor geometricProcessor) {
        // 3 dimensions, 0.01 precision, 0.05 tolerance
        // Initial difficulty 4, min complexity 75, block reward 50, target block time 10 minutes
        return new BlockProcessor(3, 0.01, 0.05, 4, 75.0, 50, 600000);
    }
}