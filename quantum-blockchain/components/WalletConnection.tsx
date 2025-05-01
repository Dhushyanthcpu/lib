import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { FC } from 'react';

const WalletConnection: FC = () => {
  const { connected } = useWallet();

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="mb-4">
        <WalletMultiButton className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" />
      </div>
      {connected && (
        <div className="text-green-500">
          Wallet Connected Successfully!
        </div>
      )}
    </div>
  );
};

export default WalletConnection; 