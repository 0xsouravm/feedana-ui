import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const Footer = () => {
  const currentYear = new Date()?.getFullYear();

  const footerSections = [
    {
      title: "Platform",
      links: [
        { name: "Create Board", path: "/board/create" },
        { name: "View All Boards", path: "/board/all" },
      ]
    },
    {
      title: "Support",
      links: [
        { name: "How This Works", path: "/how-it-works" },
        { name: "Contact Support", path: "#" },
      ]
    },
    {
      title: "Developers",
      links: [
        { name: "Frontend Code", path: "https://github.com/0xsouravm/feedana" },
        { name: "Smart Contract", path: "https://github.com/0xsouravm/feedana-program" },
      ]
    },
  ];

  const socialLinks = [
    { name: "Twitter", icon: "Twitter", url: "#" },
    { name: "Discord", icon: "MessageCircle", url: "#" },
    { name: "GitHub", icon: "Github", url: "#" },
    { name: "Telegram", icon: "Send", url: "#" }
  ];

  const trustBadges = [
    { name: "Decentralised", icon: "Shield" },
    { name: "Anonymous", icon: "Lock" },
    { name: "Open Source", icon: "Code" },
    { name: "Transparent", icon: "CheckCircle" }
  ];

  return (
    <footer className="bg-gradient-to-t from-muted/20 to-background border-t border-border/30">
      {/* Main Footer Content */}
      <div className="container-padding max-w-7xl mx-auto py-20">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-8">
            <Link to="/home" className="flex items-center space-x-3 group">
              <div className="relative">
                <img 
                  src="/assets/images/logo.svg" 
                  alt="Feedana Logo" 
                  className="w-12 h-12 group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-foreground">Feedana</span>
                <span className="text-xs text-accent font-mono">v0.1.0 Beta</span>
              </div>
            </Link>
            
            <p className="text-muted-foreground leading-relaxed max-w-md text-base">
              Truth without fear, feedback without friction. The first blockchain-powered 
              anonymous feedback platform built on Solana.
            </p>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4">
              {trustBadges?.map((badge, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 glass-card rounded-xl border border-accent/10">
                  <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                    <Icon name={badge?.icon} size={16} className="text-accent" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{badge?.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections?.map((section, index) => (
            <div key={index} className="space-y-6">
              <h3 className="text-lg font-bold text-foreground flex items-center space-x-2">
                <div className="w-1 h-6 bg-accent rounded-full"></div>
                <span>{section?.title}</span>
              </h3>
              <ul className="space-y-4">
                {section?.links?.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {link?.path?.startsWith('http') ? (
                      <a
                        href={link?.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-accent transition-all duration-200 text-sm flex items-center space-x-2 group"
                      >
                        <Icon name="Github" size={14} className="text-accent/70 group-hover:text-accent" />
                        <span className="group-hover:translate-x-1 transition-transform duration-200">{link?.name}</span>
                        <Icon name="ExternalLink" size={12} className="opacity-50 group-hover:opacity-100" />
                      </a>
                    ) : (
                      <Link
                        to={link?.path}
                        className="text-muted-foreground hover:text-accent transition-all duration-200 text-sm flex items-center space-x-2 group"
                      >
                        <Icon name="ArrowRight" size={12} className="text-accent/70 group-hover:text-accent" />
                        <span className="group-hover:translate-x-1 transition-transform duration-200">{link?.name}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      {/* Privacy Notice */}
      <div className="border-t border-border/50">
        <div className="container-padding max-w-7xl mx-auto py-6">
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-start space-x-3">
              <Icon name="Info" size={20} className="text-accent mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-foreground mb-2">Privacy-First Notice</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This website respects your privacy. We don't use tracking cookies, analytics, 
                  or any form of user surveillance. Your browsing remains completely anonymous, 
                  just like your feedback submissions. All data processing happens locally in 
                  your browser or through cryptographically protected blockchain transactions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Bottom Bar */}
      <div className="border-t border-border/50">
        <div className="container-padding max-w-7xl mx-auto py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>© {currentYear} Feedana. All rights reserved.</span>
              {/* <Link to="#" className="hover:text-accent transition-colors">Privacy Policy</Link>
              <Link to="#" className="hover:text-accent transition-colors">Terms of Service</Link>
              <Link to="#" className="hover:text-accent transition-colors">Cookie Policy</Link> */}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon name="Globe" size={14} />
                <span>Decentralized</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Blockchain Network Status
      <div className="border-t border-border/50 bg-muted/5">
        <div className="container-padding max-w-7xl mx-auto py-4">
          <div className="flex items-center justify-center space-x-8 text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>Solana Mainnet</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Activity" size={12} />
              <span>Block Height: 234,567,890</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Zap" size={12} />
              <span>TPS: 2,847</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="DollarSign" size={12} />
              <span>SOL: $23.45</span>
            </div>
          </div>
        </div>
      </div> */}
    </footer>
  );
};

export default Footer;