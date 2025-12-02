// A solidity coinflip game

// Author: 1CY.ETH
// Take a flat fee over x value coinflip
// Under x value, it should be free
// Could be calculated as a % of coinflip value, and payed in native balance
// Allow the iniater of the coinflip, to set a diff % of the coinflip value, that the other player has to pay, slight wiggle room for the joiner. - Will reflect odds
// Either a straight 50%50 odds, or more tilted like 20%80, or 80%20 - the math random chance should reflect that
// Take usage of chainlink fair randomness VRF, to make the coinflip random
// Events for coinflips initiated, conflip joined, coinflip result
// Coinflips are stored in a mapping, with a unique id, and the initiator, the joiner, the value, the diff %, and the result
// The contract should have a balance, that is the sum of all coinflips, and the contract should be able to pay out the winner
// The contract should have a fee, that is a % of the coinflip value, and the contract should be able to pay out the fee to the contract owner
// The conflip has a status of initiated or finished
// If the status is initiated, the initiator can cancel the coinflip, and get the value back

//SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract CoinflipContract is Ownable {
    // Initialize the Ownable contract with the specified feePercentage argument
    struct Coinflip {
        address initiator;
        address joiner;
        uint value;
        uint diff;
        bool result; // true = initiator wins, false = joiner wins
    }

    mapping(uint => Coinflip) public coinflips;
    uint public coinflipCount;
    uint public fee;
    uint public minValueForFee = 0.1 ether;
    uint public feeBalance;
    uint public contractBalance;

    event CoinflipInitiated(uint id, address initiator, uint value, uint diff);
    event CoinflipJoined(uint id, address joiner, uint value, uint diff);
    event CoinflipResult(uint id, bool result);

    //Constructor
    constructor() Ownable(msg.sender) {}

    function setFee(uint _fee) external onlyOwner {
        fee = _fee;
    }

    function readFee() external view returns (uint) {
        return fee;
    }

    function withdrawFee() external onlyOwner {
        require(feeBalance > 0, "Fee balance is 0");
        payable(msg.sender).transfer(feeBalance);
        feeBalance = 0;
    }

    function readContractBalance() external view returns (uint) {
        return contractBalance;
    }

    function readMinValueForFee() external view returns (uint) {
        return minValueForFee;
    }

    function setMinValueForFee(uint _minValueForFee) external onlyOwner {
        minValueForFee = _minValueForFee * 1 ether;
    }

    function initiateCoinflip(uint _diff) external payable {
        require(msg.value > 0, "Value must be greater than 0");
        require(_diff > 0 && _diff < 100, "Diff must be between 0 and 100");

        if (msg.value > minValueForFee) {
            feeBalance += (msg.value * fee) / 100;
            contractBalance += (msg.value * (100 - fee)) / 100;
        } else {
            contractBalance += msg.value;
        }

        coinflipCount++;
        coinflips[coinflipCount] = Coinflip(
            msg.sender,
            address(0),
            msg.value,
            _diff,
            false
        );
        contractBalance += msg.value;
        emit CoinflipInitiated(coinflipCount, msg.sender, msg.value, _diff);
    }

    function joinCoinflip(uint _id) external payable {
        require(msg.value > 0, "Value must be greater than 0");
        require(
            coinflips[_id].initiator != address(0),
            "Coinflip does not exist"
        );
        require(coinflips[_id].joiner == address(0), "Coinflip already joined");
        require(
            msg.value == (coinflips[_id].value * coinflips[_id].diff) / 100,
            "Value must be equal to diff"
        ); //Check the value is aligning with diff of initiater value

        //We need more diff calculations here
        //

        //Tke fee
        if (msg.value > minValueForFee) {
            feeBalance += (msg.value * fee) / 100;
            contractBalance += (msg.value * (100 - fee)) / 100;
        } else {
            contractBalance += msg.value;
        }

        coinflips[_id].joiner = msg.sender;
        emit CoinflipJoined(_id, msg.sender, msg.value, coinflips[_id].diff);

        //Start resolving the conflip
        uint random = uint(keccak256(abi.encodePacked(block.timestamp))) % 2;
        coinflips[_id].result = random == 0;
        if (coinflips[_id].result) {
            payable(coinflips[_id].initiator).transfer(
                coinflips[_id].value + msg.value
            );
        } else {
            payable(coinflips[_id].joiner).transfer(
                coinflips[_id].value + msg.value
            );
        }

        emit CoinflipResult(_id, coinflips[_id].result);
    }

    function cancelCoinflip(uint _id) external {
        require(
            coinflips[_id].initiator == msg.sender,
            "Only initiator can cancel"
        );
        require(coinflips[_id].joiner == address(0), "Coinflip already joined");

        payable(msg.sender).transfer(coinflips[_id].value);
        contractBalance -= coinflips[_id].value;
        delete coinflips[_id];
    }
}
