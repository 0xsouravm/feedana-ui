import React from "react";
import Routes from "./Routes";
import { WalletContextProvider } from "./contexts/WalletContext";

function App() {
  return (
    <WalletContextProvider>
      <Routes />
    </WalletContextProvider>
  );
}

export default App;
