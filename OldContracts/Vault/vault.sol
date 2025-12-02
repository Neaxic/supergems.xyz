pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract NFTSwap {
    address payable public owner;
    uint256 public fee;

    // Mapping from NFT address to array of tokenIds
    mapping(address => uint256[]) public vault;

    constructor(uint256 _fee) {
        owner = payable(msg.sender);
        fee = _fee;
    }

    function depositNFT(address nftAddress, uint256 tokenId) external {
        require(msg.sender == owner, "Only the owner can deposit NFTs");

        IERC721 nft = IERC721(nftAddress);
        nft.transferFrom(msg.sender, address(this), tokenId);

        vault[nftAddress].push(tokenId);
    }

    function swapNFT(address nftAddress, uint256 userTokenId, uint256 vaultTokenId) external payable {
        require(msg.value == fee, "You must send the correct fee to swap NFTs");

        IERC721 nft = IERC721(nftAddress);

        // Check that the user owns the token they want to swap
        require(nft.ownerOf(userTokenId) == msg.sender, "You must own the NFT you want to swap");

        // Check that the vault owns the token to be swapped
        require(nft.ownerOf(vaultTokenId) == address(this), "Vault does not own this NFT");

        // Swap the NFTs
        nft.transferFrom(msg.sender, address(this), userTokenId);
        nft.transferFrom(address(this), msg.sender, vaultTokenId);
    }

    function withdraw() external {
        require(msg.sender == owner, "Only the owner can withdraw");

        owner.transfer(address(this).balance);
    }
}