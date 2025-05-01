import { FC } from 'react';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import WalletConnection from '../components/WalletConnection';
import Swap from '../components/Swap';
import MarketAnalysis from '../components/MarketAnalysis';

const Home: FC = () => {
  const wallets = [new PhantomWalletAdapter()];

  return (
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
          <div className="relative py-3 sm:max-w-4xl sm:mx-auto">
            <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
              <div className="max-w-4xl mx-auto">
                <div className="divide-y divide-gray-200">
                  <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                    <WalletConnection />
                    <div className="mt-8">
                      <MarketAnalysis />
                    </div>
                    <div className="mt-8">
                      <Swap
                        fromToken="SOL"
                        toToken="USDC"
                        rate={20.5} // Example rate
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </WalletModalProvider>
    </WalletProvider>
  );
};

export default Home; 