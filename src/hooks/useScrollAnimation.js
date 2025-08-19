import { useEffect } from 'react';

export const useScrollAnimation = () => {
  useEffect(() => {
    let isScrolling = false;
    let scrollVelocity = 0;
    let lastScrollY = window.scrollY;
    let lastTime = Date.now();
    let animationFrame = null;

    // Physics constants for inertial scrolling
    const friction = 0.85;
    const velocityThreshold = 0.1;
    
    // Track scroll velocity
    const updateScrollVelocity = () => {
      const currentTime = Date.now();
      const currentScrollY = window.scrollY;
      const deltaY = currentScrollY - lastScrollY;
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime > 0) {
        scrollVelocity = deltaY / deltaTime;
      }
      
      lastScrollY = currentScrollY;
      lastTime = currentTime;
    };

    // Inertial momentum scrolling
    const applyInertialScrolling = () => {
      if (Math.abs(scrollVelocity) < velocityThreshold) {
        isScrolling = false;
        document.body.classList.remove('inertial-scrolling');
        return;
      }

      // Apply velocity to scroll position
      window.scrollTo(0, window.scrollY + scrollVelocity * 16);
      
      // Apply friction
      scrollVelocity *= friction;
      
      // Continue animation
      animationFrame = requestAnimationFrame(applyInertialScrolling);
    };

    // Handle wheel events for custom inertial scrolling
    const handleWheel = (e) => {
      e.preventDefault();
      
      // Start inertial scrolling
      if (!isScrolling) {
        isScrolling = true;
        document.body.classList.add('inertial-scrolling');
      }
      
      // Add wheel delta to velocity with momentum
      const wheelDelta = e.deltaY * 0.5;
      scrollVelocity += wheelDelta * 0.1;
      
      // Clamp velocity to prevent excessive speed
      scrollVelocity = Math.max(-50, Math.min(50, scrollVelocity));
      
      // Cancel existing animation
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      
      // Start momentum animation
      animationFrame = requestAnimationFrame(applyInertialScrolling);
      
      // Stop momentum after delay
      clearTimeout(window.inertialTimeout);
      window.inertialTimeout = setTimeout(() => {
        scrollVelocity *= 0.5;
      }, 100);
    };

    // Handle touch events for mobile inertial scrolling
    let touchStartY = 0;
    let touchVelocity = 0;
    let touchLastY = 0;
    let touchLastTime = Date.now();

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
      touchLastY = touchStartY;
      touchLastTime = Date.now();
      touchVelocity = 0;
    };

    const handleTouchMove = (e) => {
      const currentY = e.touches[0].clientY;
      const currentTime = Date.now();
      const deltaY = currentY - touchLastY;
      const deltaTime = currentTime - touchLastTime;
      
      if (deltaTime > 0) {
        touchVelocity = deltaY / deltaTime;
      }
      
      touchLastY = currentY;
      touchLastTime = currentTime;
    };

    const handleTouchEnd = () => {
      if (Math.abs(touchVelocity) > 0.1) {
        scrollVelocity = -touchVelocity * 3; // Convert touch velocity to scroll velocity
        isScrolling = true;
        document.body.classList.add('inertial-scrolling');
        animationFrame = requestAnimationFrame(applyInertialScrolling);
      }
    };

    // Intersection Observer for element animations
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.classList.contains('scroll-fade-in') ||
              entry.target.classList.contains('scroll-slide-up') ||
              entry.target.classList.contains('scroll-scale-in')) {
            entry.target.classList.add('animate');
          }
          
          if (entry.target.classList.contains('smooth-reveal')) {
            entry.target.classList.add('visible');
          }
        }
      });
    }, observerOptions);

    // Observe animated elements
    const animatedElements = document.querySelectorAll(
      '.scroll-fade-in, .scroll-slide-up, .scroll-scale-in, .smooth-reveal'
    );
    
    animatedElements.forEach((el) => {
      observer.observe(el);
    });

    // Apply inertial scrolling styles
    const applyInertialStyles = () => {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      
      const mainContainer = document.createElement('div');
      mainContainer.id = 'inertial-scroll-container';
      mainContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        overflow-y: auto;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        -ms-overflow-style: none;
        scroll-behavior: auto;
      `;
      
      // Hide scrollbar
      const style = document.createElement('style');
      style.textContent = `
        #inertial-scroll-container::-webkit-scrollbar {
          display: none;
        }
        
        body.inertial-scrolling {
          pointer-events: none;
        }
        
        body.inertial-scrolling * {
          pointer-events: auto;
        }
      `;
      document.head.appendChild(style);
      
      // Move all body content to the container
      const bodyContent = Array.from(document.body.children);
      bodyContent.forEach(child => {
        if (child.id !== 'inertial-scroll-container') {
          mainContainer.appendChild(child);
        }
      });
      
      document.body.appendChild(mainContainer);
      
      // Add event listeners to the container
      mainContainer.addEventListener('wheel', handleWheel, { passive: false });
      mainContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
      mainContainer.addEventListener('touchmove', handleTouchMove, { passive: true });
      mainContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
      
      // Update scroll tracking
      mainContainer.addEventListener('scroll', updateScrollVelocity, { passive: true });
    };

    // Initialize inertial scrolling
    applyInertialStyles();

    // Cleanup
    return () => {
      observer.disconnect();
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      clearTimeout(window.inertialTimeout);
      
      // Restore normal scrolling
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      const container = document.getElementById('inertial-scroll-container');
      if (container) {
        const content = Array.from(container.children);
        content.forEach(child => document.body.appendChild(child));
        container.remove();
      }
    };
  }, []);
};

export default useScrollAnimation;