import { QuantumDeepLearningWorkflow } from '../ai/QuantumDeepLearningWorkflow';
import { Transaction } from '../Block';

describe('QuantumDeepLearningWorkflow', () => {
  let quantumDeepLearning: QuantumDeepLearningWorkflow;
  
  beforeEach(() => {
    quantumDeepLearning = new QuantumDeepLearningWorkflow();
  });
  
  test('should analyze transaction', async () => {
    const transaction: Transaction = {
      fromAddress: '0x1234567890123456789012345678901234567890',
      toAddress: '0x0987654321098765432109876543210987654321',
      amount: 100,
      timestamp: Date.now()
    };
    
    const analysis = await quantumDeepLearning.analyzeTransaction(transaction);
    
    expect(analysis).toBeDefined();
    expect(analysis.risk).toBeDefined();
    expect(analysis.risk).toBeGreaterThanOrEqual(0);
    expect(analysis.risk).toBeLessThanOrEqual(1);
    expect(analysis.patterns).toBeDefined();
    expect(analysis.anomalyScore).toBeDefined();
  });
  
  test('should detect anomalies', async () => {
    const normalTransaction: Transaction = {
      fromAddress: '0x1234567890123456789012345678901234567890',
      toAddress: '0x0987654321098765432109876543210987654321',
      amount: 100,
      timestamp: Date.now()
    };
    
    const suspiciousTransaction: Transaction = {
      fromAddress: '0x1234567890123456789012345678901234567890',
      toAddress: '0x0987654321098765432109876543210987654321',
      amount: 1000000, // Very large amount
      timestamp: Date.now()
    };
    
    const normalAnalysis = await quantumDeepLearning.analyzeTransaction(normalTransaction);
    const suspiciousAnalysis = await quantumDeepLearning.analyzeTransaction(suspiciousTransaction);
    
    // Suspicious transaction should have higher risk
    expect(suspiciousAnalysis.risk).toBeGreaterThan(normalAnalysis.risk);
  });
  
  test('should train model', async () => {
    const transactions: Transaction[] = [
      {
        fromAddress: '0x1234567890123456789012345678901234567890',
        toAddress: '0x0987654321098765432109876543210987654321',
        amount: 100,
        timestamp: Date.now() - 3600000
      },
      {
        fromAddress: '0x1234567890123456789012345678901234567890',
        toAddress: '0x0987654321098765432109876543210987654321',
        amount: 200,
        timestamp: Date.now() - 2400000
      },
      {
        fromAddress: '0x1234567890123456789012345678901234567890',
        toAddress: '0x0987654321098765432109876543210987654321',
        amount: 300,
        timestamp: Date.now() - 1200000
      }
    ];
    
    const trainingResult = await quantumDeepLearning.trainModel(transactions);
    
    expect(trainingResult).toBeDefined();
    expect(trainingResult.accuracy).toBeDefined();
    expect(trainingResult.loss).toBeDefined();
    expect(trainingResult.epochs).toBeGreaterThan(0);
  });
  
  test('should predict transaction risk', async () => {
    const transaction: Transaction = {
      fromAddress: '0x1234567890123456789012345678901234567890',
      toAddress: '0x0987654321098765432109876543210987654321',
      amount: 100,
      timestamp: Date.now()
    };
    
    const prediction = await quantumDeepLearning.predictTransactionRisk(transaction);
    
    expect(prediction).toBeDefined();
    expect(prediction.risk).toBeDefined();
    expect(prediction.risk).toBeGreaterThanOrEqual(0);
    expect(prediction.risk).toBeLessThanOrEqual(1);
    expect(prediction.confidence).toBeDefined();
    expect(prediction.confidence).toBeGreaterThanOrEqual(0);
    expect(prediction.confidence).toBeLessThanOrEqual(1);
  });
  
  test('should get model metrics', () => {
    const metrics = quantumDeepLearning.getModelMetrics();
    
    expect(metrics).toBeDefined();
    expect(metrics.accuracy).toBeDefined();
    expect(metrics.parameters).toBeDefined();
    expect(metrics.lastTrainingTime).toBeDefined();
  });
});