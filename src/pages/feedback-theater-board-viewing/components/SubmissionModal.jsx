import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import WalletConnectionModal from '../../../components/wallet/WalletConnectionModal';
import { generateFeedbackHash } from '../../../utils/simpleBoardUtils';
import { getBoardById, updateBoardIPFS } from '../../../utils/simpleSupabaseApi';
import { ipfsService } from '../../../services/ipfsService';
import ipfsFetcher from '../../../utils/ipfsFetcher';

const SubmissionModal = ({ isOpen, onClose, board, onSuccess }) => {
  // Wallet connection
  const { connected, connecting, publicKey } = useWallet();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentiment, setSentiment] = useState('neutral');
  const [charCount, setCharCount] = useState(0);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const maxChars = 2000;
  const minChars = 50;

  useEffect(() => {
    setCharCount(content?.length || 0);
    
    // Simple sentiment analysis simulation
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect', 'wonderful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'worst', 'disappointing'];
    
    const words = content?.toLowerCase()?.split(' ') || [];
    const positiveCount = words?.filter(word => positiveWords?.some(pos => word?.includes(pos)))?.length || 0;
    const negativeCount = words?.filter(word => negativeWords?.some(neg => word?.includes(neg)))?.length || 0;
    
    if (positiveCount > negativeCount) {
      setSentiment('positive');
    } else if (negativeCount > positiveCount) {
      setSentiment('negative');
    } else {
      setSentiment('neutral');
    }
  }, [content]);

  const handleSubmit = async () => {
    if (!connected) {
      setIsWalletModalOpen(true);
      return;
    }
    
    if (content?.length < minChars || !publicKey) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('Starting feedback submission process...');
      
      // Step 1: Get board data from database
      const boardDbData = await getBoardById(board.id);
      if (!boardDbData) {
        throw new Error('Board not found in database');
      }
      
      console.log('Board data from DB:', boardDbData);
      
      // Step 2: Fetch current board data from IPFS if CID exists
      let currentBoardData = null;
      if (boardDbData.ipfs_cid && boardDbData.ipfs_cid !== 'local-only') {
        console.log('Fetching existing board data from IPFS...');
        const ipfsResult = await ipfsFetcher.fetchBoardData(boardDbData.ipfs_cid);
        currentBoardData = ipfsResult;
      }
      
      // Step 3: Generate feedback ID and create new feedback object
      const timestamp = new Date().toISOString();
      const feedbackId = await generateFeedbackHash(
        publicKey.toString(),
        content,
        timestamp
      );
      
      // Format tags with proper hashtag format
      const formattedTags = tags.map(tag => {
        const cleanTag = tag.trim().replace(/^#+/, ''); // Remove any existing hashtags
        return `#${cleanTag}`; // Add single hashtag
      });

      const newFeedback = {
        feedback_id: feedbackId,
        feedback_text: content,
        feedback_type: sentiment,
        created_by: publicKey.toString(),
        created_at: timestamp,
        tags: formattedTags
      };
      
      // Step 4: Update board data with new feedback
      const updatedBoardData = {
        ...currentBoardData,
        // Ensure we have the basic board structure
        board_id: currentBoardData?.board_id || board.id,
        board_title: currentBoardData?.board_title || board.title,
        board_description: currentBoardData?.board_description || board.description,
        board_category: currentBoardData?.board_category || 'General',
        created_by: currentBoardData?.created_by || boardDbData.owner,
        created_at: currentBoardData?.created_at || boardDbData.created_at,
        // Update feedback-related fields
        latest_feedback_by: publicKey.toString(),
        latest_feedback_at: timestamp,
        total_feedback_count: (currentBoardData?.total_feedback_count || 0) + 1,
        feedbacks: [
          ...(currentBoardData?.feedbacks || []),
          newFeedback
        ]
      };
      
      console.log('Updated board data:', updatedBoardData);
      
      // Step 5: Upload updated board data to IPFS
      const ipfsUploadResult = await ipfsService.uploadBoardToIPFS(updatedBoardData);
      
      if (!ipfsUploadResult.success) {
        throw new Error(`Failed to upload to IPFS: ${ipfsUploadResult.error}`);
      }
      
      console.log('New IPFS upload result:', ipfsUploadResult);
      
      // Step 6: Update database with new IPFS CID
      await updateBoardIPFS(board.id, ipfsUploadResult.cid);
      
      console.log('Feedback submitted successfully!');
      
      // Reset form and close modal
      setContent('');
      setTags([]);
      setTagInput('');
      onClose();
      
      // Trigger success callback
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert(`Failed to submit feedback: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-border/30">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Submit Your Feedback</h2>
            <p className="text-muted-foreground mt-2">
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
        <div className="p-8 space-y-8">
          {/* Wallet Info */}
          {!connected ? (
            <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Wallet" size={16} className="text-warning" />
                <span className="text-sm font-semibold text-warning">Wallet Required</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Connect your wallet to submit feedback. This helps prevent spam and ensures authentic contributions.
              </p>
            </div>
          ) : (
            <div className="bg-success/10 border border-success/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="CheckCircle" size={16} className="text-success" />
                <span className="text-sm font-semibold text-success">Wallet Connected</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Your feedback will be stored on IPFS and linked to the blockchain for transparency.
              </p>
            </div>
          )}

          {/* Feedback Editor */}
          <div className="space-y-4">
            <label className="text-lg font-semibold text-foreground">
              Your Feedback *
            </label>
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => {
                  const value = e?.target?.value || '';
                  // Enforce character limit
                  if (value.length <= maxChars) {
                    setContent(value);
                  }
                }}
                placeholder="Share your honest thoughts and feedback. Be specific about what works well and what could be improved..."
                className={`w-full h-48 px-6 py-4 bg-input border-2 rounded-2xl text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 text-lg ${
                  charCount > maxChars ? 'border-error focus:border-error' : 'border-border focus:border-accent'
                }`}
                maxLength={maxChars}
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
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground font-medium">
                Minimum {minChars} characters required
              </p>
              <div className={`flex items-center gap-1 text-sm ${getSentimentColor(sentiment)}`}>
                <Icon name={getSentimentIcon(sentiment)} size={14} />
                <span className="capitalize font-medium">Sentiment: {sentiment}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <label className="text-lg font-semibold text-foreground">
              Tags (Optional)
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e?.target?.value)}
                onKeyPress={(e) => e?.key === 'Enter' && addTag()}
                placeholder="Add a tag (e.g., ui, performance, bug)..."
                className="flex-1 px-4 py-3 bg-input border-2 border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
              />
              <Button
                variant="outline"
                onClick={addTag}
                disabled={!tagInput?.trim() || tags?.length >= 5}
                className="px-6 py-3 border-2 border-border rounded-2xl hover:border-accent/50 transition-all duration-200"
              >
                Add
              </Button>
            </div>
            {tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags?.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 bg-accent/10 text-accent rounded-lg text-sm font-medium"
                  >
                    <span>#{tag}</span>
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-accent/80 transition-colors duration-200"
                    >
                      <Icon name="X" size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submission Info */}
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Zap" size={16} className="text-accent" />
              <span className="text-sm font-semibold text-accent">Ready to Submit</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your feedback will be visible immediately and help improve the project for everyone.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-8 border-t border-border/30">
          <div className="text-sm text-muted-foreground font-medium">
            Submission will be processed immediately
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 border-2 border-border rounded-2xl hover:border-accent/50 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={(connected && content?.length < minChars) || isSubmitting || connecting}
              loading={isSubmitting || connecting}
              iconName={connected ? "Send" : "Wallet"}
              iconPosition="left"
              className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow px-8 py-3 text-lg font-bold rounded-2xl"
            >
              {isSubmitting ? 'Submitting Feedback...' : 
               connecting ? 'Connecting Wallet...' :
               connected ? 'Submit Feedback' : 'Connect Wallet'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Wallet Connection Modal */}
      <WalletConnectionModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
      />

    </div>
  );
};

export default SubmissionModal;