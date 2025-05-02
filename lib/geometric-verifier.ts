import axios from 'axios';
import { Transaction } from './transaction';
import { Logger } from './logger';

export class GeometricVerifier {
  private apiUrl: string;
  private logger: Logger;
  private fallbackMode: boolean = false;
  
  /**
   * Create a new geometric verifier
   */
  constructor(apiUrl: string = process.env.GEOMETRIC_API_URL || 'http://localhost:8000/api/verify') {
    this.apiUrl = apiUrl;
    this.logger = new Logger('GeometricVerifier');
  }
  
  /**
   * Verify transaction geometry
   */
  public async verifyTransactionGeometry(transaction: Transaction): Promise<boolean> {
    // Skip verification if no contour data
    if (!transaction.contourData) {
      return true;
    }
    
    try {
      // If in fallback mode, use local verification
      if (this.fallbackMode) {
        return this.localVerification(transaction.contourData);
      }
      
      // Call the geometric verification API
      const response = await axios.post(this.apiUrl, {
        contourData: transaction.contourData,
        transactionHash: transaction.hash
      }, {
        timeout: 5000 // 5 second timeout
      });
      
      return response.data.valid === true;
    } catch (error) {
      this.logger.warn(`API verification failed, switching to fallback mode: ${error instanceof Error ? error.message : String(error)}`);
      
