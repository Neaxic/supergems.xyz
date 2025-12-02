// Purpose: To create a contract that allows "people" to donate a NFT, after which other people can swap same collection NFTs for that NFT.
// The contract also cotains a fee system, where the owner of the contract can set a fee for each swap.
// Further each donater can set a fee for the NFT they donate (within a rage set by the owner).
// The donaters of any NFT can withdraw their NFT at any time, and if anybody swapped NFT with the donated NFT, the original Donater, can withdraw the new inserted (swapped) NFT.

// The contract owner, also has the right to update a list of what NFT collection addresses that can be donated to, a whitelist of addresses
// The owner can also update the fee for each swap, and the fee range for the donaters.
// The contract owner also earn a fee on each swap, not donation. This is adjustable

// This is a concept contract
// Author: Gaard

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Switch is Ownable, ReentrancyGuard {
    struct Donation {
        address donor;
        address nftContract;
        uint256 tokenId;
        uint256 donorFee;
        bool isERC721;
    }

    struct DonationInput {
        address nftContract;
        uint256 tokenId;
        uint256 donorFee;
        bool isERC721;
    }

    address[] private activeDonationContracts;
    mapping(address => uint256[]) private collectionTokenIds;
    mapping(address => bool) private isActiveContract;
    mapping(address => bool) public allowedCollections;
    mapping(address => mapping(uint256 => Donation)) public donations;
    mapping(address => uint256) public accumulatedFees;

    uint256 public ownerFee;
    uint256 public minDonorFee;
    uint256 public maxDonorFee;

    event DonationAdded(
        address indexed donor,
        address indexed nftContract,
        uint256 tokenId,
        uint256 fee
    );
    event DonationWithdrawn(
        address indexed donor,
        address indexed nftContract,
        uint256 tokenId
    );
    event NFTSwapped(
        address indexed oldOwner,
        address indexed newOwner,
        address indexed nftContract,
        uint256 oldTokenId,
        uint256 newTokenId
    );
    event FeesUpdated(
        uint256 ownerFee,
        uint256 minDonorFee,
        uint256 maxDonorFee
    );
    event FeesWithdrawn(address indexed user, uint256 amount);
    event CollectionEmptied(address indexed nftContract, uint256 tokenCount);
    event CollectionAllowedChange(address indexed nftContract, bool isAllowed);

    constructor(
        address initialOwner,
        uint256 _ownerFee,
        uint256 _minDonorFee,
        uint256 _maxDonorFee
    ) Ownable(initialOwner) ReentrancyGuard() {
        ownerFee = _ownerFee;
        minDonorFee = _minDonorFee;
        maxDonorFee = _maxDonorFee;
    }

    function setAllowedCollection(
        address _collection,
        bool _isAllowed
    ) external onlyOwner {
        allowedCollections[_collection] = _isAllowed;
        emit CollectionAllowedChange(_collection, _isAllowed);
    }

    //TODO: Change to fee of usser chosen fee mby
    function updateFees(
        uint256 _ownerFee,
        uint256 _minDonorFee,
        uint256 _maxDonorFee
    ) external onlyOwner {
        ownerFee = _ownerFee;
        minDonorFee = _minDonorFee;
        maxDonorFee = _maxDonorFee;
        emit FeesUpdated(_ownerFee, _minDonorFee, _maxDonorFee);
    }

    function donateBatchNFT(DonationInput[] calldata _donations) external {
        for (uint256 i = 0; i < _donations.length; i++) {
            DonationInput memory donation = _donations[i];

            require(
                allowedCollections[donation.nftContract],
                "Collection not allowed"
            );
            require(
                donation.donorFee >= minDonorFee &&
                    donation.donorFee <= maxDonorFee,
                "Invalid donor fee"
            );

            if (donation.isERC721) {
                require(
                    IERC721(donation.nftContract).ownerOf(donation.tokenId) ==
                        msg.sender,
                    "Not the owner of this NFT"
                );
                IERC721(donation.nftContract).transferFrom(
                    msg.sender,
                    address(this),
                    donation.tokenId
                );
            } else {
                require(
                    IERC1155(donation.nftContract).balanceOf(
                        msg.sender,
                        donation.tokenId
                    ) > 0,
                    "Insufficient balance of this NFT"
                );
                IERC1155(donation.nftContract).safeTransferFrom(
                    msg.sender,
                    address(this),
                    donation.tokenId,
                    1,
                    ""
                );
            }

            donations[donation.nftContract][donation.tokenId] = Donation(
                msg.sender,
                donation.nftContract,
                donation.tokenId,
                donation.donorFee,
                donation.isERC721
            );
            collectionTokenIds[donation.nftContract].push(donation.tokenId);

            // Add contract to active donations if it's not already there
            if (!isActiveContract[donation.nftContract]) {
                activeDonationContracts.push(donation.nftContract);
                isActiveContract[donation.nftContract] = true;
            }

            emit DonationAdded(
                msg.sender,
                donation.nftContract,
                donation.tokenId,
                donation.donorFee
            );
        }
    }

    function withdrawDonation(address _nftContract, uint256 _tokenId) external {
        Donation storage donation = donations[_nftContract][_tokenId];
        require(donation.donor == msg.sender, "Not the donor");

        if (donation.isERC721) {
            IERC721(_nftContract).transferFrom(
                address(this),
                msg.sender,
                _tokenId
            );
        } else {
            IERC1155(_nftContract).safeTransferFrom(
                address(this),
                msg.sender,
                _tokenId,
                1,
                ""
            );
        }

        delete donations[_nftContract][_tokenId];

        _removeEmptyContract(_nftContract);
        emit DonationWithdrawn(msg.sender, _nftContract, _tokenId);
    }

    function withdrawMultipleDonations(
        address[] calldata _nftContracts,
        uint256[] calldata _tokenIds
    ) external nonReentrant {
        require(
            _nftContracts.length == _tokenIds.length,
            "Arrays length mismatch"
        );

        for (uint256 i = 0; i < _nftContracts.length; i++) {
            address nftContract = _nftContracts[i];
            uint256 tokenId = _tokenIds[i];
            Donation storage donation = donations[nftContract][tokenId];

            require(donation.donor == msg.sender, "Not the donor");

            if (donation.isERC721) {
                IERC721(nftContract).transferFrom(
                    address(this),
                    msg.sender,
                    tokenId
                );
            } else {
                IERC1155(nftContract).safeTransferFrom(
                    address(this),
                    msg.sender,
                    tokenId,
                    1,
                    ""
                );
            }

            delete donations[nftContract][tokenId];

            _removeEmptyContract(nftContract);
            emit DonationWithdrawn(msg.sender, nftContract, tokenId);
        }
    }

    function swapNFT(
        address _nftContract,
        uint256 _oldTokenId,
        uint256 _newTokenId,
        bool _isERC721
    ) external payable nonReentrant {
        Donation storage oldDonation = donations[_nftContract][_oldTokenId];
        require(oldDonation.donor != address(0), "NFT not donated");

        uint256 totalFee = ownerFee + oldDonation.donorFee;
        require(msg.value >= totalFee, "Insufficient fee");

        require(
            _nftContract == oldDonation.nftContract,
            "Invalid NFT contract"
        );

        if (_isERC721) {
            require(
                IERC721(_nftContract).ownerOf(_newTokenId) == msg.sender,
                "Not the owner of this NFT"
            );
            IERC721(_nftContract).transferFrom(
                msg.sender,
                address(this),
                _newTokenId
            );
            IERC721(_nftContract).transferFrom(
                address(this),
                msg.sender,
                _oldTokenId
            );
        } else {
            require(
                IERC1155(_nftContract).balanceOf(msg.sender, _newTokenId) > 0,
                "Insufficient balance of this NFT"
            );
            IERC1155(_nftContract).safeTransferFrom(
                msg.sender,
                address(this),
                _newTokenId,
                1,
                ""
            );
            IERC1155(_nftContract).safeTransferFrom(
                address(this),
                msg.sender,
                _oldTokenId,
                1,
                ""
            );
        }

        // Update donation
        donations[_nftContract][_newTokenId] = Donation(
            oldDonation.donor,
            _nftContract,
            _newTokenId,
            oldDonation.donorFee,
            _isERC721
        );
        delete donations[_nftContract][_oldTokenId];

        // Update collection tokenIds
        // collectionTokenIds[_nftContract].up(_tokenId);
        _updateCollectionTokenIds(_nftContract, _oldTokenId, _newTokenId);

        // Store fees
        accumulatedFees[owner()] += ownerFee;
        accumulatedFees[oldDonation.donor] += oldDonation.donorFee;

        emit NFTSwapped(
            oldDonation.donor,
            msg.sender,
            _nftContract,
            _oldTokenId,
            _newTokenId
        );
    }

    struct SwapInfo {
        address nftContract;
        uint256[] oldTokenIds;
        uint256[] newTokenIds;
        bool isERC721;
    }

    function swapMultipleNFTs(
        SwapInfo[] calldata swapInfos
    ) external payable nonReentrant {
        uint256 totalFee = 0;

        for (uint256 i = 0; i < swapInfos.length; i++) {
            SwapInfo memory swapInfo = swapInfos[i];
            require(
                swapInfo.oldTokenIds.length == swapInfo.newTokenIds.length,
                "Token ID arrays length mismatch"
            );

            for (uint256 j = 0; j < swapInfo.oldTokenIds.length; j++) {
                uint256 oldTokenId = swapInfo.oldTokenIds[j];
                uint256 newTokenId = swapInfo.newTokenIds[j];

                Donation storage oldDonation = donations[swapInfo.nftContract][
                    oldTokenId
                ];
                require(oldDonation.donor != address(0), "NFT not donated");
                require(
                    swapInfo.nftContract == oldDonation.nftContract,
                    "Invalid NFT contract"
                );

                uint256 swapFee = ownerFee + oldDonation.donorFee;
                totalFee += swapFee;

                if (swapInfo.isERC721) {
                    require(
                        IERC721(swapInfo.nftContract).ownerOf(newTokenId) ==
                            msg.sender,
                        "Not the owner of this NFT"
                    );
                    IERC721(swapInfo.nftContract).transferFrom(
                        msg.sender,
                        address(this),
                        newTokenId
                    );
                    IERC721(swapInfo.nftContract).transferFrom(
                        address(this),
                        msg.sender,
                        oldTokenId
                    );
                } else {
                    require(
                        IERC1155(swapInfo.nftContract).balanceOf(
                            msg.sender,
                            newTokenId
                        ) > 0,
                        "Insufficient balance of this NFT"
                    );
                    IERC1155(swapInfo.nftContract).safeTransferFrom(
                        msg.sender,
                        address(this),
                        newTokenId,
                        1,
                        ""
                    );
                    IERC1155(swapInfo.nftContract).safeTransferFrom(
                        address(this),
                        msg.sender,
                        oldTokenId,
                        1,
                        ""
                    );
                }

                // Update donation
                donations[swapInfo.nftContract][newTokenId] = Donation(
                    oldDonation.donor,
                    swapInfo.nftContract,
                    newTokenId,
                    oldDonation.donorFee,
                    swapInfo.isERC721
                );
                delete donations[swapInfo.nftContract][oldTokenId];

                // Update collection tokenIds
                _updateCollectionTokenIds(
                    swapInfo.nftContract,
                    oldTokenId,
                    newTokenId
                );

                // Store fees
                accumulatedFees[owner()] += ownerFee;
                accumulatedFees[oldDonation.donor] += oldDonation.donorFee;

                emit NFTSwapped(
                    oldDonation.donor,
                    msg.sender,
                    swapInfo.nftContract,
                    oldTokenId,
                    newTokenId
                );
            }
        }

        require(msg.value >= totalFee, "Insufficient fee");
    }

    //Could be optimised to use a mapping instead of looping through the array
    function _updateCollectionTokenIds(
        address nftContract,
        uint256 oldTokenId,
        uint256 newTokenId
    ) internal {
        for (uint j = 0; j < collectionTokenIds[nftContract].length; j++) {
            if (collectionTokenIds[nftContract][j] == oldTokenId) {
                collectionTokenIds[nftContract][j] = newTokenId;
                break;
            }
        }
    }

    function withdrawAccumulatedFees() external nonReentrant {
        uint256 amount = accumulatedFees[msg.sender];
        require(amount > 0, "No fees to withdraw");

        accumulatedFees[msg.sender] = 0;
        payable(msg.sender).transfer(amount);

        emit FeesWithdrawn(msg.sender, amount);
    }

    // Function to empty a collection's donated NFTs
    function emptyCollectionDonations(address _nftContract) external onlyOwner {
        require(allowedCollections[_nftContract], "Collection not allowed");

        uint256[] storage tokenIds = collectionTokenIds[_nftContract];
        uint256 tokenCount = tokenIds.length;

        for (uint256 i = 0; i < tokenCount; i++) {
            uint256 tokenId = tokenIds[i];
            Donation memory donation = donations[_nftContract][tokenId];

            if (donation.isERC721) {
                IERC721(_nftContract).transferFrom(
                    address(this),
                    donation.donor,
                    tokenId
                );
            } else {
                IERC1155(_nftContract).safeTransferFrom(
                    address(this),
                    donation.donor,
                    tokenId,
                    1,
                    ""
                );
            }

            delete donations[_nftContract][tokenId];
            emit DonationWithdrawn(donation.donor, _nftContract, tokenId);
        }

        delete collectionTokenIds[_nftContract];

        emit CollectionEmptied(_nftContract, tokenCount);
    }

    //Various getters
    //Function to get a list of all collections that can be donated to
    function getAllowedCollections() external view returns (address[] memory) {
        return activeDonationContracts;
    }

    // Getter function for active donation contracts
    function getActiveDonationContracts()
        external
        view
        returns (address[] memory)
    {
        return activeDonationContracts;
    }

    // Function to get a list of all donated NFT tokenIds for a collection
    function getDonatedNFTs(
        address _nftContract
    ) external view returns (uint256[] memory) {
        return collectionTokenIds[_nftContract];
    }

    // Getter function for donations list
    function getDonations(
        address _nftContract,
        uint256 _offset,
        uint256 _limit
    ) external view returns (Donation[] memory) {
        uint256[] storage tokenIds = collectionTokenIds[_nftContract];
        uint256 totalDonations = tokenIds.length;

        if (_offset >= totalDonations) {
            return new Donation[](0);
        }

        uint256 end = _offset + _limit;
        if (end > totalDonations) {
            end = totalDonations;
        }
        uint256 resultLength = end - _offset;

        Donation[] memory result = new Donation[](resultLength);

        for (uint256 i = 0; i < resultLength; i++) {
            uint256 tokenId = tokenIds[_offset + i];
            Donation storage donation = donations[_nftContract][tokenId];
            result[i] = Donation({
                nftContract: donation.nftContract,
                tokenId: donation.tokenId,
                donor: donation.donor,
                donorFee: donation.donorFee,
                isERC721: donation.isERC721
            });
        }

        return result;
    }

    // Getter function for total number of donations for a contract
    function getTotalDonations(
        address _nftContract
    ) external view returns (uint256) {
        return collectionTokenIds[_nftContract].length;
    }

    // Various helpers
    // Function to remove a contract from active donations if it has no more donations
    function _removeEmptyContract(address _nftContract) internal {
        if (
            collectionTokenIds[_nftContract].length == 0 &&
            isActiveContract[_nftContract]
        ) {
            for (uint i = 0; i < activeDonationContracts.length; i++) {
                if (activeDonationContracts[i] == _nftContract) {
                    activeDonationContracts[i] = activeDonationContracts[
                        activeDonationContracts.length - 1
                    ];
                    activeDonationContracts.pop();
                    isActiveContract[_nftContract] = false;
                    break;
                }
            }
        }
    }
}
