import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FeaturedBoards = () => {
  const [timeRemaining, setTimeRemaining] = useState({});

  const featuredBoards = [
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
        </div>

        {/* Featured Boards Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {featuredBoards?.map((board) => (
            <div key={board?.id} className="glass-card p-6 rounded-2xl hover:shadow-glow transition-all duration-300 group">
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
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                    {board?.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {board?.description}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {board?.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-muted/20 text-muted-foreground text-xs rounded-lg"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-accent">{board?.fundingPool} SOL</div>
                  <div className="text-xs text-muted-foreground">Funding Pool</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">{board?.submissionCount}</div>
                  <div className="text-xs text-muted-foreground">Submissions</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-success">{board?.responseRate}%</div>
                  <div className="text-xs text-muted-foreground">Response Rate</div>
                </div>
              </div>

              {/* Time Remaining */}
              {timeRemaining?.[board?.id] && (
                <div className="flex items-center justify-between mb-4 p-3 bg-muted/10 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Icon name="Clock" size={16} className="text-warning" />
                    <span className="text-sm text-muted-foreground">
                      {timeRemaining?.[board?.id]?.days}d {timeRemaining?.[board?.id]?.hours}h remaining
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    <span>Last: {board?.recentSubmission}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3">
                <Link to="/feedback-theater-board-viewing" className="flex-1">
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

        {/* Board Statistics */}
        <div className="glass-card p-8 rounded-2xl">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-accent mb-2">847</div>
              <div className="text-muted-foreground">Active Boards</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-success mb-2">12,847</div>
              <div className="text-muted-foreground">Total Submissions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-warning mb-2">156.7 SOL</div>
              <div className="text-muted-foreground">Total Funding</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground mb-2">89.3%</div>
              <div className="text-muted-foreground">Avg Response Rate</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
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
      </div>
    </section>
  );
};

export default FeaturedBoards;