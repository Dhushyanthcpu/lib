import { Transaction } from '../Block';
import { SupportedLanguage, DEFAULT_LANGUAGE } from '../types/SupportedLanguage';
import { FidelityMLWorkflow } from './FidelityMLWorkflow';
import { OpenAI } from 'openai';
import { Anthropic } from 'anthropic';

// Initialize API clients with environment variables
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface LLMConfig {
    model: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
    provider: 'openai' | 'anthropic';
}

interface ANNConfig {
    layers: number[];
    activationFunction: string;
    optimizer: string;
    learningRate: number;
    batchSize: number;
    epochs: number;
}

export class GenAIWorkflow {
    private llmConfig: LLMConfig;
    private annConfig: ANNConfig;
    private language: SupportedLanguage;
    private transactionHistory: Transaction[];
    private modelCache: Map<string, any>;
    private predictionCache: Map<string, any>;
    private fidelityMLWorkflow: FidelityMLWorkflow;

    constructor(language: SupportedLanguage = DEFAULT_LANGUAGE) {
        this.language = language;
        this.transactionHistory = [];
        this.modelCache = new Map();
        this.predictionCache = new Map();
        
        // Initialize Fidelity ML Workflow
        this.fidelityMLWorkflow = new FidelityMLWorkflow();

        // Initialize LLM configuration
        this.llmConfig = {
            model: 'llama-2-70b',
            temperature: 0.7,
            maxTokens: 2048,
            topP: 0.9,
            frequencyPenalty: 0.5,
            presencePenalty: 0.5,
            provider: 'openai'
        };

        // Initialize ANN configuration
        this.annConfig = {
            layers: [128, 256, 512, 256, 128],
            activationFunction: 'relu',
            optimizer: 'adam',
            learningRate: 0.001,
            batchSize: 32,
            epochs: 100
        };
    }

    public setLanguage(language: SupportedLanguage): void {
        this.language = language;
    }

    public getLanguage(): SupportedLanguage {
        return this.language;
    }

    private getPromptTemplate(type: string): string {
        const templates: Record<SupportedLanguage, Record<string, string>> = {
            [SupportedLanguage.ENGLISH]: {
                transactionAnalysis: "Analyzing transaction pattern for potential risks...",
                fraudDetection: "Checking for suspicious activity patterns...",
                riskAssessment: "Evaluating overall risk level...",
                anomalyDetection: "Scanning for unusual behavior patterns...",
                default: "Analyze transaction of {{amount}} at {{timestamp}} with context: {{context}}"
            },
            [SupportedLanguage.SPANISH]: {
                transactionAnalysis: "Analizando el patrón de transacción para detectar riesgos potenciales...",
                fraudDetection: "Verificando patrones de actividad sospechosa...",
                riskAssessment: "Evaluando nivel de riesgo general...",
                anomalyDetection: "Escaneando patrones de comportamiento inusuales...",
                default: "Analizar transacción de {{amount}} en {{timestamp}} con contexto: {{context}}"
            },
            [SupportedLanguage.CHINESE]: {
                transactionAnalysis: "正在分析交易模式以识别潜在风险...",
                fraudDetection: "正在检查可疑活动模式...",
                riskAssessment: "正在评估整体风险水平...",
                anomalyDetection: "正在扫描异常行为模式...",
                default: "分析交易：金额{{amount}}，时间{{timestamp}}，上下文：{{context}}"
            }
        };
        return templates[this.language]?.[type] || templates[DEFAULT_LANGUAGE][type] || templates[DEFAULT_LANGUAGE].default;
    }

    public async analyzeTransaction(transaction: Transaction): Promise<{
        risk: number;
        anomaly: boolean;
        recommendation: string;
        confidence: number;
    }> {
        // Add transaction to history
        this.transactionHistory.push(transaction);

        // Get LLM analysis
        const llmAnalysis = await this.performLLMAnalysis(transaction);

        // Get ANN prediction
        const annPrediction = await this.performANNPrediction(transaction);
        
        // Get Fidelity ML Workflow analysis
        const fidelityAnalysis = await this.performFidelityMLAnalysis(transaction);

        // Combine insights from all models
        return this.combineInsights(llmAnalysis, annPrediction, fidelityAnalysis);
    }
    
