import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Footer from '../home/components/Footer';
import BoardHeader from './components/BoardHeader';
import FilterControls from './components/FilterControls';
import FeedbackCard from './components/FeedbackCard';
import SubmissionModal from './components/SubmissionModal';
import ShareModal from './components/ShareModal';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import SuccessNotification from '../../components/ui/SuccessNotification';
import { getBoardById, updateBoardIPFS } from '../../utils/supabaseApi';
import ipfsFetcher from '../../utils/ipfsFetcher';
import { ipfsService } from '../../services/ipfsService';
import { archiveFeedbackBoard, upvoteFeedback, downvoteFeedback } from '../../services/anchorService';
import { PublicKey } from '@solana/web3.js';
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';

const BoardView = () => {
  const { boardId } = useParams();
  const { connected, publicKey } = useWallet();
  const wallet = useAnchorWallet();
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [realFeedback, setRealFeedback] = useState([]);
  const [boardIPFSData, setBoardIPFSData] = useState(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);
  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isBoardLoading, setIsBoardLoading] = useState(true);
  const [boardNotFound, setBoardNotFound] = useState(false);
  const [showArchiveSuccess, setShowArchiveSuccess] = useState(false);

  const itemsPerPage = 12;


  // Calculate real stats from IPFS data
  const calculateStatsFromIPFS = () => {
    if (!boardIPFSData || !realFeedback.length) {
      return {
        totalSubmissions: 0,
        activeContributors: 0,
        avgResponseTime: 'N/A',
        satisfactionRate: 0,
        sentiment: { positive: 0, neutral: 0, negative: 0 },
        recentActivity: []
      };
    }

    const uniqueContributors = new Set((realFeedback || []).map(f => f?.createdBy).filter(Boolean)).size;
    
    // Calculate sentiment distribution
    const sentimentCounts = (realFeedback || []).reduce((acc, feedback) => {
      if (feedback?.sentiment) {
        acc[feedback.sentiment] = (acc[feedback.sentiment] || 0) + 1;
      }
      return acc;
    }, {});

    // Calculate average response time (simulate based on feedback frequency)
    const now = Date.now();
    const recentFeedbacks = (realFeedback || []).filter(f => {
      if (!f?.timestamp) return false;
      try {
        const feedbackTime = f.timestamp instanceof Date ? f.timestamp.getTime() : new Date(f.timestamp).getTime();
        if (isNaN(feedbackTime)) return false;
        return (now - feedbackTime) < 7 * 24 * 60 * 60 * 1000; // Last 7 days
      } catch (error) {
        return false;
      }
    });
    const avgResponseTime = recentFeedbacks.length > 1 ? '1.2h' : '2.5h';

    // Generate recent activity from real feedback
    const recentActivity = (realFeedback || [])
      .filter(f => f?.timestamp)
      .sort((a, b) => {
        try {
          const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
          const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
          if (isNaN(aTime) || isNaN(bTime)) return 0;
          return bTime - aTime;
        } catch (error) {
          return 0;
        }
      })
      .slice(0, 4)
      .map(feedback => {
        const timeAgo = getTimeAgo(feedback.timestamp);
        return {
          time: timeAgo,
          action: 'Feedback submitted',
          reward: ''
        };
      });

    return {
      totalSubmissions: boardIPFSData.total_feedback_count || realFeedback.length,
      activeContributors: uniqueContributors,
      avgResponseTime,
      satisfactionRate: Math.min(95, 60 + (realFeedback.length * 2)),
      sentiment: {
        positive: sentimentCounts.positive || 0,
        neutral: sentimentCounts.neutral || 0,
        negative: sentimentCounts.negative || 0
      },
      recentActivity
    };
  };

  // Helper function to get time ago string
  const getTimeAgo = (timestamp) => {
    try {
      if (!timestamp) return 'Just now';
      
      const now = Date.now();
      let feedbackTime;
      
      if (timestamp instanceof Date) {
        feedbackTime = timestamp.getTime();
      } else {
        const parsedDate = new Date(timestamp);
        if (isNaN(parsedDate.getTime())) {
          return 'Just now';
        }
        feedbackTime = parsedDate.getTime();
      }
      
      const diff = now - feedbackTime;
      
      // If diff is negative or NaN, return 'Just now'
      if (diff < 0 || isNaN(diff)) return 'Just now';
      
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
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
    } catch (error) {
      console.warn('Error parsing timestamp in getTimeAgo:', timestamp, error);
      return 'Just now';
    }
  };


  // Filter and sort feedback - use real feedback when available
  const feedbackToUse = Array.isArray(realFeedback) && realFeedback.length > 0 ? realFeedback : [];
  
  const filteredFeedback = (feedbackToUse || []).filter(feedback => {
    if (!feedback) return false;
    const matchesFilter = filterBy === 'all' || feedback?.sentiment === filterBy;
    const matchesSearch = searchQuery === '' || 
      feedback?.content?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      (feedback?.tags && Array.isArray(feedback.tags) && feedback.tags.some(tag => tag?.toLowerCase()?.includes(searchQuery?.toLowerCase())));
    
    return matchesFilter && matchesSearch;
  });

  const sortedFeedback = (filteredFeedback || []).sort((a, b) => {
    if (!a || !b) return 0;
    try {
      switch (sortBy) {
        case 'newest':
          const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp || 0).getTime();
          const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp || 0).getTime();
          if (isNaN(bTime) || isNaN(aTime)) return 0;
          return bTime - aTime;
        case 'oldest':
          const aTimeOld = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp || 0).getTime();
          const bTimeOld = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp || 0).getTime();
          if (isNaN(aTimeOld) || isNaN(bTimeOld)) return 0;
          return aTimeOld - bTimeOld;
        case 'helpful':
          return (b?.helpful || 0) - (a?.helpful || 0);
        default:
          return 0;
      }
    } catch (error) {
      console.warn('Error sorting feedback:', error);
      return 0;
    }
  });

  const totalPages = Math.ceil((sortedFeedback?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFeedback = (sortedFeedback || []).slice(startIndex, startIndex + itemsPerPage);

  const handleSubmitFeedback = () => {
    // Check if board is archived
    if (boardIPFSData?.is_archived || selectedBoard?.archived) {
      alert('This board has been archived and no longer accepts new feedback.');
      return;
    }
    setIsSubmissionModalOpen(true);
  };

  const handleArchiveBoard = async () => {
    if (!connected || !wallet) {
      alert('Please connect your wallet to archive the board.');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Archiving board...');
      
      // Step 1: Fetch current IPFS data
      let currentBoardData = null;
      if (selectedBoard?.ipfs_cid && selectedBoard.ipfs_cid !== 'local-only') {
        console.log('Fetching existing board data from IPFS...');
        currentBoardData = await ipfsFetcher.fetchBoardData(selectedBoard.ipfs_cid);
      }
      
      // Step 2: Update IPFS data with is_archived: true
      const updatedBoardData = {
        ...currentBoardData,
        is_archived: true, // Add/update archive flag
        archived_at: new Date().toISOString(), // Add timestamp
        // Ensure we have the basic board structure
        board_id: currentBoardData?.board_id || selectedBoard?.board_id || boardId,
        board_title: currentBoardData?.board_title || selectedBoard?.board_title,
        board_description: currentBoardData?.board_description || selectedBoard?.board_description,
        board_category: currentBoardData?.board_category || selectedBoard?.board_category || 'General',
        created_by: currentBoardData?.created_by || selectedBoard?.created_by,
        created_at: currentBoardData?.created_at || selectedBoard?.created_at,
        feedbacks: currentBoardData?.feedbacks || []
      };
      
      console.log('Uploading archived board data to IPFS...');
      const ipfsUploadResult = await ipfsService.uploadBoardToIPFS(updatedBoardData);
      
      if (!ipfsUploadResult.success) {
        throw new Error(`Failed to upload to IPFS: ${ipfsUploadResult.error}`);
      }
      
      // Step 3: Call blockchain to archive board
      console.log('Archiving board on blockchain...');
      const tx = await archiveFeedbackBoard(wallet, selectedBoard.board_id || boardId);
      console.log('Board archived on blockchain:', tx);
      
      // Step 4: Update Supabase with new CID
      console.log('Updating board CID in database...');
      await updateBoardIPFS(selectedBoard.board_id || boardId, ipfsUploadResult.cid);
      
      // Step 5: Cleanup old IPFS file
      if (selectedBoard?.ipfs_cid && selectedBoard.ipfs_cid !== ipfsUploadResult.cid) {
        try {
          console.log('🗑️ Deleting old IPFS file...');
          await ipfsService.deleteByCID(selectedBoard.ipfs_cid);
          console.log('✅ Old IPFS file deleted');
        } catch (deleteError) {
          console.warn('Failed to delete old IPFS file:', deleteError);
        }
      }

      // Step 6: Update local state
      setBoardIPFSData(updatedBoardData);
      setSelectedBoard(prev => ({ ...prev, archived: true, is_archived: true, ipfs_cid: ipfsUploadResult.cid }));
      
      setShowArchiveSuccess(true);
    } catch (error) {
      console.error('Error archiving board:', error);
      alert(`Failed to archive board: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpvoteFeedback = async (feedback) => {
    if (!connected || !wallet) {
      alert('Please connect your wallet to vote on feedback.');
      return;
    }

    try {
      console.log('Upvoting feedback:', feedback);
      setIsLoading(true);
      
      // Step 1: Fetch current IPFS data
      let currentBoardData = null;
      if (selectedBoard?.ipfs_cid && selectedBoard.ipfs_cid !== 'local-only') {
        console.log('Fetching existing board data from IPFS...');
        currentBoardData = await ipfsFetcher.fetchBoardData(selectedBoard.ipfs_cid);
      }
      
      if (!currentBoardData || !currentBoardData.feedbacks) {
        throw new Error('Board data not found');
      }
      
      // Step 2: Find and update the feedback with upvote
      const updatedFeedbacks = currentBoardData.feedbacks.map(fb => {
        if (fb.feedback_id === feedback.feedback_id) {
          return {
            ...fb,
            upvotes: (fb.upvotes || 0) + 1, // Add upvotes field if not exists
            downvotes: fb.downvotes || 0 // Ensure downvotes field exists
          };
        }
        return {
          ...fb,
          upvotes: fb.upvotes || 0, // Ensure upvotes field exists
          downvotes: fb.downvotes || 0 // Ensure downvotes field exists
        };
      });
      
      // Step 3: Update IPFS data with new vote counts
      const updatedBoardData = {
        ...currentBoardData,
        feedbacks: updatedFeedbacks,
        latest_feedback_at: new Date().toISOString(),
        latest_feedback_by: publicKey.toString()
      };
      
      console.log('Uploading updated board data to IPFS...');
      const ipfsUploadResult = await ipfsService.uploadBoardToIPFS(updatedBoardData);
      
      if (!ipfsUploadResult.success) {
        throw new Error(`Failed to upload to IPFS: ${ipfsUploadResult.error}`);
      }
      
      // Step 4: Call blockchain upvote function
      console.log('Recording upvote on blockchain...');
      const creatorPubkey = new PublicKey(selectedBoard.created_by || selectedBoard.owner);
      const tx = await upvoteFeedback(wallet, creatorPubkey, selectedBoard.board_id || boardId, ipfsUploadResult.cid);
      console.log('Upvote recorded on blockchain:', tx);
      
      // Step 5: Update Supabase with new CID
      console.log('Updating board CID in database...');
      await updateBoardIPFS(selectedBoard.board_id || boardId, ipfsUploadResult.cid);
      
      // Step 6: Cleanup old IPFS file
      if (selectedBoard?.ipfs_cid && selectedBoard.ipfs_cid !== ipfsUploadResult.cid) {
        try {
          console.log('🗑️ Deleting old IPFS file...');
          await ipfsService.deleteByCID(selectedBoard.ipfs_cid);
          console.log('✅ Old IPFS file deleted');
        } catch (deleteError) {
          console.warn('Failed to delete old IPFS file:', deleteError);
        }
      }

      // Step 7: Update local state
      setBoardIPFSData(updatedBoardData);
      setRealFeedback(updatedFeedbacks);
      setSelectedBoard(prev => ({ ...prev, ipfs_cid: ipfsUploadResult.cid }));
      
      console.log('✅ Upvote completed successfully');
    } catch (error) {
      console.error('Error upvoting feedback:', error);
      alert(`Failed to upvote feedback: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownvoteFeedback = async (feedback) => {
    if (!connected || !wallet) {
      alert('Please connect your wallet to vote on feedback.');
      return;
    }

    try {
      console.log('Downvoting feedback:', feedback);
      setIsLoading(true);
      
      // Step 1: Fetch current IPFS data
      let currentBoardData = null;
      if (selectedBoard?.ipfs_cid && selectedBoard.ipfs_cid !== 'local-only') {
        console.log('Fetching existing board data from IPFS...');
        currentBoardData = await ipfsFetcher.fetchBoardData(selectedBoard.ipfs_cid);
      }
      
      if (!currentBoardData || !currentBoardData.feedbacks) {
        throw new Error('Board data not found');
      }
      
      // Step 2: Find and update the feedback with downvote
      const updatedFeedbacks = currentBoardData.feedbacks.map(fb => {
        if (fb.feedback_id === feedback.feedback_id) {
          return {
            ...fb,
            upvotes: fb.upvotes || 0, // Ensure upvotes field exists
            downvotes: (fb.downvotes || 0) + 1 // Add downvotes field if not exists
          };
        }
        return {
          ...fb,
          upvotes: fb.upvotes || 0, // Ensure upvotes field exists
          downvotes: fb.downvotes || 0 // Ensure downvotes field exists
        };
      });
      
      // Step 3: Update IPFS data with new vote counts
      const updatedBoardData = {
        ...currentBoardData,
        feedbacks: updatedFeedbacks,
        latest_feedback_at: new Date().toISOString(),
        latest_feedback_by: publicKey.toString()
      };
      
      console.log('Uploading updated board data to IPFS...');
      const ipfsUploadResult = await ipfsService.uploadBoardToIPFS(updatedBoardData);
      
      if (!ipfsUploadResult.success) {
        throw new Error(`Failed to upload to IPFS: ${ipfsUploadResult.error}`);
      }
      
      // Step 4: Call blockchain downvote function
      console.log('Recording downvote on blockchain...');
      const creatorPubkey = new PublicKey(selectedBoard.created_by || selectedBoard.owner);
      const tx = await downvoteFeedback(wallet, creatorPubkey, selectedBoard.board_id || boardId, ipfsUploadResult.cid);
      console.log('Downvote recorded on blockchain:', tx);
      
      // Step 5: Update Supabase with new CID
      console.log('Updating board CID in database...');
      await updateBoardIPFS(selectedBoard.board_id || boardId, ipfsUploadResult.cid);
      
      // Step 6: Cleanup old IPFS file
      if (selectedBoard?.ipfs_cid && selectedBoard.ipfs_cid !== ipfsUploadResult.cid) {
        try {
          console.log('🗑️ Deleting old IPFS file...');
          await ipfsService.deleteByCID(selectedBoard.ipfs_cid);
          console.log('✅ Old IPFS file deleted');
        } catch (deleteError) {
          console.warn('Failed to delete old IPFS file:', deleteError);
        }
      }

      // Step 7: Update local state
      setBoardIPFSData(updatedBoardData);
      setRealFeedback(updatedFeedbacks);
      setSelectedBoard(prev => ({ ...prev, ipfs_cid: ipfsUploadResult.cid }));
      
      console.log('✅ Downvote completed successfully');
    } catch (error) {
      console.error('Error downvoting feedback:', error);
      alert(`Failed to downvote feedback: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (currentPage >= totalPages) return;
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCurrentPage(prev => prev + 1);
    setIsLoading(false);
  };

  // Handle export data functionality
  const handleExportData = async () => {
    if (!selectedBoard || !boardIPFSData) {
      alert('No board data available to export');
      return;
    }

    setIsExporting(true);
    
    try {
      // Create a comprehensive export object
      const exportData = {
        export_info: {
          exported_at: new Date().toISOString(),
          board_id: selectedBoard.board_id || selectedBoard.id,
          total_feedbacks: realFeedback.length,
          export_version: '1.0'
        },
        board_data: boardIPFSData,
        processed_feedbacks: realFeedback.map(feedback => ({
          ...feedback,
          timestamp: feedback.timestamp instanceof Date ? feedback.timestamp.toISOString() : new Date().toISOString() // Safe conversion
        })),
        statistics: calculateStatsFromIPFS()
      };

      // Convert to JSON string
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // Create blob and download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `board-${selectedBoard.board_id || selectedBoard.id}-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('Board data exported successfully');
      
    } catch (error) {
      console.error('Error exporting board data:', error);
      alert('Failed to export board data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Fetch board data and validate existence
  useEffect(() => {
    const fetchBoardData = async () => {
      if (!boardId) return;
      
      try {
        setIsBoardLoading(true);
        setBoardNotFound(false);
        setIsLoadingFeedback(true);
        setFeedbackError(null);
        
        console.log('Fetching board data from database...', boardId);
        
        // Get board data from database first
        let boardDbData = null;
        try {
          boardDbData = await getBoardById(boardId);
        } catch (dbError) {
          console.warn('Failed to fetch board from database:', dbError.message);
          setBoardNotFound(true);
          setIsBoardLoading(false);
          setIsLoadingFeedback(false);
          return;
        }
        
        if (!boardDbData) {
          console.log('Board not found in database');
          setBoardNotFound(true);
          setIsBoardLoading(false);
          setIsLoadingFeedback(false);
          return;
        }

        // Set the board data and mark as found
        setSelectedBoard(boardDbData);
        setBoardNotFound(false);
        setIsBoardLoading(false);
        console.log('Board found:', boardDbData);
        
        // Fetch board data from IPFS if CID exists
        if (boardDbData.ipfs_cid && boardDbData.ipfs_cid !== 'local-only') {
          console.log('Fetching board data from IPFS with CID:', boardDbData.ipfs_cid);
          let ipfsData = null;
          try {
            if (ipfsFetcher.isAvailable()) {
              ipfsData = await ipfsFetcher.fetchBoardData(boardDbData.ipfs_cid);
            } else {
              console.log('IPFS not available, using database data only');
            }
          } catch (ipfsError) {
            console.warn('IPFS fetch failed for board data:', ipfsError.message);
            ipfsData = null;
          }
          
          if (ipfsData) {
            console.log('Successfully fetched IPFS data:', ipfsData);
            setBoardIPFSData(ipfsData);
            
            // Extract feedbacks from IPFS data
            const feedbacks = ipfsData.feedbacks || [];
            console.log(`Found ${feedbacks.length} feedbacks in IPFS data`);
            
            // Transform IPFS feedback format to component format
            const transformedFeedbacks = feedbacks.map((feedback, index) => {
              // Safe timestamp parsing
              let timestamp = new Date();
              try {
                if (feedback.created_at) {
                  timestamp = new Date(feedback.created_at);
                  // Check if date is valid
                  if (isNaN(timestamp.getTime())) {
                    timestamp = new Date();
                  }
                }
              } catch (error) {
                console.warn('Invalid timestamp for feedback:', feedback.created_at);
                timestamp = new Date();
              }

              return {
                id: feedback.feedback_id || `fb_${index}`,
                feedback_id: feedback.feedback_id || `fb_${index}`, // Add feedback_id for voting
                content: feedback.feedback_text || feedback.content || '',
                timestamp: timestamp,
                sentiment: feedback.feedback_type || 'neutral',
                tags: Array.isArray(feedback.tags) ? feedback.tags : [], // Ensure tags is always an array
                createdBy: feedback.created_by || 'Anonymous',
                upvotes: feedback.upvotes || 0, // Add upvotes field
                downvotes: feedback.downvotes || 0 // Add downvotes field
              };
            });
            
            setRealFeedback(transformedFeedbacks);
          } else {
            console.log('No IPFS data found');
            setRealFeedback([]);
            setBoardIPFSData(null);
          }
        } else {
          console.log('No IPFS CID found, using empty feedback');
          setRealFeedback([]);
          setBoardIPFSData(null);
        }
        
      } catch (error) {
        console.error('Error fetching board feedback:', error);
        // Don't show error to user, just use empty state
        console.log('Using empty feedback state due to fetch error');
        setFeedbackError(null);
        setRealFeedback([]);
        setBoardIPFSData(null);
      } finally {
        setIsLoadingFeedback(false);
      }
    };
    
    fetchBoardData();
  }, [boardId]);

  // Don't render main content if board is loading or not found
  if (isBoardLoading || !selectedBoard) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="glass-card p-12 text-center">
              <Icon name="Loader2" size={64} className="text-accent animate-spin mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Loading Board
              </h2>
              <p className="text-muted-foreground text-lg">
                Fetching board data from the blockchain...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (boardNotFound) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-lg w-full">
            <div className="glass-card p-12 text-center border-2 border-error/20 bg-error/5 rounded-3xl shadow-2xl">
              {/* Error Icon with animation */}
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Icon name="SearchX" size={48} className="text-error" />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-foreground mb-4">
                Board Not Found
              </h2>
              
              <div className="space-y-3 mb-8">
                <p className="text-muted-foreground text-lg">
                  The board with ID
                </p>
                <div className="bg-muted/30 border border-border/50 rounded-xl p-4 mx-auto max-w-full overflow-hidden">
                  <code className="font-mono text-foreground text-lg font-semibold tracking-wider break-all word-wrap">
                    {boardId}
                  </code>
                </div>
                <p className="text-muted-foreground">
                  doesn't exist.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/board/all">
                  <Button
                    variant="default"
                    size="lg"
                    iconName="List"
                    iconPosition="left"
                    className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow w-full sm:w-auto"
                  >
                    View All Boards
                  </Button>
                </Link>
                <Link to="/board/create">
                  <Button
                    variant="outline"
                    size="lg"
                    iconName="Plus"
                    iconPosition="left"
                    className="border-accent/30 text-accent hover:bg-accent/10 hover:text-white w-full sm:w-auto"
                  >
                    Create Your Board
                  </Button>
                </Link>
              </div>
              
              {/* Decorative elements */}
              <div className="mt-8 pt-8 border-t border-border/30">
                <p className="text-xs text-muted-foreground/70">
                  Double-check the URL or browse our available boards
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Back to all boards */}
          <div className="mb-6">
            <Link to="/board/all">
              <Button
                variant="outline"
                iconName="ArrowLeft"
                iconPosition="left"
                className="text-muted-foreground hover:text-foreground"
              >
                Back to All Boards
              </Button>
            </Link>
          </div>
          
          {/* Board Header */}
          <BoardHeader 
            board={{
              ...selectedBoard,
              // Override with real IPFS data if available
              ...(boardIPFSData && {
                board_title: boardIPFSData.board_title,
                title: boardIPFSData.board_title, // Keep both for compatibility
                board_description: boardIPFSData.board_description,
                description: boardIPFSData.board_description, // Keep both for compatibility
                board_category: boardIPFSData.board_category,
                category: boardIPFSData.board_category, // Keep both for compatibility
                created_at: boardIPFSData.created_at,
                createdAt: boardIPFSData.created_at, // Keep both for compatibility
                totalSubmissions: boardIPFSData.total_feedback_count,
                created_by: boardIPFSData.created_by
              })
            }}
            onSubmitFeedback={handleSubmitFeedback}
            onArchiveBoard={handleArchiveBoard}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Filter Controls */}
              <FilterControls
                sortBy={sortBy}
                setSortBy={setSortBy}
                filterBy={filterBy}
                setFilterBy={setFilterBy}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                totalCount={feedbackToUse?.length}
                filteredCount={filteredFeedback?.length}
              />

              {/* Feedback List */}
              <div className="space-y-4">
                {/* Loading State */}
                {isLoadingFeedback && (
                  <div className="glass-card p-12 text-center">
                    <Icon name="Loader2" size={48} className="text-accent animate-spin mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Loading Feedback from IPFS...
                    </h3>
                    <p className="text-muted-foreground">
                      Fetching real feedback data from the blockchain
                    </p>
                  </div>
                )}

                {/* Error State */}
                {feedbackError && !isLoadingFeedback && (
                  <div className="glass-card p-12 text-center border border-error/20 bg-error/10">
                    <Icon name="AlertTriangle" size={48} className="text-error mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Error Loading Feedback
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {feedbackError}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => window.location.reload()}
                      iconName="RefreshCw"
                      iconPosition="left"
                      className="border-error/30 text-error hover:bg-error/10 hover:text-white"
                    >
                      Try Again
                    </Button>
                  </div>
                )}

                {/* Real Feedback Content */}
                {!isLoadingFeedback && !feedbackError && (
                  <>
                    {paginatedFeedback?.length > 0 ? (
                      <>
                        {paginatedFeedback?.map((feedback) => (
                          <div key={feedback?.id}>
                            <FeedbackCard 
                              feedback={feedback}
                              onUpvote={handleUpvoteFeedback}
                              onDownvote={handleDownvoteFeedback}
                              isArchived={boardIPFSData?.is_archived || selectedBoard?.archived}
                            />
                          </div>
                        ))}
                        
                        {/* Load More / Pagination */}
                        {currentPage < totalPages && (
                          <div className="flex justify-center pt-6">
                            <Button
                              variant="outline"
                              onClick={loadMore}
                              loading={isLoading}
                              iconName="ChevronDown"
                              iconPosition="right"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {isLoading ? 'Loading...' : `Load More (${totalPages - currentPage} pages remaining)`}
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="glass-card p-12 text-center">
                        {realFeedback.length === 0 ? (
                          // No feedback exists yet
                          <>
                            <Icon name="MessageSquare" size={48} className="text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                              No Feedback Yet
                            </h3>
                            <p className="text-muted-foreground mb-6">
                              This board doesn't have any feedback yet. Be the first to share your thoughts!
                            </p>
                            <Button
                              variant="default"
                              onClick={handleSubmitFeedback}
                              iconName="Plus"
                              iconPosition="left"
                              className="bg-accent text-accent-foreground hover:bg-accent/90"
                            >
                              Submit First Feedback
                            </Button>
                          </>
                        ) : (
                          // Feedback exists but filtered out
                          <>
                            <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                              No Matching Feedback
                            </h3>
                            <p className="text-muted-foreground mb-6">
                              Try adjusting your filters or search terms to see more feedback
                            </p>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSearchQuery('');
                                setFilterBy('all');
                              }}
                              iconName="X"
                              iconPosition="left"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              Clear Filters
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    fullWidth
                    iconName="Share"
                    iconPosition="left"
                    className="justify-start"
                    onClick={() => setIsShareModalOpen(true)}
                  >
                    Share Board
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    iconName="Download"
                    iconPosition="left"
                    className="justify-start"
                    onClick={handleExportData}
                    loading={isExporting}
                    disabled={!boardIPFSData || isExporting}
                  >
                    {isExporting ? 'Exporting...' : 'Export Data'}
                  </Button>
                </div>
              </div>

              {/* Simple Info */}
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="Info" size={16} className="text-accent" />
                  <span className="text-sm font-semibold text-accent">How It Works</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Simply share your thoughts and feedback. No registration required - just write, submit, and go.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Submission Modal */}
      <SubmissionModal
        isOpen={isSubmissionModalOpen}
        onClose={() => setIsSubmissionModalOpen(false)}
        board={selectedBoard}
        boardCreator={boardIPFSData?.created_by}
        onSuccess={() => setShowFeedbackSuccess(true)}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        board={{
          id: selectedBoard?.id,
          title: boardIPFSData?.board_title || selectedBoard?.title,
          description: boardIPFSData?.board_description || selectedBoard?.board_description || selectedBoard?.description
        }}
      />

      {/* Feedback Success Notification */}
      <SuccessNotification
        isOpen={showFeedbackSuccess}
        onClose={() => setShowFeedbackSuccess(false)}
        title="Feedback Submitted Successfully! 🎉"
        message="Your feedback has been stored on IPFS and submitted on-chain via Solana blockchain. Thank you for contributing to this board!"
        actionText="View Updated Board"
        onAction={() => window.location.reload()}
        duration={6000}
      />

      {/* Archive Success Notification */}
      <SuccessNotification
        isOpen={showArchiveSuccess}
        onClose={() => setShowArchiveSuccess(false)}
        title="Board Archived Successfully! 📁"
        message="Your board has been archived and stored on IPFS with blockchain confirmation. No new feedback can be submitted, but existing feedback remains visible."
        actionText="Got it"
        onAction={() => setShowArchiveSuccess(false)}
        duration={6000}
      />
      
      <Footer />
    </div>
  );
};

export default BoardView;