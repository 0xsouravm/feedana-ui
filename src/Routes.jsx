import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import HomepageAnonymousBlockchainFeedbackPlatform from './pages/homepage-anonymous-blockchain-feedback-platform';
import BoardCreationStudio from './pages/board-creation-studio';
import FeedbackTheaterBoardViewing from './pages/feedback-theater-board-viewing';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<HomepageAnonymousBlockchainFeedbackPlatform />} />
        <Route path="/homepage-anonymous-blockchain-feedback-platform" element={<HomepageAnonymousBlockchainFeedbackPlatform />} />
        <Route path="/board-creation-studio" element={<BoardCreationStudio />} />
        <Route path="/feedback-theater-board-viewing" element={<FeedbackTheaterBoardViewing />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
