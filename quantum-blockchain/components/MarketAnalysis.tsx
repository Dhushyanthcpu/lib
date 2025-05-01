import { FC, useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MarketData {
  timestamp: number;
  price: number;
  prediction: number;
}

const MarketAnalysis: FC = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const API_KEY = '0fcc0912-6c4d-426d-bcda-bb2b7d0c6b48';

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/solana/market_chart?vs_currency=usd&days=7&interval=daily`,
          {
            headers: {
              'X-CG-API-KEY': API_KEY
            }
          }
        );
        const data = await response.json();
        
        // Process data and add AI predictions
        const processedData = data.prices.map((item: [number, number], index: number) => ({
          timestamp: item[0],
          price: item[1],
          prediction: item[1] * (1 + Math.random() * 0.1) // Simulated AI prediction
        }));
        
        setMarketData(processedData);
      } catch (error) {
        console.error('Error fetching market data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: marketData.map(item => new Date(item.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'Actual Price',
        data: marketData.map(item => item.price),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'AI Prediction',
        data: marketData.map(item => item.prediction),
        borderColor: 'rgb(255, 99, 132)',
        borderDash: [5, 5],
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Solana Price Analysis & AI Predictions'
      }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading market data...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Market Analysis</h2>
      <div className="h-96">
        <Line data={chartData} options={options} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold">Current Price</h3>
          <p className="text-2xl">${marketData[marketData.length - 1]?.price.toFixed(2)}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold">AI Prediction</h3>
          <p className="text-2xl">${marketData[marketData.length - 1]?.prediction.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default MarketAnalysis; 