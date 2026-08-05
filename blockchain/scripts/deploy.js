import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("Deploying NFTMarketplace...");
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const marketplace = await NFTMarketplace.deploy();
  await marketplace.waitForDeployment();
  console.log(`NFTMarketplace deployed to: ${marketplace.target}`);

  console.log("Deploying SampleNFT...");
  const SampleNFT = await hre.ethers.getContractFactory("SampleNFT");
  const sampleNFT = await SampleNFT.deploy();
  await sampleNFT.waitForDeployment();
  console.log(`SampleNFT deployed to: ${sampleNFT.target}`);

  // Write addresses to backend DB
  const dbPath = path.join(__dirname, '../../server/db.json');
  
  let data = { nfts: [], contracts: {} };
  if (fs.existsSync(dbPath)) {
    try {
      data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch (e) {}
  }
  
  data.contracts = {
    marketplace: marketplace.target,
    sampleNFT: sampleNFT.target
  };
  
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  console.log("Contract addresses saved to server/db.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
