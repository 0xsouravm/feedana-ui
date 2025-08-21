import React from 'react';
import Icon from '../../../components/AppIcon';

const ProgressStepper = ({ currentStep, onStepClick }) => {
  const steps = [
    {
      id: 1,
      name: 'Basic Setup',
      description: 'Configure board fundamentals',
      icon: 'Settings'
    },
    {
      id: 2,
      name: 'Privacy Controls',
      description: 'Set anonymity and security levels',
      icon: 'Shield'
    },
    {
      id: 3,
      name: 'Funding Setup',
      description: 'Configure incentives and deposits',
      icon: 'Wallet'
    },
    {
      id: 4,
      name: 'Template Gallery',
      description: 'Choose from proven configurations',
      icon: 'Layout'
    },
    {
      id: 5,
      name: 'Contract Preview',
      description: 'Review and deploy to blockchain',
      icon: 'Code'
    }
  ];

  const getStepStatus = (stepId) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'active';
    return 'pending';
  };

  const getStepClasses = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground border-success';
      case 'active':
        return 'bg-accent text-accent-foreground border-accent';
      case 'pending':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getConnectorClasses = (status) => {
    return status === 'completed' ? 'bg-success' : 'bg-border';
  };

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
          <Icon name="MapPin" size={16} className="text-accent" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Creation Progress</h3>
          <p className="text-sm text-muted-foreground">Step {currentStep} of {steps?.length}</p>
        </div>
      </div>
      {/* Desktop Stepper */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between">
          {steps?.map((step, index) => {
            const status = getStepStatus(step?.id);
            const isClickable = step?.id <= currentStep;

            return (
              <div key={step?.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => isClickable && onStepClick(step?.id)}
                    disabled={!isClickable}
                    className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${
                      getStepClasses(status)
                    } ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}`}
                  >
                    {status === 'completed' ? (
                      <Icon name="Check" size={20} />
                    ) : (
                      <Icon name={step?.icon} size={20} />
                    )}
                  </button>
                  <div className="mt-3 text-center">
                    <h4 className={`text-sm font-medium ${
                      status === 'active' ? 'text-accent' : 
                      status === 'completed' ? 'text-success' : 'text-muted-foreground'
                    }`}>
                      {step?.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-24">
                      {step?.description}
                    </p>
                  </div>
                </div>
                {index < steps?.length - 1 && (
                  <div className="flex-1 mx-4 mb-8">
                    <div className={`h-0.5 transition-all duration-300 ${
                      getConnectorClasses(getStepStatus(step?.id))
                    }`}></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Mobile Stepper */}
      <div className="lg:hidden space-y-4">
        {steps?.map((step) => {
          const status = getStepStatus(step?.id);
          const isClickable = step?.id <= currentStep;

          return (
            <button
              key={step?.id}
              onClick={() => isClickable && onStepClick(step?.id)}
              disabled={!isClickable}
              className={`w-full flex items-center space-x-4 p-4 rounded-xl border transition-all duration-300 ${
                status === 'active' ?'bg-accent/10 border-accent/20' 
                  : status === 'completed' ?'bg-success/10 border-success/20' :'bg-muted/10 border-border/50'
              } ${isClickable ? 'cursor-pointer hover:bg-opacity-80' : 'cursor-not-allowed'}`}
            >
              <div className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center ${
                getStepClasses(status)
              }`}>
                {status === 'completed' ? (
                  <Icon name="Check" size={18} />
                ) : (
                  <Icon name={step?.icon} size={18} />
                )}
              </div>
              <div className="flex-1 text-left">
                <h4 className={`text-sm font-medium ${
                  status === 'active' ? 'text-accent' : 
                  status === 'completed' ? 'text-success' : 'text-muted-foreground'
                }`}>
                  {step?.name}
                </h4>
                <p className="text-xs text-muted-foreground">{step?.description}</p>
              </div>
              {status === 'active' && (
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              )}
            </button>
          );
        })}
      </div>
      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Overall Progress</span>
          <span className="text-sm text-muted-foreground">{Math.round((currentStep / steps?.length) * 100)}%</span>
        </div>
        <div className="w-full bg-muted/30 rounded-full h-2">
          <div 
            className="bg-accent h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / steps?.length) * 100}%` }}
          ></div>
        </div>
      </div>
      {/* Estimated Time */}
      <div className="mt-4 bg-background/30 rounded-lg p-3 border border-border/50">
        <div className="flex items-center space-x-2">
          <Icon name="Clock" size={14} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Estimated time remaining: {Math.max(0, (steps?.length - currentStep) * 2)} minutes
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressStepper;