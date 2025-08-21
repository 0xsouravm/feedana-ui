import React, { useEffect } from "react";
import Routes from "./Routes";
import { WalletContextProvider } from "./contexts/WalletContext";

function App() {
  useEffect(() => {
    // Global error handler for unhandled fetch errors
    const handleUnhandledRejection = (event) => {
      if (event.reason && event.reason.message && event.reason.message.includes('Failed to fetch')) {
        console.warn('Caught unhandled fetch error:', event.reason.message);
        // Prevent the error from showing in console
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <WalletContextProvider>
      <Routes />
    </WalletContextProvider>
  );
}

export default App;
