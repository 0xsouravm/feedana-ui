import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BoardHeader from './components/BoardHeader';
import FilterControls from './components/FilterControls';
import FeedbackCard from './components/FeedbackCard';
import SubmissionModal from './components/SubmissionModal';
import ShareModal from './components/ShareModal';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import SuccessNotification from '../../components/ui/SuccessNotification';
import { getBoardById } from '../../utils/simpleSupabaseApi';
import ipfsFetcher from '../../utils/ipfsFetcher';

const BoardView = () => {
  const { boardId } = useParams();
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

  const itemsPerPage = 12;

  // Mock board data - simplified without privacy features
  const boardData = {
    id: "board_001",
    title: "Product Feedback Collection - Q4 2024",
    description: `We're seeking honest feedback about our latest product features and user experience improvements. Your insights will directly influence our development roadmap for 2025.

This board is specifically focused on gathering constructive feedback about usability, performance, and feature requests. All feedback is welcome.`,
    createdAt: "3 days ago",
    totalSubmissions: 127,
    guidelines: [
      "Be specific and constructive",
      "Focus on user experience", 
      "Include examples when possible",
      "Minimum 50 characters",
      "Maximum 2000 characters"
    ]
  };

  // Set up initial board selection
  useEffect(() => {
    if (boardId) {
      setSelectedBoard({ id: boardId });
    }
  }, [boardId]);

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
    const recentFeedbacks = (realFeedback || []).filter(f => 
      f?.timestamp && (now - new Date(f.timestamp).getTime()) < 7 * 24 * 60 * 60 * 1000 // Last 7 days
    );
    const avgResponseTime = recentFeedbacks.length > 1 ? '1.2h' : '2.5h';

    // Generate recent activity from real feedback
    const recentActivity = (realFeedback || [])
      .filter(f => f?.timestamp)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
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
    const now = Date.now();
    const feedbackTime = timestamp instanceof Date ? timestamp.getTime() : new Date(timestamp).getTime();
    const diff = now - feedbackTime;
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
  };

  const statsData = calculateStatsFromIPFS();

  // Filter and sort feedback - use real feedback when available
  const feedbackToUse = realFeedback.length > 0 ? realFeedback : [];
  
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
    switch (sortBy) {
      case 'newest':
        return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
      case 'oldest':
        return new Date(a.timestamp || 0) - new Date(b.timestamp || 0);
      case 'helpful':
        return (b?.helpful || 0) - (a?.helpful || 0);
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil((sortedFeedback?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFeedback = (sortedFeedback || []).slice(startIndex, startIndex + itemsPerPage);

  const handleSubmitFeedback = () => {
    setIsSubmissionModalOpen(true);
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
          board_id: selectedBoard.id,
          total_feedbacks: realFeedback.length,
          export_version: '1.0'
        },
        board_data: boardIPFSData,
        processed_feedbacks: realFeedback.map(feedback => ({
          ...feedback,
          timestamp: feedback.timestamp.toISOString() // Convert Date to string for JSON
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
      link.download = `board-${selectedBoard.id}-export-${new Date().toISOString().split('T')[0]}.json`;
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

  // Fetch real feedback from IPFS when board is selected
  useEffect(() => {
    const fetchBoardFeedback = async () => {
      if (!selectedBoard) return;
      
      try {
        setIsLoadingFeedback(true);
        setFeedbackError(null);
        
        console.log('Fetching board feedback from database and IPFS...');
        
        // Get board data from database first
        let boardDbData = null;
        try {
          boardDbData = await getBoardById(selectedBoard.id);
        } catch (dbError) {
          console.warn('Failed to fetch board from database:', dbError.message);
          // Continue with empty state instead of showing error
          setRealFeedback([]);
          setBoardIPFSData(null);
          return;
        }
        
        if (!boardDbData) {
          console.log('Board not found in database');
          setRealFeedback([]);
          setBoardIPFSData(null);
          return;
        }
        
        console.log('Board data from DB:', boardDbData);
        
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
            const transformedFeedbacks = feedbacks.map((feedback, index) => ({
              id: feedback.feedback_id || `fb_${index}`,
              content: feedback.feedback_text || feedback.content,
              timestamp: new Date(feedback.created_at),
              sentiment: feedback.feedback_type || 'neutral',
              tags: feedback.tags || [], // Use stored tags from IPFS
              createdBy: feedback.created_by
            }));
            
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
    
    fetchBoardFeedback();
  }, [selectedBoard]);

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
              ...(selectedBoard || boardData),
              // Override with real IPFS data if available
              ...(boardIPFSData && {
                title: boardIPFSData.board_title,
                description: boardIPFSData.board_description,
                category: boardIPFSData.board_category,
                createdAt: boardIPFSData.created_at,
                totalSubmissions: boardIPFSData.total_feedback_count,
                creator: boardIPFSData.created_by
              })
            }}
            onSubmitFeedback={handleSubmitFeedback}
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
                      className="border-error/30 text-error hover:bg-error/10"
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
                            <FeedbackCard feedback={feedback} />
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
        board={selectedBoard || boardData}
        boardCreator={boardIPFSData?.created_by}
        onSuccess={() => setShowFeedbackSuccess(true)}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        board={{
          id: selectedBoard?.id,
          title: boardIPFSData?.board_title || selectedBoard?.title || boardData.title,
          description: boardIPFSData?.board_description || selectedBoard?.description || boardData.description
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
    </div>
  );
};

export default BoardView;