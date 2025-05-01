import React, { FC, useState } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import idl from '../target/idl/solana_dapp.json';
import type { Counter as CounterType } from '../target/types/solana_dapp';

const programID = new PublicKey('11111111111111111111111111111111');
const opts = {
  preflightCommitment: 'processed' as const,
};

export const Counter: FC = () => {
  const [count, setCount] = useState<number | null>(null);
  const wallet = useAnchorWallet();

  const getProvider = () => {
    if (!wallet) {
      return null;
    }
    const connection = new Connection('https://api.devnet.solana.com', opts.preflightCommitment);
    const provider = new AnchorProvider(connection, wallet, opts);
    return provider;
  };

  const initialize = async () => {
    const provider = getProvider();
    if (!provider) return;

    try {
      const program = new Program<CounterType>(idl, programID, provider);
      const counterAccount = web3.Keypair.generate();

      await program.methods
        .initialize()
        .accounts({
          counter: counterAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([counterAccount])
        .rpc();

      const account = await program.account.counter.fetch(counterAccount.publicKey);
      setCount(account.count.toNumber());
    } catch (err) {
      console.error('Error initializing counter:', err);
    }
  };

  const increment = async () => {
    const provider = getProvider();
    if (!provider || count === null) return;

    try {
      const program = new Program<CounterType>(idl, programID, provider);
      await program.methods
        .increment()
        .accounts({
          counter: provider.wallet.publicKey,
        })
        .rpc();

      const account = await program.account.counter.fetch(provider.wallet.publicKey);
      setCount(account.count.toNumber());
    } catch (err) {
      console.error('Error incrementing counter:', err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Solana Counter</h2>
      {!wallet ? (
        <p>Please connect your wallet</p>
      ) : count === null ? (
        <button
          onClick={initialize}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Initialize Counter
        </button>
      ) : (
        <div>
          <p className="text-xl mb-4">Count: {count}</p>
          <button
            onClick={increment}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Increment
          </button>
        </div>
      )}
    </div>
  );
}; 