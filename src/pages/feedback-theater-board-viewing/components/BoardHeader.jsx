import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BoardHeader = ({ board, onSubmitFeedback }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTimeAgo = (timeString) => {
    // Simple implementation for demo
    return timeString;
  };

  const shouldShowExpansion = board?.description?.length > 200;

  return (
    <div className="glass-card p-8 rounded-2xl mb-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/70 rounded-2xl flex items-center justify-center">
              <Icon name="MessageSquare" size={24} className="text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                {board?.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                <div className="flex items-center space-x-1">
                  <Icon name="Calendar" size={14} />
                  <span>Created {formatTimeAgo(board?.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="MessageCircle" size={14} />
                  <span>{board?.totalSubmissions} feedback items</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-muted-foreground leading-relaxed">
              {isExpanded || !shouldShowExpansion 
                ? board?.description 
                : `${board?.description?.substring(0, 200)}...`
              }
            </p>
            {shouldShowExpansion && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-accent text-sm hover:text-accent/80 transition-colors duration-200 mt-2"
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>

          {/* Guidelines */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center space-x-2">
              <Icon name="CheckCircle" size={16} className="text-accent" />
              <span>Guidelines</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {board?.guidelines?.map((guideline, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Icon name="ArrowRight" size={12} className="text-accent" />
                  <span>{guideline}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="lg:w-80 space-y-4">
          <Button
            variant="default"
            size="lg"
            iconName="Plus"
            iconPosition="left"
            onClick={onSubmitFeedback}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow"
          >
            Submit Feedback
          </Button>

          <div className="bg-muted/20 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Icon name="BarChart" size={16} className="text-accent" />
              <span className="text-sm font-medium text-foreground">Board Stats</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Feedback</span>
                <span className="font-medium text-foreground">{board?.totalSubmissions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium text-foreground">{board?.createdAt}</span>
              </div>
            </div>
          </div>

          <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Info" size={16} className="text-accent" />
              <span className="text-sm font-semibold text-accent">Quick & Easy</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Share your thoughts quickly and easily. No registration or complex setup required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardHeader;