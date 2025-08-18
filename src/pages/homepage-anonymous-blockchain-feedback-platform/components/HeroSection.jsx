import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import DotGrid from '../../../components/DotGrid';

const HeroSection = () => {
  const [globalFeedbackCount, setGlobalFeedbackCount] = useState(12847);

  // Simulate real-time feedback counter
  useEffect(() => {
    const interval = setInterval(() => {
      setGlobalFeedbackCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* DotGrid Background */}
      <div className="absolute inset-0 z-0">
        <DotGrid
          dotSize={4}
          gap={15}
          baseColor="#000000"
          activeColor="#FFFFFF"
          proximity={150}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>
      
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/3 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-accent/2 to-transparent rounded-full blur-3xl"></div>
      </div>
      <div className="relative z-10 container-padding max-w-7xl mx-auto pt-24">
        <div className="text-center space-y-8">
          {/* Main Headline */}
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 glass-card px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm font-mono text-muted-foreground">
                Live: {globalFeedbackCount?.toLocaleString()} feedback submissions
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-foreground leading-tight pt-6">
              Feedback made
              <span className="block text-gradient bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
                simple
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Collect valuable feedback effortlessly - no complications, just results
            </p>
          </div>

          {/* Simple Demo */}
          <div className="max-w-lg mx-auto mt-8">
            <div className="text-center">
              <div className="inline-block glass-card px-8 py-6 rounded-2xl">
                <p className="text-2xl font-medium text-accent mb-3">
                  "Feedback without the politics"
                </p>
                <p className="text-muted-foreground">
                 No registration • No retaliation
                </p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/board-creation-studio">
              <Button
                variant="default"
                size="lg"
                iconName="Plus"
                iconPosition="left"
                className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow px-8 py-4 text-lg"
              >
                Create Feedback Board
              </Button>
            </Link>
            
            <Link to="/feedback-theater-board-viewing">
              <Button
                variant="outline"
                size="lg"
                iconName="Eye"
                iconPosition="left"
                className="border-accent/30 text-accent hover:bg-accent/10 px-8 py-4 text-lg"
              >
                View Example
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-2 group">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center group-hover:bg-success/20 transition-colors duration-300">
                <Icon name="Clock" size={20} className="text-success" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Instant Setup</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-2 group">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center group-hover:bg-success/20 transition-colors duration-300">
                <Icon name="MessageCircle" size={20} className="text-success" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Easy to Use</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-2 group">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center group-hover:bg-success/20 transition-colors duration-300">
                <Icon name="Users" size={20} className="text-success" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">12K+ Users</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-2 group">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center group-hover:bg-success/20 transition-colors duration-300">
                <Icon name="CheckCircle" size={20} className="text-success" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Reliable</span>
            </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;