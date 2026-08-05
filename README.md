# NEONEXUS — NFT Marketplace

NEONEXUS is a futuristic NFT marketplace allowing users to explore, submit, trade, and auction ERC-721 tokens. It is composed of three sub-projects:

| Sub-project | Folder | Purpose |
|---|---|---|
| Blockchain | `blockchain/` | Solidity contracts + Hardhat local network |
| Server | `server/` | Express.js REST API with a JSON file database |
| Frontend | `frontend/` | React + Vite UI |

---

## Prerequisites

- Node.js v18 or newer
- npm
- MetaMask (browser extension)

---

## Project Structure

```
nft-marketplace/          ← project root (run most commands here)
├── blockchain/           ← Hardhat project
│   ├── contracts/
│   │   ├── NFTMarketplace.sol
│   │   └── SampleNFT.sol
│   ├── scripts/
│   │   ├── deploy.js
│   │   └── samples.js
│   └── hardhat.config.js
├── server/               ← Express API
│   └── server.js
└── frontend/             ← React/Vite app
```

---

## Step-by-Step Setup

### Step 1 — Install all dependencies

> 📁 **Run from:** `nft-marketplace/` (project root)

```bash
npm run install-all
```

Installs packages for `blockchain/`, `server/`, and `frontend/` in one shot.

---

### Step 2 — Start the local Hardhat blockchain

> 📁 **Run from:** `nft-marketplace/` (project root)  
> ⚠️ **Keep this terminal open for the entire session.**

```bash
npm run node
```

Or directly from the blockchain folder:

```bash
# cd nft-marketplace/blockchain/
npx hardhat node
```

The node runs at `http://127.0.0.1:8545` and prints 20 test accounts pre-loaded with 10 000 ETH each.

---

### Step 3 — Compile the smart contracts

> 📁 **Run from:** `nft-marketplace/` (project root)

```bash
npm run compile
```

Or from the blockchain folder:

```bash
# cd nft-marketplace/blockchain/
npm run compile
```

Compiles `NFTMarketplace.sol` and `SampleNFT.sol` and writes artifacts to `blockchain/artifacts/`.

---

### Step 4 — Deploy the smart contracts

> 📁 **Run from:** `nft-marketplace/` (project root)  
> ✅ Requires the Hardhat node (Step 2) to be running.

```bash
npm run deploy
```

Or from the blockchain folder:

```bash
# cd nft-marketplace/blockchain/
npm run deploy
```

- Deploys `NFTMarketplace` and `SampleNFT` to the local network.
- Saves the deployed contract addresses to `server/db.json`.

---

### Step 5 — Seed sample NFTs

> 📁 **Run from:** `nft-marketplace/` (project root)  
> ✅ Requires the Hardhat node (Step 2) to be running.  
> ✅ Requires contracts to be deployed (Step 4).

```bash
npm run samples
```

Or from the blockchain folder:

```bash
# cd nft-marketplace/blockchain/
npm run samples
```

This script:
- Mints 3 Sample NFTs from `SampleNFT`.
- Lists NFT #0 for **direct sale** at 1 ETH.
- Puts NFT #1 on **auction** with a 0.5 ETH minimum bid.
- Keeps NFT #2 in your wallet (unlisted).
- Saves NFTs #0 and #1 to `server/db.json` so they appear in the Explore page.

---

### Step 6 — Start the backend API server

> 📁 **Run from:** `nft-marketplace/` (project root)

```bash
npm run serve
```

Or from the server folder:

```bash
# cd nft-marketplace/server/
node server.js
```

The API runs at `http://localhost:8080`.

---

### Step 7 — Start the frontend dev server

> 📁 **Run from:** `nft-marketplace/` (project root)

```bash
npm run dev
```

Or from the frontend folder:

```bash
# cd nft-marketplace/frontend/
npm run dev
```

Opens the UI at `http://localhost:5173`.

---

## All Available Scripts (from project root)

| Script | Command | What it does |
|--------|---------|--------------|
| Install deps | `npm run install-all` | Installs packages for all 3 sub-projects |
| Start node | `npm run node` | Starts the local Hardhat blockchain |
| Compile | `npm run compile` | Compiles Solidity contracts |
| Deploy | `npm run deploy` | Deploys contracts to the local network |
| Seed NFTs | `npm run samples` | Mints and lists sample NFTs |
| Start API | `npm run serve` | Starts the Express backend on port 8080 |
| Start UI | `npm run dev` | Starts the Vite frontend on port 5173 |

---

## MetaMask Configuration

1. Open MetaMask → **Add a network manually**:
   - **Network name:** Hardhat Localhost
   - **RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Currency symbol:** ETH
2. Import a test account using one of the private keys printed by `npm run node`.

---

## Testing the Application

1. Navigate to `http://localhost:5173` in your browser.
2. Connect MetaMask to the **Hardhat Localhost** network.
3. **Explore page** — View the NFTs listed on the platform.
4. **Buy an NFT** — Select NFT #0 and purchase it for 1 ETH.
5. **Bid on an NFT** — Select NFT #1 and place a bid (≥ 0.5 ETH).
6. **Submit an NFT** — Go to the Submit page, enter the `SampleNFT` contract address and token ID `2` to list your remaining NFT.
7. **Portfolio page** — View your owned NFTs.

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `HH606` — Solidity version mismatch | Set `evmVersion: "cancun"` and `version: "0.8.28"` in `hardhat.config.js` |
| `HH700` — Artifact not found | Run `npm run compile` before `npm run deploy` |
| `ECONNREFUSED 127.0.0.1:8545` | The Hardhat node is not running — run `npm run node` first |
| `Missing script: "samples"` | Run commands from the **project root**, not from inside `blockchain/scripts/` |

---

## Built With

- **Blockchain:** Solidity · Hardhat · OpenZeppelin
- **Backend:** Express.js · Lowdb (JSON file DB)
- **Frontend:** React · Vite · Ethers.js · Vanilla CSS (Glassmorphism & Neon themes)
