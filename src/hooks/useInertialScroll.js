import { useEffect } from 'react';

export const useInertialScroll = () => {
  useEffect(() => {
    // Simple inertial scrolling with CSS only for now
    const addInertialStyles = () => {
      const style = document.createElement('style');
      style.id = 'inertial-scroll-styles';
      style.textContent = `
        html {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }
        
        body {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: none;
        }
        
        .momentum-container {
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
        }
        
        .glass-card {
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
        }
      `;
      document.head.appendChild(style);
    };

    // Initialize
    addInertialStyles();

    // Cleanup
    return () => {
      const styles = document.getElementById('inertial-scroll-styles');
      if (styles) {
        styles.remove();
      }
    };
  }, []);
};

export default useInertialScroll;