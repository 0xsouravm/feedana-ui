import React, { useState } from 'react';
import { Checkbox } from '../../../components/ui/Checkbox';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const PrivacyControlsPanel = ({ privacySettings, onPrivacyChange, errors }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const anonymityLevels = [
    { value: 'basic', label: 'Basic Anonymity', description: 'Standard stealth addresses' },
    { value: 'enhanced', label: 'Enhanced Privacy', description: 'Additional mixing protocols' },
    { value: 'maximum', label: 'Maximum Security', description: 'Full cryptographic protection' }
  ];

  const rateLimitOptions = [
    { value: 'none', label: 'No Limits', description: 'Unlimited submissions' },
    { value: 'hourly', label: '1 per Hour', description: 'Prevents spam effectively' },
    { value: 'daily', label: '1 per Day', description: 'Thoughtful responses only' },
    { value: 'weekly', label: '1 per Week', description: 'Maximum consideration time' }
  ];

  const moderationOptions = [
    { value: 'none', label: 'No Moderation', description: 'All feedback appears immediately' },
    { value: 'auto', label: 'Auto-Filter', description: 'AI removes obvious spam/abuse' },
    { value: 'manual', label: 'Manual Review', description: 'You approve each submission' }
  ];

  const handleSettingChange = (field, value) => {
    onPrivacyChange({ ...privacySettings, [field]: value });
  };

  return (
    <div className="glass-card p-8 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
            <Icon name="Shield" size={20} className="text-accent" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Privacy Controls</h3>
            <p className="text-sm text-muted-foreground">Configure anonymity and protection levels</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span className="text-xs text-success font-mono">SECURE</span>
        </div>
      </div>
      <div className="space-y-6">
        <Select
          label="Anonymity Level"
          description="Higher levels provide stronger privacy but may increase transaction costs"
          options={anonymityLevels}
          value={privacySettings?.anonymityLevel}
          onChange={(value) => handleSettingChange('anonymityLevel', value)}
          error={errors?.anonymityLevel}
          required
        />

        <div className="bg-background/50 rounded-xl p-4 border border-accent/20">
          <div className="flex items-center space-x-3 mb-3">
            <Icon name="Eye" size={16} className="text-accent" />
            <span className="text-sm font-medium text-foreground">Preview: How submissions will appear</span>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 bg-gradient-to-br from-accent/50 to-accent/30 rounded-full"></div>
              <span className="text-xs font-mono text-muted-foreground">
                {privacySettings?.anonymityLevel === 'basic' && 'anon_7x9k2m'}
                {privacySettings?.anonymityLevel === 'enhanced' && '***_secure_***'}
                {privacySettings?.anonymityLevel === 'maximum' && '████████'}
              </span>
              <span className="text-xs text-muted-foreground">• 2 minutes ago</span>
            </div>
            <p className="text-sm text-foreground">This is how anonymous feedback will appear to you and others.</p>
          </div>
        </div>

        <Select
          label="Rate Limiting"
          description="Control how frequently the same contributor can submit feedback"
          options={rateLimitOptions}
          value={privacySettings?.rateLimit}
          onChange={(value) => handleSettingChange('rateLimit', value)}
          error={errors?.rateLimit}
        />

        <Select
          label="Moderation Policy"
          description="Choose how submitted feedback is reviewed before publication"
          options={moderationOptions}
          value={privacySettings?.moderation}
          onChange={(value) => handleSettingChange('moderation', value)}
          error={errors?.moderation}
        />

        <div className="space-y-4">
          <Checkbox
            label="Enable Stealth Addresses"
            description="Generate unique addresses for each submission (recommended)"
            checked={privacySettings?.stealthAddresses}
            onChange={(e) => handleSettingChange('stealthAddresses', e?.target?.checked)}
          />

          <Checkbox
            label="Require Proof of Humanity"
            description="Verify contributors are real humans without revealing identity"
            checked={privacySettings?.proofOfHumanity}
            onChange={(e) => handleSettingChange('proofOfHumanity', e?.target?.checked)}
          />

          <Checkbox
            label="Enable Reputation Tracking"
            description="Track anonymous contributor quality without revealing identity"
            checked={privacySettings?.reputationTracking}
            onChange={(e) => handleSettingChange('reputationTracking', e?.target?.checked)}
          />
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 text-sm text-accent hover:text-accent/80 transition-colors duration-200"
        >
          <Icon name={showAdvanced ? "ChevronUp" : "ChevronDown"} size={16} />
          <span>Advanced Privacy Settings</span>
        </button>

        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-border/50">
            <Input
              label="Custom Mixing Rounds"
              type="number"
              placeholder="3"
              value={privacySettings?.mixingRounds}
              onChange={(e) => handleSettingChange('mixingRounds', e?.target?.value)}
              description="Number of cryptographic mixing rounds (higher = more private)"
              min="1"
              max="10"
            />

            <Input
              label="Anonymity Set Size"
              type="number"
              placeholder="100"
              value={privacySettings?.anonymitySetSize}
              onChange={(e) => handleSettingChange('anonymitySetSize', e?.target?.value)}
              description="Minimum number of participants before revealing any data"
              min="10"
              max="1000"
            />

            <Checkbox
              label="Zero-Knowledge Proofs"
              description="Use ZK-SNARKs for maximum privacy (experimental)"
              checked={privacySettings?.zkProofs}
              onChange={(e) => handleSettingChange('zkProofs', e?.target?.checked)}
            />
          </div>
        )}

        <div className="bg-warning/10 rounded-xl p-4 border border-warning/20">
          <div className="flex items-start space-x-3">
            <Icon name="AlertTriangle" size={16} className="text-warning mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">Privacy Notice</h4>
              <p className="text-xs text-muted-foreground">
                Higher privacy levels may increase transaction costs and processing time. 
                All privacy settings are immutable once the board is created.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyControlsPanel;