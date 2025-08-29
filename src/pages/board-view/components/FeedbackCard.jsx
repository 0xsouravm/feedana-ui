import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FeedbackCard = ({ feedback, onUpvote, onDownvote, isArchived, currentUserAddress }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHelpful, setIsHelpful] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [isDownvoting, setIsDownvoting] = useState(false);
  
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const feedbackTime = new Date(timestamp);
    const diff = now - feedbackTime;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
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

  // Check voting eligibility
  const isOwnFeedback = currentUserAddress && feedback.feedback_giver === currentUserAddress;
  const hasUpvoted = currentUserAddress && feedback.upvoters && feedback.upvoters.includes(currentUserAddress);
  const hasDownvoted = currentUserAddress && feedback.downvoters && feedback.downvoters.includes(currentUserAddress);
  const canUpvote = currentUserAddress && !isArchived && !isOwnFeedback && !hasUpvoted;
  const canDownvote = currentUserAddress && !isArchived && !isOwnFeedback && !hasDownvoted;

  const handleUpvote = async () => {
    if (isUpvoting || isDownvoting || !canUpvote) return;
    
    setIsUpvoting(true);
    try {
      await onUpvote(feedback);
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleDownvote = async () => {
    if (isUpvoting || isDownvoting || !canDownvote) return;
    
    setIsDownvoting(true);
    try {
      await onDownvote(feedback);
    } finally {
      setIsDownvoting(false);
    }
  };

  // Check if content should be truncated - use character count and line count
  const shouldTruncate = feedback?.content && (
    feedback.content.length > 200 || // Long content
    feedback.content.split('\n').length > 3 || // Multiple lines
    feedback.content.split(' ').length > 30 // Many words
  );
  const displayContent = feedback?.content || '';

  return (
    <div className="glass-card p-6 rounded-xl hover:shadow-glow transition-all duration-300 relative z-0">
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
              {/* <div className={`px-2 py-1 rounded-full text-xs border ${getSentimentColor(feedback?.sentiment)}`}>
                <div className="flex items-center space-x-1">
                  <Icon name={getSentimentIcon(feedback?.sentiment)} size={10} />
                  <span className="capitalize">{feedback?.sentiment}</span>
                </div>
              </div> */}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
              <Icon name="Clock" size={12} />
              <span>{formatTimeAgo(feedback?.timestamp)}</span>
            </div>
          </div>
        </div>
{/*         
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Icon name="Eye" size={12} />
            <span>{feedback?.views}</span>
          </div>
        </div> */}
      </div>

      {/* Content */}
      <div className="mb-4">
        <div className={`text-foreground leading-relaxed text-sm whitespace-pre-wrap break-words ${
          !isExpanded ? 'line-clamp-3' : ''
        }`}>
          {displayContent}
        </div>
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
{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border/30">
        <div className="flex items-center space-x-3">
          {/* Voting buttons */}
          {!isArchived && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleUpvote}
                disabled={isUpvoting || isDownvoting || !canUpvote}
                title={
                  !currentUserAddress ? 'Connect wallet to vote' :
                  isOwnFeedback ? 'Cannot vote on your own feedback' :
                  hasUpvoted ? 'Already upvoted' :
                  'Upvote this feedback'
                }
                className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-colors duration-200 ${
                  isUpvoting 
                    ? 'bg-green-500/20 text-green-500 cursor-wait' 
                    : hasUpvoted
                    ? 'bg-green-500/20 text-green-500'
                    : canUpvote
                    ? 'hover:bg-green-500/10 text-muted-foreground hover:text-green-500'
                    : 'text-muted-foreground/50 cursor-not-allowed'
                } ${(isUpvoting || isDownvoting || !canUpvote) ? 'opacity-50' : ''}`}
              >
                {isUpvoting ? (
                  <div className="w-3.5 h-3.5 border border-green-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Icon name="ArrowUp" size={14} />
                )}
                <span className="text-xs">{feedback?.upvotes || 0}</span>
              </button>
              <button
                onClick={handleDownvote}
                disabled={isUpvoting || isDownvoting || !canDownvote}
                title={
                  !currentUserAddress ? 'Connect wallet to vote' :
                  isOwnFeedback ? 'Cannot vote on your own feedback' :
                  hasDownvoted ? 'Already downvoted' :
                  'Downvote this feedback'
                }
                className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-colors duration-200 ${
                  isDownvoting 
                    ? 'bg-red-500/20 text-red-500 cursor-wait' 
                    : hasDownvoted
                    ? 'bg-red-500/20 text-red-500'
                    : canDownvote
                    ? 'hover:bg-red-500/10 text-muted-foreground hover:text-red-500'
                    : 'text-muted-foreground/50 cursor-not-allowed'
                } ${(isUpvoting || isDownvoting || !canDownvote) ? 'opacity-50' : ''}`}
              >
                {isDownvoting ? (
                  <div className="w-3.5 h-3.5 border border-red-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Icon name="ArrowDown" size={14} />
                )}
                <span className="text-xs">{feedback?.downvotes || 0}</span>
              </button>
            </div>
          )}
          
          {/* Sentiment indicator */}
          <div className={`px-2 py-1 rounded-full text-xs border ${getSentimentColor(feedback?.feedback_type || feedback?.sentiment)}`}>
            <div className="flex items-center space-x-1">
              <Icon name={getSentimentIcon(feedback?.feedback_type || feedback?.sentiment)} size={10} />
              <span className="capitalize">{feedback?.feedback_type || feedback?.sentiment}</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          ID: {(feedback?.feedback_id || feedback?.id)?.slice(-8)}
        </div>
      </div>
    </div>
  );
};

export default FeedbackCard;