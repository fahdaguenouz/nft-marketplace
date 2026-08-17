import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { Web3Context } from '../App';
import { fetchNFTData } from '../utils';

function Explore() {
  const { provider } = useContext(Web3Context);
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  useEffect(() => {
    const loadNFTs = async () => {
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
        setNfts(nftData.filter(n => n !== null));
      } catch (err) {
        console.error("Error loading NFTs", err);
      }
      setLoading(false);
    };

    loadNFTs();
  }, [provider]);

  const filteredNfts = nfts.filter(nft => {
    if (filter === 'sale') return nft.salePrice != null;
    if (filter === 'auction') return nft.auctionData != null;
    return true;
  });

  const totalPages = Math.ceil(filteredNfts.length / itemsPerPage);
  const paginatedNfts = filteredNfts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <div className="flex justify-between align-center mb-4">
        <h1>Explore Artifacts</h1>
        <div className="flex gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 'auto', marginBottom: 0 }}>
            <option value="all">All Items</option>
            <option value="sale">For Sale</option>
            <option value="auction">On Auction</option>
          </select>
          <Link to="/submit" className="btn">Submit NFT</Link>
        </div>
      </div>

      {loading ? (
        <div className="loading">Scanning Blockchain...</div>
      ) : (
        <>
          <div className="nft-grid">
            {paginatedNfts.map((nft, idx) => (
              <Link to={`/nft/${nft.contract}/${nft.tokenId}`} key={idx}>
                <div className="glass-card">
                  <div className="nft-image-container">
                    <img src={nft.image} alt={nft.name} className="nft-image" />
                  </div>
                  <div className="nft-info">
                    <div className="flex justify-between align-center mb-4" style={{ marginBottom: '8px' }}>
                      <div className="nft-title" style={{ margin: 0 }}>{nft.name}</div>
                      <div className="badge">#{nft.tokenId}</div>
                    </div>
                    {nft.salePrice && <div className="nft-price">{nft.salePrice} ETH</div>}
                    {nft.auctionData && <div className="nft-price">Bid: {nft.auctionData.highestBid > 0 ? nft.auctionData.highestBid : nft.auctionData.minPrice} ETH</div>}
                    {!nft.salePrice && !nft.auctionData && <div className="text-muted" style={{ fontSize: '0.9rem' }}>Not Listed</div>}
                  </div>
                </div>
              </Link>
            ))}
            {filteredNfts.length === 0 && <p className="text-muted">No artifacts found matching criteria.</p>}
          </div>
        
        {totalPages > 1 && (
          <div className="flex justify-center gap-2" style={{ marginTop: '20px' }}>
            <button 
              className="btn btn-outline" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="text-muted" style={{ alignSelf: 'center' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button 
              className="btn btn-outline" 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
        </>
      )}
    </div>
  );
}

export default Explore;
