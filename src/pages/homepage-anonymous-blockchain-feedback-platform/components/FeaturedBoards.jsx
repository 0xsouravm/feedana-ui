import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { getAllBoards } from '../../../utils/simpleSupabaseApi';
import ipfsFetcher from '../../../utils/ipfsFetcher';

const FeaturedBoards = () => {
  const [timeRemaining, setTimeRemaining] = useState({});
  const [featuredBoards, setFeaturedBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  // Toggle description expansion
  const toggleDescription = (boardId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [boardId]: !prev[boardId]
    }));
  };

  // Static fallback boards in case of loading issues
  const fallbackBoards = [
    {
      id: "tech-startup-culture",
      title: "Tech Startup Culture Feedback",
      description: "Anonymous insights about work culture, management practices, and team dynamics in fast-growing tech companies.",
      category: "Workplace Culture",
      fundingPool: 2.4,
      submissionCount: 127,
      responseRate: 89,
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
      tags: ["Culture", "Management", "Remote Work"],
      isHot: true,
      recentSubmission: "2 minutes ago"
    },
    {
      id: "product-roadmap-feedback",
      title: "SaaS Product Roadmap Review",
      description: "Help shape the future of our platform by sharing honest feedback about proposed features and priorities.",
      category: "Product Development",
      fundingPool: 1.8,
      submissionCount: 89,
      responseRate: 76,
      expiresAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days
      tags: ["Product", "Features", "UX"],
      isHot: false,
      recentSubmission: "8 minutes ago"
    },
    {
      id: "university-course-evaluation",
      title: "Computer Science Curriculum Feedback",
      description: "Anonymous course evaluations and suggestions for improving the CS program at major universities.",
      category: "Education",
      fundingPool: 3.2,
      submissionCount: 203,
      responseRate: 94,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      tags: ["Education", "Curriculum", "Teaching"],
      isHot: true,
      recentSubmission: "1 minute ago"
    },
    {
      id: "healthcare-experience",
      title: "Patient Experience Improvement",
      description: "Share your healthcare experiences anonymously to help improve patient care and service quality.",
      category: "Healthcare",
      fundingPool: 4.1,
      submissionCount: 156,
      responseRate: 82,
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
      tags: ["Healthcare", "Patient Care", "Service"],
      isHot: false,
      recentSubmission: "5 minutes ago"
    }
  ];

  // Fetch boards from Supabase and IPFS
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Fetching boards from database...');
        // Get limited boards for homepage display
        const supabaseBoards = await getAllBoards(4);
        
        if (!supabaseBoards || supabaseBoards.length === 0) {
          console.log('No boards found in database');
          setFeaturedBoards([]);
          return;
        }
        
        console.log(`Found ${supabaseBoards.length} boards in database`);
        
        // Fetch IPFS data for boards that have CIDs
        const ipfsResults = await ipfsFetcher.fetchMultipleBoardData(
          supabaseBoards
            .filter(board => board.ipfs_cid && board.ipfs_cid !== 'local-only')
            .map(board => board.ipfs_cid)
        );
        
        // Create mapping of CID to IPFS data
        const ipfsDataMap = {};
        ipfsResults.forEach(result => {
          if (result.data) {
            ipfsDataMap[result.cid] = result.data;
          }
        });
        
        // Combine Supabase and IPFS data
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
            responseRate: feedbackCount > 0 ? Math.min(95, 60 + (feedbackCount * 2)) : 0, // Calculate based on activity
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            tags: [category],
            isHot: feedbackCount > 10 || (latestFeedbackAt && (Date.now() - new Date(latestFeedbackAt).getTime()) < 24 * 60 * 60 * 1000),
            recentSubmission: lastActivity,
            totalFeedbacks: feedbackCount,
            latestFeedbackAt: latestFeedbackAt
          };
        });
        
        console.log(`Successfully loaded ${combinedBoards.length} boards`);
        setFeaturedBoards(combinedBoards);
        
      } catch (err) {
        console.error('Error fetching boards:', err);
        setError(err.message);
        setFeaturedBoards([]); // Show nothing on error
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBoards();
  }, []);

  // Calculate time remaining for each board
  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = new Date();
      const remaining = {};
      
      featuredBoards?.forEach(board => {
        const diff = board?.expiresAt - now;
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          remaining[board.id] = { days, hours };
        } else {
          remaining[board.id] = { days: 0, hours: 0 };
        }
      });
      
      setTimeRemaining(remaining);
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-background">
      <div className="container-padding max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Active Feedback Boards
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of anonymous contributors sharing honest insights across 
            various industries and topics. Your voice matters, your identity stays private.
          </p>
          
          {/* Loading/Error States */}
          {isLoading && (
            <div className="flex items-center justify-center mt-8">
              <Icon name="Loader2" size={24} className="text-accent animate-spin mr-2" />
              <span className="text-muted-foreground">Loading boards from blockchain...</span>
            </div>
          )}
          
          {error && !isLoading && (
            <div className="glass-card p-4 rounded-xl border border-warning/20 bg-warning/10 mt-8 max-w-md mx-auto">
              <div className="flex items-center space-x-2">
                <Icon name="AlertTriangle" size={16} className="text-warning" />
                <span className="text-sm text-warning">Using demo data - {error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Featured Boards Grid */}
        {featuredBoards && featuredBoards.length > 0 && (
          <>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {featuredBoards?.map((board) => (
                <div key={board?.id} className="glass-card p-6 rounded-2xl hover:shadow-glow transition-all duration-300 group h-full flex flex-col">
                  {/* Board Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-accent">{board?.category}</span>
                        {board?.isHot && (
                          <div className="flex items-center space-x-1 px-2 py-1 bg-error/10 rounded-full">
                            <Icon name="Flame" size={12} className="text-error" />
                            <span className="text-xs font-medium text-error">Hot</span>
                          </div>
                        )}
                        {board?.ipfsCid && board?.ipfsCid !== 'local-only' && (
                          <div className="flex items-center space-x-1 px-2 py-1 bg-success/10 rounded-full">
                            <Icon name="Database" size={12} className="text-success" />
                            <span className="text-xs font-medium text-success">IPFS</span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-accent transition-colors line-clamp-2">
                        {board?.title}
                      </h3>
                      <div className="text-muted-foreground text-sm leading-relaxed">
                        <p className={expandedDescriptions[board?.id] ? "" : "line-clamp-3"}>
                          {board?.description}
                        </p>
                        {board?.description && board?.description.length > 150 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDescription(board?.id);
                            }}
                            className="text-accent text-xs font-medium hover:underline mt-2 inline-block"
                          >
                            {expandedDescriptions[board?.id] ? 'Read less' : 'Read more'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content Area - grows to fill available space */}
                  <div className="flex-1 flex flex-col">
                    {/* Spacer to push statistics to bottom */}
                    <div className="flex-1"></div>

                    {/* Statistics - Fixed at bottom, left-aligned */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-left py-2">
                        <div className="text-lg font-bold text-foreground leading-none mb-1">{board?.submissionCount}</div>
                        <div className="text-xs text-muted-foreground leading-tight">Submissions</div>
                      </div>
                      <div className="text-left py-2">
                        <div className="text-lg font-bold text-success leading-none mb-1">{board?.responseRate}%</div>
                        <div className="text-xs text-muted-foreground leading-tight">Response Rate</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <Link to={`/board/${board?.id}`} className="flex-1">
                      <Button
                        variant="default"
                        fullWidth
                        iconName="Eye"
                        iconPosition="left"
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        View Board
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      iconName="Share"
                      className="border-accent/30 text-accent hover:bg-accent/10"
                    >
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Boards Button */}
            <div className="text-center mb-12">
              <Link to="/feedback-theater-board-viewing">
                <Button
                  variant="outline"
                  size="lg"
                  iconName="ArrowRight"
                  iconPosition="right"
                  className="border-accent/30 text-accent hover:bg-accent/10 px-8 py-4 text-lg"
                >
                  View All Boards ({featuredBoards?.length > 0 ? featuredBoards.length + '+' : 'All'})
                </Button>
              </Link>
            </div>
          </>
        )}

        {/* No Boards Message */}
        {(!isLoading && (!featuredBoards || featuredBoards.length === 0)) && (
          <div className="text-center py-16">
            <div className="glass-card p-12 rounded-2xl max-w-md mx-auto">
              <Icon name="MessageSquare" size={64} className="text-muted-foreground mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                No Active Boards Yet
              </h3>
              <p className="text-muted-foreground mb-8">
                Be the first to create a feedback board and start gathering valuable insights from your community.
              </p>
              <Link to="/board-creation-studio">
                <Button
                  variant="default"
                  size="lg"
                  iconName="Plus"
                  iconPosition="left"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow"
                >
                  Create First Board
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Board Statistics - Only show if there are boards */}
        {featuredBoards && featuredBoards.length > 0 && (
          <div className="glass-card p-8 rounded-2xl">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="py-4">
                <div className="text-3xl font-bold text-accent leading-none mb-3">{featuredBoards?.length || 0}</div>
                <div className="text-muted-foreground leading-tight">Active Boards</div>
              </div>
              <div className="py-4">
                <div className="text-3xl font-bold text-success leading-none mb-3">
                  {featuredBoards?.reduce((acc, board) => acc + (board?.submissionCount || 0), 0) || 0}
                </div>
                <div className="text-muted-foreground leading-tight">Total Submissions</div>
              </div>
              <div className="py-4">
                <div className="text-3xl font-bold text-foreground leading-none mb-3">
                  {featuredBoards?.length > 0 
                    ? Math.round(featuredBoards?.reduce((acc, board) => acc + (board?.responseRate || 0), 0) / featuredBoards?.length) 
                    : 0}%
                </div>
                <div className="text-muted-foreground leading-tight">Avg Response Rate</div>
              </div>
            </div>
          </div>
        )}

        {/* CTA Section - Only show if there are boards */}
        {featuredBoards && featuredBoards.length > 0 && (
          <div className="text-center mt-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-foreground">
                Ready to Create Your Own Board?
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Set up your anonymous feedback environment in minutes. 
                Fund your board, customize settings, and start collecting honest insights.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/board-creation-studio">
                  <Button
                    variant="default"
                    size="lg"
                    iconName="Plus"
                    iconPosition="left"
                    className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow"
                  >
                    Create Your Board
                  </Button>
                </Link>
                <Link to="/feedback-theater-board-viewing">
                  <Button
                    variant="outline"
                    size="lg"
                    iconName="Search"
                    iconPosition="left"
                    className="border-accent/30 text-accent hover:bg-accent/10"
                  >
                    Explore All Boards
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedBoards;