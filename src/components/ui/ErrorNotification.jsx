import React, { useEffect, useState } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const ErrorNotification = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  actionText,
  onAction,
  duration = 8000 // Longer duration for errors
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      
      // Auto-close after duration
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Notification */}
      <div className={`relative glass-card border-2 border-error/20 bg-error/5 rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all duration-300 ${
        isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
      }`}>
        {/* Error Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center">
            <Icon name="AlertTriangle" size={32} className="text-error animate-pulse" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            {title}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {actionText && onAction && (
            <Button
              variant="default"
              onClick={() => {
                onAction();
                handleClose();
              }}
              className="bg-error text-white hover:bg-error/90 shadow-glow"
              fullWidth
            >
              {actionText}
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-error/30 text-error hover:bg-error/10 hover:text-white"
            fullWidth
          >
            Close
          </Button>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all duration-200"
        >
          <Icon name="X" size={20} />
        </button>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/20 rounded-b-3xl overflow-hidden">
          <div 
            className="h-full bg-error animate-shrink-width"
            style={{
              animation: `shrink-width ${duration}ms linear forwards`
            }}
          />
        </div>

        {/* CSS for progress animation */}
        <style jsx>{`
          @keyframes shrink-width {
            from {
              width: 100%;
            }
            to {
              width: 0%;
            }
          }
          .animate-shrink-width {
            animation: shrink-width ${duration}ms linear forwards;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ErrorNotification;