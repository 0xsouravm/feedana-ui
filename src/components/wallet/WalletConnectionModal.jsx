import React, { useState, useCallback, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletReadyState } from '@solana/wallet-adapter-base';
import Icon from '../AppIcon';
import Button from '../ui/Button';

const WalletConnectionModal = ({ isOpen, onClose }) => {
  const { wallets, select, connect, connected, disconnect, publicKey, connecting, wallet } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const lastSelectedWallet = useRef(null);

  const handleWalletSelect = useCallback(async (walletName) => {
    if (isConnecting || connecting) return;
    
    setError(null);
    setIsConnecting(true);
    
    try {
      // Find the wallet
      const targetWallet = wallets.find(w => w.adapter.name === walletName);
      if (!targetWallet) {
        throw new Error(`${walletName} wallet not found`);
      }
      
      if (targetWallet.readyState === WalletReadyState.NotDetected) {
        throw new Error(`${walletName} is not installed. Please install it first.`);
      }
      
      // Simple: just select and connect
      select(walletName);
      await connect();
      
      onClose();
      
    } catch (error) {
      console.error('Connection error:', error);
      
      // Handle user cancellation
      if (error.message && (
        error.message.toLowerCase().includes('user rejected') ||
        error.message.toLowerCase().includes('user denied') ||
        error.message.toLowerCase().includes('cancelled')
      )) {
        onClose();
        return;
      }
      
      setError('Connection failed. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  }, [wallets, select, connect, onClose]);

  const handleDisconnect = async () => {
    try {
      await disconnect();
      onClose();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const getWalletIcon = (walletName) => {
    switch (walletName.toLowerCase()) {
      case 'phantom':
        return '/assets/images/phantom-icon.png';
      case 'solflare':
        return '/assets/images/solflare-icon.svg';
      case 'metamask':
        return '/assets/images/metamask-icon.png';
      default:
        return '/assets/images/phantom-icon.png';
    }
  };

  const getWalletStatus = (wallet) => {
    switch (wallet.readyState) {
      case WalletReadyState.Installed:
        return { text: 'Detected', color: 'text-success' };
      case WalletReadyState.Loadable:
        return { text: 'Available', color: 'text-muted-foreground' };
      case WalletReadyState.NotDetected:
        return { text: 'Not Detected', color: 'text-destructive' };
      default:
        return { text: 'Unknown', color: 'text-muted-foreground' };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="glass-card p-6 rounded-2xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            {connected ? 'Wallet Connected' : 'Connect Wallet'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        {connected ? (
          <div className="space-y-4">
            <div className="p-4 bg-success/10 rounded-xl border border-success/20">
              <div className="flex items-center space-x-3 mb-2">
                <Icon name="CheckCircle" size={20} className="text-success" />
                <span className="font-medium text-foreground">Connected</span>
              </div>
              <p className="text-sm text-muted-foreground font-mono">
                {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
              </p>
            </div>
            <Button
              variant="outline"
              fullWidth
              onClick={handleDisconnect}
              iconName="LogOut"
              iconPosition="left"
            >
              Disconnect Wallet
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl mb-4">
                <div className="flex items-center space-x-2">
                  <Icon name="AlertCircle" size={16} className="text-destructive" />
                  <span className="text-sm text-destructive">{error}</span>
                </div>
              </div>
            )}
            
            <p className="text-muted-foreground text-sm mb-4">
              Choose a wallet to connect with:
            </p>
            
            {/* Available/Installed Wallets */}
            {wallets
              .filter(wallet => 
                wallet.readyState === WalletReadyState.Installed || 
                wallet.readyState === WalletReadyState.Loadable
              )
              .filter(wallet => {
                // Only show Phantom and Solflare (remove MetaMask for now)
                const walletName = wallet.adapter?.name || wallet.name;
                return ['Phantom', 'Solflare'].includes(walletName);
              })
              .reduce((unique, wallet) => {
                // Remove duplicates by name only
                const walletName = wallet.adapter?.name || wallet.name;
                if (!unique.find(w => (w.adapter?.name || w.name) === walletName)) {
                  unique.push(wallet);
                }
                return unique;
              }, [])
              .map((wallet) => {
                const status = getWalletStatus(wallet);
                return (
                  <button
                    key={wallet.adapter.name}
                    onClick={() => handleWalletSelect(wallet.adapter.name)}
                    disabled={isConnecting || connecting}
                    className="w-full flex items-center space-x-4 p-4 rounded-xl border border-border/30 hover:border-accent/30 hover:bg-accent/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <img 
                      src={getWalletIcon(wallet.adapter.name)} 
                      alt={wallet.adapter.name}
                      className="w-6 h-6" 
                    />
                    <div className="text-left flex-1">
                      <div className="font-medium text-foreground">
                        {wallet.adapter.name}
                      </div>
                      <div className={`text-sm ${status.color}`}>
                        {status.text}
                      </div>
                    </div>
                    {(isConnecting || connecting) && (
                      <Icon name="Loader2" size={16} className="text-accent animate-spin" />
                    )}
                  </button>
                );
              })}

            {/* Not Detected Wallets */}
            {wallets
              .filter(wallet => wallet.readyState === WalletReadyState.NotDetected)
              .filter(wallet => {
                // Only show Phantom and Solflare (remove MetaMask for now)
                const walletName = wallet.adapter?.name || wallet.name;
                return ['Phantom', 'Solflare'].includes(walletName);
              })
              .reduce((unique, wallet) => {
                // Remove duplicates by name only
                const walletName = wallet.adapter?.name || wallet.name;
                if (!unique.find(w => (w.adapter?.name || w.name) === walletName)) {
                  unique.push(wallet);
                }
                return unique;
              }, []).length > 0 && (
              <div className="mt-6">
                <p className="text-muted-foreground text-sm mb-3">
                  Install a wallet to get started:
                </p>
                {wallets
                  .filter(wallet => wallet.readyState === WalletReadyState.NotDetected)
                  .filter(wallet => {
                    // Only show the 3 wallets we want
                    const walletName = wallet.adapter?.name || wallet.name;
                    return ['Phantom', 'Solflare', 'MetaMask'].includes(walletName);
                  })
                  .reduce((unique, wallet) => {
                    // Remove duplicates by name only
                    const walletName = wallet.adapter?.name || wallet.name;
                    if (!unique.find(w => (w.adapter?.name || w.name) === walletName)) {
                      unique.push(wallet);
                    }
                    return unique;
                  }, [])
                  .map((wallet) => (
                    <button
                      key={wallet.adapter.name}
                      onClick={() => window.open(wallet.adapter.url, '_blank')}
                      className="w-full flex items-center space-x-4 p-4 rounded-xl border border-border/30 hover:border-accent/30 hover:bg-accent/5 transition-all duration-200"
                    >
                      <img 
                        src={getWalletIcon(wallet.adapter.name)} 
                        alt={wallet.adapter.name}
                        className="w-6 h-6 opacity-50" 
                      />
                      <div className="text-left flex-1">
                        <div className="font-medium text-foreground">
                          Install {wallet.adapter.name}
                        </div>
                        <div className="text-sm text-destructive">
                          Not detected
                        </div>
                      </div>
                      <Icon name="ExternalLink" size={16} className="text-muted-foreground" />
                    </button>
                  ))}
              </div>
            )}
            
            {/* If no wallets are available at all */}
            {wallets.length === 0 && (
              <div className="text-center py-8">
                <Icon name="Wallet" size={48} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No wallets configured</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletConnectionModal;