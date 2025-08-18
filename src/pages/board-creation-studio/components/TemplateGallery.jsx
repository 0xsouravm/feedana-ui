import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TemplateGallery = ({ onTemplateSelect, selectedTemplate }) => {
  const [activeCategory, setActiveCategory] = useState('all');

  const templates = [
    {
      id: 'employee-feedback',
      name: 'Employee Feedback',
      category: 'workplace',
      description: 'Anonymous feedback for workplace culture, management, and processes',
      icon: 'Users',
      features: ['Enhanced Privacy', 'Auto-moderation', 'Weekly Reports'],
      successMetrics: '87% response rate, 4.2/5 satisfaction',
      estimatedSetup: '5 minutes',
      config: {
        title: 'Anonymous Employee Feedback',
        description: `Share your honest thoughts about our workplace culture, management practices, and processes.\n\nYour feedback is completely anonymous and helps us create a better work environment for everyone.`,
        category: 'employee-feedback',
        duration: 30,
        targetResponses: 50,
        anonymityLevel: 'enhanced',
        rateLimit: 'weekly',
        moderation: 'auto',
        incentiveModel: 'fixed',
        depositAmount: '5.0',
        currency: 'USDC'
      }
    },
    {
      id: 'product-reviews',
      name: 'Product Reviews',
      category: 'business',
      description: 'Honest product feedback without fear of retaliation or bias',
      icon: 'Package',
      features: ['Basic Privacy', 'Quality Bonuses', 'Real-time Analytics'],
      successMetrics: '92% completion rate, 3.8/5 quality score',
      estimatedSetup: '3 minutes',
      config: {
        title: 'Anonymous Product Review',
        description: `Help us improve our products with your honest feedback.\n\nShare your experience, suggestions, and concerns without revealing your identity.`,
        category: 'product-reviews',
        duration: 14,
        targetResponses: 100,
        anonymityLevel: 'basic',
        rateLimit: 'daily',
        moderation: 'none',
        incentiveModel: 'tiered',
        depositAmount: '10.0',
        currency: 'SOL'
      }
    },
    {
      id: 'community-input',
      name: 'Community Input',
      category: 'community',
      description: 'Gather community opinions on decisions and initiatives',
      icon: 'MessageSquare',
      features: ['Basic Privacy', 'Lottery Rewards', 'Public Results'],
      successMetrics: '76% participation rate, 4.1/5 engagement',
      estimatedSetup: '4 minutes',
      config: {
        title: 'Community Decision Input',
        description: `Your voice matters in shaping our community decisions.\n\nShare your thoughts and ideas anonymously to help guide our future direction.`,
        category: 'community-input',
        duration: 21,
        targetResponses: 200,
        anonymityLevel: 'basic',
        rateLimit: 'daily',
        moderation: 'manual',
        incentiveModel: 'lottery',
        depositAmount: '15.0',
        currency: 'USDC'
      }
    },
    {
      id: 'whistleblower',
      name: 'Whistleblower Portal',
      category: 'security',
      description: 'Maximum security for reporting sensitive issues safely',
      icon: 'Shield',
      features: ['Maximum Security', 'Zero-Knowledge Proofs', 'Legal Protection'],
      successMetrics: '95% anonymity confidence, 100% security record',
      estimatedSetup: '8 minutes',
      config: {
        title: 'Secure Whistleblower Portal',
        description: `Report concerns, violations, or sensitive issues with complete anonymity.\n\nYour identity is protected by advanced cryptographic methods and legal safeguards.`,
        category: 'whistleblower',
        duration: 90,
        targetResponses: 10,
        anonymityLevel: 'maximum',
        rateLimit: 'none',
        moderation: 'manual',
        incentiveModel: 'none',
        depositAmount: '0',
        currency: 'SOL'
      }
    },
    {
      id: 'customer-service',
      name: 'Customer Service',
      category: 'business',
      description: 'Honest feedback about customer service experiences',
      icon: 'Headphones',
      features: ['Enhanced Privacy', 'Auto-categorization', 'Response Tracking'],
      successMetrics: '89% response rate, 4.0/5 actionability',
      estimatedSetup: '3 minutes',
      config: {
        title: 'Customer Service Feedback',
        description: `Help us improve our customer service by sharing your experience.\n\nYour feedback is anonymous and directly impacts service quality improvements.`,
        category: 'customer-service',
        duration: 7,
        targetResponses: 75,
        anonymityLevel: 'enhanced',
        rateLimit: 'hourly',
        moderation: 'auto',
        incentiveModel: 'fixed',
        depositAmount: '7.5',
        currency: 'USDC'
      }
    },
    {
      id: 'research-survey',
      name: 'Research Survey',
      category: 'research',
      description: 'Academic or market research with privacy protection',
      icon: 'BarChart3',
      features: ['Enhanced Privacy', 'Data Export', 'Statistical Analysis'],
      successMetrics: '82% completion rate, 4.3/5 data quality',
      estimatedSetup: '6 minutes',
      config: {
        title: 'Anonymous Research Survey',
        description: `Participate in our research study with complete privacy protection.\n\nYour responses contribute to valuable insights while maintaining your anonymity.`,
        category: 'research-survey',
        duration: 45,
        targetResponses: 300,
        anonymityLevel: 'enhanced',
        rateLimit: 'none',
        moderation: 'none',
        incentiveModel: 'fixed',
        depositAmount: '25.0',
        currency: 'USDC'
      }
    }
  ];

  const categories = [
    { id: 'all', name: 'All Templates', icon: 'Grid3X3' },
    { id: 'workplace', name: 'Workplace', icon: 'Building' },
    { id: 'business', name: 'Business', icon: 'Briefcase' },
    { id: 'community', name: 'Community', icon: 'Users' },
    { id: 'security', name: 'Security', icon: 'Shield' },
    { id: 'research', name: 'Research', icon: 'Search' }
  ];

  const filteredTemplates = activeCategory === 'all' 
    ? templates 
    : templates?.filter(template => template?.category === activeCategory);

  const getPrivacyColor = (level) => {
    switch (level) {
      case 'basic': return 'text-warning';
      case 'enhanced': return 'text-accent';
      case 'maximum': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="glass-card p-8 rounded-2xl">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
          <Icon name="Layout" size={20} className="text-accent" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">Template Gallery</h3>
          <p className="text-sm text-muted-foreground">Start with proven configurations for common use cases</p>
        </div>
      </div>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories?.map((category) => (
          <button
            key={category?.id}
            onClick={() => setActiveCategory(category?.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
              activeCategory === category?.id
                ? 'bg-accent/10 text-accent border border-accent/20' :'text-muted-foreground hover:text-foreground hover:bg-muted/30'
            }`}
          >
            <Icon name={category?.icon} size={16} />
            <span className="text-sm font-medium">{category?.name}</span>
          </button>
        ))}
      </div>
      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates?.map((template) => (
          <div
            key={template?.id}
            className={`bg-background/50 rounded-xl p-6 border transition-all duration-300 hover:shadow-lg cursor-pointer ${
              selectedTemplate?.id === template?.id
                ? 'border-accent/50 bg-accent/5' :'border-border/50 hover:border-accent/30'
            }`}
            onClick={() => onTemplateSelect(template)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-muted/30 rounded-xl flex items-center justify-center">
                  <Icon name={template?.icon} size={20} className="text-foreground" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-foreground">{template?.name}</h4>
                  <p className="text-xs text-muted-foreground">{template?.estimatedSetup} setup</p>
                </div>
              </div>
              {selectedTemplate?.id === template?.id && (
                <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                  <Icon name="Check" size={14} className="text-accent-foreground" />
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-4">{template?.description}</p>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Privacy Level</span>
                <span className={`text-xs font-medium ${getPrivacyColor(template?.config?.anonymityLevel)}`}>
                  {template?.config?.anonymityLevel?.charAt(0)?.toUpperCase() + template?.config?.anonymityLevel?.slice(1)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Target Responses</span>
                <span className="text-xs font-medium text-foreground">{template?.config?.targetResponses}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Duration</span>
                <span className="text-xs font-medium text-foreground">{template?.config?.duration} days</span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <h5 className="text-xs font-medium text-foreground">Key Features</h5>
              <div className="flex flex-wrap gap-1">
                {template?.features?.map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-muted/20 rounded-md text-xs text-muted-foreground"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-muted/10 rounded-lg p-3 mb-4">
              <h5 className="text-xs font-medium text-foreground mb-1">Success Metrics</h5>
              <p className="text-xs text-muted-foreground">{template?.successMetrics}</p>
            </div>

            <Button
              variant={selectedTemplate?.id === template?.id ? "default" : "outline"}
              size="sm"
              fullWidth
              iconName={selectedTemplate?.id === template?.id ? "Check" : "Plus"}
              iconPosition="left"
              className={selectedTemplate?.id === template?.id ? "bg-accent text-accent-foreground" : ""}
            >
              {selectedTemplate?.id === template?.id ? "Selected" : "Use Template"}
            </Button>
          </div>
        ))}
      </div>
      {filteredTemplates?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h4 className="text-lg font-medium text-foreground mb-2">No templates found</h4>
          <p className="text-sm text-muted-foreground">Try selecting a different category</p>
        </div>
      )}
      <div className="mt-8 bg-background/30 rounded-xl p-4 border border-border/50">
        <div className="flex items-start space-x-3">
          <Icon name="Lightbulb" size={16} className="text-accent mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-foreground mb-1">Template Benefits</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Pre-configured privacy settings based on use case requirements</li>
              <li>• Optimized incentive structures proven to increase response quality</li>
              <li>• Battle-tested configurations with real success metrics</li>
              <li>• Faster setup with intelligent defaults you can customize</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateGallery;