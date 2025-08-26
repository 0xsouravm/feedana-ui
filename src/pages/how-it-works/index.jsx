import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Footer from '../home/components/Footer';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Connect Your Wallet",
      description: "Connect your Solana wallet (Phantom or Solflare) to get started. No personal information required.",
      icon: "Wallet",
      details: [
        "Uses Solana blockchain for secure transactions",
        "No email or registration needed",
        "Your wallet address is your only identifier"
      ]
    },
    {
      number: "02", 
      title: "Create or Find Boards",
      description: "Create your own feedback board or browse existing ones. Each board is stored on-chain and IPFS.",
      icon: "PlusCircle",
      details: [
        "Board data stored on IPFS for decentralization",
        "IPFS CID recorded on Solana blockchain",
        "Browse public boards or create your own"
      ]
    },
    {
      number: "03",
      title: "Submit Anonymous Feedback",
      description: "Share your thoughts completely anonymously. Your feedback is cryptographically secured.",
      icon: "MessageSquare",
      details: [
        "Anonymous wallet-based submissions",
        "No personal information collected",
        "Submit feedbacks with a peace of mind"
      ]
    },
    {
      number: "04",
      title: "Share Board or Export Results",
      description: "Anyone can view all feedback and export board data and share the board on various networks. Contributors remain completely anonymous.",
      icon: "Send",
      details: [
        "Share to popular social media",
        "Export to JSON format",
        "Copy shareable board URLs"
      ]
    }
  ];

  const features = [
    {
      title: "Wallet-Based Anonymity",
      description: "Your identity is protected by using wallet addresses as identifiers. No personal information required.",
      icon: "Shield", 
      color: "text-blue-400"
    },
    {
      title: "Decentralized Storage", 
      description: "All data lives on IPFS and Solana blockchain. No central servers to hack or shut down.",
      icon: "Database",
      color: "text-purple-400"
    },
    {
      title: "Immutable Records",
      description: "Once submitted, feedback cannot be altered or censored. Permanent and tamper-proof.",
      icon: "Lock",
      color: "text-green-400"
    },
    {
      title: "Low Transaction Costs",
      description: "Powered by Solana's fast, low-cost blockchain. Typical transactions cost less than $0.01.",
      icon: "DollarSign",
      color: "text-yellow-400"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              How Feedana Works
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Learn how our blockchain-powered anonymous feedback platform protects your privacy 
              while ensuring authentic, immutable feedback collection.
            </p>
          </div>

          {/* Process Steps */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              Simple 4-Step Process
            </h2>
            
            <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-3xl p-12 border border-accent/20">
              <div className="space-y-16">
                {steps.map((step, index) => (
                  <div 
                    key={index}
                    className={`flex flex-col lg:flex-row items-center gap-8 ${
                      index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                    }`}
                  >
                    {/* Content */}
                    <div className="flex-1 space-y-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-accent/30 rounded-2xl flex items-center justify-center border-2 border-accent/40">
                          <span className="text-2xl font-bold text-accent">{step.number}</span>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-foreground">{step.title}</h3>
                        </div>
                      </div>
                      
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                      
                      <ul className="space-y-2">
                        {step.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-center space-x-3">
                            <Icon name="Check" size={16} className="text-success" />
                            <span className="text-muted-foreground">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/20 shadow-lg">
                        <Icon name={step.icon} size={64} className="text-accent" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              Why Choose Feedana
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="glass-card p-8 rounded-2xl">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-muted/20 rounded-xl flex items-center justify-center">
                      <Icon name={feature.icon} size={24} className={feature.color} />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Is my feedback really anonymous?
                </h3>
                <p className="text-muted-foreground">
                  Yes, pseudonymously. Your wallet address is used to prevent spam and ensure 
                  authenticity, but wallet addresses don't reveal your real identity. The blockchain 
                  only verifies that feedback came from a valid wallet, maintaining privacy through 
                  pseudonymous addressing.
                </p>
              </div>
              
              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  What does it cost to use Feedana?
                </h3>
                <p className="text-muted-foreground">
                  Very little! You only pay Solana network fees, which are typically less than 
                  $0.01 per transaction. Additionally there is a fixed 10 lamports (~$0.000002) fee for 
                  creating a board and 1 lamport (~$0.0000002) fee for submitting feedback. There are no 
                  subscriptions or hidden costs.
                </p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon name="MessageSquare" size={16} className="text-accent" />
                      <span className="text-sm font-semibold text-foreground">Feedbacks Submitted</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      $1 in platform fees = <span className="font-bold text-accent">~5,000,000 feedbacks</span>
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      (excl. transaction and blockchain fees)
                    </p>
                  </div>
                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon name="Plus" size={16} className="text-accent" />
                      <span className="text-sm font-semibold text-foreground">Boards Created</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      $1 in platform fees = <span className="font-bold text-accent">~500,000 boards</span>
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      (excl. transaction and blockchain fees)
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Can feedback be deleted or censored?
                </h3>
                <p className="text-muted-foreground">
                  No. Once feedback is submitted to the blockchain and IPFS, it becomes 
                  immutable and permanent. This ensures no one can alter or censor feedback 
                  after submission, maintaining integrity and trust.
                </p>
              </div>
              
              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Do I need technical knowledge to use this?
                </h3>
                <p className="text-muted-foreground">
                  Not at all! Simply install a Solana wallet (like Phantom), connect it, 
                  and you're ready to go. The interface is designed to be as simple as 
                  any traditional web application.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="glass-card p-12 rounded-3xl border-2 border-accent/20">
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join the future of anonymous feedback. Create your first board or explore 
                existing ones to see Feedana in action.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/board/create">
                  <Button
                    variant="default"
                    size="lg"
                    iconName="Plus"
                    iconPosition="left"
                    className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow w-full sm:w-auto"
                  >
                    Create Your First Board
                  </Button>
                </Link>
                <Link to="/board/all">
                  <Button
                    variant="outline"
                    size="lg"
                    iconName="Search"
                    iconPosition="left"
                    className="border-accent/30 text-accent hover:bg-accent/10 hover:text-white w-full sm:w-auto"
                  >
                    Explore Existing Boards
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HowItWorks;