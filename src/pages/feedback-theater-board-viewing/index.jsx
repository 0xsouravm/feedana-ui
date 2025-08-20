import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BoardHeader from './components/BoardHeader';
import FilterControls from './components/FilterControls';
import FeedbackCard from './components/FeedbackCard';
import SubmissionModal from './components/SubmissionModal';
import ShareModal from './components/ShareModal';
// import BoardStats from './components/BoardStats';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import SuccessNotification from '../../components/ui/SuccessNotification';
import { useChainlinkScroll } from '../../hooks/useChainlinkScroll';
import { getAllBoards, getBoardById } from '../../utils/simpleSupabaseApi';
import ipfsFetcher from '../../utils/ipfsFetcher';

const FeedbackTheaterBoardViewing = () => {
  // Chainlink-style resistance scrolling disabled for board viewing
  // useChainlinkScroll();
  
  const location = useLocation();
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' for all boards, 'board' for single board
  const [allBoards, setAllBoards] = useState([]);
  const [isBoardsLoading, setIsBoardsLoading] = useState(true);
  const [boardsError, setBoardsError] = useState(null);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [realFeedback, setRealFeedback] = useState([]);
  const [boardIPFSData, setBoardIPFSData] = useState(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);
  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const itemsPerPage = 12; // Increased for boards grid

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

  // Mock feedback data - removed privacy-related fields
  const mockFeedback = [
    {
      id: "fb_001",
      content: `The new dashboard interface is significantly more intuitive than the previous version. I particularly appreciate the streamlined navigation and the way information is organized into clear sections.

However, I've noticed that the loading times for the analytics section can be quite slow, especially when dealing with larger datasets. This impacts productivity when trying to generate reports quickly.

Suggestion: Consider implementing lazy loading for heavy data components and maybe add skeleton loaders to improve perceived performance.`,
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      sentiment: 'positive',
      helpful: 23,
      views: 156,
      tags: ['dashboard', 'performance', 'ux']
    },
    {
      id: "fb_002", 
      content: `I've been using the mobile app for the past week and while the core functionality works well, there are several areas that need improvement.

The biggest issue is with the search feature - it's incredibly slow and often returns irrelevant results. Sometimes it takes 10-15 seconds just to get basic search results, which is frustrating when you're trying to find something quickly.

Also, the notification system is too aggressive. I'm getting notifications for every minor update, which makes me want to turn them off completely. Please add more granular notification controls.`,
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      sentiment: 'negative',
      helpful: 18,
      views: 89,
      tags: ['mobile', 'search', 'notifications']
    },
    {
      id: "fb_003",
      content: `The recent update to the collaboration features is exactly what our team needed. The real-time editing capabilities work flawlessly, and the conflict resolution system handles simultaneous edits gracefully.

The integration with external tools has also improved significantly. We can now seamlessly import data from our existing workflows without any formatting issues.

One small suggestion: it would be helpful to have keyboard shortcuts for common actions. Power users would really appreciate this addition.`,
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      sentiment: 'positive',
      helpful: 31,
      views: 203,
      tags: ['collaboration', 'integration', 'shortcuts']
    },
    {
      id: "fb_004",
      content: `The user interface is clean and modern, but I think there's room for improvement in terms of accessibility. Some of the color contrasts are too low, making it difficult to read for users with visual impairments.

Also, the font sizes in certain sections are quite small, especially in the sidebar navigation. Consider implementing better responsive typography that scales appropriately across different screen sizes and user preferences.`,
      timestamp: new Date(Date.now() - 10800000), // 3 hours ago
      sentiment: 'neutral',
      helpful: 12,
      views: 67,
      tags: ['accessibility', 'typography', 'design']
    },
    {
      id: "fb_005",
      content: `Love the new automation features! They've saved our team countless hours of manual work. The workflow builder is intuitive and powerful - even non-technical team members can create complex automations.

The error handling is also excellent. When something goes wrong, the system provides clear, actionable error messages that help us fix issues quickly. This is a huge improvement over the previous version where errors were cryptic and unhelpful.`,
      timestamp: new Date(Date.now() - 14400000), // 4 hours ago
      sentiment: 'positive',
      helpful: 27,
      views: 134,
      tags: ['automation', 'workflow', 'errors']
    }
  ];

  // Determine view mode based on URL parameters or location state
  useEffect(() => {
    if (boardId) {
      // URL-based board viewing
      setViewMode('board');
      // We'll fetch the board data in the feedback fetching effect
      setSelectedBoard({ id: boardId });
    } else if (location.state?.board) {
      // State-based board viewing (legacy)
      setViewMode('board');
      setSelectedBoard(location.state.board);
    } else {
      // List view
      setViewMode('list');
    }
  }, [boardId, location.state]);

  // Fetch all boards for list view
  useEffect(() => {
    const fetchAllBoards = async () => {
      if (viewMode !== 'list') return;
      
      try {
        setIsBoardsLoading(true);
        setBoardsError(null);
        
        console.log('Fetching all boards for board listing page...');
        const supabaseBoards = await getAllBoards(50); // Get more boards for the listing page
        
        if (!supabaseBoards || supabaseBoards.length === 0) {
          console.log('No boards found in database');
          setAllBoards([]);
          return;
        }
        
        // Fetch IPFS data for boards
        const ipfsResults = await ipfsFetcher.fetchMultipleBoardData(
          supabaseBoards
            .filter(board => board.ipfs_cid && board.ipfs_cid !== 'local-only')
            .map(board => board.ipfs_cid)
        );
        
        const ipfsDataMap = {};
        ipfsResults.forEach(result => {
          if (result.data) {
            ipfsDataMap[result.cid] = result.data;
          }
        });
        
        // Combine data using the same logic as homepage
        const combinedBoards = supabaseBoards.map(board => {
          const ipfsData = ipfsDataMap[board.ipfs_cid];
          
          // Use IPFS data with fallbacks to legacy fields
          const title = ipfsData?.board_title || ipfsData?.title || board.board_id || 'Untitled Board';
          const description = ipfsData?.board_description || ipfsData?.description || 'No description available';
          const category = ipfsData?.board_category || ipfsData?.category || 'General';
          const feedbackCount = ipfsData?.total_feedback_count || 0;
          const latestFeedbackAt = ipfsData?.latest_feedback_at;
          const createdAt = ipfsData?.created_at || board.created_at;
          
          // Calculate time since last activity
          let lastActivity = 'No activity yet';
          if (latestFeedbackAt) {
            const timeDiff = Date.now() - new Date(latestFeedbackAt).getTime();
            const minutes = Math.floor(timeDiff / (1000 * 60));
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);
            
            if (days > 0) {
              lastActivity = `${days} day${days > 1 ? 's' : ''} ago`;
            } else if (hours > 0) {
              lastActivity = `${hours} hour${hours > 1 ? 's' : ''} ago`;
            } else if (minutes > 0) {
              lastActivity = `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
            } else {
              lastActivity = 'Just now';
            }
          } else if (createdAt) {
            const timeDiff = Date.now() - new Date(createdAt).getTime();
            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            lastActivity = `Created ${days} day${days !== 1 ? 's' : ''} ago`;
          }
          
          return {
            id: board.board_id,
            title,
            description,
            category,
            creator: board.owner,
            createdAt: createdAt,
            ipfsCid: board.ipfs_cid,
            // Use real data from IPFS
            submissionCount: feedbackCount,
            responseRate: feedbackCount > 0 ? Math.min(95, 60 + (feedbackCount * 2)) : 0,
            tags: [category],
            isActive: true,
            lastActivity: lastActivity,
            totalFeedbacks: feedbackCount,
            latestFeedbackAt: latestFeedbackAt
          };
        });
        
        setAllBoards(combinedBoards);
        
      } catch (err) {
        console.error('Error fetching all boards:', err);
        setBoardsError(err.message);
        setAllBoards([]);
      } finally {
        setIsBoardsLoading(false);
      }
    };
    
    fetchAllBoards();
  }, [viewMode]);

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

    const uniqueContributors = new Set(realFeedback.map(f => f.createdBy)).size;
    
    // Calculate sentiment distribution
    const sentimentCounts = realFeedback.reduce((acc, feedback) => {
      acc[feedback.sentiment] = (acc[feedback.sentiment] || 0) + 1;
      return acc;
    }, {});

    // Calculate average response time (simulate based on feedback frequency)
    const now = Date.now();
    const recentFeedbacks = realFeedback.filter(f => 
      (now - f.timestamp.getTime()) < 7 * 24 * 60 * 60 * 1000 // Last 7 days
    );
    const avgResponseTime = recentFeedbacks.length > 1 ? '1.2h' : '2.5h';

    // Generate recent activity from real feedback
    const recentActivity = realFeedback
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
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
  
  const filteredFeedback = feedbackToUse?.filter(feedback => {
    const matchesFilter = filterBy === 'all' || feedback?.sentiment === filterBy;
    const matchesSearch = searchQuery === '' || 
      feedback?.content?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      feedback?.tags?.some(tag => tag?.toLowerCase()?.includes(searchQuery?.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const sortedFeedback = [...filteredFeedback]?.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.timestamp) - new Date(a.timestamp);
      case 'oldest':
        return new Date(a.timestamp) - new Date(b.timestamp);
      case 'helpful':
        return b?.helpful - a?.helpful;
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedFeedback?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFeedback = sortedFeedback?.slice(startIndex, startIndex + itemsPerPage);

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

  // Toggle description expansion
  const toggleDescription = (boardId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [boardId]: !prev[boardId]
    }));
  };

  // Fetch real feedback from IPFS when board is selected
  useEffect(() => {
    const fetchBoardFeedback = async () => {
      if (viewMode !== 'board' || !selectedBoard) return;
      
      try {
        setIsLoadingFeedback(true);
        setFeedbackError(null);
        
        console.log('Fetching board feedback from database and IPFS...');
        
        // Get board data from database first
        const boardDbData = await getBoardById(selectedBoard.id);
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
          const ipfsData = await ipfsFetcher.fetchBoardData(boardDbData.ipfs_cid);
          
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
              // helpful: Math.floor(Math.random() * 50) + 1, // Generate random helpful count
              // views: Math.floor(Math.random() * 200) + 50, // Generate random view count
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
        setFeedbackError(error.message);
        setRealFeedback([]);
        setBoardIPFSData(null);
      } finally {
        setIsLoadingFeedback(false);
      }
    };
    
    fetchBoardFeedback();
  }, [viewMode, selectedBoard]);


  // Boards list view component
  const renderBoardsList = () => (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
          All Feedback Boards
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Explore all active feedback boards and contribute to discussions that matter to you.
        </p>
        
        {isBoardsLoading && (
          <div className="flex items-center justify-center mt-8">
            <Icon name="Loader2" size={24} className="text-accent animate-spin mr-2" />
            <span className="text-muted-foreground">Loading all boards...</span>
          </div>
        )}
        
        {boardsError && !isBoardsLoading && (
          <div className="glass-card p-4 rounded-xl border border-error/20 bg-error/10 mt-8 max-w-md mx-auto">
            <div className="flex items-center space-x-2">
              <Icon name="AlertTriangle" size={16} className="text-error" />
              <span className="text-sm text-error">Error loading boards - {boardsError}</span>
            </div>
          </div>
        )}
      </div>
      
      {!isBoardsLoading && (
        <>
          {/* Boards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {allBoards.map((board) => (
              <div key={board.id} className="glass-card p-6 rounded-2xl hover:shadow-glow transition-all duration-300 group cursor-pointer h-full flex flex-col"
                   onClick={() => {
                     navigate(`/board/${board.id}`);
                   }}>
                {/* Header Section */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-accent">{board.category}</span>
                    {board.ipfsCid && board.ipfsCid !== 'local-only' && (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-success/10 rounded-full">
                        <Icon name="Database" size={12} className="text-success" />
                        <span className="text-xs font-medium text-success">IPFS</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-accent transition-colors line-clamp-2">
                    {board.title}
                  </h3>
                  <div className="text-muted-foreground text-sm leading-relaxed">
                    <p className={expandedDescriptions[board.id] ? "" : "line-clamp-3"}>
                      {board.description}
                    </p>
                    {board.description && board.description.length > 150 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDescription(board.id);
                        }}
                        className="text-accent text-xs font-medium hover:underline mt-2 inline-block"
                      >
                        {expandedDescriptions[board.id] ? 'Read less' : 'Read more'}
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Content Area - grows to fill available space */}
                <div className="flex-1 flex flex-col">
                  {/* Spacer to push statistics to bottom */}
                  <div className="flex-1"></div>
                  
                  {/* Statistics - Fixed at bottom, left-aligned */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-left py-2">
                      <div className="text-lg font-bold text-foreground leading-none mb-1">{board.submissionCount}</div>
                      <div className="text-xs text-muted-foreground leading-tight">Submissions</div>
                    </div>
                    <div className="text-left py-2">
                      <div className="text-lg font-bold text-success leading-none mb-1">{board.responseRate}%</div>
                      <div className="text-xs text-muted-foreground leading-tight">Response Rate</div>
                    </div>
                  </div>
                </div>
                
                {/* Footer - always at bottom */}
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-2">
                  <span>Last activity: {board.lastActivity}</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    <span>Active</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {allBoards.length === 0 && (
            <div className="text-center py-12">
              <Icon name="Search" size={64} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No boards found</h3>
              <p className="text-muted-foreground mb-6">Be the first to create a feedback board!</p>
              <Link to="/board-creation-studio">
                <Button variant="default" iconName="Plus" iconPosition="left" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Create Your Board
                </Button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {viewMode === 'list' ? renderBoardsList() : (
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Back to all boards */}
            <div className="mb-6">
              <Button
                variant="outline"
                iconName="ArrowLeft"
                iconPosition="left"
                onClick={() => setViewMode('list')}
                className="text-muted-foreground hover:text-foreground"
              >
                Back to All Boards
              </Button>
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
                          {paginatedFeedback?.map((feedback, index) => (
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
                {/* Board Stats
                <BoardStats stats={statsData} /> */}

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
                    {/* <Button
                      variant="outline"
                      fullWidth
                      iconName="Bookmark"
                      iconPosition="left"
                      className="justify-start"
                    >
                      Save Board
                    </Button> */}
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
                    {/* <Button
                      variant="outline"
                      fullWidth
                      iconName="Flag"
                      iconPosition="left"
                      className="justify-start text-error hover:text-error"
                    >
                      Report Board
                    </Button> */}
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
        )}
      </main>
      {/* Submission Modal */}
      <SubmissionModal
        isOpen={isSubmissionModalOpen}
        onClose={() => setIsSubmissionModalOpen(false)}
        board={selectedBoard || boardData}
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
        message="Your feedback has been stored on IPFS and added to the blockchain. Thank you for contributing to this board!"
        actionText="View Updated Board"
        onAction={() => window.location.reload()}
        duration={6000}
      />
    </div>
  );
};

export default FeedbackTheaterBoardViewing;