import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ValueProposition = () => {
  const [activeDemo, setActiveDemo] = useState(0);

  const pillars = [
    {
      icon: "MessageSquare",
      title: "Simple Collection", 
      description: "Straightforward feedback collection process that anyone can use without technical knowledge or setup complexity.",
      features: [
        "No registration required",
        "Instant feedback submission",
        "Clean, intuitive interface",
        "Mobile-friendly design"
      ],
      color: "accent"
    },
    {
      icon: "BarChart",
      title: "Organized Results",
      description: "All feedback is automatically organized and categorized to help you understand patterns and make informed decisions.",
      features: [
        "Automatic categorization",
        "Sentiment analysis", 
        "Easy export options",
        "Real-time updates"
      ],
      color: "success"
    },
    {
      icon: "TrendingUp",
      title: "Actionable Insights",
      description: "Transform raw feedback into clear, actionable insights that help you improve your products and services effectively.",
      features: [
        "Clear data visualization",
        "Trend identification",
        "Priority recommendations",
        "Progress tracking"
      ],
      color: "warning"
    }
  ];

  const feedbackExamples = [
    {
      content: `The new product roadmap lacks clear prioritization. The team seems to be building features that look good in demos but don't solve real user problems. We need more customer research before committing to these directions.`,
      category: "Product Strategy",
      sentiment: "constructive"
    },
    {
      content: `Management's communication during the recent changes was unclear and created unnecessary confusion. Better transparency about decision criteria would help everyone understand the direction.`,
      category: "Communication",
      sentiment: "constructive"
    },
    {
      content: `The remote work policy is actually working better than expected. Team productivity is up 23% and satisfaction scores have improved. We should make this permanent rather than forcing return to office.`,
      category: "Operations",
      sentiment: "positive"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container-padding max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Three Pillars of Effective Feedback
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our platform focuses on simplicity, organization, and actionable results 
            to help you collect and utilize feedback more effectively.
          </p>
        </div>

        {/* Interactive Pillars */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {pillars?.map((pillar, index) => (
            <div
              key={index}
              className={`glass-card p-8 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-glow ${
                activeDemo === index ? 'border border-accent/30' : ''
              }`}
              onClick={() => setActiveDemo(index)}
            >
              <div className="text-center space-y-6">
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center bg-${pillar?.color}/10`}>
                  <Icon name={pillar?.icon} size={32} className={`text-${pillar?.color}`} />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{pillar?.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{pillar?.description}</p>
                </div>

                <div className="space-y-2">
                  {pillar?.features?.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-2 text-sm">
                      <Icon name="Check" size={14} className={`text-${pillar?.color}`} />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {activeDemo === index && (
                  <div className="mt-6 p-4 bg-muted/20 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-2 h-2 bg-${pillar?.color} rounded-full animate-pulse`}></div>
                      <span className="text-sm font-medium text-foreground">Active Feature</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Demo Section */}
        <div className="glass-card p-8 rounded-2xl">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Demo Content */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Icon name={pillars?.[activeDemo]?.icon} size={24} className="text-accent" />
                <h3 className="text-2xl font-semibold text-foreground">
                  {pillars?.[activeDemo]?.title} Example
                </h3>
              </div>

              {activeDemo === 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Simple Submission Process</h4>
                  <div className="bg-muted/20 rounded-xl p-4 space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-accent/10 rounded-lg">
                      <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                        <span className="text-accent font-bold text-sm">1</span>
                      </div>
                      <span className="text-foreground">Visit feedback board</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-accent/10 rounded-lg">
                      <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                        <span className="text-accent font-bold text-sm">2</span>
                      </div>
                      <span className="text-foreground">Write your feedback</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-accent/10 rounded-lg">
                      <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                        <span className="text-accent font-bold text-sm">3</span>
                      </div>
                      <span className="text-foreground">Submit and go</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No account creation, no complex forms, no technical barriers. 
                    Just simple, straightforward feedback collection.
                  </p>
                </div>
              )}

              {activeDemo === 1 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Automatic Organization</h4>
                  <div className="space-y-3">
                    {[
                      { category: "Product Feedback", count: "47 submissions", icon: "Package" },
                      { category: "User Experience", count: "32 submissions", icon: "Users" },
                      { category: "Feature Requests", count: "28 submissions", icon: "Plus" }
                    ]?.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg">
                        <Icon name={item?.icon} size={16} className="text-success" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">{item?.category}</div>
                          <div className="text-xs text-muted-foreground">{item?.count}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeDemo === 2 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Sample Feedback</h4>
                  <div className="space-y-3">
                    {feedbackExamples?.map((example, index) => (
                      <div key={index} className="p-4 bg-muted/20 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-accent">{example?.category}</span>
                          <div className={`px-2 py-1 rounded-full text-xs ${
                            example?.sentiment === 'positive' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                          }`}>
                            {example?.sentiment}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          "{example?.content}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Statistics */}
            <div className="space-y-6">
              <h4 className="text-xl font-semibold text-foreground">Platform Statistics</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/20 rounded-xl">
                  <div className="text-2xl font-bold text-accent">12,847</div>
                  <div className="text-sm text-muted-foreground">Total Submissions</div>
                </div>
                <div className="text-center p-4 bg-muted/20 rounded-xl">
                  <div className="text-2xl font-bold text-success">98.7%</div>
                  <div className="text-sm text-muted-foreground">User Satisfaction</div>
                </div>
                <div className="text-center p-4 bg-muted/20 rounded-xl">
                  <div className="text-2xl font-bold text-warning">4.8x</div>
                  <div className="text-sm text-muted-foreground">Faster Collection</div>
                </div>
                <div className="text-center p-4 bg-muted/20 rounded-xl">
                  <div className="text-2xl font-bold text-accent">847</div>
                  <div className="text-sm text-muted-foreground">Active Boards</div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-accent/5 to-transparent rounded-xl border border-accent/20">
                <h5 className="font-semibold text-foreground mb-3">Why Simple Works</h5>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start space-x-2">
                    <Icon name="ArrowRight" size={14} className="text-accent mt-0.5" />
                    <span>No barriers to participation</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Icon name="ArrowRight" size={14} className="text-accent mt-0.5" />
                    <span>Higher response rates</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Icon name="ArrowRight" size={14} className="text-accent mt-0.5" />
                    <span>More genuine responses</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Icon name="ArrowRight" size={14} className="text-accent mt-0.5" />
                    <span>Faster insights delivery</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;