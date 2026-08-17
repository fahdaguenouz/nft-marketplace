import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import Welcome from './pages/Welcome';
import Explore from './pages/Explore';
import Submit from './pages/Submit';
import NFTPage from './pages/NFTPage';
import Portfolio from './pages/Portfolio';
import './index.css';

export const Web3Context = createContext(null);

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  const [showConnect, setShowConnect] = useState(false);
  const [wcProvider, setWcProvider] = useState(null);

  const initEthers = async (accounts, customProvider = null) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      const activeProvider = customProvider || window.ethereum;
      const newProvider = new ethers.BrowserProvider(activeProvider);
      setProvider(newProvider);
      const newSigner = await newProvider.getSigner();
      setSigner(newSigner);
    } else {
      setAccount(null);
      setSigner(null);
      localStorage.removeItem("walletConnected");
      localStorage.removeItem("walletType");
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      const type = localStorage.getItem("walletType");
      if (localStorage.getItem("walletConnected") === "true") {
        if (type === "metamask" && window.ethereum) {
          window.ethereum.request({ method: 'eth_accounts' })
            .then(acc => initEthers(acc))
            .catch(console.error);
          window.ethereum.on('accountsChanged', (acc) => initEthers(acc));
        } else if (type === "walletconnect") {
          try {
             const provider = await EthereumProvider.init({
                projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '8e6b5ff28374a26189ad9e1c3a647d7a', // Public fallback ID
                optionalChains: [1, 31337],
                showQrModal: true
             });
             setWcProvider(provider);
             if (provider.session) {
                const accounts = await provider.request({ method: 'eth_accounts' });
                initEthers(accounts, provider);
                provider.on("accountsChanged", (accs) => initEthers(accs, provider));
             }
          } catch(e) { console.error(e); }
        }
      }
    };
    checkConnection();
  }, []);

  const connectMetaMask = async () => {
    setShowConnect(false);
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        await initEthers(accounts);
        localStorage.setItem("walletConnected", "true");
        localStorage.setItem("walletType", "metamask");
      } catch (err) {
        console.error("Failed to connect wallet", err);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const connectWalletConnect = async () => {
    setShowConnect(false);
    try {
      const provider = await EthereumProvider.init({
        projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '8e6b5ff28374a26189ad9e1c3a647d7a', // Public fallback ID
        optionalChains: [1, 31337],
        showQrModal: true
      });
      setWcProvider(provider);
      await provider.connect();
      const accounts = await provider.request({ method: 'eth_accounts' });
      await initEthers(accounts, provider);
      localStorage.setItem("walletConnected", "true");
      localStorage.setItem("walletType", "walletconnect");
      provider.on("accountsChanged", (accs) => initEthers(accs, provider));
    } catch (err) {
      console.error("WalletConnect error", err);
    }
  };

  const logout = async () => {
    if (wcProvider) {
       try { await wcProvider.disconnect(); } catch(e) {}
    }
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setWcProvider(null);
    localStorage.removeItem("walletConnected");
    localStorage.removeItem("walletType");
  };

  const connectWallet = () => setShowConnect(true);

  return (
    <Web3Context.Provider value={{ account, provider, signer, connectWallet, connectMetaMask, connectWalletConnect }}>
      <Router>
        <div className="container">
          <header>
            <Link to="/" className="logo">NEONEXUS</Link>
            <nav className="nav-links">
              <Link to="/explore">Explore</Link>
              <Link to="/submit">Submit NFT</Link>
              {account ? (
                <>
                  <Link to="/portfolio">Portfolio</Link>
                  <div className="badge">{account.substring(0, 6)}...{account.substring(38)}</div>
                  <button className="btn btn-outline" onClick={logout} style={{ padding: '0.3rem 0.8rem', fontSize: '0.9rem' }}>Logout</button>
                </>
              ) : (
                <div style={{ position: 'relative' }}>
                  <button className="btn" onClick={() => setShowConnect(!showConnect)}>Connect Wallet</button>
                  {showConnect && (
                     <div className="glass-panel" style={{ position: 'absolute', top: '120%', right: 0, padding: '10px', minWidth: '200px', zIndex: 10 }}>
                        <button className="btn btn-outline mb-2" onClick={connectMetaMask} style={{ width: '100%', marginBottom: '8px' }}>Browser Wallet</button>
                        <button className="btn btn-outline" onClick={connectWalletConnect} style={{ width: '100%' }}>Mobile Wallet (QR)</button>
                     </div>
                  )}
                </div>
              )}
            </nav>
          </header>
          
          <main>
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/submit" element={<Submit />} />
              <Route path="/nft/:contract/:tokenId" element={<NFTPage />} />
              <Route path="/portfolio" element={<Portfolio />} />
            </Routes>
          </main>
        </div>
      </Router>
    </Web3Context.Provider>
  );
}

export default App;
