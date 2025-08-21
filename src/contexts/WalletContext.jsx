import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { 
  PhantomWalletAdapter, 
  SolflareWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';

export const WalletContextProvider = ({ children }) => {
  // Configure the network - use mainnet for production, devnet for development
  const network = process.env.NODE_ENV === 'production' ? 'mainnet-beta' : 'devnet';
  const endpoint = useMemo(() => {
    try {
      // Use custom RPC endpoint for better reliability
      if (process.env.NODE_ENV === 'production') {
        return 'https://api.mainnet-beta.solana.com';
      }
      return clusterApiUrl(network);
    } catch (error) {
      console.error('Error getting endpoint:', error);
      return 'https://api.devnet.solana.com';
    }
  }, [network]);
  
  // Configure wallet adapters with error handling for deployment
  const wallets = useMemo(() => {
    try {
      console.log('Initializing wallet adapters for environment:', process.env.NODE_ENV);
      
      const adapters = [];
      
      // Only add wallets that are available
      try {
        adapters.push(new PhantomWalletAdapter());
      } catch (e) {
        console.warn('Phantom wallet not available:', e.message);
      }
      
      try {
        adapters.push(new SolflareWalletAdapter());
      } catch (e) {
        console.warn('Solflare wallet not available:', e.message);
      }
      
      console.log('Wallet adapters created successfully:', adapters.length);
      return adapters;
    } catch (error) {
      console.error('Error initializing wallet adapters:', error);
      return [];
    }
  }, []);

  return (
    <ConnectionProvider 
      endpoint={endpoint}
      config={{
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000,
      }}
    >
      <WalletProvider 
        wallets={wallets} 
        autoConnect={false}
        onError={(error) => {
          console.error('Wallet error:', error);
          // Don't throw errors in production
          if (process.env.NODE_ENV === 'development') {
            console.warn('Wallet connection error (dev mode):', error.message);
          }
        }}
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};