import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const RateLimitDisplay = ({ isActive, timeRemaining, onComplete }) => {
  const [countdown, setCountdown] = useState(timeRemaining);
  const [educationalTip, setEducationalTip] = useState(0);

  const educationalTips = [
    {
      title: "Quality Over Quantity",
      content: "Rate limits ensure thoughtful feedback by preventing spam and encouraging meaningful contributions.",
      icon: "Target"
    },
    {
      title: "Blockchain Efficiency",
      content: "Limiting submissions reduces network congestion and keeps transaction costs low for everyone.",
      icon: "Zap"
    },
    {
      title: "Fair Distribution",
      content: "Rate limits ensure rewards are distributed fairly among all contributors, not just the fastest typists.",
      icon: "Scale"
    },
    {
      title: "Privacy Protection",
      content: "Submission delays help protect your anonymity by making timing analysis more difficult.",
      icon: "Shield"
    }
  ];

  useEffect(() => {
    if (!isActive || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, countdown, onComplete]);

  useEffect(() => {
    const tipTimer = setInterval(() => {
      setEducationalTip(prev => (prev + 1) % educationalTips?.length);
    }, 8000);

    return () => clearInterval(tipTimer);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds?.toString()?.padStart(2, '0')}`;
  };

  const progressPercentage = ((timeRemaining - countdown) / timeRemaining) * 100;

  if (!isActive) return null;

  return (
    <div className="glass-card p-6 mb-6 border border-warning/20">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Countdown Section */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16">
            {/* Progress Circle */}
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-muted/30"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - progressPercentage / 100)}`}
                className="text-warning transition-all duration-1000 ease-linear"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon name="Clock" size={20} className="text-warning" />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Rate Limit Active
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-warning font-mono">
                {formatTime(countdown)}
              </span>
              <span className="text-sm text-muted-foreground">remaining</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Next submission available in {formatTime(countdown)}
            </p>
          </div>
        </div>

        {/* Educational Content */}
        <div className="flex-1 max-w-md">
          <div className="bg-muted/20 rounded-xl p-4 transition-all duration-500">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon 
                  name={educationalTips?.[educationalTip]?.icon} 
                  size={16} 
                  className="text-accent" 
                />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">
                  {educationalTips?.[educationalTip]?.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {educationalTips?.[educationalTip]?.content}
                </p>
              </div>
            </div>
          </div>
          
          {/* Tip Indicators */}
          <div className="flex items-center justify-center gap-1 mt-3">
            {educationalTips?.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === educationalTip ? 'bg-accent' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon name="Users" size={12} />
            <span>47 users waiting</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon name="Activity" size={12} />
            <span>Network: Normal</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon name="Zap" size={12} />
            <span>Gas: 0.001 SOL</span>
          </div>
        </div>
      </div>
      {/* Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-muted/30 rounded-full h-1">
          <div 
            className="bg-warning h-1 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default RateLimitDisplay;