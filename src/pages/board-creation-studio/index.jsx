import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import WalletConnectionModal from '../../components/wallet/WalletConnectionModal';
import { useChainlinkScroll } from '../../hooks/useChainlinkScroll';

const BoardCreationStudio = () => {
  const navigate = useNavigate();
  
  // Wallet connection
  const { connected, connecting } = useWallet();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  
  // Initialize Chainlink-style resistance scrolling
  useChainlinkScroll();
  const [isDeploying, setIsDeploying] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Form data with category
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ''
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  // Categories for dropdown with icons
  const categories = [
    { value: 'product', label: 'Product Feedback', icon: 'Package', description: 'Get feedback on your products and features' },
    { value: 'service', label: 'Service Feedback', icon: 'Users', description: 'Improve your service quality and customer experience' },
    { value: 'website', label: 'Website Feedback', icon: 'Globe', description: 'Enhance your website design and functionality' },
    { value: 'app', label: 'App Feedback', icon: 'Smartphone', description: 'Optimize your mobile or web application' },
    { value: 'event', label: 'Event Feedback', icon: 'Calendar', description: 'Gather insights from event attendees' },
    { value: 'team', label: 'Team Feedback', icon: 'Users2', description: 'Internal feedback for team improvements' },
    { value: 'course', label: 'Course/Training', icon: 'BookOpen', description: 'Educational content and training feedback' },
    { value: 'support', label: 'Customer Support', icon: 'Headphones', description: 'Improve your customer support experience' },
    { value: 'general', label: 'General Feedback', icon: 'MessageSquare', description: 'Open feedback on any topic' },
    { value: 'other', label: 'Other', icon: 'MoreHorizontal', description: 'Custom feedback category' }
  ];

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData?.title?.trim()) newErrors.title = 'Board title is required';
    if (!formData?.description?.trim()) newErrors.description = 'Description is required';
    if (!formData?.category?.trim()) newErrors.category = 'Category is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  // Handle board creation
  const handleCreate = async () => {
    if (!connected) {
      setIsWalletModalOpen(true);
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setIsDeploying(true);
    
    // Simulate creation process
    setTimeout(() => {
      setIsDeploying(false);
      // Navigate to feedback theater
      navigate('/feedback-theater-board-viewing');
    }, 2000);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background overflow-x-hidden chainlink-container">
        <main className="pt-16 overflow-x-hidden momentum-container">
        {/* Enhanced Hero Section */}
        <section className="section-padding py-20 text-center">
          <div className="max-w-6xl mx-auto">
            <div className="inline-flex items-center space-x-2 glass-card px-4 py-2 rounded-full mb-6">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm font-mono text-muted-foreground">
                Setup takes less than 30 seconds
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6" style={{color: '#FFFFFF', opacity: 1, visibility: 'visible'}}>
              Create Your Feedback Board
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Collect valuable feedback from your audience with our simple, no-hassle platform. 
              Get honest insights that help you improve and grow.
            </p>

            <Button
              variant="default"
              size="lg"
              iconName="ArrowDown"
              iconPosition="right"
              onClick={() => {
                const target = document.getElementById('board-form');
                if (target) {
                  const targetPosition = target.offsetTop - 80; // Account for header height
                  
                  // Use Chainlink scroll system
                  if (window.chainlinkScrollTo) {
                    window.chainlinkScrollTo(targetPosition);
                  } else {
                    // Fallback to regular scroll
                    window.scrollTo({
                      top: targetPosition,
                      behavior: 'smooth'
                    });
                  }
                }
              }}
              className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow px-8 py-4 text-lg font-semibold mb-12"
            >
              Get Started
            </Button>

            {/* Key Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                {
                  icon: 'Clock',
                  title: 'Quick Setup',
                  description: 'Get your feedback board live in under 30 seconds'
                },
                {
                  icon: 'Shield',
                  title: 'Anonymous by Default',
                  description: 'Contributors can share honest feedback without fear'
                },
                {
                  icon: 'BarChart',
                  title: 'Organized Results',
                  description: 'Feedback is automatically categorized and easy to review'
                }
              ].map((benefit, index) => (
                <div key={index} className="glass-card p-6 rounded-2xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon name={benefit.icon} size={24} className="text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Creation Form */}
        <section id="board-form" className="section-padding py-20 bg-gradient-to-br from-muted/5 to-background overflow-x-hidden scroll-parallax">
          <div className="max-w-6xl mx-auto momentum-container">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6" style={{color: '#FFFFFF', opacity: 1, visibility: 'visible'}}>
                Let's Build Your Board
              </h2>
              <p className="text-xl text-muted-foreground">
                Follow these simple steps to create your feedback collection board
              </p>
            </div>


            {/* Single Form Card */}
            <div className="w-full">
              <div className="glass-card p-8 md:p-12 rounded-3xl shadow-2xl overflow-visible">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Left Column - Category and Info */}
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-3">Choose Your Category</h3>
                      <p className="text-muted-foreground mb-6">What type of feedback are you looking to collect?</p>
                      
                      {/* Custom Category Dropdown */}
                      <div className="relative z-20">
                        <button
                          onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                          className="w-full p-4 bg-input border-2 border-border rounded-2xl text-left flex items-center justify-between hover:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                        >
                          <div className="flex items-center space-x-3">
                            {formData.category ? (
                              <>
                                <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                                  <Icon 
                                    name={categories.find(c => c.value === formData.category)?.icon || 'Tag'} 
                                    size={20} 
                                    className="text-accent" 
                                  />
                                </div>
                                <div>
                                  <span className="text-lg font-medium text-foreground">
                                    {categories.find(c => c.value === formData.category)?.label}
                                  </span>
                                  <p className="text-sm text-muted-foreground">
                                    {categories.find(c => c.value === formData.category)?.description}
                                  </p>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="w-10 h-10 bg-muted/50 rounded-xl flex items-center justify-center">
                                  <Icon name="ChevronDown" size={20} className="text-muted-foreground" />
                                </div>
                                <span className="text-base text-muted-foreground">Select a category...</span>
                              </>
                            )}
                          </div>
                          <Icon 
                            name="ChevronDown" 
                            size={20} 
                            className={`text-muted-foreground transition-transform duration-200 ${
                              showCategoryDropdown ? 'rotate-180' : ''
                            }`} 
                          />
                        </button>

                        {/* Dropdown Menu */}
                        {showCategoryDropdown && (
                          <div 
                            className="absolute top-full left-0 right-0 mt-2 bg-background rounded-2xl border-2 border-border shadow-2xl z-50"
                            style={{
                              height: '26rem',
                              overflowY: 'auto',
                              scrollbarWidth: 'thin',
                              scrollbarColor: '#00FF88 transparent'
                            }}
                            onWheel={(e) => e.stopPropagation()}
                          >
                            <style dangerouslySetInnerHTML={{
                              __html: `
                                .category-dropdown::-webkit-scrollbar {
                                  width: 8px;
                                }
                                .category-dropdown::-webkit-scrollbar-track {
                                  background: transparent;
                                }
                                .category-dropdown::-webkit-scrollbar-thumb {
                                  background: #00FF88;
                                  border-radius: 4px;
                                }
                                .category-dropdown::-webkit-scrollbar-thumb:hover {
                                  background: #00CC6F;
                                }
                              `
                            }} />
                            <div className="category-dropdown h-full overflow-y-auto">
                              {categories.map((category) => (
                                <button
                                  key={category.value}
                                  onClick={() => {
                                    setFormData({ ...formData, category: category.value });
                                    setShowCategoryDropdown(false);
                                  }}
                                  className="w-full p-4 text-left hover:bg-accent/10 hover:scale-[1.02] transition-all duration-200 border-b border-border/50 last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl group"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center group-hover:bg-accent/30 transition-colors duration-200">
                                      <Icon name={category.icon} size={20} className="text-accent group-hover:scale-110 transition-transform duration-200" />
                                    </div>
                                    <div>
                                      <span className="text-lg font-medium text-foreground block">
                                        {category.label}
                                      </span>
                                      <p className="text-sm text-muted-foreground">
                                        {category.description}
                                      </p>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Info Sections */}
                    <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon name="Lightbulb" size={16} className="text-accent" />
                        <span className="text-sm font-semibold text-accent">Why choose a category?</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Categories help set clear expectations for contributors and organize your feedback more effectively.
                      </p>
                    </div>

                    <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon name="Target" size={16} className="text-accent" />
                        <span className="text-sm font-semibold text-accent">Pro tip</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Clear, specific titles get 3x more quality responses. Include the context and purpose.
                      </p>
                    </div>

                    <div className="bg-accent/10 rounded-xl px-3 py-2 border border-accent/20">
                      <p className="text-xs text-muted-foreground">
                        💡 Specific descriptions reduce irrelevant feedback by 60%
                      </p>
                    </div>

                    {/* Create Button */}
                    <Button
                      variant="default"
                      size="lg"
                      iconName={connected ? "Rocket" : "Wallet"}
                      iconPosition="left"
                      loading={isDeploying || connecting}
                      onClick={handleCreate}
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow px-8 py-4 text-lg font-bold"
                      disabled={connected && (!formData?.title?.trim() || !formData?.description?.trim() || !formData?.category?.trim())}
                    >
                      {isDeploying ? 'Creating Your Board...' : 
                       connecting ? 'Connecting Wallet...' :
                       connected ? 'Create Feedback Board' : 'Connect Wallet'}
                    </Button>
                  </div>

                  {/* Right Column - Title and Description */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-3">Board Details</h3>
                      <p className="text-muted-foreground mb-6">Give your feedback board a clear title and description</p>
                    </div>

                    {/* Title Input */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-foreground">Board Title *</label>
                      <input
                        type="text"
                        placeholder="e.g., Product Feature Feedback, Website Redesign Input..."
                        className="w-full px-6 py-4 bg-input border-2 border-border rounded-2xl text-foreground placeholder:text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 text-lg font-medium"
                        value={formData?.title}
                        onChange={(e) => handleInputChange('title', e?.target?.value)}
                      />
                      {errors?.title && (
                        <p className="text-sm text-error font-medium">{errors?.title}</p>
                      )}
                    </div>

                    {/* Description Input */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-foreground">Description *</label>
                      <textarea
                        className="w-full px-6 py-4 bg-input border-2 border-border rounded-2xl text-foreground placeholder:text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent resize-none transition-all duration-200 text-lg"
                        rows={8}
                        placeholder="Describe what kind of feedback you're looking for. Be specific about topics, tone, and expectations to get better responses..."
                        value={formData?.description}
                        onChange={(e) => handleInputChange('description', e?.target?.value)}
                      />
                      {errors?.description && (
                        <p className="text-sm text-error font-medium">{errors?.description}</p>
                      )}
                      <div className="flex justify-end">
                        <p className="text-sm text-muted-foreground font-medium">
                          {formData?.description?.length}/500
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="section-padding py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mt-16">
              <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-3xl p-8 border border-success/20">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Icon name="CheckCircle" size={20} className="text-success" />
                  <span className="text-lg font-bold text-success">What happens after you create your board?</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-success/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Icon name="Zap" size={20} className="text-success" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-1">Instant Setup</h4>
                    <p className="text-sm text-muted-foreground">Board goes live immediately</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-success/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Icon name="Share" size={20} className="text-success" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-1">Shareable Link</h4>
                    <p className="text-sm text-muted-foreground">Get a link to share with your audience</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-success/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Icon name="MessageSquare" size={20} className="text-success" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-1">Start Collecting</h4>
                    <p className="text-sm text-muted-foreground">Begin receiving feedback immediately</p>
                  </div>
                </div>

                <div className="bg-accent/10 rounded-xl p-4 border border-accent/20 mt-6">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Icon name="Lightbulb" size={16} className="text-accent" />
                    <span className="text-sm font-semibold text-accent">Pro Tips</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <div className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Clear titles get 3x more quality responses</span>
                    </div>
                    <div className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Specific descriptions reduce irrelevant feedback by 60%</span>
                    </div>
                    <div className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Anonymous feedback encourages honest input</span>
                    </div>
                    <div className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Share your link on social media for wider reach</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="section-padding py-8 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Icon name="MessageSquare" size={20} className="text-accent" />
              <span className="text-sm text-muted-foreground">
                © {new Date()?.getFullYear()} SimpleFeed. Simple feedback platform.
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
      </div>

      {/* Wallet Connection Modal */}
      <WalletConnectionModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
      />
    </>
  );
};

export default BoardCreationStudio;