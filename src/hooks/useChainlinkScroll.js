import { useEffect } from 'react';

export const useChainlinkScroll = () => {
  useEffect(() => {
    // Check if we're on the board creation page - if so, disable completely
    const isOnBoardCreationPage = window.location.pathname.includes('/board-creation-studio');
    
    if (isOnBoardCreationPage) {
      console.log('Chainlink scroll disabled on board creation page');
      return; // Exit early, no scroll handling
    }
    
    let isScrolling = false;
    let velocity = 0;
    let scrollTarget = window.scrollY;
    let animationFrame = null;
    let isInputFocused = false;

    // Chainlink-style scroll constants
    const friction = 0.09; // Lower = more resistance (honey-like feel)
    const ease = 0.12; // Smooth interpolation factor
    const velocityDamping = 0.85; // Velocity decay

    // Smooth scroll animation loop
    const smoothScrollLoop = () => {
      const currentScrollY = window.scrollY;
      const distance = scrollTarget - currentScrollY;

      // Apply smooth easing toward target
      if (Math.abs(distance) > 0.1) {
        const newScrollY = currentScrollY + distance * ease;
        window.scrollTo(0, newScrollY);
        animationFrame = requestAnimationFrame(smoothScrollLoop);
      } else {
        isScrolling = false;
      }
    };

    // Handle wheel events with resistance
    const handleWheel = (e) => {
      // Don't handle scroll if modal is open or input is focused
      if (window.modalScrollDisabled || isInputFocused || isInputCurrentlyFocused()) {
        return;
      }
      
      e.preventDefault();

      const delta = e.deltaY;
      const scrollAmount = delta * 0.8; // Reduce scroll sensitivity

      // Add to velocity with resistance
      velocity += scrollAmount * friction;
      velocity *= velocityDamping; // Apply damping

      // Update scroll target instead of immediate scroll
      scrollTarget += velocity;

      // Clamp scroll target to page bounds
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollTarget = Math.max(0, Math.min(maxScroll, scrollTarget));

      // Start smooth animation if not already running
      if (!isScrolling) {
        isScrolling = true;
        smoothScrollLoop();
      }

      // Clear momentum timeout
      clearTimeout(window.chainlinkTimeout);
      window.chainlinkTimeout = setTimeout(() => {
        velocity *= 0.5; // Gradual velocity decay
      }, 50);
    };

    // Handle touch for mobile
    let touchStartY = 0;
    let touchVelocity = 0;
    let lastTouchY = 0;
    let lastTouchTime = Date.now();

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
      lastTouchY = touchStartY;
      lastTouchTime = Date.now();
      touchVelocity = 0;
    };

    const handleTouchMove = (e) => {
      // Don't handle scroll if modal is open or input is focused
      if (window.modalScrollDisabled || isInputFocused || isInputCurrentlyFocused()) {
        return;
      }
      
      const currentY = e.touches[0].clientY;
      const currentTime = Date.now();
      const deltaY = lastTouchY - currentY;
      const deltaTime = currentTime - lastTouchTime;

      if (deltaTime > 0) {
        touchVelocity = deltaY / deltaTime;
      }

      lastTouchY = currentY;
      lastTouchTime = currentTime;

      // Apply resistance to touch scrolling
      velocity += touchVelocity * friction * 5;
      scrollTarget += velocity;

      // Clamp bounds
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollTarget = Math.max(0, Math.min(maxScroll, scrollTarget));

      if (!isScrolling) {
        isScrolling = true;
        smoothScrollLoop();
      }
    };

    const handleTouchEnd = () => {
      // Add momentum after touch ends
      velocity *= 0.7;
      if (Math.abs(velocity) > 0.1) {
        scrollTarget += velocity * 20; // Momentum multiplier
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        scrollTarget = Math.max(0, Math.min(maxScroll, scrollTarget));
      }
    };

    // Smooth scroll to target function
    const scrollToTarget = (targetPosition) => {
      scrollTarget = targetPosition;
      if (!isScrolling) {
        isScrolling = true;
        smoothScrollLoop();
      }
    };

    // Expose scroll function globally for button clicks
    window.chainlinkScrollTo = scrollToTarget;

    // Apply Chainlink-style CSS
    const addChainlinkStyles = () => {
      const style = document.createElement('style');
      style.id = 'chainlink-scroll-styles';
      style.textContent = `
        /* Chainlink-style base */
        html {
          scroll-behavior: auto !important;
          overflow-y: auto;
        }
        
        body {
          scroll-behavior: auto !important;
          overscroll-behavior: none;
          overflow-x: hidden;
        }

        /* Smooth hardware acceleration */
        .chainlink-container {
          transform: translate3d(0, 0, 0);
          will-change: transform;
        }

        /* Remove any conflicting smooth scroll */
        * {
          scroll-behavior: auto !important;
        }

        /* Ensure text visibility */
        .text-foreground {
          color: var(--color-foreground) !important;
          opacity: 1 !important;
        }

        .text-muted-foreground {
          color: var(--color-muted-foreground) !important;
          opacity: 1 !important;
        }

        /* Ensure header stays fixed */
        header {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          z-index: 9999 !important;
          transform: translate3d(0, 0, 0) !important;
          will-change: transform !important;
        }

        /* Remove transforms from chainlink containers that contain header */
        .chainlink-container:has(header) {
          transform: none !important;
          will-change: auto !important;
        }

        /* Fix dropdown scrolling and cropping */
        .absolute.top-full {
          position: absolute !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          overscroll-behavior: contain !important;
          z-index: 100 !important;
        }

        /* Ensure dropdowns can scroll independently */
        [class*="max-h-"] {
          overflow-y: auto !important;
          overscroll-behavior: contain !important;
        }

        /* Allow dropdown visibility without breaking layout */
        .glass-card {
          overflow: visible;
        }

        /* Only the dropdown container needs visible overflow */
        .space-y-4.relative {
          overflow: visible;
        }

        /* Dropdown specific positioning */
        .absolute.top-full {
          position: absolute !important;
          z-index: 9999 !important;
          max-width: 100% !important;
          left: 0 !important;
          right: 0 !important;
        }

        /* Custom green dot scrollbar for dropdown */
        .dropdown-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: var(--color-accent) transparent;
        }

        .dropdown-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .dropdown-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .dropdown-scrollbar::-webkit-scrollbar-thumb {
          background: var(--color-accent);
          border-radius: 50%;
          width: 6px;
          height: 6px;
          min-height: 6px;
        }

        .dropdown-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--color-accent);
          opacity: 0.8;
        }

        /* Ensure dropdown window border is visible */
        .dropdown-window {
          border: 2px solid var(--color-border) !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
        }

        /* Ensure modals appear above transform contexts */
        .fixed[style*="z-index"] {
          position: fixed !important;
          transform: none !important;
          will-change: auto !important;
        }
      `;
      document.head.appendChild(style);
    };

    // Initialize Chainlink scroll
    addChainlinkStyles();
    
    // Sync scroll target with current position
    scrollTarget = window.scrollY;

    // Track input focus state
    const handleFocusIn = (e) => {
      const target = e.target;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        isInputFocused = true;
        console.log('Input focused - Chainlink scroll disabled:', target.tagName, target.type || 'no-type');
      }
    };

    const handleFocusOut = (e) => {
      const target = e.target;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        isInputFocused = false;
        console.log('Input unfocused - Chainlink scroll enabled:', target.tagName);
      }
    };

    // Also check on every wheel/touch event for safety
    const isInputCurrentlyFocused = () => {
      const activeElement = document.activeElement;
      return activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.contentEditable === 'true' ||
        activeElement.getAttribute('contenteditable') === 'true' ||
        activeElement.isContentEditable
      );
    };

    // Prevent key events from interfering with input
    const handleKeyDown = (e) => {
      const target = e.target;
      const isTargetInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true';
      const currentlyFocused = isInputCurrentlyFocused();
      
      // Debug logging for space key
      if (e.code === 'Space') {
        console.log('Space key pressed:', {
          target: target.tagName,
          isTargetInput,
          isInputFocused,
          currentlyFocused,
          willPrevent: !isTargetInput && !isInputFocused && !currentlyFocused
        });
      }
      
      // Always allow keyboard input when target is an input field
      if (isTargetInput) {
        return true; // Don't prevent any keys for input fields
      }
      
      // Also check if any input is currently focused (double check)
      if (isInputFocused || currentlyFocused) {
        return true;
      }
      
      // Only prevent scroll-related keys when not in input fields
      const scrollKeys = ['Space', 'PageDown', 'PageUp', 'End', 'Home', 'ArrowUp', 'ArrowDown'];
      if (scrollKeys.includes(e.code)) {
        e.preventDefault();
      }
    };

    // Add event listeners
    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('keydown', handleKeyDown, { passive: false });
    document.addEventListener('focusin', handleFocusIn, { passive: true });
    document.addEventListener('focusout', handleFocusOut, { passive: true });

    // Cleanup
    return () => {
      const style = document.getElementById('chainlink-scroll-styles');
      if (style) style.remove();

      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);

      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      clearTimeout(window.chainlinkTimeout);
      
      // Clean up global function
      if (window.chainlinkScrollTo) {
        delete window.chainlinkScrollTo;
      }
    };
  }, []);
};

export default useChainlinkScroll;