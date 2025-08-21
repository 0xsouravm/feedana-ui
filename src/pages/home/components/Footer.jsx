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
        { name: "Feedback Theater", path: "/board/all" },
        { name: "Privacy Academy", path: "#" },
        { name: "Community Hub", path: "#" }
      ]
    },
    {
      title: "Privacy & Security",
      links: [
        { name: "Privacy Guide", path: "#" },
        { name: "Security Audit", path: "#" },
        { name: "Cryptographic Proofs", path: "#" },
        { name: "Anonymity Guarantees", path: "#" }
      ]
    },
    {
      title: "Developers",
      links: [
        { name: "API Documentation", path: "#" },
        { name: "Anchor Integration", path: "#" },
        { name: "GitHub Repository", path: "#" },
        { name: "Technical Whitepaper", path: "#" }
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", path: "#" },
        { name: "Contact Support", path: "#" },
        { name: "Bug Reports", path: "#" },
        { name: "Feature Requests", path: "#" }
      ]
    }
  ];

  const socialLinks = [
    { name: "Twitter", icon: "Twitter", url: "#" },
    { name: "Discord", icon: "MessageCircle", url: "#" },
    { name: "GitHub", icon: "Github", url: "#" },
    { name: "Telegram", icon: "Send", url: "#" }
  ];

  const trustBadges = [
    { name: "SOC 2 Compliant", icon: "Shield" },
    { name: "GDPR Ready", icon: "Lock" },
    { name: "Open Source", icon: "Code" },
    { name: "Audited", icon: "CheckCircle" }
  ];

  return (
    <footer className="bg-background border-t border-border/50">
      {/* Main Footer Content */}
      <div className="container-padding max-w-7xl mx-auto py-16">
        <div className="grid lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/home" className="flex items-center space-x-3 group">
              <img 
                src="/assets/images/logo.svg" 
                alt="Feedana Logo" 
                className="w-10 h-10"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground">Feedana</span>
                <span className="text-xs text-muted-foreground font-mono">v2.1.0</span>
              </div>
            </Link>
            
            <p className="text-muted-foreground leading-relaxed max-w-md">
              Truth without fear, feedback without friction. The first blockchain-powered 
              anonymous feedback platform that guarantees cryptographic privacy while 
              maintaining authenticity.
            </p>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3">
              {trustBadges?.map((badge, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-muted/10 rounded-lg">
                  <Icon name={badge?.icon} size={14} className="text-accent" />
                  <span className="text-xs text-muted-foreground">{badge?.name}</span>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks?.map((social, index) => (
                <a
                  key={index}
                  href={social?.url}
                  className="w-10 h-10 bg-muted/20 rounded-xl flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all duration-300"
                  aria-label={social?.name}
                >
                  <Icon name={social?.icon} size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections?.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="font-semibold text-foreground">{section?.title}</h3>
              <ul className="space-y-3">
                {section?.links?.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link?.path}
                      className="text-muted-foreground hover:text-accent transition-colors duration-200 text-sm"
                    >
                      {link?.name}
                    </Link>
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
              <Link to="#" className="hover:text-accent transition-colors">Privacy Policy</Link>
              <Link to="#" className="hover:text-accent transition-colors">Terms of Service</Link>
              <Link to="#" className="hover:text-accent transition-colors">Cookie Policy</Link>
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