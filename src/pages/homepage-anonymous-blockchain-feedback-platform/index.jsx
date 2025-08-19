import React from 'react';
import Header from '../../components/ui/Header';
import HeroSection from './components/HeroSection';
import ValueProposition from './components/ValueProposition';
import FeaturedBoards from './components/FeaturedBoards';
// import SocialProof from './components/SocialProof';
import Footer from './components/Footer';

const HomepageAnonymousBlockchainFeedbackPlatform = () => {
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <HeroSection />
        <ValueProposition />
        <FeaturedBoards />
        {/* <SocialProof /> */}
      </main>
      
      <Footer />
    </div>
  );
};

export default HomepageAnonymousBlockchainFeedbackPlatform;