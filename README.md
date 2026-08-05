# NEONEXUS - NFT Marketplace

NEONEXUS is a futuristic, thematic NFT marketplace allowing users to explore, submit, trade, and auction ERC721 tokens.

## Prerequisites
- Node.js (v18+)
- NPM
- A browser wallet like MetaMask

## Setup Instructions

### 1. Installation
Install all dependencies for the blockchain, server, and frontend:
```bash
npm run install-all
```

### 2. Run Local Blockchain
Start a Hardhat local node. This will provide you with test accounts loaded with fake ETH:
```bash
npx hardhat node
```
*(Keep this terminal running)*

### 3. Deploy Smart Contracts
Open a new terminal and run:
```bash
npm run deploy
```
This compiles the contracts (`SampleNFT` and `NFTMarketplace`) and deploys them to the local blockchain. It also saves their addresses to the database.

### 4. Deploy Sample NFTs
To populate the marketplace with sample NFTs, run:
```bash
npm run samples
```
This script will:
- Mint 3 Sample NFTs.
- List NFT #0 for direct sale (1 ETH).
- Put NFT #1 on auction (0.5 ETH minimum bid).
- Keep NFT #2 in your wallet (unlisted).
- Save NFTs #0 and #1 to the website database so they appear in the "Explore" page.

### 5. Start the Application Server
```bash
npm run serve
```
This starts the backend API and serves the frontend application on `http://localhost:8080`.

## Testing the Application

1. Open your browser and navigate to `http://localhost:8080`.
2. Connect your MetaMask wallet (ensure it is connected to the Localhost 8545 network).
3. **Explore Page**: View the NFTs available on the platform.
4. **Buy an NFT**: Navigate to NFT #0 and purchase it for 1 ETH.
5. **Bid on an NFT**: Navigate to NFT #1 and place a bid.
6. **Submit an NFT**: Navigate to the "Submit" page, enter the `SampleNFT` contract address and token ID `2` to add your remaining NFT to the platform.
7. **Portfolio Page**: View the NFTs you own.

### Non-EVM Chains Note
While this project uses Hardhat (EVM) for straightforward ERC721 testing out of the box, the architecture is easily adaptable. To deploy to a chain like Avalanche C-Chain (which is EVM compatible), simply update `hardhat.config.js` with the network details and a private key, and run `npm run deploy --network fuji`.

## Built With
- **Blockchain**: Solidity, Hardhat, OpenZeppelin
- **Backend**: Express.js, Lowdb (JSON file DB)
- **Frontend**: React, Vite, Ethers.js, Vanilla CSS (Glassmorphism & Neon Themes)
