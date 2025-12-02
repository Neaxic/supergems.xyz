// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Ownable.sol";

contract Auction is Ownable {
    address payable public highestBidder;
    uint public highestBid;
    uint public FEE = 0.001 ether;

    event HighestBidIncreased(address bidder, uint amount);
    event AuctionEnded(address winner, uint amount);

    constructor() Ownable(msg.sender) {}

    function bid() public payable {
        require(msg.value > highestBid, "There already is a higher bid.");

        if (highestBid != 0) {
            // Refund the previously highest bidder.
            highestBidder.transfer(highestBid);
        }

        highestBidder = payable(msg.sender);
        highestBid = msg.value;
        emit HighestBidIncreased(msg.sender, msg.value);
    }

    function auctionEnd() public onlyOwner {
        // Only the owner can end the auction.

        emit AuctionEnded(highestBidder, highestBid);

        // The auction's balance is sent to the owner.
        payable(owner()).transfer(address(this).balance);
    }
}
