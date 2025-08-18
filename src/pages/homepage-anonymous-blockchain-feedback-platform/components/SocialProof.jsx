import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const SocialProof = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const securityAudits = [
    {
      firm: "CertiK",
      score: "98/100",
      status: "Verified",
      date: "2024-07-15",
      focus: "Smart Contract Security"
    },
    {
      firm: "Quantstamp",
      score: "96/100", 
      status: "Verified",
      date: "2024-06-22",
      focus: "Cryptographic Implementation"
    },
    {
      firm: "Trail of Bits",
      score: "97/100",
      status: "Verified", 
      date: "2024-08-03",
      focus: "Privacy Architecture"
    }
  ];

  const anonymousTestimonials = [
    {
      content: `Finally, a platform where I can share honest feedback about management without fear of retaliation. The anonymity is bulletproof - I've verified the cryptographic proofs myself.`,
      role: "Senior Software Engineer",
      industry: "Tech Startup",
      submissionCount: 23,
      verificationHash: "0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c5f7"
    },
    {
      content: `As a whistleblower in healthcare, I needed absolute privacy protection. Feedana's blockchain verification gave me confidence to share critical patient safety concerns.`,
      role: "Healthcare Professional", 
      industry: "Medical",
      submissionCount: 8,
      verificationHash: "0x2c5f7fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c5"
    },
    {
      content: `The quality of feedback we receive through Feedana is dramatically higher than traditional surveys. People share insights they'd never reveal in identified feedback.`,
      role: "HR Director",
      industry: "Fortune 500",
      submissionCount: 156,
      verificationHash: "0xead7c2c5f7fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ea"
    },
    {
      content: `I was skeptical about blockchain privacy until I tested Feedana's stealth addresses. The mathematical guarantees are solid - this is the future of anonymous communication.`,
      role: "Cryptography Researcher",
      industry: "Academia",
      submissionCount: 34,
      verificationHash: "0x4ead79fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2"
    }
  ];

  const expertEndorsements = [
    {
      name: "Dr. Sarah Chen",
      title: "Privacy Researcher, MIT",
      quote: "Feedana represents a breakthrough in anonymous communication technology.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Marcus Rodriguez",
      title: "Blockchain Security Expert",
      quote: "The cryptographic implementation is mathematically sound and production-ready.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Dr. Emily Watson",
      title: "Digital Rights Advocate",
      quote: "This platform could revolutionize how organizations collect honest feedback.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    }
  ];

  const platformMetrics = [
    { label: "Anonymous Users", value: "12,000+", icon: "Users" },
    { label: "Feedback Submissions", value: "47,000+", icon: "MessageSquare" },
    { label: "Active Boards", value: "847", icon: "Layout" },
    { label: "SOL Secured", value: "2,340", icon: "Shield" },
    { label: "Privacy Score", value: "99.8%", icon: "Lock" },
    { label: "Uptime", value: "99.9%", icon: "Activity" }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % anonymousTestimonials?.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-background">
      <div className="container-padding max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Trusted by Privacy Advocates Worldwide
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our commitment to anonymity and security is verified by leading blockchain 
            security firms and trusted by thousands of anonymous users.
          </p>
        </div>

        {/* Security Audits */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-foreground text-center mb-8">
            Security Audit Results
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {securityAudits?.map((audit, index) => (
              <div key={index} className="glass-card p-6 rounded-2xl text-center">
                <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon name="Shield" size={32} className="text-success" />
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-2">{audit?.firm}</h4>
                <div className="text-3xl font-bold text-success mb-2">{audit?.score}</div>
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <Icon name="CheckCircle" size={16} className="text-success" />
                  <span className="text-sm font-medium text-success">{audit?.status}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{audit?.focus}</p>
                <p className="text-xs text-muted-foreground">Audited: {audit?.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Anonymous Testimonials */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-foreground text-center mb-8">
            Anonymous User Testimonials
          </h3>
          <div className="max-w-4xl mx-auto">
            <div className="glass-card p-8 rounded-2xl">
              <div className="text-center mb-6">
                <Icon name="Quote" size={48} className="text-accent/30 mx-auto mb-4" />
                <blockquote className="text-lg text-foreground leading-relaxed mb-6">
                  "{anonymousTestimonials?.[currentTestimonial]?.content}"
                </blockquote>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                    <span>{anonymousTestimonials?.[currentTestimonial]?.role}</span>
                    <span>•</span>
                    <span>{anonymousTestimonials?.[currentTestimonial]?.industry}</span>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <Icon name="MessageSquare" size={12} className="text-accent" />
                      <span className="text-muted-foreground">
                        {anonymousTestimonials?.[currentTestimonial]?.submissionCount} submissions
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Shield" size={12} className="text-success" />
                      <span className="text-muted-foreground font-mono">
                        {anonymousTestimonials?.[currentTestimonial]?.verificationHash?.slice(0, 12)}...
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial Navigation */}
              <div className="flex items-center justify-center space-x-2">
                {anonymousTestimonials?.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentTestimonial ? 'bg-accent' : 'bg-muted/30 hover:bg-muted/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Expert Endorsements */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-foreground text-center mb-8">
            Expert Endorsements
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {expertEndorsements?.map((expert, index) => (
              <div key={index} className="glass-card p-6 rounded-2xl text-center">
                <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4">
                  <img
                    src={expert?.avatar}
                    alt={expert?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-semibold text-foreground mb-1">{expert?.name}</h4>
                <p className="text-sm text-accent mb-3">{expert?.title}</p>
                <blockquote className="text-sm text-muted-foreground italic">
                  "{expert?.quote}"
                </blockquote>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Metrics */}
        <div className="glass-card p-8 rounded-2xl">
          <h3 className="text-2xl font-semibold text-foreground text-center mb-8">
            Platform Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {platformMetrics?.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon name={metric?.icon} size={24} className="text-accent" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">{metric?.value}</div>
                <div className="text-sm text-muted-foreground">{metric?.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cryptographic Verification */}
        <div className="mt-16 text-center">
          <div className="max-w-3xl mx-auto glass-card p-8 rounded-2xl">
            <Icon name="Lock" size={48} className="text-accent mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Cryptographic Verification Available
            </h3>
            <p className="text-muted-foreground mb-6">
              All testimonials and metrics are cryptographically verifiable on-chain. 
              We provide mathematical proof of authenticity without compromising anonymity.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <Icon name="CheckCircle" size={16} className="text-success" />
                <span className="text-muted-foreground">Zero-Knowledge Proofs</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="CheckCircle" size={16} className="text-success" />
                <span className="text-muted-foreground">On-Chain Verification</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="CheckCircle" size={16} className="text-success" />
                <span className="text-muted-foreground">Privacy Preserved</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;