    /**
     * Perform analysis using the Fidelity ML Workflow
     * @param transaction The transaction to analyze
     * @returns Analysis result from Fidelity ML Workflow
     */
    private async performFidelityMLAnalysis(transaction: Transaction): Promise<any> {
        try {
            // Use the Fidelity ML Workflow to analyze the transaction
            const analysis = await this.fidelityMLWorkflow.analyzeTransaction(transaction);
            
            return {
                risk: analysis.risk,
                anomaly: analysis.anomaly,
                explanation: analysis.explanation,
                confidence: analysis.confidence
            };
        } catch (error) {
            console.error('Fidelity ML Analysis Error:', error);
            return null;
        }
    }

    private async performLLMAnalysis(transaction: Transaction): Promise<any> {
        const prompt = this.generateAnalysisPrompt(transaction);
        
        try {
            // Use the appropriate client based on configuration
            if (this.llmConfig.provider === 'openai') {
                const response = await openaiClient.chat.completions.create({
                    model: this.llmConfig.model,
                    messages: [{ role: "user", content: prompt }],
                    temperature: this.llmConfig.temperature,
                    max_tokens: this.llmConfig.maxTokens,
                    top_p: this.llmConfig.topP,
                    frequency_penalty: this.llmConfig.frequencyPenalty,
                    presence_penalty: this.llmConfig.presencePenalty
                });
                
                return this.parseOpenAIResponse(response);
            } else {
                const response = await anthropicClient.messages.create({
                    model: this.llmConfig.model,
                    max_tokens: this.llmConfig.maxTokens,
                    messages: [{ role: "user", content: prompt }]
                });
                
                return this.parseAnthropicResponse(response);
            }
        } catch (error) {
            console.error('LLM Analysis Error:', error);
            return null;
        }
    }

    private generateAnalysisPrompt(transaction: Transaction): string {
        const context = this.getTransactionContext(transaction);
        const template = this.getPromptTemplate('default');
        
        return template
            .replace('{{amount}}', transaction.amount.toString())
            .replace('{{timestamp}}', transaction.timestamp?.toString() || '')
            .replace('{{context}}', JSON.stringify(context));
    }

    private getTransactionContext(transaction: Transaction): any {
        // Implementation for getting transaction context
        return {
            recentTransactions: this.transactionHistory.slice(-5),
            // Add more context as needed
        };
    }

    private async performANNPrediction(transaction: Transaction): Promise<any> {
        // Implementation for ANN prediction
        return {
            risk: Math.random(),
            anomaly: Math.random() > 0.8,
            confidence: Math.random()
        };
    }

    private combineInsights(llmAnalysis: any, annPrediction: any, fidelityAnalysis: any): any {
        // Implementation for combining insights from all three models
        // Calculate weighted risk score
        const llmWeight = 0.3;
        const annWeight = 0.3;
        const fidelityWeight = 0.4; // Higher weight for the more sophisticated Fidelity model
        
        const weightedRisk = 
            (llmAnalysis?.risk || 0) * llmWeight + 
            (annPrediction?.risk || 0) * annWeight + 
            (fidelityAnalysis?.risk || 0) * fidelityWeight;
            
        // Determine anomaly status (if any model detects an anomaly)
        const anomalyDetected = 
            (annPrediction?.anomaly || false) || 
            (fidelityAnalysis?.anomaly || false);
            
        // Combine confidence scores
        const weightedConfidence = 
            (llmAnalysis?.confidence || 0) * llmWeight + 
            (annPrediction?.confidence || 0) * annWeight + 
            (fidelityAnalysis?.confidence || 0) * fidelityWeight;
            
        // Generate comprehensive recommendation
        let recommendation = llmAnalysis?.explanation || 'No LLM recommendation available';
        
        // Add Fidelity ML insights if available
        if (fidelityAnalysis?.explanation) {
            recommendation += '\n\nFidelity ML Analysis: ' + fidelityAnalysis.explanation;
        }
        
        return {
            risk: weightedRisk,
            anomaly: anomalyDetected,
            recommendation: recommendation,
            confidence: weightedConfidence
        };
    }
}
