import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import HomepageAnonymousBlockchainFeedbackPlatform from './pages/home';
import BoardCreationStudio from './pages/board-creation';
import FeedbackTheaterBoardViewing from './pages/view-boards';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<HomepageAnonymousBlockchainFeedbackPlatform />} />
        <Route path="/home" element={<HomepageAnonymousBlockchainFeedbackPlatform />} />
        <Route path="/board/create" element={<BoardCreationStudio />} />
        <Route path="/board/all" element={<FeedbackTheaterBoardViewing />} />
        <Route path="/board/:boardId" element={<FeedbackTheaterBoardViewing />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
