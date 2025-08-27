import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BoardHeader = ({ board, onSubmitFeedback }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { connected, publicKey } = useWallet();

  const formatTimeAgo = (timeString) => {
    if (!timeString) return 'Unknown';
    
    const now = new Date();
    const boardTime = new Date(timeString);
    const diff = now - boardTime;
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

  const formatAddress = (address) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const shouldShowExpansion = (board?.board_description || board?.description)?.length > 200;
  
  // Check if current user is the board creator
  const isCreator = connected && publicKey && (board?.created_by || board?.creator) && 
    publicKey.toString() === (board.created_by || board.creator);

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
                {board?.board_title || board?.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                {(board?.board_category || board?.category) && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Tag" size={14} />
                    <span className="font-medium text-accent">{board.board_category || board.category}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Icon name="Calendar" size={14} />
                  <span>Created {formatTimeAgo(board?.created_at || board?.createdAt)}</span>
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
                ? (board?.board_description || board?.description)
                : `${(board?.board_description || board?.description)?.substring(0, 200)}...`
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
            
            {/* Creator Info */}
            {(board?.created_by || board?.creator) && (
              <div className="mt-4 p-3 bg-muted/10 rounded-lg border border-border/30">
                <div className="flex items-center space-x-2 text-sm">
                  <Icon name="User" size={14} className="text-accent" />
                  <span className="text-muted-foreground">Created by:</span>
                  <span className="font-mono text-foreground bg-muted/20 px-2 py-1 rounded text-xs">
                    {formatAddress(board.created_by || board.creator)}
                  </span>
                </div>
              </div>
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
          {!isCreator ? (
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
          ) : (
            <div className="w-full bg-muted/20 border border-border/30 rounded-xl p-4 text-center">
              <Icon name="User" size={24} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                You created this board
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Share it with others to collect feedback
              </p>
            </div>
          )}

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
                <span className="font-medium text-foreground">{formatTimeAgo(board?.created_at || board?.createdAt)}</span>
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