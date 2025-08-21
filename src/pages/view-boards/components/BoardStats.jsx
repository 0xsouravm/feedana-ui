import React from 'react';
import Icon from '../../../components/AppIcon';

const BoardStats = ({ stats }) => {
  const statItems = [
    {
      label: 'Total Submissions',
      value: stats?.totalSubmissions,
      icon: 'MessageSquare',
      color: 'text-foreground'
    },
    {
      label: 'Active Contributors',
      value: stats?.activeContributors,
      icon: 'Users',
      color: 'text-accent'
    },
    {
      label: 'Avg. Response Time',
      value: stats?.avgResponseTime,
      icon: 'Clock',
      color: 'text-warning'
    },
    {
      label: 'Satisfaction Rate',
      value: `${stats?.satisfactionRate}%`,
      icon: 'TrendingUp',
      color: 'text-success'
    }
  ];

  const sentimentData = [
    { label: 'Positive', value: stats?.sentiment?.positive, color: 'bg-success' },
    { label: 'Neutral', value: stats?.sentiment?.neutral, color: 'bg-warning' },
    { label: 'Negative', value: stats?.sentiment?.negative, color: 'bg-error' }
  ];

  const totalSentiment = stats?.sentiment?.positive + stats?.sentiment?.neutral + stats?.sentiment?.negative;

  return (
    <div className="glass-card p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Board Analytics</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="BarChart3" size={16} />
          <span>Real-time data</span>
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
        </div>
      </div>
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statItems?.map((item, index) => (
          <div key={index} className="bg-muted/20 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Icon name={item?.icon} size={20} className={item?.color} />
            </div>
            <div className={`text-xl font-bold ${item?.color} mb-1`}>
              {item?.value}
            </div>
            <div className="text-xs text-muted-foreground">
              {item?.label}
            </div>
          </div>
        ))}
      </div>
      {/* Sentiment Analysis */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Sentiment Distribution</h3>
        
        <div className="space-y-3">
          {sentimentData?.map((sentiment, index) => {
            const percentage = totalSentiment > 0 ? (sentiment?.value / totalSentiment) * 100 : 0;
            
            return (
              <div key={index} className="flex items-center gap-3">
                <div className="w-16 text-xs text-muted-foreground">
                  {sentiment?.label}
                </div>
                <div className="flex-1 bg-muted/30 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full ${sentiment?.color} transition-all duration-1000 ease-out`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-12 text-xs text-muted-foreground text-right">
                  {sentiment?.value}
                </div>
                <div className="w-10 text-xs text-muted-foreground text-right">
                  {percentage?.toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Activity Timeline */}
      <div className="mt-6 pt-6 border-t border-border/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
          <button className="text-xs text-accent hover:text-accent/80 transition-colors duration-200">
            View all
          </button>
        </div>
        
        <div className="space-y-3">
          {stats?.recentActivity?.map((activity, index) => (
            <div key={index} className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0"></div>
              <span className="text-muted-foreground">{activity?.time}</span>
              <span className="text-foreground">{activity?.action}</span>
              <span className="text-accent">{activity?.reward}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BoardStats;