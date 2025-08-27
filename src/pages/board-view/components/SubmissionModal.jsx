import React, { useState, useEffect } from 'react';
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import WalletConnectionModal from '../../../components/wallet/WalletConnectionModal';
import ErrorNotification from '../../../components/ui/ErrorNotification';
import { generateFeedbackHash } from '../../../utils/boardUtils';
import { getBoardById, updateBoardIPFS } from '../../../utils/supabaseApi';
import { ipfsService } from '../../../services/ipfsService';
import ipfsFetcher from '../../../utils/ipfsFetcher';
import { submitFeedback } from '../../../services/anchorService';
import { checkSolBalance, formatSolBalance } from '../../../utils/balanceUtils';
import { aiService } from '../../../services/aiService';

const SubmissionModal = ({ isOpen, onClose, board, onSuccess, boardCreator }) => {
  // Wallet connection
  const { connected, connecting, publicKey } = useWallet();
  const wallet = useAnchorWallet();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  
  // Error notification state
  const [errorNotification, setErrorNotification] = useState({
    isOpen: false,
    title: '',
    message: '',
    actionText: '',
    onAction: null
  });

  // Balance checking state
  const [balanceInfo, setBalanceInfo] = useState({
    balance: 0,
    hasEnoughBalance: true,
    isChecking: false,
    error: null
  });
  
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentiment, setSentiment] = useState('neutral');
  const [charCount, setCharCount] = useState(0);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const maxChars = 2000;
  const minChars = 50;

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Prevent scrolling
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      
      return () => {
        // Restore scrolling
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

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

  // Check balance when wallet connects and modal opens
  useEffect(() => {
    const checkBalance = async () => {
      if (isOpen && connected && publicKey) {
        setBalanceInfo(prev => ({ ...prev, isChecking: true }));
        const result = await checkSolBalance(publicKey);
        setBalanceInfo({
          balance: result.balance,
          hasEnoughBalance: result.hasEnoughBalance,
          isChecking: false,
          error: result.error
        });
      } else if (!connected) {
        setBalanceInfo({
          balance: 0,
          hasEnoughBalance: true,
          isChecking: false,
          error: null
        });
      }
    };

    checkBalance();
  }, [isOpen, connected, publicKey]);

  const handleSubmit = async () => {
    console.log('handleSubmit called - Wallet states:');
    console.log('- connected:', connected);
    console.log('- wallet:', wallet);
    console.log('- publicKey:', publicKey?.toString());
    
    if (!connected) {
      setIsWalletModalOpen(true);
      return;
    }
    
    // Safety check: prevent board creators from submitting feedback
    if (connected && publicKey && boardCreator && publicKey.toString() === boardCreator) {
      setErrorNotification({
        isOpen: true,
        title: 'Cannot Submit Feedback',
        message: 'You cannot give feedback on your own board. Share your board with others to collect their feedback.',
        actionText: null,
        onAction: null
      });
      return;
    }
    
    if (content?.length < minChars || !publicKey) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('Starting feedback submission process...');
      
      // Step 1: Get board data from database
      const boardDbData = await getBoardById(board.board_id || board.id);
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
      
      // Step 3: Analyze sentiment using AI service
      console.log('🤖 Analyzing feedback sentiment...');
      console.log('Content to analyze:', content);
      let analyzedSentiment = sentiment; // fallback to manual selection
      
      try {
        // Validate content before sending to AI
        if (content && typeof content === 'string' && content.trim().length > 0) {
          analyzedSentiment = await aiService.analyzeSentiment(content.trim());
          console.log(`✅ AI sentiment analysis: ${analyzedSentiment}`);
        } else {
          console.warn('⚠️ Invalid content for sentiment analysis, using manual selection');
          analyzedSentiment = sentiment;
        }
      } catch (sentimentError) {
        console.warn('⚠️ AI sentiment analysis failed, using manual selection:', sentimentError);
        analyzedSentiment = sentiment; // fallback to user's manual selection
      }

      // Step 4: Generate feedback ID and create new feedback object
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
        feedback_type: analyzedSentiment, // Use AI-analyzed sentiment
        created_by: publicKey.toString(),
        created_at: timestamp,
        tags: formattedTags
      };
      
      // Step 5: Update board data with new feedback
      const updatedBoardData = {
        ...currentBoardData,
        // Ensure we have the basic board structure
        board_id: currentBoardData?.board_id || board.board_id || board.id,
        board_title: currentBoardData?.board_title || board.board_title || board.title,
        board_description: currentBoardData?.board_description || board.board_description || board.description,
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
      
      // Step 6: Upload new version to IPFS (keep original untouched for now)
      const oldCid = boardDbData.ipfs_cid;
      
      // Upload the new version (original stays untouched)
      console.log('📤 Uploading new version to IPFS...');
      const ipfsUploadResult = await ipfsService.uploadBoardToIPFS(updatedBoardData);
      
      if (!ipfsUploadResult.success) {
        throw new Error(`Failed to upload to IPFS: ${ipfsUploadResult.error}`);
      }
      
      console.log('✅ New IPFS version uploaded:', ipfsUploadResult);
      console.log('📝 Original file still exists at CID:', oldCid);
      
      // Step 7: Submit feedback on-chain using Anchor (CRITICAL STEP)
      let anchorTx = null;
      let blockchainSuccess = false;
      
      console.log('🚀 Submitting feedback on-chain...');
      console.log('Wallet:', wallet?.publicKey?.toString());
      console.log('Board creator:', boardDbData.created_by || boardDbData.owner);
      console.log('Board ID:', board.board_id || board.id);
      console.log('IPFS CID:', ipfsUploadResult.cid);
      
      try {
        if (!wallet) {
          throw new Error('Wallet not available for blockchain submission');
        }
        
        // Use board creator or owner as fallback
        const creatorPubkey = new PublicKey(boardDbData.created_by || boardDbData.owner);
        
        console.log('🔗 Calling submitFeedback anchor service...');
        anchorTx = await submitFeedback(
          wallet,
          creatorPubkey,
          board.board_id || board.id,
          ipfsUploadResult.cid
        );
        
        blockchainSuccess = true;
        console.log('✅ Feedback submitted on-chain successfully:', anchorTx);
        
      } catch (anchorError) {
        console.error('💥 Blockchain submission failed:', anchorError);
        console.error('Anchor error details:', {
          message: anchorError.message,
          logs: anchorError.logs,
          programErrorStack: anchorError.programErrorStack
        });
        
        // CRITICAL: Delete the new version since blockchain failed
        if (ipfsUploadResult.cid) {
          console.log('🗑️ Deleting new version due to blockchain failure...');
          try {
            await ipfsService.deleteByCID(ipfsUploadResult.cid);
            console.log('✅ Failed new version deleted from IPFS');
            console.log('📝 Original version remains untouched at CID:', oldCid);
          } catch (cleanupError) {
            console.error('❌ Failed to cleanup new version:', cleanupError);
          }
        }
        
        // Re-throw the error to prevent database update
        throw new Error(`Blockchain submission failed: ${anchorError.message}`);
      }
      
      // Step 7: ONLY if blockchain succeeded - cleanup old and update database
      if (blockchainSuccess) {
        console.log('✅ Blockchain successful, cleaning up old version and updating database...');
        
        // Delete the old version now that blockchain succeeded
        if (oldCid) {
          console.log('🗑️ Attempting to delete old IPFS file with CID:', oldCid);
          try {
            const deleteResult = await ipfsService.deleteByCID(oldCid);
            if (deleteResult.success) {
              console.log('✅ Old version deleted from IPFS successfully');
            } else {
              console.warn('⚠️ IPFS delete operation returned failure:', deleteResult.error);
            }
          } catch (cleanupError) {
            console.error('❌ Failed to delete old version from IPFS:', cleanupError);
          }
        } else {
          console.log('⚠️ No old CID to delete');
        }
        
        // Update database with new CID
        await updateBoardIPFS(board.board_id || board.id, ipfsUploadResult.cid);
        console.log('✅ Database updated with new CID:', ipfsUploadResult.cid);
      } else {
        throw new Error('Blockchain submission failed, database and IPFS remain unchanged');
      }
      
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
      console.error('💥 Feedback submission failed:', error);
      
      // Show user-friendly error message based on specific error types
      const getErrorDetails = (error) => {
        const errorMsg = error.message?.toLowerCase() || '';
        const errorString = JSON.stringify(error).toLowerCase();
        
        // Check for insufficient balance errors
        if (errorMsg.includes('insufficient') || 
            errorMsg.includes('not enough') ||
            errorMsg.includes('balance') ||
            errorString.includes('insufficient') ||
            errorString.includes('0x1') || // Solana insufficient funds error code
            errorMsg.includes('account does not have enough sol')) {
          return {
            title: 'Insufficient Balance',
            message: 'You don\'t have enough SOL to complete this transaction. Please add more SOL to your wallet and try again.',
            actionText: 'Add SOL'
          };
        }
        
        // Check for wallet connection errors
        if (errorMsg.includes('wallet not connected') ||
            errorMsg.includes('user rejected') ||
            errorMsg.includes('user denied') ||
            errorMsg.includes('user cancelled')) {
          return {
            title: 'Wallet Connection Issue',
            message: 'Please connect your wallet and approve the transaction to continue.',
            actionText: 'Connect Wallet'
          };
        }
        
        // Check for network/RPC errors
        if (errorMsg.includes('network') ||
            errorMsg.includes('rpc') ||
            errorMsg.includes('connection') ||
            errorMsg.includes('timeout')) {
          return {
            title: 'Network Connection Error',
            message: 'Unable to connect to the Solana network. Please check your internet connection and try again.',
            actionText: 'Retry'
          };
        }
        
        // Check for transaction failures
        if (errorMsg.includes('transaction failed') ||
            errorMsg.includes('simulation failed') ||
            errorMsg.includes('blockhash not found')) {
          return {
            title: 'Transaction Failed',
            message: 'The blockchain transaction failed. This might be due to network congestion. Please try again.',
            actionText: 'Retry Transaction'
          };
        }
        
        // Check for IPFS errors
        if (error.message.includes('Failed to upload to IPFS') ||
            errorMsg.includes('ipfs') ||
            errorMsg.includes('pinata')) {
          return {
            title: 'IPFS Upload Failed',
            message: 'Failed to upload data to IPFS. Please check your internet connection and try again.',
            actionText: 'Retry Upload'
          };
        }
        
        // Default blockchain error
        if (error.message.includes('Blockchain submission failed')) {
          return {
            title: 'Blockchain Error',
            message: 'The blockchain transaction encountered an error. Please try again or contact support if the issue persists.',
            actionText: 'Try Again'
          };
        }
        
        // Generic error
        return {
          title: 'Feedback Submission Failed',
          message: error.message || 'An unexpected error occurred. Please try again.',
          actionText: 'Try Again'
        };
      };
      
      const errorDetails = getErrorDetails(error);
      
      setErrorNotification({
        isOpen: true,
        title: errorDetails.title,
        message: errorDetails.message,
        actionText: errorDetails.actionText,
        onAction: null
      });
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


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto glass-card rounded-2xl sm:rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-8 border-b border-border/30">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Submit Your Feedback</h2>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
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
        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
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
          <div className="space-y-3 sm:space-y-4">
            <label className="text-base sm:text-lg font-semibold text-foreground">
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
                className={`w-full h-32 sm:h-48 px-4 sm:px-6 py-3 sm:py-4 bg-input border-2 rounded-xl sm:rounded-2xl text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 text-sm sm:text-lg ${
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
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3 sm:space-y-4">
            <label className="text-base sm:text-lg font-semibold text-foreground">
              Tags (Optional)
            </label>
            <div className="flex gap-2 sm:gap-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e?.target?.value)}
                onKeyPress={(e) => e?.key === 'Enter' && addTag()}
                placeholder="Add a tag..."
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-input border-2 border-border rounded-xl sm:rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 text-sm sm:text-base"
              />
              <Button
                variant="outline"
                onClick={addTag}
                disabled={!tagInput?.trim() || tags?.length >= 5}
                className="px-4 sm:px-6 py-2 sm:py-3 border-2 border-border rounded-xl sm:rounded-2xl hover:border-accent/50 transition-all duration-200 text-sm sm:text-base"
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
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-8 border-t border-border/30 gap-4 sm:gap-0">
          <div className="text-xs sm:text-sm text-muted-foreground font-medium text-center sm:text-left">
            Submission will be processed immediately
          </div>
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 border-2 border-border rounded-xl sm:rounded-2xl hover:border-accent/50 transition-all duration-200 text-sm sm:text-base"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={(connected && content?.length < minChars) || isSubmitting || connecting || balanceInfo.isChecking || (connected && !balanceInfo.hasEnoughBalance)}
              loading={isSubmitting || connecting || balanceInfo.isChecking}
              iconName={connected ? (balanceInfo.hasEnoughBalance ? "Send" : "AlertTriangle") : "Wallet"}
              iconPosition="left"
              className={`flex-1 sm:flex-none shadow-glow px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-lg font-bold rounded-xl sm:rounded-2xl ${
                connected && !balanceInfo.hasEnoughBalance 
                  ? 'bg-error text-white hover:bg-error/90' 
                  : 'bg-accent text-accent-foreground hover:bg-accent/90'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 
               connecting ? 'Connecting...' :
               balanceInfo.isChecking ? 'Checking Balance...' :
               connected && !balanceInfo.hasEnoughBalance ? `Insufficient Balance (${formatSolBalance(balanceInfo.balance)})` :
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

      {/* Error Notification */}
      <ErrorNotification
        isOpen={errorNotification.isOpen}
        onClose={() => setErrorNotification({ ...errorNotification, isOpen: false })}
        title={errorNotification.title}
        message={errorNotification.message}
        actionText={errorNotification.actionText}
        onAction={errorNotification.onAction}
      />

    </div>
  );
};

export default SubmissionModal;