import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletReadyState } from '@solana/wallet-adapter-base';

const WalletDebugger = () => {
  const { wallets, wallet, connected, connecting, publicKey } = useWallet();

  return (
    <div className="fixed bottom-4 right-4 bg-background border border-border rounded-lg p-4 max-w-sm text-xs space-y-2 z-50">
      <h3 className="font-semibold">Wallet Debug Info</h3>
      
      <div>
        <span className="font-medium">Status:</span> 
        {connected ? 'Connected' : connecting ? 'Connecting...' : 'Disconnected'}
      </div>
      
      {publicKey && (
        <div>
          <span className="font-medium">Public Key:</span> 
          <div className="font-mono text-xs break-all">
            {publicKey.toString()}
          </div>
        </div>
      )}
      
      {wallet && (
        <div>
          <span className="font-medium">Current Wallet:</span> {wallet.adapter.name}
        </div>
      )}
      
      <div>
        <span className="font-medium">Available Wallets:</span>
        <div className="space-y-1 mt-1">
          {wallets.map((w) => (
            <div key={w.adapter.name} className="flex justify-between">
              <span>{w.adapter.name}</span>
              <span className={
                w.readyState === WalletReadyState.Installed ? 'text-green-500' :
                w.readyState === WalletReadyState.Loadable ? 'text-yellow-500' :
                'text-red-500'
              }>
                {w.readyState === WalletReadyState.Installed ? 'Installed' :
                 w.readyState === WalletReadyState.Loadable ? 'Loadable' :
                 'Not Detected'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WalletDebugger;