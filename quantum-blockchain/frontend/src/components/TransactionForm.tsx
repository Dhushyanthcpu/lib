import { useState } from 'react';
import { verifyTransactionOnChain } from '../utils/quantum_bridge';

export default function TransactionForm() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const data = {
        sender: '0x123...',
        recipient: '0x456...',
        amount: 100,
        fee: 10,
        timestamp: Math.floor(Date.now() / 1000),
        balance: 1000,
        expectedHash: '12345678'.repeat(8)
      };
      const response = await verifyTransactionOnChain(data);
      setResult(response);
    } catch (error) {
      console.error('Error verifying transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Quantum Transaction Verification</h2>
      <button
        onClick={handleVerify}
        disabled={loading}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {loading ? 'Verifying...' : 'Verify Transaction'}
      </button>
      {result && (
        <div className="mt-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold">Verification Result</h3>
            <p className="text-sm text-gray-600">Valid: {result.valid.toString()}</p>
            <p className="text-sm text-gray-600">Transaction Hash: {result.tx_hash}</p>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold">Quantum Circuit</h3>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
              {result.circuit_diagram}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
} 