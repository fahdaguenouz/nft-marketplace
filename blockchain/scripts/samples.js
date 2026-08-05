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
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/800px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/The_Girl_with_a_Pearl_Earring.jpg/800px-The_Girl_with_a_Pearl_Earring.jpg"
  ];
  
  const metadatas = [];
  
  for (let i = 0; i < 3; i++) {
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

  console.log("Approving Marketplace for NFT #0...");
  let tx = await sampleNFT.approve(marketplaceAddress, 0);
  await tx.wait();
  
  console.log("Listing NFT #0 for sale at 1 ETH...");
  tx = await marketplace.listNFT(sampleNFTAddress, 0, hre.ethers.parseEther("1"));
  await tx.wait();
  
  console.log("Approving Marketplace for NFT #1...");
  tx = await sampleNFT.approve(marketplaceAddress, 1);
  await tx.wait();
  
  console.log("Creating auction for NFT #1...");
  tx = await marketplace.createAuction(sampleNFTAddress, 1, hre.ethers.parseEther("0.5"), 86400);
  await tx.wait();

  data.nfts = [
    { contract: sampleNFTAddress, tokenId: 0 },
    { contract: sampleNFTAddress, tokenId: 1 }
  ];
  
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  console.log("Sample NFTs successfully minted and saved to the database.");
  console.log("NFT #0 listed for sale. NFT #1 listed for auction. NFT #2 remains in your wallet.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
