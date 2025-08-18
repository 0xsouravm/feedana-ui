import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const BoardCreationStudio = () => {
  const navigate = useNavigate();
  const [isDeploying, setIsDeploying] = useState(false);

  // Simplified form data - only title and description
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData?.title?.trim()) newErrors.title = 'Board title is required';
    if (!formData?.description?.trim()) newErrors.description = 'Description is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  // Handle board creation
  const handleCreate = async () => {
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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="section-padding py-12 border-b border-border/50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/70 rounded-2xl flex items-center justify-center">
                  <Icon name="Plus" size={24} color="#000000" strokeWidth={2.5} />
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
                  Create Your Board
                </h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Create your feedback board in seconds. Just add a title and description, then you're ready to go.
              </p>
            </div>
          </div>
        </section>

        {/* Simplified Creation Form */}
        <section className="section-padding py-12">
          <div className="max-w-2xl mx-auto">
            <div className="glass-card p-8 rounded-2xl">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                  <Icon name="FileText" size={20} className="text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Board Details</h3>
                  <p className="text-sm text-muted-foreground">Tell us about your feedback board</p>
                </div>
              </div>

              <div className="space-y-6">
                <Input
                  label="Board Title"
                  type="text"
                  placeholder="e.g., Product Feature Feedback, Team Performance Review"
                  value={formData?.title}
                  onChange={(e) => handleInputChange('title', e?.target?.value)}
                  error={errors?.title}
                  required
                  description="Choose a clear, descriptive title"
                  className="mb-4"
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Board Description <span className="text-error">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none transition-all duration-200"
                    rows={4}
                    placeholder="Describe what kind of feedback you're looking for. Be specific about topics, tone, and expectations to get better responses."
                    value={formData?.description}
                    onChange={(e) => handleInputChange('description', e?.target?.value)}
                  />
                  {errors?.description && (
                    <p className="text-sm text-error">{errors?.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formData?.description?.length}/500 characters
                  </p>
                </div>

                {/* Create Button */}
                <div className="pt-6 border-t border-border/50">
                  <Button
                    variant="default"
                    size="lg"
                    iconName="Plus"
                    iconPosition="left"
                    loading={isDeploying}
                    onClick={handleCreate}
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                    disabled={!formData?.title?.trim() || !formData?.description?.trim()}
                  >
                    {isDeploying ? 'Creating Your Board...' : 'Create Board'}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Your board will be ready immediately
                  </p>
                </div>

                {/* Quick Tips */}
                <div className="bg-muted/20 rounded-xl p-4 border border-border/50">
                  <div className="flex items-start space-x-3">
                    <Icon name="Lightbulb" size={16} className="text-accent mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Quick Tips</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Clear titles get 3x more quality responses</li>
                        <li>• Specific descriptions reduce irrelevant feedback by 60%</li>
                        <li>• Your board will be live immediately after creation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Preview */}
        <section className="section-padding py-12 bg-muted/10 border-t border-border/50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground mb-8">What You Get</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  title: 'Simple Collection', 
                  description: 'Clean interface makes it easy for anyone to leave feedback',
                  icon: 'MessageSquare' 
                },
                { 
                  title: 'Organized Results', 
                  description: 'Feedback is automatically categorized and organized',
                  icon: 'BarChart' 
                },
                { 
                  title: 'Instant Setup', 
                  description: 'Your board goes live immediately after creation',
                  icon: 'Zap' 
                }
              ]?.map((feature, index) => (
                <div key={index} className="glass-card p-6 rounded-xl">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon name={feature?.icon} size={24} className="text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature?.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature?.description}</p>
                </div>
              ))}
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
  );
};

export default BoardCreationStudio;