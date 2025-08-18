import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SubmissionModal = ({ isOpen, onClose, board }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentiment, setSentiment] = useState('neutral');
  const [charCount, setCharCount] = useState(0);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const maxChars = 2000;
  const minChars = 50;

  useEffect(() => {
    setCharCount(content?.length);
    
    // Simple sentiment analysis simulation
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect', 'wonderful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'worst', 'disappointing'];
    
    const words = content?.toLowerCase()?.split(' ');
    const positiveCount = words?.filter(word => positiveWords?.some(pos => word?.includes(pos)))?.length;
    const negativeCount = words?.filter(word => negativeWords?.some(neg => word?.includes(neg)))?.length;
    
    if (positiveCount > negativeCount) {
      setSentiment('positive');
    } else if (negativeCount > positiveCount) {
      setSentiment('negative');
    } else {
      setSentiment('neutral');
    }
  }, [content]);

  const handleSubmit = async () => {
    if (content?.length < minChars) return;
    
    setIsSubmitting(true);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    onClose();
    
    // Reset form
    setContent('');
    setTags([]);
    setTagInput('');
  };

  const addTag = () => {
    if (tagInput?.trim() && !tags?.includes(tagInput?.trim()) && tags?.length < 5) {
      setTags([...tags, tagInput?.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags?.filter(tag => tag !== tagToRemove));
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-success';
      case 'negative': return 'text-error';
      case 'neutral': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/30">
          <div>
            <h2 className="text-xl font-bold text-foreground">Submit Your Feedback</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Share your thoughts and help improve this project
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all duration-200"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Simple Info */}
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="MessageSquare" size={16} className="text-accent" />
              <span className="text-sm font-semibold text-accent">Quick & Simple</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Just write your feedback and submit. No registration or complex process required.
            </p>
          </div>

          {/* Feedback Editor */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Your Feedback
            </label>
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e?.target?.value)}
                placeholder="Share your honest thoughts and feedback..."
                className="w-full h-40 p-4 bg-muted/30 border border-border/50 rounded-xl text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all duration-200"
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-3">
                <div className={`text-xs ${charCount > maxChars ? 'text-error' : 'text-muted-foreground'}`}>
                  {charCount}/{maxChars}
                </div>
                {charCount >= minChars && (
                  <div className="flex items-center gap-1 text-xs text-success">
                    <Icon name="Check" size={12} />
                    <span>Ready</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Minimum {minChars} characters required</span>
              <div className={`flex items-center gap-1 ${getSentimentColor(sentiment)}`}>
                <Icon name={getSentimentIcon(sentiment)} size={12} />
                <span className="capitalize">Sentiment: {sentiment}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Tags (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e?.target?.value)}
                onKeyPress={(e) => e?.key === 'Enter' && addTag()}
                placeholder="Add a tag..."
                className="flex-1 px-3 py-2 bg-muted/30 border border-border/50 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all duration-200"
              />
              <Button
                variant="outline"
                onClick={addTag}
                disabled={!tagInput?.trim() || tags?.length >= 5}
              >
                Add
              </Button>
            </div>
            {tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags?.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded-md text-xs"
                  >
                    <span>#{tag}</span>
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-accent/80 transition-colors duration-200"
                    >
                      <Icon name="X" size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submission Info */}
          <div className="bg-muted/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Icon name="Clock" size={16} className="text-accent" />
                  <span className="text-sm font-medium text-foreground">Ready to Submit</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your feedback will be visible immediately after submission
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-accent">
                  <Icon name="CheckCircle" size={24} className="text-success" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border/30">
          <div className="text-xs text-muted-foreground">
            Submission will be processed immediately
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={content?.length < minChars || isSubmitting}
              loading={isSubmitting}
              iconName="Send"
              iconPosition="left"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionModal;