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
- Mints **7 Sample NFTs** (tokens #0–#6) from `SampleNFT`.
- Lists NFT #0 for **direct sale** at 1 ETH.
- Lists NFT #1 for **direct sale** at 2 ETH.
- Puts NFT #2 on **auction** with a 0.5 ETH minimum bid.
- Puts NFT #3 on **auction** with a 0.1 ETH minimum bid.
- Keeps NFTs #4, #5 in your wallet (unlisted — viewable but not for sale).
- Saves NFTs #0–#5 to `server/db.json` so they appear in the Explore page.
- **NFT #6 is minted on-chain but intentionally left out of the database** — use the Submit page to add it manually (see below).

---

### Step 6 — Build and Start the backend API server

> 📁 **Run from:** `nft-marketplace/` (project root)

```bash
npm run serve
```
*Note: This command builds the frontend UI using Vite and then starts the Express API server on `http://localhost:8080`, serving the production React app.*

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
| Build UI | `npm run build` | Builds the React frontend for production |
| Start API | `npm run serve` | Builds the frontend and starts the Express backend on port 8080 |
| Start UI | `npm run dev` | Starts the Vite frontend on port 5173 |

---

## Testnet Deployment

To deploy the smart contracts to a testnet (e.g., Sepolia):

1. Go to `blockchain/hardhat.config.js` and add a new network configuration:
   ```javascript
   require('dotenv').config();
   module.exports = {
     networks: {
       sepolia: {
         url: process.env.RPC_URL || "", // e.g. Infura or Alchemy URL
         accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
       }
     },
     // ...
   };
   ```
2. Create a `.env` file in the `blockchain/` directory. You will need two values:
   - **RPC_URL**: This is the connection endpoint to the blockchain. Register for free on a provider like [Alchemy](https://www.alchemy.com/) or [Infura](https://www.infura.io/), create a new app on the **Sepolia** network, and copy the HTTP URL provided.
   - **PRIVATE_KEY**: The private key of the wallet deploying the contract. Open your MetaMask extension, select the account you want to use for deployment, click on "Account details", and select "Show private key". **(⚠️ WARNING: Never use a private key that holds real mainnet funds. Always create a dedicated testing account.)**
   
   Your `blockchain/.env` should look like this:
   ```env
   RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
   PRIVATE_KEY=your_metamask_private_key_here
   ```
3. From the `nft-marketplace` root, run the deployment command targeting the testnet:
   ```bash
   npm run deploy --prefix blockchain -- --network sepolia
   ```
   * **Expected Output (Success):** You will see "Deploying NFTMarketplace..." followed by "NFTMarketplace deployed to: 0x..." and similar for SampleNFT. Finally, "Contract addresses saved to server/db.json".
   * **Expected Output (Error):** If your RPC URL is wrong or your account has no ETH, you will see Hardhat errors like `ProviderError` (insufficient funds) or network connection errors. If your `PRIVATE_KEY` is empty, you will get an `Invalid account` error.

4. Deploy the samples similarly to seed real testnet transactions:
   ```bash
   npm run samples --prefix blockchain -- --network sepolia
   ```
   * **Note**: Make sure you have testnet ETH in your deployment account! If you get a `ProviderError: insufficient funds for gas` error, it means your wallet is empty. You must get free Sepolia ETH from a faucet (like [Alchemy Faucet](https://sepoliafaucet.com/) or [Infura Faucet](https://www.infura.io/faucet/sepolia)) before deploying. Testnet transactions take 10-15 seconds to confirm.

---

## WalletConnect (Mobile Wallet) isn't showing the QR Code?

The Alchemy RPC_URL (which you correctly put in `blockchain/.env`) is only used for Hardhat to deploy contracts to the Sepolia testnet. It does not control the WalletConnect Mobile UI.

To make the WalletConnect Mobile QR Code appear properly on your frontend, you need a completely different key called a Project ID, and it needs to go in the frontend folder:

1. Go to [Reown Cloud](https://cloud.reown.com/) (formerly WalletConnect) and sign in.
2. Click "Create Project" (name it whatever you want).
3. Copy the **Project ID** it gives you (it will be a mix of letters and numbers like `4a0f4a867...`).
4. Create a new file at `frontend/.env` and add this exact line:
   ```env
   VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
   ```
5. Restart your frontend server. The QR modal will now appear properly when clicking "Mobile Wallet".

---

## MetaMask Configuration (Localhost)

1. Open MetaMask → **Add a network manually**:
   - **Network name:** Hardhat Localhost
   - **RPC URL:** `http://127.0.0.1:8545` 
     *(**Important for Mobile Wallets:** If you are connecting a mobile wallet to your PC's local Hardhat node, `127.0.0.1` won't work because that's the phone's own localhost. You must use your PC's local network IP address instead, e.g., `http://192.168.56.105:8545` or `http://10.0.2.15:8545`. Your phone and PC must be on the same WiFi.)*
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
6. **Submit an NFT** — Go to the Submit page to import existing NFTs into the marketplace (see details below).
7. **Portfolio page** — View your owned NFTs.

---

## How to Submit an NFT

The **Submit Page** (`/submit`) lets you manually register an **already minted** ERC-721 token into the NEONEXUS database so it shows up on the Explore page.

> [!IMPORTANT]
> **The NFT must already exist on-chain before you can submit it.** The Submit page does NOT mint a new NFT — it only registers an existing token address + ID into the backend database. If the token doesn't exist on the blockchain, the Explore page will fail to load its image and name.

### ⚙️ How it works

1. You give it a **Contract Address** (the ERC-721 contract where the NFT lives) and a **Token ID**.
2. It calls `POST /api/nfts` on the backend, which saves the pair to `server/db.json`.
3. The Explore page reads the DB and fetches each token's metadata directly from the blockchain via its `tokenURI`.

### ✅ Quick Test — Submit Token #6 (without running samples first)

After running `npm run deploy` + `npm run samples`, token **#6** has been minted on-chain but is intentionally NOT in the database. This makes it the perfect test case:

1. Open `server/db.json` and copy the `sampleNFT` contract address (e.g., `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`).
2. Navigate to the **Submit** page in the frontend.
3. Paste the **Contract Address**.
4. Enter **Token ID Start:** `6` (leave Range End blank).
5. Click **Add to Marketplace** — you will be redirected to Explore and token #6 will now appear!

### 📋 Submitting a Range of NFTs

To import multiple tokens at once (e.g., tokens #4 through #6):
- **Token ID Start:** `4`
- **Token ID Range End:** `6`

All tokens in that range will be registered in one click.

### 🔍 Where to find the Contract Address
- **Terminal output** after running `npm run deploy`: `SampleNFT deployed to: 0x...`
- **`server/db.json`** under `"contracts": { "sampleNFT": "0x..." }`

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

---

## System Workflow & Data Flow

NEONEXUS relies on a hybrid architecture to ensure both decentralization (via Smart Contracts) and fast performance (via a Backend Indexer).

### 1. Smart Contracts (The Truth)
The EVM (Ethereum Virtual Machine) acts as the ultimate source of truth. Ownership, pricing, auctions, and bids are completely managed by the deployed Solidity contracts (`NFTMarketplace.sol` and `SampleNFT.sol`).

### 2. Backend Indexer (The Cache)
Scanning an entire blockchain to find which NFTs exist is extremely slow. Instead, we use a lightweight Express API and a JSON file (`server/db.json`). When a contract is deployed, its address is saved here. When an NFT is minted or manually submitted, its ID is saved here. 

### 3. Frontend UI (The Interface)
The React application reads the `db.json` file to get the list of known NFTs. Then, for every NFT, it uses `ethers.js` to query the **Smart Contract directly** to get its real-time status (Is it for sale? Who owns it? What is the `tokenURI` for the image?). Transactions (buying, listing, bidding) are signed by MetaMask and sent directly to the blockchain.

### Flow Examples:
* **Buying an NFT:** User clicks "Buy" → MetaMask prompts for signature + ETH → Transaction sent to Smart Contract → Smart Contract transfers NFT and funds → UI refreshes directly from the Blockchain.
* **Submitting an NFT:** User enters Contract Address + Token ID → Frontend sends `POST` to Backend → Backend saves to `db.json` → Explore page reads new ID and fetches data from the blockchain.

---

## Audit Verification Guide

This section is dedicated to auditors to quickly verify that all project requirements have been met.

### 1. Read the documentation
* **Instructions to deploy and launch:** Available in the **Step-by-Step Setup** section above.
* **Smart contract compile correctly:** Verified by running `npm run compile`.
* **Deploy sample NFTs:** Verified by running `npm run samples`. This automatically mints and lists NFTs.
* **Remaining available NFT:** As detailed in step 5, **NFT #6** is explicitly minted on the blockchain but left out of the database for the auditor to test the "Submit an NFT" functionality.
* **Website available at localhost:8080:** Running `npm run serve` hosts the production UI at exactly `http://localhost:8080`.

### 2. Serve the interface
* **Include a title and a theme:** The app is titled "NEONEXUS" and features a cohesive futuristic, neon-glassmorphism theme.
* **Frontpage display two NFTs:** The **Welcome Page** displays two featured NFTs dynamically.
* **Connect wallet button:** Present in the top navigation bar.
* **Explore page:** Accessible via the navigation bar. It dynamically loads all known NFTs using pagination/scrolling logic.
* **Submit an NFT page:** Accessible via the "Submit" button in the navigation or from the Explore page.

### 3. Submit an NFT
* **Allow submission:** Navigate to the Submit page. Enter the `sampleNFT` contract address (found in your terminal after deployment or in `server/db.json`) and enter Token ID **6**.
* **NFT displayed in explore:** After submission, navigate to the Explore page. NFT #6 will now correctly load its image and data directly from the blockchain.

### 4. Connect a wallet
* **Browser wallet:** Clicking "Connect Wallet" prompts MetaMask for connection.
* **Portfolio page:** Once connected, the "Portfolio" tab appears in the navigation bar. It displays only the NFTs currently owned by the connected wallet address.

### 5. Buy an NFT
* **Buy functionality:** On the Explore page, select NFT #0 (which is listed for 1 ETH). Click "Buy Now", approve the MetaMask transaction.
* **Portfolio update:** Once the transaction confirms, navigating to your Portfolio will show the newly purchased NFT.

### 6. Try to sell the NFT
* **List for sale:** Go to your Portfolio, click on an NFT you own, enter a price in ETH, and click "List for Sale". You will be asked to approve the marketplace contract and then set the price.
* **Buy with another account:** Switch to a different account in MetaMask, go to the Explore page, and you will see the NFT is now available for purchase by the new account.

### 7. Bonus Features
* **Filters:** The Explore page includes a sidebar/dropdown to filter NFTs by "For Sale" or "On Auction".
* **Auction NFTs:** The smart contract supports auctions. `npm run samples` automatically puts NFT #2 and #3 on auction. 
* **Auction Mechanics:** Users can place bids. Once the block timestamp exceeds the auction duration, anyone can trigger `endAuction` to attribute the NFT to the highest bidder.
