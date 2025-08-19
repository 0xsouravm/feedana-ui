import { useEffect } from 'react';

export const useSmoothInertialScroll = () => {
  useEffect(() => {
    // Add smooth inertial scrolling styles
    const addStyles = () => {
      const style = document.createElement('style');
      style.id = 'smooth-inertial-scroll';
      style.textContent = `
        /* Enhanced smooth scrolling */
        html {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-y: none;
        }
        
        body {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-y: none;
          scroll-behavior: smooth;
        }
        
        /* Hardware acceleration for better performance - only for specific elements */
        .momentum-container {
          transform: translateZ(0);
          backface-visibility: hidden;
        }
        
        /* Smooth momentum scrolling for containers */
        .momentum-container {
          transform: translate3d(0, 0, 0);
          will-change: transform;
        }
        
        /* Enhanced glass cards */
        .glass-card {
          transform: translate3d(0, 0, 0);
          will-change: transform;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .glass-card:hover {
          transform: translate3d(0, -2px, 0);
        }
      `;
      document.head.appendChild(style);
    };

    // Enhanced wheel scrolling for desktop
    let isScrolling = false;
    const handleWheel = (e) => {
      // Don't prevent default - let browser handle it but enhance it
      if (!isScrolling) {
        isScrolling = true;
        document.body.style.scrollBehavior = 'auto';
        
        // Add momentum class for visual feedback
        document.body.classList.add('momentum-scrolling');
        
        // Reset after scroll ends
        clearTimeout(window.scrollTimer);
        window.scrollTimer = setTimeout(() => {
          isScrolling = false;
          document.body.style.scrollBehavior = 'smooth';
          document.body.classList.remove('momentum-scrolling');
        }, 150);
      }
    };

    // Enhanced touch scrolling for mobile
    let touchStartTime = 0;
    let touchStartY = 0;
    
    const handleTouchStart = (e) => {
      touchStartTime = Date.now();
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchEnd = (e) => {
      const touchEndTime = Date.now();
      const touchEndY = e.changedTouches[0].clientY;
      const deltaTime = touchEndTime - touchStartTime;
      const deltaY = Math.abs(touchEndY - touchStartY);
      
      // If it was a fast swipe, add momentum class
      if (deltaTime < 300 && deltaY > 50) {
        document.body.classList.add('momentum-scrolling');
        setTimeout(() => {
          document.body.classList.remove('momentum-scrolling');
        }, 500);
      }
    };

    // Apply styles and listeners
    addStyles();
    
    // Use passive listeners for better performance
    document.addEventListener('wheel', handleWheel, { passive: true });
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Cleanup
    return () => {
      const style = document.getElementById('smooth-inertial-scroll');
      if (style) style.remove();
      
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      
      clearTimeout(window.scrollTimer);
    };
  }, []);
};

export default useSmoothInertialScroll;