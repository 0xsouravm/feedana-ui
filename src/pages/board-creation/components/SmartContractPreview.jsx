import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SmartContractPreview = ({ formData, privacySettings, fundingData, onDeploy }) => {
  const [gasEstimate, setGasEstimate] = useState({
    deployment: 0.0045,
    initialization: 0.0012,
    total: 0.0057
  });
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    // Simulate wallet connection check
    const checkWalletConnection = () => {
      const connected = Math.random() > 0.3; // 70% chance of being connected
      setIsConnected(connected);
      if (connected) {
        setWalletAddress('7x9k...m4n2');
      }
    };

    checkWalletConnection();
  }, []);

  const contractParameters = [
    { label: 'Board Title', value: formData?.title || 'Untitled Board' },
    { label: 'Category', value: formData?.category || 'general' },
    { label: 'Duration', value: `${formData?.duration || 30} days` },
    { label: 'Target Responses', value: formData?.targetResponses || 100 },
    { label: 'Anonymity Level', value: privacySettings?.anonymityLevel || 'basic' },
    { label: 'Rate Limiting', value: privacySettings?.rateLimit || 'none' },
    { label: 'Moderation', value: privacySettings?.moderation || 'none' },
    { label: 'Deposit Amount', value: `${fundingData?.depositAmount || '0'} ${fundingData?.currency || 'SOL'}` },
    { label: 'Incentive Model', value: fundingData?.incentiveModel || 'none' }
  ];

  const securityFeatures = [
    { name: 'Stealth Addresses', enabled: privacySettings?.stealthAddresses, icon: 'Eye' },
    { name: 'Proof of Humanity', enabled: privacySettings?.proofOfHumanity, icon: 'UserCheck' },
    { name: 'Reputation Tracking', enabled: privacySettings?.reputationTracking, icon: 'Star' },
    { name: 'Auto Refunds', enabled: fundingData?.autoRefund, icon: 'RefreshCw' },
    { name: 'Quality Bonuses', enabled: fundingData?.qualityBonuses, icon: 'Award' },
    { name: 'Zero-Knowledge Proofs', enabled: privacySettings?.zkProofs, icon: 'Shield' }
  ];

  const handleConnectWallet = () => {
    setIsConnected(true);
    setWalletAddress('7x9k...m4n2');
  };

  const handleDeploy = () => {
    if (onDeploy) {
      onDeploy({
        formData,
        privacySettings,
        fundingData,
        gasEstimate,
        walletAddress
      });
    }
  };

  return (
    <div className="glass-card p-8 rounded-2xl">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
          <Icon name="Code" size={20} className="text-accent" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">Smart Contract Preview</h3>
          <p className="text-sm text-muted-foreground">Review configuration before blockchain deployment</p>
        </div>
      </div>
      <div className="space-y-6">
        {/* Wallet Connection Status */}
        <div className={`rounded-xl p-4 border ${
          isConnected 
            ? 'bg-success/10 border-success/20' :'bg-warning/10 border-warning/20'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon 
                name={isConnected ? "CheckCircle" : "AlertCircle"} 
                size={20} 
                className={isConnected ? "text-success" : "text-warning"} 
              />
              <div>
                <h4 className="text-sm font-medium text-foreground">
                  {isConnected ? 'Wallet Connected' : 'Wallet Not Connected'}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {isConnected ? `Address: ${walletAddress}` : 'Connect wallet to deploy contract'}
                </p>
              </div>
            </div>
            {!isConnected && (
              <Button
                variant="outline"
                size="sm"
                iconName="Wallet"
                iconPosition="left"
                onClick={handleConnectWallet}
              >
                Connect
              </Button>
            )}
          </div>
        </div>

        {/* Contract Parameters */}
        <div className="bg-background/50 rounded-xl p-6 border border-border/50">
          <h4 className="text-lg font-medium text-foreground mb-4">Contract Parameters</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contractParameters?.map((param, index) => (
              <div key={index} className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">{param?.label}</span>
                <span className="text-sm font-mono text-foreground">{param?.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Features */}
        <div className="bg-background/50 rounded-xl p-6 border border-border/50">
          <h4 className="text-lg font-medium text-foreground mb-4">Security Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {securityFeatures?.map((feature, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-2">
                  <Icon name={feature?.icon} size={16} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">{feature?.name}</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  feature?.enabled ? 'bg-success' : 'bg-muted-foreground/30'
                }`}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Gas Estimation */}
        <div className="bg-background/50 rounded-xl p-6 border border-border/50">
          <h4 className="text-lg font-medium text-foreground mb-4">Gas Estimation</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Contract Deployment</span>
              <span className="text-sm font-mono text-foreground">{gasEstimate?.deployment} SOL</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Initialization</span>
              <span className="text-sm font-mono text-foreground">{gasEstimate?.initialization} SOL</span>
            </div>
            <div className="border-t border-border/50 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-base font-medium text-foreground">Total Gas Cost</span>
                <span className="text-base font-mono font-medium text-accent">{gasEstimate?.total} SOL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contract Code Preview */}
        <div className="bg-background/50 rounded-xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-foreground">Contract Code Preview</h4>
            <Button variant="ghost" size="sm" iconName="Copy" iconPosition="left">
              Copy
            </Button>
          </div>
          <div className="bg-black/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <pre className="text-muted-foreground">
{`use anchor_lang::prelude::*;

#[program]
pub mod anon_feedback {
    use super::*;
    
    pub fn initialize_board(
        ctx: Context<InitializeBoard>,
        title: String,
        category: String,
        duration: u64,
        anonymity_level: u8,
        deposit_amount: u64,
    ) -> Result<()> {
        let board = &mut ctx.accounts.board;
        board.title = title;
        board.category = category;
        board.duration = duration;
        board.anonymity_level = anonymity_level;
        board.deposit_amount = deposit_amount;
        board.creator = ctx.accounts.creator.key();
        board.created_at = Clock::get()?.unix_timestamp;
        Ok(())
    }
}`}
            </pre>
          </div>
        </div>

        {/* Deployment Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            size="lg"
            iconName="FileText"
            iconPosition="left"
            className="flex-1"
          >
            Save as Draft
          </Button>
          
          <Button
            variant="default"
            size="lg"
            iconName="Rocket"
            iconPosition="left"
            className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
            disabled={!isConnected}
            onClick={handleDeploy}
          >
            Deploy Contract
          </Button>
        </div>

        {/* Deployment Notice */}
        <div className="bg-warning/10 rounded-xl p-4 border border-warning/20">
          <div className="flex items-start space-x-3">
            <Icon name="AlertTriangle" size={16} className="text-warning mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">Deployment Notice</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Contract deployment is irreversible once confirmed</li>
                <li>• All configuration parameters will be immutable</li>
                <li>• Gas fees are non-refundable regardless of deployment outcome</li>
                <li>• Ensure all settings are correct before proceeding</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartContractPreview;