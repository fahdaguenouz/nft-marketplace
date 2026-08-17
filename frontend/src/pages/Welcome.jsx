import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { Web3Context } from '../App';
import { fetchNFTData } from '../utils';

function Welcome() {
  const { provider, connectWallet, account } = useContext(Web3Context);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const contractsRes = await fetch('http://localhost:8080/api/contracts');
        const contracts = await contractsRes.json();
        
        const nftsRes = await fetch('http://localhost:8080/api/nfts');
        const nfts = await nftsRes.json();
        
        if (nfts.length === 0 || !contracts.marketplace) {
          setLoading(false);
          return;
        }

        const readProvider = provider || new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        
        const dataPromises = nfts.map(n => 
          fetchNFTData(readProvider, n.contract, n.tokenId, contracts.marketplace)
        );
        
        const allNftData = await Promise.all(dataPromises);
        const validNfts = allNftData.filter(n => n !== null);

        const forSale = validNfts.filter(n => n.salePrice != null);
        let selectedForSale = null;
        if (forSale.length > 0) {
           selectedForSale = forSale[Math.floor(Math.random() * forSale.length)];
        }
        
        const remainingNfts = validNfts.filter(n => n !== selectedForSale);
        let selectedRandom = null;
        if (remainingNfts.length > 0) {
           selectedRandom = remainingNfts[Math.floor(Math.random() * remainingNfts.length)];
        }

        const toShow = [];
        if (selectedForSale) toShow.push(selectedForSale);
        if (selectedRandom) toShow.push(selectedRandom);
        
        if (toShow.length < 2 && validNfts.length > toShow.length) {
            for (let nft of validNfts) {
               if (!toShow.includes(nft)) {
                  toShow.push(nft);
                  if (toShow.length === 2) break;
               }
            }
        }
        
        setFeatured(toShow);
      } catch (err) {
        console.error("Error loading featured NFTs", err);
      }
      setLoading(false);
    };

    loadFeatured();
  }, [provider]);

  return (
    <div className="text-center">
      <h1 style={{ fontSize: '3rem', marginBottom: '20px', background: 'linear-gradient(45deg, var(--primary-color), var(--secondary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Discover the Future of Digital Assets
      </h1>
      <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px auto' }}>
        Welcome to NEONEXUS, the premier thematic marketplace for cyberpunk and futuristic NFTs. Trade, auction, and collect the most exquisite digital artifacts on the blockchain.
      </p>
      
      {!account && (
        <button className="btn mb-4" style={{ fontSize: '1.2rem', padding: '15px 40px' }} onClick={connectWallet}>
          Connect Wallet to Trade
        </button>
      )}
      
      <div className="mb-4">
        <Link to="/explore" className="btn btn-outline" style={{ fontSize: '1.2rem', padding: '15px 40px', display: 'inline-block', marginLeft: '10px' }}>
          Explore Collection
        </Link>
      </div>

      <h2 className="mt-4 mb-4" style={{ marginTop: '60px' }}>Featured Artifacts</h2>
      
      {loading ? (
        <div className="loading">Initializing Neural Link...</div>
      ) : (
        <div className="nft-grid" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {featured.map((nft, idx) => (
            <Link to={`/nft/${nft.contract}/${nft.tokenId}`} key={idx}>
              <div className="glass-card">
                <div className="nft-image-container">
                  <img src={nft.image} alt={nft.name} className="nft-image" />
                </div>
                <div className="nft-info text-left">
                  <div className="nft-title">{nft.name}</div>
                  <div className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '8px' }}>#{nft.tokenId}</div>
                  {nft.salePrice && <div className="nft-price">{nft.salePrice} ETH</div>}
                  {nft.auctionData && <div className="nft-price">Bid: {nft.auctionData.highestBid > 0 ? nft.auctionData.highestBid : nft.auctionData.minPrice} ETH</div>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Welcome;
