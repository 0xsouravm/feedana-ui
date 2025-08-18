import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FeedbackCard = ({ feedback }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHelpful, setIsHelpful] = useState(false);
  
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-success bg-success/10 border-success/20';
      case 'negative': return 'text-error bg-error/10 border-error/20';
      case 'neutral': return 'text-muted-foreground bg-muted/10 border-muted/20';
      default: return 'text-muted-foreground bg-muted/10 border-muted/20';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'TrendingUp';
      case 'negative': return 'TrendingDown';
      case 'neutral': return 'Minus';
      default: return 'Minus';
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleHelpful = () => {
    setIsHelpful(!isHelpful);
  };

  const shouldTruncate = feedback?.content?.length > 300;
  const displayContent = isExpanded || !shouldTruncate 
    ? feedback?.content 
    : `${feedback?.content?.substring(0, 300)}...`;

  return (
    <div className="glass-card p-6 rounded-xl hover:shadow-glow transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center">
            <Icon name="User" size={16} className="text-accent" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-foreground">
                Contributor
              </span>
              <div className={`px-2 py-1 rounded-full text-xs border ${getSentimentColor(feedback?.sentiment)}`}>
                <div className="flex items-center space-x-1">
                  <Icon name={getSentimentIcon(feedback?.sentiment)} size={10} />
                  <span className="capitalize">{feedback?.sentiment}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
              <Icon name="Clock" size={12} />
              <span>{formatTimeAgo(feedback?.timestamp)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Icon name="Eye" size={12} />
            <span>{feedback?.views}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-foreground leading-relaxed text-sm whitespace-pre-line">
          {displayContent}
        </p>
        {shouldTruncate && (
          <button
            onClick={toggleExpanded}
            className="text-accent text-sm hover:text-accent/80 transition-colors duration-200 mt-2"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Tags */}
      {feedback?.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {feedback?.tags?.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-muted/30 text-muted-foreground rounded-md text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border/30">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            iconName={isHelpful ? "Heart" : "Heart"}
            iconPosition="left"
            onClick={toggleHelpful}
            className={`${isHelpful ? 'text-error' : 'text-muted-foreground'} hover:text-error transition-colors duration-200`}
          >
            <span className="text-xs">
              {feedback?.helpful + (isHelpful ? 1 : 0)}
            </span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            iconName="MessageCircle"
            iconPosition="left"
            className="text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <span className="text-xs">Reply</span>
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            iconName="Share"
            className="text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
          </Button>
          
          <Button
            variant="ghost"  
            size="sm"
            iconName="MoreHorizontal"
            className="text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackCard;