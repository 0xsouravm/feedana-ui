import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const FundingMechanismSection = ({ fundingData, onFundingChange, errors }) => {
  const [estimatedCosts, setEstimatedCosts] = useState({
    platformFee: 0,
    gasFee: 0,
    total: 0
  });

  const currencyOptions = [
    { value: 'SOL', label: 'SOL', description: 'Solana native token' },
    { value: 'USDC', label: 'USDC', description: 'USD Coin stablecoin' },
    { value: 'USDT', label: 'USDT', description: 'Tether stablecoin' }
  ];

  const incentiveModels = [
    { value: 'fixed', label: 'Fixed Reward', description: 'Same amount for each quality response' },
    { value: 'tiered', label: 'Tiered Rewards', description: 'Higher rewards for better feedback' },
    { value: 'lottery', label: 'Lottery System', description: 'Random rewards to encourage participation' },
    { value: 'none', label: 'No Incentives', description: 'Rely on intrinsic motivation only' }
  ];

  const handleFundingChange = (field, value) => {
    onFundingChange({ ...fundingData, [field]: value });
  };

  useEffect(() => {
    const depositAmount = parseFloat(fundingData?.depositAmount) || 0;
    const platformFee = depositAmount * 0.025; // 2.5% platform fee
    const gasFee = 0.001; // Estimated SOL gas fee
    const total = depositAmount + platformFee + gasFee;

    setEstimatedCosts({
      platformFee: platformFee?.toFixed(4),
      gasFee: gasFee?.toFixed(4),
      total: total?.toFixed(4)
    });
  }, [fundingData?.depositAmount]);

  return (
    <div className="glass-card p-8 rounded-2xl">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
          <Icon name="Wallet" size={20} className="text-accent" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">Funding Mechanism</h3>
          <p className="text-sm text-muted-foreground">Set up deposits and incentives for quality feedback</p>
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-background/50 rounded-xl p-6 border border-accent/20">
          <div className="flex items-start space-x-3 mb-4">
            <Icon name="Info" size={20} className="text-accent mt-0.5" />
            <div>
              <h4 className="text-lg font-medium text-foreground mb-2">How Funding Works</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• <strong className="text-foreground">Deposit:</strong> Funds are held in escrow to incentivize quality responses</p>
                <p>• <strong className="text-foreground">Distribution:</strong> Automatically distributed based on your chosen model</p>
                <p>• <strong className="text-foreground">Refunds:</strong> Unused funds returned when board closes</p>
                <p>• <strong className="text-foreground">Protection:</strong> Smart contracts ensure transparent, fair distribution</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Deposit Amount"
            type="number"
            placeholder="10.0"
            value={fundingData?.depositAmount}
            onChange={(e) => handleFundingChange('depositAmount', e?.target?.value)}
            error={errors?.depositAmount}
            description="Total amount to deposit for incentives"
            min="0.1"
            step="0.1"
            required
          />

          <Select
            label="Currency"
            description="Choose your preferred token for payments"
            options={currencyOptions}
            value={fundingData?.currency}
            onChange={(value) => handleFundingChange('currency', value)}
            error={errors?.currency}
            required
          />
        </div>

        <Select
          label="Incentive Model"
          description="How should rewards be distributed to contributors?"
          options={incentiveModels}
          value={fundingData?.incentiveModel}
          onChange={(value) => handleFundingChange('incentiveModel', value)}
          error={errors?.incentiveModel}
          required
        />

        {fundingData?.incentiveModel === 'fixed' && (
          <Input
            label="Reward per Response"
            type="number"
            placeholder="0.1"
            value={fundingData?.rewardPerResponse}
            onChange={(e) => handleFundingChange('rewardPerResponse', e?.target?.value)}
            error={errors?.rewardPerResponse}
            description="Fixed amount paid for each quality response"
            min="0.01"
            step="0.01"
          />
        )}

        {fundingData?.incentiveModel === 'tiered' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Basic Reward"
                type="number"
                placeholder="0.05"
                value={fundingData?.basicReward}
                onChange={(e) => handleFundingChange('basicReward', e?.target?.value)}
                description="For standard feedback"
                min="0.01"
                step="0.01"
              />
              <Input
                label="Quality Reward"
                type="number"
                placeholder="0.15"
                value={fundingData?.qualityReward}
                onChange={(e) => handleFundingChange('qualityReward', e?.target?.value)}
                description="For detailed feedback"
                min="0.01"
                step="0.01"
              />
              <Input
                label="Premium Reward"
                type="number"
                placeholder="0.3"
                value={fundingData?.premiumReward}
                onChange={(e) => handleFundingChange('premiumReward', e?.target?.value)}
                description="For exceptional insights"
                min="0.01"
                step="0.01"
              />
            </div>
          </div>
        )}

        {fundingData?.incentiveModel === 'lottery' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Number of Winners"
              type="number"
              placeholder="5"
              value={fundingData?.lotteryWinners}
              onChange={(e) => handleFundingChange('lotteryWinners', e?.target?.value)}
              description="How many contributors will receive rewards"
              min="1"
              max="100"
            />
            <Input
              label="Minimum Responses for Lottery"
              type="number"
              placeholder="20"
              value={fundingData?.minResponsesForLottery}
              onChange={(e) => handleFundingChange('minResponsesForLottery', e?.target?.value)}
              description="Minimum submissions before lottery activates"
              min="5"
            />
          </div>
        )}

        <div className="space-y-4">
          <Checkbox
            label="Enable Quality Bonuses"
            description="Provide additional rewards for exceptionally helpful feedback"
            checked={fundingData?.qualityBonuses}
            onChange={(e) => handleFundingChange('qualityBonuses', e?.target?.checked)}
          />

          <Checkbox
            label="Auto-refund Unused Funds"
            description="Automatically return unused deposits when board closes"
            checked={fundingData?.autoRefund}
            onChange={(e) => handleFundingChange('autoRefund', e?.target?.checked)}
          />

          <Checkbox
            label="Enable Tip Jar"
            description="Allow contributors to receive additional tips from other users"
            checked={fundingData?.tipJar}
            onChange={(e) => handleFundingChange('tipJar', e?.target?.checked)}
          />
        </div>

        <div className="bg-muted/20 rounded-xl p-6 border border-border/50">
          <h4 className="text-lg font-medium text-foreground mb-4">Cost Breakdown</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Deposit Amount</span>
              <span className="text-sm font-mono text-foreground">{fundingData?.depositAmount || '0.0000'} {fundingData?.currency}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Platform Fee (2.5%)</span>
              <span className="text-sm font-mono text-foreground">{estimatedCosts?.platformFee} {fundingData?.currency}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Estimated Gas Fee</span>
              <span className="text-sm font-mono text-foreground">{estimatedCosts?.gasFee} SOL</span>
            </div>
            <div className="border-t border-border/50 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-base font-medium text-foreground">Total Cost</span>
                <span className="text-base font-mono font-medium text-accent">{estimatedCosts?.total} {fundingData?.currency}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-success/10 rounded-xl p-4 border border-success/20">
          <div className="flex items-start space-x-3">
            <Icon name="Shield" size={16} className="text-success mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">Security Guarantee</h4>
              <p className="text-xs text-muted-foreground">
                All funds are held in audited smart contracts. You maintain full control and can withdraw unused funds at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundingMechanismSection;