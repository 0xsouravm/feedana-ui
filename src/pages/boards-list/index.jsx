import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import Header from '../../components/ui/Header';
import Footer from '../home/components/Footer';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { getAllBoards } from '../../utils/supabaseApi';
import ipfsFetcher from '../../utils/ipfsFetcher';

const BoardsList = () => {
  const navigate = useNavigate();
  const [allBoards, setAllBoards] = useState([]);
  const [isBoardsLoading, setIsBoardsLoading] = useState(true);
  const [boardsError, setBoardsError] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [archiveFilter, setArchiveFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Dropdown states
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  
  // Refs for dropdown positioning
  const sortButtonRef = useRef(null);
  const archiveButtonRef = useRef(null);
  const categoryButtonRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-sort')) {
        setIsSortOpen(false);
      }
      if (!event.target.closest('.dropdown-archive')) {
        setIsArchiveOpen(false);
      }
      if (!event.target.closest('.dropdown-category')) {
        setIsCategoryOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
            latestFeedbackAt: latestFeedbackAt,
            isArchived: ipfsData?.is_archived || board?.archived || false
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

  // Get unique categories from all boards
  const availableCategories = [...new Set(allBoards.map(board => board.category))].sort();

  // Filter and sort boards
  const filteredAndSortedBoards = allBoards
    .filter(board => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        board.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        board.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Archive filter
      const matchesArchive = archiveFilter === 'all' ||
        (archiveFilter === 'archived' && board.isArchived) ||
        (archiveFilter === 'active' && !board.isArchived);

      // Category filter
      const matchesCategory = categoryFilter === 'all' || board.category === categoryFilter;

      return matchesSearch && matchesArchive && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'most_feedbacks':
          return b.totalFeedbacks - a.totalFeedbacks;
        default:
          return 0;
      }
    });

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
              {/* Search and Filter Controls */}
              <div className="glass-card p-6 rounded-2xl mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Search */}
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <Icon 
                        name="Search" 
                        size={18} 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
                      />
                      <input
                        type="text"
                        placeholder="Search boards..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                        >
                          <Icon name="X" size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-4">
                    {/* Sort Dropdown */}
                    <div className="relative dropdown-sort">
                      <Button
                        ref={sortButtonRef}
                        variant="outline"
                        iconName="ArrowUpDown"
                        iconPosition="left"
                        onClick={() => setIsSortOpen(!isSortOpen)}
                        className={`text-muted-foreground hover:text-black hover:bg-accent ${isSortOpen ? 'bg-accent/10 text-accent' : ''}`}
                      >
                        Sort {sortBy !== 'newest' && <span className="ml-1 text-xs">({
                          sortBy === 'oldest' ? 'Oldest' : 
                          sortBy === 'most_feedbacks' ? 'Most Feedbacks' : 'Newest'
                        })</span>}
                      </Button>
                    </div>

                    {/* Archive Status Dropdown */}
                    <div className="relative dropdown-archive">
                      <Button
                        ref={archiveButtonRef}
                        variant="outline"
                        iconName="Archive"
                        iconPosition="left"
                        onClick={() => setIsArchiveOpen(!isArchiveOpen)}
                        className={`text-muted-foreground hover:text-black hover:bg-accent ${isArchiveOpen ? 'bg-accent/10 text-accent' : ''}`}
                      >
                        Status {archiveFilter !== 'all' && <span className="ml-1 text-xs">({
                          archiveFilter === 'active' ? 'Active' : 
                          archiveFilter === 'archived' ? 'Archived' : 'All'
                        })</span>}
                      </Button>
                    </div>

                    {/* Category Dropdown */}
                    <div className="relative dropdown-category">
                      <Button
                        ref={categoryButtonRef}
                        variant="outline"
                        iconName="Tag"
                        iconPosition="left"
                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                        className={`text-muted-foreground hover:text-black hover:bg-accent ${isCategoryOpen ? 'bg-accent/10 text-accent' : ''}`}
                      >
                        Category {categoryFilter !== 'all' && <span className="ml-1 text-xs">({categoryFilter})</span>}
                      </Button>
                    </div>

                    {/* Results Count */}
                    <div className="text-sm text-muted-foreground">
                      {filteredAndSortedBoards.length} of {allBoards.length} boards
                    </div>
                  </div>
                </div>
                
                {/* Active Filters */}
                {(archiveFilter !== 'all' || categoryFilter !== 'all' || searchQuery) && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/30">
                    <span className="text-sm text-muted-foreground">Active filters:</span>
                    {archiveFilter !== 'all' && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded-md text-xs">
                        <span className="capitalize">{archiveFilter}</span>
                        <button
                          onClick={() => setArchiveFilter('all')}
                          className="hover:text-accent/80 transition-colors duration-200"
                        >
                          <Icon name="X" size={12} />
                        </button>
                      </div>
                    )}
                    {categoryFilter !== 'all' && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded-md text-xs">
                        <span>{categoryFilter}</span>
                        <button
                          onClick={() => setCategoryFilter('all')}
                          className="hover:text-accent/80 transition-colors duration-200"
                        >
                          <Icon name="X" size={12} />
                        </button>
                      </div>
                    )}
                    {searchQuery && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded-md text-xs">
                        <span>"{searchQuery}"</span>
                        <button
                          onClick={() => setSearchQuery('')}
                          className="hover:text-accent/80 transition-colors duration-200"
                        >
                          <Icon name="X" size={12} />
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setArchiveFilter('all');
                        setCategoryFilter('all');
                        setSearchQuery('');
                        setSortBy('newest');
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 ml-2"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>

              {/* Boards Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {filteredAndSortedBoards.map((board) => (
                  <div key={board.id} className="glass-card p-6 rounded-2xl hover:shadow-glow transition-all duration-300 group cursor-pointer h-full flex flex-col"
                       onClick={() => {
                         navigate(`/board/${board.id}`);
                       }}>
                    {/* Header Section */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-accent">{board.category}</span>
                          {board.ipfsCid && board.ipfsCid !== 'local-only' && (
                            <div className="flex items-center space-x-1 px-2 py-1 bg-success/10 rounded-full">
                              <Icon name="Database" size={12} className="text-success" />
                              <span className="text-xs font-medium text-success">IPFS</span>
                            </div>
                          )}
                        </div>
                        {board.isArchived && (
                          <div className="flex items-center space-x-1 px-2 py-1 bg-red-500/10 rounded-full">
                            <Icon name="Archive" size={12} className="text-red-500" />
                            <span className="text-xs font-medium text-red-500">Archived</span>
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
              
              {/* Empty States */}
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
              
              {allBoards.length > 0 && filteredAndSortedBoards.length === 0 && (
                <div className="text-center py-12">
                  <Icon name="Filter" size={64} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No boards match your filters</h3>
                  <p className="text-muted-foreground mb-6">Try adjusting your search terms or filters to see more results.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setArchiveFilter('all');
                      setCategoryFilter('all');
                      setSortBy('newest');
                    }}
                    className="text-accent hover:text-accent/80 underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />

      {/* Portal dropdowns */}
      {isSortOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9999]" 
          onClick={() => setIsSortOpen(false)}
        >
          <div
            className="absolute w-48 glass-card border border-border/30 rounded-xl shadow-lg"
            style={{
              top: sortButtonRef.current ? `${sortButtonRef.current.getBoundingClientRect().bottom + 8}px` : '0px',
              left: sortButtonRef.current ? `${sortButtonRef.current.getBoundingClientRect().right - 192}px` : '0px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-2">
              {[
                { value: 'newest', label: 'Newest First', icon: 'ArrowDown' },
                { value: 'oldest', label: 'Oldest First', icon: 'ArrowUp' },
                { value: 'most_feedbacks', label: 'Most Feedbacks', icon: 'TrendingUp' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSortBy(option.value);
                    setIsSortOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    sortBy === option.value
                      ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  <Icon name={option.icon} size={14} />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
      
      {isArchiveOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9999]" 
          onClick={() => setIsArchiveOpen(false)}
        >
          <div
            className="absolute w-48 glass-card border border-border/30 rounded-xl shadow-lg"
            style={{
              top: archiveButtonRef.current ? `${archiveButtonRef.current.getBoundingClientRect().bottom + 8}px` : '0px',
              left: archiveButtonRef.current ? `${archiveButtonRef.current.getBoundingClientRect().right - 192}px` : '0px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-2">
              {[
                { value: 'all', label: 'All Boards', count: allBoards.length },
                { value: 'active', label: 'Active Only', count: allBoards.filter(b => !b.isArchived).length },
                { value: 'archived', label: 'Archived Only', count: allBoards.filter(b => b.isArchived).length }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setArchiveFilter(option.value);
                    setIsArchiveOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    archiveFilter === option.value
                      ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  <span>{option.label}</span>
                  <span className="text-xs">{option.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
      
      {isCategoryOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9999]" 
          onClick={() => setIsCategoryOpen(false)}
        >
          <div
            className="absolute w-48 glass-card border border-border/30 rounded-xl shadow-lg"
            style={{
              top: categoryButtonRef.current ? `${categoryButtonRef.current.getBoundingClientRect().bottom + 8}px` : '0px',
              left: categoryButtonRef.current ? `${categoryButtonRef.current.getBoundingClientRect().right - 192}px` : '0px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-2">
              {[
                { value: 'all', label: 'All Categories', count: allBoards.length },
                ...availableCategories.map(category => ({
                  value: category,
                  label: category,
                  count: allBoards.filter(b => b.category === category).length
                }))
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setCategoryFilter(option.value);
                    setIsCategoryOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    categoryFilter === option.value
                      ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  <span>{option.label}</span>
                  <span className="text-xs">{option.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default BoardsList;