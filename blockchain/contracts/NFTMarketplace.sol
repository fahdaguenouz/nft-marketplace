// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract NFTMarketplace is ReentrancyGuard, IERC721Receiver {
    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool isActive;
    }

    struct Auction {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 minPrice;
        uint256 endTime;
        address highestBidder;
        uint256 highestBid;
        bool isActive;
    }

    // Mapping from NFT contract -> Token ID -> Listing
    mapping(address => mapping(uint256 => Listing)) public listings;
    
    // Mapping from NFT contract -> Token ID -> Auction
    mapping(address => mapping(uint256 => Auction)) public auctions;

    // Mapping for pending returns for failed auction bids or refunds (Pull over Push)
    mapping(address => uint256) public pendingReturns;

    event NFTListed(address indexed seller, address indexed nftContract, uint256 indexed tokenId, uint256 price);
    event NFTSold(address indexed buyer, address indexed nftContract, uint256 indexed tokenId, uint256 price);
    event AuctionCreated(address indexed seller, address indexed nftContract, uint256 indexed tokenId, uint256 minPrice, uint256 endTime);
    event BidPlaced(address indexed bidder, address indexed nftContract, uint256 indexed tokenId, uint256 bidAmount);
    event AuctionEnded(address indexed winner, address indexed nftContract, uint256 indexed tokenId, uint256 winningBid);

    function listNFT(address _nftContract, uint256 _tokenId, uint256 _price) external {
        require(_price > 0, "Price must be greater than zero");
        IERC721 nft = IERC721(_nftContract);
        require(nft.ownerOf(_tokenId) == msg.sender, "Not the owner");
        require(nft.getApproved(_tokenId) == address(this) || nft.isApprovedForAll(msg.sender, address(this)), "Marketplace not approved");

        listings[_nftContract][_tokenId] = Listing(msg.sender, _nftContract, _tokenId, _price, true);
        
        emit NFTListed(msg.sender, _nftContract, _tokenId, _price);
    }

    function buyNFT(address _nftContract, uint256 _tokenId) external payable nonReentrant {
        Listing memory listing = listings[_nftContract][_tokenId];
        require(listing.isActive, "Not listed for sale");
        require(msg.value >= listing.price, "Insufficient payment");

        listings[_nftContract][_tokenId].isActive = false;

        IERC721(_nftContract).safeTransferFrom(listing.seller, msg.sender, _tokenId);
        
        (bool success, ) = payable(listing.seller).call{value: listing.price}("");
        require(success, "Transfer failed");

        if (msg.value > listing.price) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - listing.price}("");
            require(refundSuccess, "Refund failed");
        }

        emit NFTSold(msg.sender, _nftContract, _tokenId, listing.price);
    }

    function createAuction(address _nftContract, uint256 _tokenId, uint256 _minPrice, uint256 _duration) external {
        IERC721 nft = IERC721(_nftContract);
        require(nft.ownerOf(_tokenId) == msg.sender, "Not the owner");
        require(nft.getApproved(_tokenId) == address(this) || nft.isApprovedForAll(msg.sender, address(this)), "Marketplace not approved");

        nft.safeTransferFrom(msg.sender, address(this), _tokenId);

        uint256 endTime = block.timestamp + _duration;
        auctions[_nftContract][_tokenId] = Auction({
            seller: msg.sender,
            nftContract: _nftContract,
            tokenId: _tokenId,
            minPrice: _minPrice,
            endTime: endTime,
            highestBidder: address(0),
            highestBid: 0,
            isActive: true
        });

        emit AuctionCreated(msg.sender, _nftContract, _tokenId, _minPrice, endTime);
    }

    function bid(address _nftContract, uint256 _tokenId) external payable nonReentrant {
        Auction storage auction = auctions[_nftContract][_tokenId];
        require(auction.isActive, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.value > auction.highestBid && msg.value >= auction.minPrice, "Bid too low");

        if (auction.highestBidder != address(0)) {
            pendingReturns[auction.highestBidder] += auction.highestBid;
        }

        auction.highestBidder = msg.sender;
        auction.highestBid = msg.value;

        emit BidPlaced(msg.sender, _nftContract, _tokenId, msg.value);
    }

    function endAuction(address _nftContract, uint256 _tokenId) external nonReentrant {
        Auction storage auction = auctions[_nftContract][_tokenId];
        require(auction.isActive, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction not ended yet");

        auction.isActive = false;

        if (auction.highestBidder != address(0)) {
            IERC721(_nftContract).safeTransferFrom(address(this), auction.highestBidder, _tokenId);
            pendingReturns[auction.seller] += auction.highestBid;

            emit AuctionEnded(auction.highestBidder, _nftContract, _tokenId, auction.highestBid);
        } else {
            IERC721(_nftContract).safeTransferFrom(address(this), auction.seller, _tokenId);
            emit AuctionEnded(address(0), _nftContract, _tokenId, 0);
        }
    }

    function withdraw() external nonReentrant {
        uint256 amount = pendingReturns[msg.sender];
        require(amount > 0, "No pending returns");
        pendingReturns[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdraw failed");
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
