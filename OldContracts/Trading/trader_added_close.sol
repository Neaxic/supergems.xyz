//SPDX-License-Identifier: Unlicense
// Started by gontae - enhanced & extended by @gaard on farcaster

//Contributer: twitter: @1CYETH, github: Neaxic
//Contributer: twitter: @Gontae

pragma solidity ^0.8.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Swapper is Ownable, ReentrancyGuard {
    enum AssetType {
        ERC20,
        ERC721
    }

    enum ProposalType {
        Private,
        Open
    }

    struct Proposal {
        address from;
        address to;
        Content[] giveContents;
        Content[] receiveContents;
        uint expiryDate;
        bool fulfilled;
    }

    struct OpenProposal {
        address from;
        uint expiryDate;
        bool fulfilled;
        Content[] giveContents;
        address[] collectionAddresses;
        bool isOr;
    }

    struct Content {
        AssetType assetType;
        address tokenAddress;
        uint amountOrId;
    }

    uint public FEE = 0.001 ether;
    bool public isPaused;

    uint proposalsCount;
    mapping(uint => Proposal) public proposals;

    uint openProposalsCount;
    mapping(uint => OpenProposal) public openProposals;

    event ProposalAdded(uint proposalId);
    event ProposalFulfilled(uint indexed proposalId);
    event ProposalCleared(uint indexed proposalId);

    event OpenProposalAdded(uint proposalId);
    event OpenProposalFulfilled(uint indexed openProposalId);
    event OpenProposalCleared(uint indexed openProposalId);

    constructor() Ownable(msg.sender) {}

    function addProposal(
        address _to,
        Content[] calldata _giveContents,
        Content[] calldata _receiveContents,
        uint _expiryDate
    ) public payable nonReentrant returns (uint) {
        require(!isPaused, "Contract is paused");
        require(_giveContents.length > 0, "You must give something");
        require(_receiveContents.length > 0, "You must receive something");
        require(msg.value >= FEE, "You must align with the service fee");

        proposalsCount++;
        Proposal storage proposal = proposals[proposalsCount];
        proposal.from = msg.sender;
        proposal.to = _to;
        proposal.expiryDate = _expiryDate;
        proposal.fulfilled = false;
        for (uint i = 0; i < _giveContents.length; i++) {
            Content memory _giveContent = _giveContents[i];
            sideIsAbleToFulfillTheirPart(_giveContent, msg.sender, true);
            proposal.giveContents.push(_giveContent);
        }
        for (uint i = 0; i < _receiveContents.length; i++) {
            Content memory _receiveContent = _receiveContents[i];
            proposal.receiveContents.push(_receiveContent);
        }
        emit ProposalAdded(proposalsCount);
        return proposalsCount;
    }

    function addOpenProposal(
        uint _expiryDate,
        Content[] memory _giveContents,
        address[] memory _collectionAddresses,
        bool _isOr
    ) public payable nonReentrant returns (uint) {
        require(!isPaused, "Contract is paused");
        require(_giveContents.length > 0, "You must give something");
        require(_collectionAddresses.length > 0, "You must receive something");
        require(msg.value >= FEE, "You must align with the service fee");

        openProposalsCount++;
        OpenProposal storage openProposal = openProposals[openProposalsCount];
        openProposal.from = msg.sender;
        openProposal.expiryDate = _expiryDate;
        openProposal.fulfilled = false;
        openProposal.collectionAddresses = _collectionAddresses;
        openProposal.isOr = _isOr;
        for (uint i = 0; i < _giveContents.length; i++) {
            Content memory _giveContent = _giveContents[i];
            sideIsAbleToFulfillTheirPart(_giveContent, msg.sender, true);
            openProposal.giveContents.push(_giveContent);
        }
        emit OpenProposalAdded(openProposalsCount);
        return openProposalsCount;
    }

    function fulfillOpenProposal(
        uint _id,
        Content[] memory _giveContents
    ) external payable {
        require(!isPaused, "Contract is paused");
        require(msg.value >= FEE, "You must align with the service fee");

        OpenProposal storage openProposal = openProposals[_id];
        require(
            openProposal.expiryDate >= block.timestamp,
            "Open proposal has expired"
        );
        require(
            openProposal.fulfilled == false,
            "This open proposal has already been fulfilled"
        );
        if (openProposal.isOr) {
            require(_giveContents.length >= 1, "Must give at least one item");
        } else {
            require(
                _giveContents.length == openProposal.collectionAddresses.length,
                "Must give an item for each collection address"
            );
        }

        // Check proposer still has the NFTs
        for (uint i = 0; i < openProposal.giveContents.length; i++) {
            Content memory _content = openProposal.giveContents[i];
            sideIsAbleToFulfillTheirPart(_content, openProposal.from, true);
        }

        // Check accepters givecontent on function call
        uint validContentsCount = 0;
        for (uint i = 0; i < _giveContents.length; i++) {
            Content memory _giveContent = _giveContents[i];
            if (
                isInCollectionAddresses(
                    _giveContent.tokenAddress,
                    openProposal.collectionAddresses
                )
            ) {
                sideIsAbleToFulfillTheirPart(_giveContent, msg.sender, true);
                validContentsCount++;
            }
        }

        // If the proposal uses AND logic, check if the user has all the required items
        if (openProposal.isOr == false) {
            require(
                validContentsCount == openProposal.collectionAddresses.length,
                "Not all required items are present"
            );
        }

        // If the proposal uses OR logic, check if the user has at least one of the required items
        if (openProposal.isOr == true) {
            require(
                validContentsCount > 0,
                "None of the required items are present"
            );
        }

        //Disclose the proposal as done, so it can't be fulfilled again - before transactions (reentrancy protection?)
        openProposal.fulfilled = true;

        // Perform the transaction
        for (uint i = 0; i < openProposal.giveContents.length; i++) {
            Content memory _content = openProposal.giveContents[i];
            performTransactionInContent(
                _content,
                openProposal.from,
                msg.sender, // The caller is the one who fulfills the open proposal
                true
            );
        }

        //Might it be possible for accepter to send own nfts away, after his check initially - before the fulfillOpenProposal function call?
        //Since this is an array thats iterating.
        for (uint i = 0; i < _giveContents.length; i++) {
            Content memory _content = _giveContents[i];
            performTransactionInContent(
                _content,
                msg.sender, // The caller is the one who fulfills the open proposal
                openProposal.from,
                false
            );
        }

        emit OpenProposalFulfilled(_id);
    }

    function fulfillProposal(uint _id) external payable {
        require(!isPaused, "Contract is paused");
        require(msg.value >= FEE, "You must align with the service fee");

        Proposal storage proposal = proposals[_id];
        require(proposal.expiryDate >= block.timestamp, "Proposal has expired");
        require(
            proposal.to == msg.sender,
            "You're not the Taker of this proposal"
        );
        require(
            proposal.fulfilled == false,
            "This proposal has already been fulfilled"
        );

        for (uint i = 0; i < proposal.giveContents.length; i++) {
            Content memory _content = proposal.giveContents[i];
            performTransactionInContent(
                _content,
                proposal.from,
                proposal.to,
                true
            );
        }
        for (uint i = 0; i < proposal.receiveContents.length; i++) {
            Content memory _content = proposal.receiveContents[i];
            performTransactionInContent(
                _content,
                proposal.to,
                proposal.from,
                false
            );
        }
        proposal.fulfilled = true;

        emit ProposalFulfilled(_id);
    }

    function closeProposal(uint _id, ProposalType _type) external {
        if (_type == ProposalType.Private) {
            Proposal storage proposal = proposals[_id];
            require(
                (proposal.from == msg.sender || proposal.to == msg.sender),
                "You're not the relevant to this proposal"
            );
            delete proposals[_id];
            emit ProposalCleared(_id);
        } else if (_type == ProposalType.Open) {
            OpenProposal storage openProposal = openProposals[_id];
            require(
                openProposal.from == msg.sender,
                "You're not the Maker of this open proposal"
            );
            delete openProposals[_id];
            emit OpenProposalCleared(_id);
        } else {
            revert("Invalid proposal type");
        }
    }

    function pause() external onlyOwner {
        isPaused = true;
    }

    function unpause() external onlyOwner {
        isPaused = false;
    }

    function resetAllProposals() external onlyOwner {
        proposals = new mapping(uint => Proposal)();
        openProposals = new mapping(uint => OpenProposal)();
    }

    // Transfer all accumulated fees to the owner
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function setFee(uint _fee) external onlyOwner {
        FEE = _fee;
    }

    function isInCollectionAddresses(
        address collectionAddress,
        address[] memory collectionAddresses
    ) private pure returns (bool) {
        for (uint i = 0; i < collectionAddresses.length; i++) {
            if (collectionAddresses[i] == collectionAddress) {
                return true;
            }
        }
        return false;
    }

    function performTransactionInContent(
        Content memory _content,
        address _transactionOrigin,
        address _transactionDestination,
        bool _isMaker
    ) internal {
        sideIsAbleToFulfillTheirPart(_content, _transactionOrigin, _isMaker);
        if (_content.assetType == AssetType.ERC20) {
            uint _amountInWei = _content.amountOrId * 10 ** 18;
            IERC20 token = IERC20(_content.tokenAddress);
            token.transferFrom(
                _transactionOrigin,
                _transactionDestination,
                _amountInWei
            );
        } else if (_content.assetType == AssetType.ERC721) {
            uint _tokenId = _content.amountOrId;
            IERC721 token = IERC721(_content.tokenAddress);
            token.safeTransferFrom(
                _transactionOrigin,
                _transactionDestination,
                _tokenId
            );
        }
    }

    function sideIsAbleToFulfillTheirPart(
        Content memory _content,
        address _from,
        bool _isMaker
    ) internal view {
        if (_content.assetType == AssetType.ERC20) {
            uint _amountInWei = _content.amountOrId * 10 ** 18;
            IERC20 token = IERC20(_content.tokenAddress);
            require(
                token.allowance(_from, address(this)) >= _amountInWei,
                string.concat(
                    _isMaker ? "Maker" : "Taker",
                    " has not approved ",
                    Strings.toHexString(_content.tokenAddress)
                )
            );
            require(
                token.balanceOf(_from) >= _amountInWei,
                string.concat(
                    _isMaker ? "Maker" : "Taker",
                    " has not enough balance"
                )
            );
        } else if (_content.assetType == AssetType.ERC721) {
            uint _tokenId = _content.amountOrId;
            IERC721 token = IERC721(_content.tokenAddress);
            require(
                token.isApprovedForAll(_from, address(this)),
                string.concat(
                    _isMaker ? "Maker" : "Taker",
                    " has not approved ",
                    Strings.toHexString(_content.tokenAddress)
                )
            );
            require(
                token.ownerOf(_tokenId) == _from,
                string.concat(
                    _isMaker ? "Maker" : "Taker",
                    " is not the owner of NFT with ID ",
                    Strings.toString(_tokenId),
                    " in collection ",
                    Strings.toHexString(_content.tokenAddress)
                )
            );
        }
    }
}
