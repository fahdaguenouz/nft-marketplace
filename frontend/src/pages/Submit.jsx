import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Submit() {
  const navigate = useNavigate();
  const [contract, setContract] = useState('');
  const [startTokenId, setStartTokenId] = useState('');
  const [endTokenId, setEndTokenId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract || !startTokenId) return;

    setLoading(true);
    try {
      const start = parseInt(startTokenId);
      const end = endTokenId ? parseInt(endTokenId) : start;
      
      const newNfts = [];
      for (let i = start; i <= end; i++) {
        newNfts.push({ contract, tokenId: i });
      }

      const res = await fetch('http://localhost:8080/api/nfts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nfts: newNfts })
      });

      if (res.ok) {
        navigate('/explore');
      } else {
        alert("Failed to submit NFTs");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting NFTs");
    }
    setLoading(false);
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '600px', margin: '40px auto' }}>
      <h2 className="mb-4">Submit NFT(s)</h2>
      <p className="text-muted mb-4">Reference an existing ERC721 smart contract to display its tokens on NEONEXUS.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="text-muted" style={{ display: 'block', marginBottom: '8px' }}>Contract Address</label>
          <input 
            type="text" 
            value={contract} 
            onChange={(e) => setContract(e.target.value)} 
            placeholder="0x..." 
            required 
          />
        </div>
        
        <div className="flex gap-2 mb-4">
          <div style={{ flex: 1 }}>
            <label className="text-muted" style={{ display: 'block', marginBottom: '8px' }}>Token ID (Start)</label>
            <input 
              type="number" 
              value={startTokenId} 
              onChange={(e) => setStartTokenId(e.target.value)} 
              placeholder="0" 
              required 
            />
          </div>
          <div style={{ flex: 1 }}>
            <label className="text-muted" style={{ display: 'block', marginBottom: '8px' }}>Token ID Range End (Optional)</label>
            <input 
              type="number" 
              value={endTokenId} 
              onChange={(e) => setEndTokenId(e.target.value)} 
              placeholder="e.g. 10" 
            />
          </div>
        </div>

        <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Submitting...' : 'Add to Marketplace'}
        </button>
      </form>
    </div>
  );
}

export default Submit;
