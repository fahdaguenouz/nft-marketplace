import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ethers } from 'ethers';
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

  const initEthers = async (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(newProvider);
      const newSigner = await newProvider.getSigner();
      setSigner(newSigner);
    } else {
      setAccount(null);
      setSigner(null);
      localStorage.removeItem("walletConnected");
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      if (localStorage.getItem("walletConnected") === "true") {
        window.ethereum.request({ method: 'eth_accounts' })
          .then(initEthers)
          .catch(console.error);
      }

      window.ethereum.on('accountsChanged', initEthers);
    }
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        await initEthers(accounts);
        localStorage.setItem("walletConnected", "true");
      } catch (err) {
        console.error("Failed to connect wallet", err);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const logout = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    localStorage.removeItem("walletConnected");
  };

  return (
    <Web3Context.Provider value={{ account, provider, signer, connectWallet }}>
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
                <button className="btn" onClick={connectWallet}>Connect Wallet</button>
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
