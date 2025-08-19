import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import BoardHeader from './components/BoardHeader';
import FilterControls from './components/FilterControls';
import FeedbackCard from './components/FeedbackCard';
import SubmissionModal from './components/SubmissionModal';
import BoardStats from './components/BoardStats';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useChainlinkScroll } from '../../hooks/useChainlinkScroll';

const FeedbackTheaterBoardViewing = () => {
  // Initialize Chainlink-style resistance scrolling
  useChainlinkScroll();
  
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const itemsPerPage = 10;

  // Mock board data - simplified without privacy features
  const boardData = {
    id: "board_001",
    title: "Product Feedback Collection - Q4 2024",
    description: `We're seeking honest feedback about our latest product features and user experience improvements. Your insights will directly influence our development roadmap for 2025.\n\nThis board is specifically focused on gathering constructive feedback about usability, performance, and feature requests. All feedback is welcome.`,
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
      content: `The new dashboard interface is significantly more intuitive than the previous version. I particularly appreciate the streamlined navigation and the way information is organized into clear sections.\n\nHowever, I've noticed that the loading times for the analytics section can be quite slow, especially when dealing with larger datasets. This impacts productivity when trying to generate reports quickly.\n\nSuggestion: Consider implementing lazy loading for heavy data components and maybe add skeleton loaders to improve perceived performance.`,
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      sentiment: 'positive',
      helpful: 23,
      views: 156,
      tags: ['dashboard', 'performance', 'ux']
    },
    {
      id: "fb_002", 
      content: `I've been using the mobile app for the past week and while the core functionality works well, there are several areas that need improvement.\n\nThe biggest issue is with the search feature - it's incredibly slow and often returns irrelevant results. Sometimes it takes 10-15 seconds just to get basic search results, which is frustrating when you're trying to find something quickly.\n\nAlso, the notification system is too aggressive. I'm getting notifications for every minor update, which makes me want to turn them off completely. Please add more granular notification controls.`,
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      sentiment: 'negative',
      helpful: 18,
      views: 89,
      tags: ['mobile', 'search', 'notifications']
    },
    {
      id: "fb_003",
      content: `The recent update to the collaboration features is exactly what our team needed. The real-time editing capabilities work flawlessly, and the conflict resolution system handles simultaneous edits gracefully.\n\nThe integration with external tools has also improved significantly. We can now seamlessly import data from our existing workflows without any formatting issues.\n\nOne small suggestion: it would be helpful to have keyboard shortcuts for common actions. Power users would really appreciate this addition.`,
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      sentiment: 'positive',
      helpful: 31,
      views: 203,
      tags: ['collaboration', 'integration', 'shortcuts']
    },
    {
      id: "fb_004",
      content: `The user interface is clean and modern, but I think there's room for improvement in terms of accessibility. Some of the color contrasts are too low, making it difficult to read for users with visual impairments.\n\nAlso, the font sizes in certain sections are quite small, especially in the sidebar navigation. Consider implementing better responsive typography that scales appropriately across different screen sizes and user preferences.`,
      timestamp: new Date(Date.now() - 10800000), // 3 hours ago
      sentiment: 'neutral',
      helpful: 12,
      views: 67,
      tags: ['accessibility', 'typography', 'design']
    },
    {
      id: "fb_005",
      content: `Love the new automation features! They've saved our team countless hours of manual work. The workflow builder is intuitive and powerful - even non-technical team members can create complex automations.\n\nThe error handling is also excellent. When something goes wrong, the system provides clear, actionable error messages that help us fix issues quickly. This is a huge improvement over the previous version where errors were cryptic and unhelpful.`,
      timestamp: new Date(Date.now() - 14400000), // 4 hours ago
      sentiment: 'positive',
      helpful: 27,
      views: 134,
      tags: ['automation', 'workflow', 'errors']
    }
  ];

  // Mock stats data - simplified
  const statsData = {
    totalSubmissions: 127,
    activeContributors: 89,
    avgResponseTime: '2.3h',
    satisfactionRate: 87,
    sentiment: {
      positive: 67,
      neutral: 38,
      negative: 22
    },
    recentActivity: [
      { time: '2m ago', action: 'New feedback submitted', reward: '' },
      { time: '7m ago', action: 'Feedback marked helpful', reward: '' },
      { time: '12m ago', action: 'New contributor joined', reward: '' },
      { time: '18m ago', action: 'Feedback submitted', reward: '' }
    ]
  };

  // Filter and sort feedback
  const filteredFeedback = mockFeedback?.filter(feedback => {
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Board Header */}
          <BoardHeader 
            board={boardData}
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
                totalCount={mockFeedback?.length}
                filteredCount={filteredFeedback?.length}
              />

              {/* Feedback List */}
              <div className="space-y-4">
                {paginatedFeedback?.length > 0 ? (
                  <>
                    {paginatedFeedback?.map((feedback, index) => (
                      <div key={feedback?.id} className="scroll-fade-in momentum-container" style={{transitionDelay: `${index * 0.05}s`}}>
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
                    <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No feedback found
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {searchQuery || filterBy !== 'all' ?'Try adjusting your filters or search terms' :'Be the first to submit feedback for this board'
                      }
                    </p>
                    {(!searchQuery && filterBy === 'all') && (
                      <Button
                        variant="default"
                        onClick={handleSubmitFeedback}
                        iconName="Plus"
                        iconPosition="left"
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        Submit First Feedback
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Board Stats */}
              <BoardStats stats={statsData} />

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
                  >
                    Share Board
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    iconName="Bookmark"
                    iconPosition="left"
                    className="justify-start"
                  >
                    Save Board
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    iconName="Download"
                    iconPosition="left"
                    className="justify-start"
                  >
                    Export Data
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    iconName="Flag"
                    iconPosition="left"
                    className="justify-start text-error hover:text-error"
                  >
                    Report Board
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
        board={boardData}
      />
    </div>
  );
};

export default FeedbackTheaterBoardViewing;