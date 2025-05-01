'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Block, Transaction } from '@/lib/quantum-blockchain/core';
import { ErrorCorrectionData } from '@/lib/quantum-blockchain/error-correction';

interface MonitorProps {
  blockchain: any; // Replace with actual blockchain type
  onError: (error: Error) => void;
}

export function QuantumBlockchainMonitor({ blockchain, onError }: MonitorProps) {
  const [currentBlock, setCurrentBlock] = useState<Block | null>(null);
  const [errorCorrectionData, setErrorCorrectionData] = useState<ErrorCorrectionData | null>(null);
  const [entanglementStrength, setEntanglementStrength] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState({
    blockHeight: 0,
    errorRate: 0,
    quantumSignatureStrength: 0,
    networkHealth: 0
  });

  useEffect(() => {
    const updateMonitor = async () => {
      try {
        // Get latest block
        const latestBlock = blockchain.getLatestBlock();
        setCurrentBlock(latestBlock);

        // Get error correction data
        const errorData = await blockchain.errorCorrection.process();
        setErrorCorrectionData(errorData);

        // Get entanglement strength
        const strength = blockchain.entanglement.getEntanglementStrength();
        setEntanglementStrength(strength);

        // Get pending transactions
        const pendingTx = blockchain.getPendingTransactions();
        setTransactions(pendingTx);

        // Update metrics
        setMetrics({
          blockHeight: blockchain.getChain().length,
          errorRate: errorData.errorRate,
          quantumSignatureStrength: calculateSignatureStrength(latestBlock),
          networkHealth: calculateNetworkHealth(errorData, strength)
        });
      } catch (error) {
        onError(error as Error);
      }
    };

    // Update every 5 seconds
    const interval = setInterval(updateMonitor, 5000);
    updateMonitor(); // Initial update

    return () => clearInterval(interval);
  }, [blockchain]);

  const calculateSignatureStrength = (block: Block | null): number => {
    if (!block) return 0;
    // Calculate quantum signature strength (0-100)
    const signature = block.quantumSignature;
    const entropy = calculateEntropy(signature);
    return Math.min(entropy * 10, 100);
  };

  const calculateEntropy = (signature: string): number => {
    const freq: { [key: string]: number } = {};
    for (const char of signature) {
      freq[char] = (freq[char] || 0) + 1;
    }
    
    let entropy = 0;
    const len = signature.length;
    for (const count of Object.values(freq)) {
      const p = count / len;
      entropy -= p * Math.log2(p);
    }
    
    return entropy;
  };

  const calculateNetworkHealth = (
    errorData: ErrorCorrectionData | null,
    entanglementStrength: number
  ): number => {
    if (!errorData) return 0;
    
    // Combine error rate, entanglement strength, and correction success
    const errorFactor = 1 - errorData.errorRate;
    const entanglementFactor = entanglementStrength;
    const correctionFactor = calculateCorrectionSuccess(errorData);
    
    return (errorFactor * 0.4 + entanglementFactor * 0.3 + correctionFactor * 0.3) * 100;
  };

  const calculateCorrectionSuccess = (errorData: ErrorCorrectionData): number => {
    const history = errorData.correctionHistory;
    if (history.length === 0) return 1;
    
    const successCount = history.filter(event => event.success).length;
    return successCount / history.length;
  };

  const getHealthColor = (value: number): string => {
    if (value >= 90) return 'text-green-500';
    if (value >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Quantum Blockchain Monitor</span>
          <Badge 
            variant={metrics.networkHealth >= 70 ? "success" : "destructive"}
            className="ml-2"
          >
            {metrics.networkHealth >= 70 ? "Healthy" : "Warning"}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="errors">Error Correction</TabsTrigger>
            <TabsTrigger value="entanglement">Entanglement</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Block Height</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics.blockHeight}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Network Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getHealthColor(metrics.networkHealth)}`}>
                    {metrics.networkHealth.toFixed(1)}%
                  </div>
                  <Progress value={metrics.networkHealth} className="mt-2" />
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Latest Block</CardTitle>
              </CardHeader>
              <CardContent>
                
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="errors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Error Correction Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Physical Error Rate</span>
                      <span className={getHealthColor(100 - errorCorrectionData?.errorRate! * 100)}>
                        {(errorCorrectionData?.errorRate! * 100).toFixed(3)}%
                      </span>
                    </div>
                    <Progress 
                      value={100 - errorCorrectionData?.errorRate! * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {errorCorrectionData?.correctionHistory.slice(-4).map((event, i) => (
                      <div key={i} className="p-2 border rounded">
                        <div className="flex items-center justify-between">
                          <Badge variant={event.success ? "success" : "destructive"}>
                            {event.type} Error
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="mt-1 text-sm">
                          Location: [{event.location.join(', ')}]
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="entanglement" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Quantum Entanglement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Entanglement Strength</span>
                      <span className={getHealthColor(entanglementStrength * 100)}>
                        {(entanglementStrength * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={entanglementStrength * 100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Quantum Signature Strength</span>
                      <span className={getHealthColor(metrics.quantumSignatureStrength)}>
                        {metrics.quantumSignatureStrength.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={metrics.quantumSignatureStrength} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Pending Transactions ({transactions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {transactions.map((tx, i) => (
                    <div key={i} className="p-2 border rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm">
                          {tx.from.slice(0, 8)}...{tx.from.slice(-6)}
                        </span>
                        <span className="text-sm">→</span>
                        <span className="font-mono text-sm">
                          {tx.to.slice(0, 8)}...{tx.to.slice(-6)}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">Amount</span>
                        <span className="text-sm font-medium">{tx.amount}</span>
                      </div>
                    </div>
                  ))}
                  
                  {transactions.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      No pending transactions
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 