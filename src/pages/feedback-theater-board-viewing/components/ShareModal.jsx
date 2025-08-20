import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ShareModal = ({ isOpen, onClose, board, boardUrl }) => {
  const [copied, setCopied] = useState(false);
  const [shareMethod, setShareMethod] = useState('link');
  
  const fullUrl = boardUrl || `${window.location.origin}/board/${board?.id}`;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(board?.title || 'Feedback Board');
  const encodedDescription = encodeURIComponent(board?.description || 'Share your feedback on this board');

  // Social sharing URLs
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = fullUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSocialShare = (platform) => {
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Feedback Request: ${board?.title || 'Feedback Board'}`);
    const body = encodeURIComponent(`Hi there!\n\nI'd love to get your feedback on: ${board?.title || 'my project'}\n\n${board?.description || 'Please share your honest thoughts and suggestions.'}\n\nYou can submit your feedback here: ${fullUrl}\n\nThanks for your time!`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg glass-card rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/30">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Share Board</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Get more feedback by sharing your board
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all duration-200"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Share Method Tabs */}
          <div className="flex items-center space-x-1 bg-muted/20 rounded-xl p-1">
            <button
              onClick={() => setShareMethod('link')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                shareMethod === 'link' 
                  ? 'bg-accent text-accent-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="Link" size={16} className="inline mr-2" />
              Link
            </button>
            <button
              onClick={() => setShareMethod('social')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                shareMethod === 'social' 
                  ? 'bg-accent text-accent-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="Share2" size={16} className="inline mr-2" />
              Social
            </button>
            <button
              onClick={() => setShareMethod('email')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                shareMethod === 'email' 
                  ? 'bg-accent text-accent-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="Mail" size={16} className="inline mr-2" />
              Email
            </button>
          </div>

          {/* Link Sharing */}
          {shareMethod === 'link' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Board URL
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={fullUrl}
                    readOnly
                    className="flex-1 px-4 py-3 bg-input border border-border rounded-xl text-foreground text-sm font-mono select-all focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                  />
                  <Button
                    variant="outline"
                    onClick={copyToClipboard}
                    className={`px-4 py-3 ${copied ? 'border-success text-success' : ''}`}
                  >
                    <Icon name={copied ? "Check" : "Copy"} size={16} />
                  </Button>
                </div>
                {copied && (
                  <p className="text-sm text-success mt-2 flex items-center">
                    <Icon name="Check" size={14} className="mr-1" />
                    Copied to clipboard!
                  </p>
                )}
              </div>

              <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="Lightbulb" size={16} className="text-accent" />
                  <span className="text-sm font-semibold text-accent">Pro Tip</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Share this link on your website, social media, or send it directly to get quality feedback from your audience.
                </p>
              </div>
            </div>
          )}

          {/* Social Sharing */}
          {shareMethod === 'social' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Share on your favorite social platforms
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleSocialShare('twitter')}
                  className="justify-start border-blue-500/20 hover:bg-blue-500/10 text-blue-500"
                >
                  <Icon name="Twitter" size={16} className="mr-2" />
                  Twitter
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleSocialShare('facebook')}
                  className="justify-start border-blue-600/20 hover:bg-blue-600/10 text-blue-600"
                >
                  <Icon name="Facebook" size={16} className="mr-2" />
                  Facebook
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleSocialShare('linkedin')}
                  className="justify-start border-blue-700/20 hover:bg-blue-700/10 text-blue-700"
                >
                  <Icon name="Linkedin" size={16} className="mr-2" />
                  LinkedIn
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleSocialShare('reddit')}
                  className="justify-start border-orange-500/20 hover:bg-orange-500/10 text-orange-500"
                >
                  <Icon name="MessageCircle" size={16} className="mr-2" />
                  Reddit
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleSocialShare('whatsapp')}
                  className="justify-start border-green-500/20 hover:bg-green-500/10 text-green-500"
                >
                  <Icon name="MessageSquare" size={16} className="mr-2" />
                  WhatsApp
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleSocialShare('telegram')}
                  className="justify-start border-blue-400/20 hover:bg-blue-400/10 text-blue-400"
                >
                  <Icon name="Send" size={16} className="mr-2" />
                  Telegram
                </Button>
              </div>
            </div>
          )}

          {/* Email Sharing */}
          {shareMethod === 'email' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Send a personalized feedback request via email
              </p>
              
              <Button
                variant="default"
                onClick={handleEmailShare}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Icon name="Mail" size={16} className="mr-2" />
                Open Email Client
              </Button>
              
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="Info" size={16} className="text-accent" />
                  <span className="text-sm font-semibold text-accent">Email Preview</span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>Subject:</strong> Feedback Request: {board?.title}</p>
                  <p><strong>Message includes:</strong></p>
                  <ul className="list-disc list-inside ml-2 text-xs">
                    <li>Personalized greeting</li>
                    <li>Board description</li>
                    <li>Direct link to feedback form</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border/30">
          <div className="text-sm text-muted-foreground">
            {board?.title || 'Feedback Board'}
          </div>
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;