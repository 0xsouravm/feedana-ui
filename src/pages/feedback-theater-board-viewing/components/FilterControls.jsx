import React from 'react';
import { createPortal } from 'react-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FilterControls = ({ 
  sortBy, 
  setSortBy, 
  filterBy, 
  setFilterBy, 
  searchQuery, 
  setSearchQuery,
  totalCount,
  filteredCount 
}) => {
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [isSortOpen, setIsSortOpen] = React.useState(false);
  const [filterButtonPosition, setFilterButtonPosition] = React.useState(null);
  const [sortButtonPosition, setSortButtonPosition] = React.useState(null);
  const filterButtonRef = React.useRef(null);
  const sortButtonRef = React.useRef(null);
  
  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-filter')) {
        setIsFilterOpen(false);
      }
      if (!event.target.closest('.dropdown-sort')) {
        setIsSortOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  
  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: 'ArrowDown' },
    { value: 'oldest', label: 'Oldest First', icon: 'ArrowUp' },
    { value: 'reward', label: 'Highest Reward', icon: 'Coins' },
    { value: 'helpful', label: 'Most Helpful', icon: 'ThumbsUp' }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Feedback', count: totalCount },
    { value: 'positive', label: 'Positive', count: 45 },
    { value: 'neutral', label: 'Neutral', count: 23 },
    { value: 'negative', label: 'Negative', count: 12 }
  ];

  return (
    <>
    <div className="glass-card p-6 mb-6">
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
              placeholder="Search feedback..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
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
          {/* Filter Dropdown */}
          <div className="relative dropdown-filter">
            <Button
              ref={filterButtonRef}
              variant="outline"
              iconName="Filter"
              iconPosition="left"
              onClick={() => {
                if (!isFilterOpen && filterButtonRef.current) {
                  const rect = filterButtonRef.current.getBoundingClientRect();
                  setFilterButtonPosition({
                    top: rect.bottom + 8,
                    left: rect.right - 192 // 192px = w-48
                  });
                }
                setIsFilterOpen(!isFilterOpen);
              }}
              className={`text-muted-foreground hover:text-foreground ${isFilterOpen ? 'bg-accent/10 text-accent' : ''}`}
            >
              Filter {filterBy !== 'all' && <span className="ml-1 text-xs">({filterBy})</span>}
            </Button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative dropdown-sort">
            <Button
              ref={sortButtonRef}
              variant="outline"
              iconName="ArrowUpDown"
              iconPosition="left"
              onClick={() => {
                if (!isSortOpen && sortButtonRef.current) {
                  const rect = sortButtonRef.current.getBoundingClientRect();
                  setSortButtonPosition({
                    top: rect.bottom + 8,
                    left: rect.right - 192 // 192px = w-48
                  });
                }
                setIsSortOpen(!isSortOpen);
              }}
              className={`text-muted-foreground hover:text-foreground ${isSortOpen ? 'bg-accent/10 text-accent' : ''}`}
            >
              Sort {sortBy !== 'newest' && <span className="ml-1 text-xs">({sortOptions.find(o => o.value === sortBy)?.label})</span>}
            </Button>
          </div>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            {filteredCount} of {totalCount} submissions
          </div>
        </div>
      </div>
      
      {/* Active Filters */}
      {(filterBy !== 'all' || searchQuery) && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/30">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filterBy !== 'all' && (
            <div className="flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded-md text-xs">
              <span className="capitalize">{filterBy}</span>
              <button
                onClick={() => setFilterBy('all')}
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
              setFilterBy('all');
              setSearchQuery('');
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 ml-2"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
    
    {/* Portal dropdowns */}
    {isFilterOpen && filterButtonPosition && createPortal(
      <div 
        className="fixed inset-0 z-[9999]" 
        onClick={() => setIsFilterOpen(false)}
      >
        <div
          className="absolute w-48 glass-card border border-border/30 rounded-xl shadow-lg"
          style={{
            top: `${filterButtonPosition.top}px`,
            left: `${filterButtonPosition.left}px`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-2">
            {filterOptions?.map((option) => (
              <button
                key={option?.value}
                onClick={() => {
                  setFilterBy(option?.value);
                  setIsFilterOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  filterBy === option?.value
                    ? 'bg-accent/10 text-accent' :'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
              >
                <span>{option?.label}</span>
                <span className="text-xs">{option?.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>,
      document.body
    )}
    
    {isSortOpen && sortButtonPosition && createPortal(
      <div 
        className="fixed inset-0 z-[9999]" 
        onClick={() => setIsSortOpen(false)}
      >
        <div
          className="absolute w-48 glass-card border border-border/30 rounded-xl shadow-lg"
          style={{
            top: `${sortButtonPosition.top}px`,
            left: `${sortButtonPosition.left}px`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-2">
            {sortOptions?.map((option) => (
              <button
                key={option?.value}
                onClick={() => {
                  setSortBy(option?.value);
                  setIsSortOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  sortBy === option?.value
                    ? 'bg-accent/10 text-accent' :'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
              >
                <Icon name={option?.icon} size={14} />
                <span>{option?.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  );
};

export default FilterControls;