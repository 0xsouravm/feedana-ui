import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const PrivacySimulator = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const steps = [
    {
      title: "Write Your Feedback",
      description: "No wallet connection required. Experience true anonymity.",
      icon: "Edit3"
    },
    {
      title: "Cryptographic Protection",
      description: "Your identity is shielded by blockchain technology.",
      icon: "Shield"
    },
    {
      title: "Anonymous Submission",
      description: "Feedback submitted without revealing who you are.",
      icon: "Send"
    }
  ];

  const handleSubmit = async () => {
    if (!feedback?.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate submission process
    for (let i = 0; i < steps?.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    setIsComplete(true);
    setIsSubmitting(false);
  };

  const resetSimulator = () => {
    setCurrentStep(0);
    setFeedback('');
    setIsSubmitting(false);
    setIsComplete(false);
  };

  return (
    <section className="py-20 bg-background">
      <div className="container-padding max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Experience Anonymous Feedback
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Try our privacy simulator. No wallet required, no tracking, no data stored. 
            See how blockchain anonymity works in real-time.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Simulator Interface */}
          <div className="space-y-6">
            <div className="glass-card p-8 rounded-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                  <Icon name="Zap" size={20} className="text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Privacy Simulator</h3>
                  <p className="text-sm text-muted-foreground">Experience anonymity without commitment</p>
                </div>
              </div>

              {!isComplete ? (
                <div className="space-y-6">
                  <Input
                    label="Your Anonymous Feedback"
                    type="text"
                    placeholder="Share your honest thoughts..."
                    value={feedback}
                    onChange={(e) => setFeedback(e?.target?.value)}
                    description="This is just a demo - nothing is actually submitted"
                    className="mb-4"
                  />

                  <Button
                    variant="default"
                    fullWidth
                    iconName="Play"
                    iconPosition="left"
                    onClick={handleSubmit}
                    disabled={!feedback?.trim() || isSubmitting}
                    loading={isSubmitting}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    {isSubmitting ? 'Processing...' : 'Simulate Anonymous Submission'}
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                    <Icon name="CheckCircle" size={32} className="text-success" />
                  </div>
                  <h4 className="text-lg font-semibold text-foreground">Submission Complete!</h4>
                  <p className="text-muted-foreground">
                    Your feedback was processed anonymously. No trace of your identity remains.
                  </p>
                  <Button
                    variant="outline"
                    onClick={resetSimulator}
                    iconName="RotateCcw"
                    iconPosition="left"
                    className="border-accent/30 text-accent hover:bg-accent/10"
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </div>

            {/* Privacy Guarantee */}
            <div className="bg-muted/20 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <Icon name="Info" size={20} className="text-accent mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground mb-2">Privacy Guarantee</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This simulator demonstrates our privacy technology without storing any data. 
                    In the real platform, your anonymity is protected by cryptographic proofs 
                    and blockchain verification.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Process Visualization */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-foreground mb-8">How It Works</h3>
            
            {steps?.map((step, index) => (
              <div
                key={index}
                className={`flex items-start space-x-4 p-6 rounded-xl transition-all duration-500 ${
                  isSubmitting && currentStep === index
                    ? 'glass-card border border-accent/30 shadow-glow'
                    : isSubmitting && currentStep > index
                    ? 'bg-success/5 border border-success/20' :'bg-muted/10'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
                  isSubmitting && currentStep === index
                    ? 'bg-accent text-accent-foreground animate-pulse'
                    : isSubmitting && currentStep > index
                    ? 'bg-success text-success-foreground'
                    : 'bg-muted/30 text-muted-foreground'
                }`}>
                  {isSubmitting && currentStep > index ? (
                    <Icon name="Check" size={20} />
                  ) : (
                    <Icon name={step?.icon} size={20} />
                  )}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-2">{step?.title}</h4>
                  <p className="text-muted-foreground text-sm">{step?.description}</p>
                  
                  {isSubmitting && currentStep === index && (
                    <div className="mt-3 flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-accent">Processing...</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Technical Details */}
            <div className="mt-8 p-6 bg-muted/10 rounded-xl">
              <h4 className="font-semibold text-foreground mb-3 flex items-center space-x-2">
                <Icon name="Code" size={18} />
                <span>Technical Implementation</span>
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <Icon name="ArrowRight" size={14} className="text-accent" />
                  <span>Stealth address generation for each submission</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="ArrowRight" size={14} className="text-accent" />
                  <span>Zero-knowledge proofs for identity protection</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="ArrowRight" size={14} className="text-accent" />
                  <span>On-chain verification without revealing data</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacySimulator;