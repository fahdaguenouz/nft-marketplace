const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'db.json');

// Initialize empty DB if it doesn't exist
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ nfts: [], contracts: {} }, null, 2));
}

// Read DB helper
function readDB() {
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

// Write DB helper
function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// API Routes
app.get('/api/nfts', (req, res) => {
  const db = readDB();
  res.json(db.nfts || []);
});

app.get('/api/contracts', (req, res) => {
  const db = readDB();
  res.json(db.contracts || {});
});

app.post('/api/nfts', (req, res) => {
  const { nfts: newNfts } = req.body;
  
  if (!Array.isArray(newNfts)) {
    return res.status(400).json({ error: 'Expected an array of NFTs' });
  }

  const db = readDB();
  if (!db.nfts) db.nfts = [];
  
  // Add new NFTs avoiding duplicates
  for (const nft of newNfts) {
    const exists = db.nfts.find(n => n.contract.toLowerCase() === nft.contract.toLowerCase() && String(n.tokenId) === String(nft.tokenId));
    if (!exists) {
      db.nfts.push(nft);
    }
  }
  
  writeDB(db);
  res.json({ success: true, count: newNfts.length });
});

// Serve frontend static files
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// Fallback for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
