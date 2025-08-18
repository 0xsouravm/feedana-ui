import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { 
  PhantomWalletAdapter, 
  SolflareWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

export const WalletContextProvider = ({ children }) => {
  // Configure the network
  const network = 'devnet';
  const endpoint = useMemo(() => clusterApiUrl(network), []);
  
  // Configure wallet adapters - Back to simple working configuration
  const wallets = useMemo(() => {
    try {
      console.log('Initializing wallet adapters...');
      
      const adapters = [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
      ];
      
      console.log('Wallet adapters created successfully:', adapters.length);
      return adapters;
    } catch (error) {
      console.error('Error initializing wallet adapters:', error);
      return [];
    }
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};