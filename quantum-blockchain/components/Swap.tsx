import { FC, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';

interface SwapProps {
  fromToken: string;
  toToken: string;
  rate: number;
}

const Swap: FC<SwapProps> = ({ fromToken, toToken, rate }) => {
  const { publicKey, sendTransaction } = useWallet();
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSwap = async () => {
    if (!publicKey || !amount) return;

    try {
      setLoading(true);
      // Here you would implement the actual swap logic
      // This is a placeholder for the swap implementation
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      
      // Create and send transaction
      const transaction = new Transaction();
      // Add your swap instructions here
      
      const signature = await sendTransaction(transaction, connection);
      console.log('Swap successful! Signature:', signature);
    } catch (error) {
      console.error('Swap failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Swap Tokens</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">From</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter amount"
          />
          <span className="text-sm text-gray-500">{fromToken}</span>
        </div>
        
        <div className="text-center">
          <span className="text-gray-500">↓</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">To</label>
          <div className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
            {amount ? (parseFloat(amount) * rate).toFixed(6) : '0'} {toToken}
          </div>
        </div>

        <button
          onClick={handleSwap}
          disabled={!publicKey || !amount || loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            !publicKey || !amount || loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {loading ? 'Swapping...' : 'Swap'}
        </button>
      </div>
    </div>
  );
};

export default Swap; 