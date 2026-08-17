import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import { Web3Context } from '../App';
import { fetchNFTData } from '../utils';
import abi from '../abi.json';

function NFTPage() {
  const { contract, tokenId } = useParams();
  const { provider, signer, account } = useContext(Web3Context);
  const [nft, setNft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marketAddr, setMarketAddr] = useState('');
  const [transfers, setTransfers] = useState([]);
  
  // Forms
  const [listPrice, setListPrice] = useState('');
  const [bidAmount, setBidAmount] = useState('');

  const loadData = async () => {
    try {
      const contractsRes = await fetch('http://localhost:8080/api/contracts');
      const contracts = await contractsRes.json();
      setMarketAddr(contracts.marketplace);
      
      const readProvider = provider || new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const data = await fetchNFTData(readProvider, contract, tokenId, contracts.marketplace);
      setNft(data);
      
      try {
        const nftContract = new ethers.Contract(contract, abi.SampleNFT, readProvider);
        const filter = nftContract.filters.Transfer(null, null, tokenId);
        const events = await nftContract.queryFilter(filter);
        
        const transferData = await Promise.all(events.map(async (e) => {
          const block = await e.getBlock();
          return {
            from: e.args[0],
            to: e.args[1],
            date: new Date(block.timestamp * 1000).toLocaleString()
          };
        }));
        setTransfers(transferData.reverse());
      } catch (e) {
        console.error("Error loading transfers", e);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [contract, tokenId, provider]);

  const handleBuy = async () => {
    if (!signer) return alert("Please connect wallet");
    try {
      const mktContract = new ethers.Contract(marketAddr, abi.NFTMarketplace, signer);
      const tx = await mktContract.buyNFT(contract, tokenId, { value: ethers.parseEther(nft.salePrice) });
      await tx.wait();
      alert("Purchase successful!");
      loadData();
    } catch (e) {
      console.error(e);
      alert("Purchase failed");
    }
  };

  const handleBid = async () => {
    if (!signer) return alert("Please connect wallet");
    try {
      const mktContract = new ethers.Contract(marketAddr, abi.NFTMarketplace, signer);
      const tx = await mktContract.bid(contract, tokenId, { value: ethers.parseEther(bidAmount) });
      await tx.wait();
      alert("Bid placed!");
      loadData();
    } catch (e) {
      console.error(e);
      alert("Bid failed");
    }
  };

  const handleList = async () => {
    if (!signer) return alert("Please connect wallet");
    try {
      const nftContract = new ethers.Contract(contract, abi.SampleNFT, signer);
      const approved = await nftContract.getApproved(tokenId);
      
      if (approved !== marketAddr) {
        const txApprove = await nftContract.approve(marketAddr, tokenId);
        await txApprove.wait();
      }

      const mktContract = new ethers.Contract(marketAddr, abi.NFTMarketplace, signer);
      const tx = await mktContract.listNFT(contract, tokenId, ethers.parseEther(listPrice));
      await tx.wait();
      alert("Listed successfully!");
      loadData();
    } catch (e) {
      console.error(e);
      alert("Listing failed");
    }
  };

  const handleEndAuction = async () => {
    if (!signer) return alert("Please connect wallet");
    try {
      const mktContract = new ethers.Contract(marketAddr, abi.NFTMarketplace, signer);
      const tx = await mktContract.endAuction(contract, tokenId);
      await tx.wait();
      alert("Auction ended!");
      loadData();
    } catch (e) {
      console.error(e);
      alert("Failed to end auction (time might not be up)");
    }
  };

  if (loading) return <div className="loading">Loading Artifact Details...</div>;
  if (!nft) return <div>Artifact not found.</div>;

  const isOwner = account && nft.owner.toLowerCase() === account.toLowerCase();

  return (
    <div className="flex gap-2" style={{ alignItems: 'flex-start' }}>
      <div className="glass-card" style={{ flex: 1 }}>
        <img src={nft.image} alt={nft.name} style={{ width: '100%', display: 'block' }} />
      </div>
      
      <div className="glass-panel" style={{ flex: 1 }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{nft.name}</h1>
        <div className="badge mb-4">Token ID: #{nft.tokenId}</div>
        
        <p className="text-muted mb-4">{nft.description}</p>
        
        <div className="mb-4">
          <label className="text-muted">Current Owner</label>
          <div style={{ fontFamily: 'monospace', color: 'var(--primary-color)' }}>{nft.owner}</div>
        </div>

        {nft.salePrice && (
          <div className="glass-panel mb-4" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <div className="text-muted mb-4">Direct Sale Price</div>
            <div style={{ fontSize: '2rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>{nft.salePrice} ETH</div>
            {isOwner ? (
              <button className="btn mt-4" disabled style={{ width: '100%', opacity: 0.5, cursor: 'not-allowed' }}>Your Listing</button>
            ) : (
              <button className="btn mt-4" onClick={handleBuy} style={{ width: '100%' }}>Buy Now</button>
            )}
          </div>
        )}

        {nft.auctionData && (
          <div className="glass-panel mb-4" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <div className="text-muted mb-4">Auction Status</div>
            <div>Ends at: {new Date(nft.auctionData.endTime).toLocaleString()}</div>
            <div style={{ fontSize: '1.5rem', color: 'var(--secondary-color)', fontWeight: 'bold', margin: '10px 0' }}>
              Highest Bid: {nft.auctionData.highestBid > 0 ? nft.auctionData.highestBid : nft.auctionData.minPrice} ETH
            </div>
            
            {!isOwner && (
              <div className="flex gap-2 mt-4">
                <input 
                  type="number" 
                  value={bidAmount} 
                  onChange={e => setBidAmount(e.target.value)} 
                  placeholder="Bid Amount (ETH)" 
                  style={{ marginBottom: 0 }}
                />
                <button className="btn" onClick={handleBid}>Place Bid</button>
              </div>
            )}
            {isOwner && (
              <button className="btn mt-4" disabled style={{ width: '100%', opacity: 0.5, cursor: 'not-allowed' }}>Your Auction</button>
            )}
            <button className="btn btn-outline mt-4" onClick={handleEndAuction} style={{ width: '100%' }}>Settle Auction (If ended)</button>
          </div>
        )}

        {isOwner && !nft.salePrice && !nft.auctionData && (
          <div className="glass-panel mt-4" style={{ background: 'rgba(188, 19, 254, 0.1)' }}>
            <h3>Owner Actions</h3>
            <div className="flex gap-2 mt-4">
              <input 
                type="number" 
                value={listPrice} 
                onChange={e => setListPrice(e.target.value)} 
                placeholder="Price (ETH)" 
                style={{ marginBottom: 0 }}
              />
              <button className="btn" onClick={handleList}>List for Sale</button>
            </div>
          </div>
        )}

        <div className="glass-panel mt-4">
          <h3>Transfer History</h3>
          {transfers.length === 0 ? (
            <p className="text-muted mt-2">No transfers found.</p>
          ) : (
            <div style={{ marginTop: '15px', maxHeight: '200px', overflowY: 'auto' }}>
              {transfers.map((tx, idx) => (
                <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ color: 'var(--primary-color)' }}>From: {tx.from.substring(0, 8)}...</span>
                    <span style={{ color: 'var(--secondary-color)' }}>To: {tx.to.substring(0, 8)}...</span>
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>{tx.date}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NFTPage;
