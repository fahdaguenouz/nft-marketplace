import { ethers } from 'ethers';
import abi from './abi.json';

// Fetch NFT details from contract
export const fetchNFTData = async (provider, contractAddress, tokenId, marketplaceAddress) => {
  try {
    const nftContract = new ethers.Contract(contractAddress, abi.SampleNFT, provider);
    const mktContract = new ethers.Contract(marketplaceAddress, abi.NFTMarketplace, provider);
    
    const uri = await nftContract.tokenURI(tokenId);
    let metadata = { name: `Token #${tokenId}`, description: '', image: '' };
    
    if (uri.startsWith('data:application/json;base64,')) {
      const jsonStr = atob(uri.split(',')[1]);
      metadata = JSON.parse(jsonStr);
    }

    const owner = await nftContract.ownerOf(tokenId);
    
    let salePrice = null;
    let auctionData = null;

    // Check listing
    try {
      const listing = await mktContract.listings(contractAddress, tokenId);
      if (listing.isActive) {
        salePrice = ethers.formatEther(listing.price);
      }
    } catch (e) {}

    // Check auction
    try {
      const auction = await mktContract.auctions(contractAddress, tokenId);
      if (auction.isActive) {
        auctionData = {
          minPrice: ethers.formatEther(auction.minPrice),
          endTime: Number(auction.endTime) * 1000,
          highestBid: ethers.formatEther(auction.highestBid),
          highestBidder: auction.highestBidder,
          seller: auction.seller
        };
      }
    } catch (e) {}

    return {
      contract: contractAddress,
      tokenId: tokenId.toString(),
      ...metadata,
      owner,
      salePrice,
      auctionData
    };
  } catch (err) {
    console.error("Error fetching NFT data", err);
    return null;
  }
};
