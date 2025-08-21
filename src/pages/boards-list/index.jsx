import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { getAllBoards } from '../../utils/simpleSupabaseApi';
import ipfsFetcher from '../../utils/ipfsFetcher';

const BoardsList = () => {
  const navigate = useNavigate();
  const [allBoards, setAllBoards] = useState([]);
  const [isBoardsLoading, setIsBoardsLoading] = useState(true);
  const [boardsError, setBoardsError] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  // Fetch all boards for list view
  useEffect(() => {
    const fetchAllBoards = async () => {
      try {
        setIsBoardsLoading(true);
        setBoardsError(null);
        
        console.log('Fetching all boards for board listing page...');
        
        let supabaseBoards = [];
        try {
          supabaseBoards = await getAllBoards(50); // Get more boards for the listing page
        } catch (fetchError) {
          console.warn('Failed to fetch from Supabase, using empty array:', fetchError.message);
          supabaseBoards = [];
        }
        
        if (!supabaseBoards || supabaseBoards.length === 0) {
          console.log('No boards found in database, showing empty state');
          setAllBoards([]);
          return;
        }
        
        // Fetch IPFS data for boards
        let ipfsResults = [];
        try {
          if (ipfsFetcher.isAvailable()) {
            ipfsResults = await ipfsFetcher.fetchMultipleBoardData(
              supabaseBoards
                .filter(board => board.ipfs_cid && board.ipfs_cid !== 'local-only')
                .map(board => board.ipfs_cid)
            );
          } else {
            console.log('IPFS not available, using database data only');
          }
        } catch (ipfsError) {
          console.warn('IPFS fetch failed, using database data only:', ipfsError.message);
          ipfsResults = [];
        }
        
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
        console.log('Showing empty state due to fetch error');
        setAllBoards([]);
        setBoardsError(null);
      } finally {
        setIsBoardsLoading(false);
      }
    };
    
    fetchAllBoards();
  }, []);

  // Toggle description expansion
  const toggleDescription = (boardId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [boardId]: !prev[boardId]
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
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
                  <Link to="/board/create">
                    <Button variant="default" iconName="Plus" iconPosition="left" className="bg-accent text-accent-foreground hover:bg-accent/90">
                      Create Your Board
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default BoardsList;