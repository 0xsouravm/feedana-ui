import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import Icon from '../AppIcon';
import Button from './Button';
import WalletConnectionModal from '../wallet/WalletConnectionModal';

const Header = ({ isCollapsed = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Use wallet hook with error handling
  let connected = false;
  let publicKey = null;
  let disconnect = null;
  
  try {
    const walletState = useWallet();
    connected = walletState.connected || false;
    publicKey = walletState.publicKey || null;
    disconnect = walletState.disconnect || null;
  } catch (error) {
    console.error('Wallet hook error:', error);
    // Continue with default values
  }

  const handleCreateBoard = () => {
    navigate('/board-creation-studio');
  };

  const handleWalletClick = () => {
    if (connected && disconnect) {
      disconnect();
    } else {
      setIsWalletModalOpen(true);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems = [
    {
      name: 'Home',
      path: '/homepage-anonymous-blockchain-feedback-platform',
      icon: 'Home'
    },
    {
      name: 'Feedback Boards',
      path: '/feedback-theater-board-viewing',
      icon: 'Eye'
    }
  ];


  const isActivePath = (path) => location?.pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'backdrop-sanctuary border-b border-border/50' :'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 pt-2">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link 
              to="/homepage-anonymous-blockchain-feedback-platform" 
              className="flex items-center space-x-3 group"
            >
              <div className="relative">
                <img 
                  src="/assets/images/logo.svg" 
                  alt="Feedana Logo" 
                  className="w-10 h-10 group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-bold tracking-tight">
                  Feedana
                </span>
                {/* <span className="text-xs text-muted-foreground font-mono">
                  v2.1.0
                </span> */}
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden lg:flex items-center justify-center space-x-1 absolute left-1/2 transform -translate-x-1/2">
            {navigationItems?.map((item) => (
              <Link
                key={item?.name}
                to={item?.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 group ${
                  isActivePath(item?.path)
                    ? 'bg-accent/10 text-accent border border-accent/20' :'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon 
                  name={item?.icon} 
                  size={18} 
                  className={`transition-colors duration-300 ${
                    isActivePath(item?.path) ? 'text-accent' : 'group-hover:text-foreground'
                  }`}
                />
                <span className="font-medium">{item?.name}</span>
                {isActivePath(item?.path) && (
                  <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></div>
                )}
              </Link>
            ))}

          </nav>

          {/* CTA Section */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              iconName={connected ? "CheckCircle" : "Wallet"}
              iconPosition="left"
              className={connected ? "text-success hover:text-success" : "text-muted-foreground hover:text-foreground"}
              onClick={handleWalletClick}
            >
              {connected ? `${publicKey?.toString().slice(0, 4)}...${publicKey?.toString().slice(-4)}` : "Connect Wallet"}
            </Button>
            
            <Button
              variant="default"
              size="sm"
              iconName="Plus"
              iconPosition="left"
              className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow"
              onClick={handleCreateBoard}
            >
              Create Board
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300"
          >
            <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={24} />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden glass-card mx-6 mb-4 rounded-2xl overflow-hidden">
            <div className="p-4 space-y-2">
              {navigationItems?.map((item) => (
                <Link
                  key={item?.name}
                  to={item?.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActivePath(item?.path)
                      ? 'bg-accent/10 text-accent border border-accent/20' :'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  <Icon name={item?.icon} size={20} />
                  <span className="font-medium">{item?.name}</span>
                  {isActivePath(item?.path) && (
                    <div className="ml-auto w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                  )}
                </Link>
              ))}

              <div className="border-t border-border/50 pt-4 mt-4 space-y-3">
                <Button
                  variant="outline"
                  fullWidth
                  iconName={connected ? "CheckCircle" : "Wallet"}
                  iconPosition="left"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleWalletClick();
                  }}
                >
                  {connected ? `${publicKey?.toString().slice(0, 4)}...${publicKey?.toString().slice(-4)}` : "Connect Wallet"}
                </Button>
                
                <Button
                  variant="default"
                  fullWidth
                  iconName="Plus"
                  iconPosition="left"
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleCreateBoard();
                  }}
                >
                  Create Board
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wallet Connection Modal */}
      <WalletConnectionModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
      />
    </header>
  );
};

export default Header;