import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { Web3Context } from '../App';
import { fetchNFTData } from '../utils';

function Portfolio() {
  const { provider, account } = useContext(Web3Context);
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPortfolio = async () => {
      if (!account) {
        setLoading(false);
        return;
      }
      try {
        const contractsRes = await fetch('http://localhost:8080/api/contracts');
        const contracts = await contractsRes.json();
        
        const nftsRes = await fetch('http://localhost:8080/api/nfts');
        const dbNfts = await nftsRes.json();
        
        if (dbNfts.length === 0 || !contracts.marketplace) {
          setLoading(false);
          return;
        }

        const readProvider = provider || new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        
        const dataPromises = dbNfts.map(n => 
          fetchNFTData(readProvider, n.contract, n.tokenId, contracts.marketplace)
        );
        
        const nftData = await Promise.all(dataPromises);
        
        // Filter by owned by the current account
        const owned = nftData.filter(n => n && n.owner.toLowerCase() === account.toLowerCase());
        setNfts(owned);
      } catch (err) {
        console.error("Error loading portfolio", err);
      }
      setLoading(false);
    };

    loadPortfolio();
  }, [provider, account]);

  if (!account) {
    return <div className="text-center"><h2 className="mt-4">Please connect your wallet to view your portfolio.</h2></div>;
  }

  return (
    <div>
      <h1 className="mb-4">My Portfolio</h1>
      
      {loading ? (
        <div className="loading">Accessing Vault...</div>
      ) : (
        <div className="nft-grid">
          {nfts.map((nft, idx) => (
            <Link to={`/nft/${nft.contract}/${nft.tokenId}`} key={idx}>
              <div className="glass-card">
                <div className="nft-image-container">
                  <img src={nft.image} alt={nft.name} className="nft-image" />
                </div>
                <div className="nft-info">
                  <div className="nft-title">{nft.name}</div>
                  <div className="text-muted" style={{ fontSize: '0.9rem' }}>#{nft.tokenId}</div>
                  {nft.salePrice && <div className="nft-price mt-4">Listed: {nft.salePrice} ETH</div>}
                </div>
              </div>
            </Link>
          ))}
          {nfts.length === 0 && <p className="text-muted">You do not own any artifacts referenced on this platform.</p>}
        </div>
      )}
    </div>
  );
}

export default Portfolio;
