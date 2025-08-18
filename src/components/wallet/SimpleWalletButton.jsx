import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const SimpleWalletButton = () => {
  const { connected, publicKey } = useWallet();

  return (
    <div className="flex items-center space-x-4">
      <WalletMultiButton className="!bg-accent !text-accent-foreground hover:!bg-accent/90 !px-4 !py-2 !rounded-xl !font-medium !transition-all !duration-200" />
      
      {connected && publicKey && (
        <div className="text-sm text-success font-mono">
          {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
        </div>
      )}
    </div>
  );
};

export default SimpleWalletButton;