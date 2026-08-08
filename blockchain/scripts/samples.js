import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  const dbPath = path.join(__dirname, '../../server/db.json');
  if (!fs.existsSync(dbPath)) {
    console.error("Database not found. Please run deploy.js first.");
    return;
  }
  
  let data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const marketplaceAddress = data.contracts.marketplace;
  const sampleNFTAddress = data.contracts.sampleNFT;
  
  if (!marketplaceAddress || !sampleNFTAddress) {
    console.error("Contract addresses not found in database.");
    return;
  }

  const sampleNFT = await hre.ethers.getContractAt("SampleNFT", sampleNFTAddress);
  const marketplace = await hre.ethers.getContractAt("NFTMarketplace", marketplaceAddress);

  const images = [
    "/imgs/bit.jpeg",
    "/imgs/cat.jpeg",
    "/imgs/dog.jpeg",
    "/imgs/frog.jpeg",
    "/imgs/monkey.jpeg",
    "/imgs/rob.jpeg"
  ];
  
  const metadatas = [];
  
  for (let i = 0; i < images.length; i++) {
    const metadata = {
      name: `Sample Masterpiece #${i + 1}`,
      description: `A beautiful sample artwork for the marketplace.`,
      image: images[i]
    };
    metadatas.push(metadata);
    const tokenURI = "data:application/json;base64," + Buffer.from(JSON.stringify(metadata)).toString('base64');
    
    console.log(`Minting NFT #${i}...`);
    const tx = await sampleNFT.mint(deployer.address, tokenURI);
    await tx.wait();
  }

  console.log("Listing NFT #0 for sale at 1 ETH...");
  let tx = await sampleNFT.approve(marketplaceAddress, 0);
  await tx.wait();
  tx = await marketplace.listNFT(sampleNFTAddress, 0, hre.ethers.parseEther("1"));
  await tx.wait();
  
  console.log("Listing NFT #1 for sale at 2 ETH...");
  tx = await sampleNFT.approve(marketplaceAddress, 1);
  await tx.wait();
  tx = await marketplace.listNFT(sampleNFTAddress, 1, hre.ethers.parseEther("2"));
  await tx.wait();

  console.log("Creating auction for NFT #2...");
  tx = await sampleNFT.approve(marketplaceAddress, 2);
  await tx.wait();
  tx = await marketplace.createAuction(sampleNFTAddress, 2, hre.ethers.parseEther("0.5"), 86400);
  await tx.wait();

  console.log("Creating auction for NFT #3...");
  tx = await sampleNFT.approve(marketplaceAddress, 3);
  await tx.wait();
  tx = await marketplace.createAuction(sampleNFTAddress, 3, hre.ethers.parseEther("0.1"), 172800);
  await tx.wait();

  data.nfts = [
    { contract: sampleNFTAddress, tokenId: 0 },
    { contract: sampleNFTAddress, tokenId: 1 },
    { contract: sampleNFTAddress, tokenId: 2 },
    { contract: sampleNFTAddress, tokenId: 3 },
    { contract: sampleNFTAddress, tokenId: 4 },
    { contract: sampleNFTAddress, tokenId: 5 }
  ];
  
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  console.log("Sample NFTs successfully minted and saved to the database.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
