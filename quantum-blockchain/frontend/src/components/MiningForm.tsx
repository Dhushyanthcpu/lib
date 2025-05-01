import React, { useState } from 'react';
import axios from 'axios';

interface MiningResult {
  nonce: number;
  hash_value: number;
  circuit_diagram: string;
}

interface DifficultyResult {
  difficulty: number;
  circuit_diagram: string;
}

const MiningForm: React.FC = () => {
  const [miningResult, setMiningResult] = useState<MiningResult | null>(null);
  const [difficultyResult, setDifficultyResult] = useState<DifficultyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMine = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:8000/mine_block', {
        block_data: 'block_data_here',
        target_difficulty: 4,
        max_iterations: 100
      });
      setMiningResult(response.data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred while mining');
      console.error('Error mining block:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEstimateDifficulty = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:8000/estimate_difficulty', {
        network_load: 75
      });
      setDifficultyResult(response.data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred while estimating difficulty');
      console.error('Error estimating difficulty:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Quantum Mining</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={handleMine}
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {loading ? 'Mining...' : 'Mine Block'}
        </button>

        <button
          onClick={handleEstimateDifficulty}
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {loading ? 'Estimating...' : 'Estimate Difficulty'}
        </button>

        {miningResult && (
          <div className="mt-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold">Mining Result</h3>
              <p className="text-sm text-gray-600">Nonce: {miningResult.nonce}</p>
              <p className="text-sm text-gray-600">Hash Value: {miningResult.hash_value}</p>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold">Quantum Circuit</h3>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                {miningResult.circuit_diagram}
              </pre>
            </div>
          </div>
        )}

        {difficultyResult && (
          <div className="mt-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold">Difficulty Estimation</h3>
              <p className="text-sm text-gray-600">Difficulty: {difficultyResult.difficulty}</p>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold">Quantum Circuit</h3>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                {difficultyResult.circuit_diagram}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MiningForm; 