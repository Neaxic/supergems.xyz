// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import {PayableProxyInterface} from "../interfaces/PayableProxyInterface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title   PayableProxy
 * @author  OpenSea Protocol Team
 * @notice  PayableProxy is a proxy which will immediately return if
 *          called with callvalue. Otherwise, it will delegatecall the
 *          implementation.
 */
contract PayableProxy is PayableProxyInterface, Ownable {
    // Address of the implementation.
    address private _implementation;

    function setImplementation(address newImplementation) public onlyOwner {
        _implementation = newImplementation;
    }

    function _implementation() internal view override returns (address) {
        return _implementation;
    }

    constructor(address implementation) payable {
        _implementation = implementation;
    }

    /**
     * @dev Fallback function that delegates calls to the address returned by
     *      `_implementation()`. Will run if no other function in the contract
     *      matches the call data.
     */
    fallback() external payable override {
        _fallback();
    }

    /**
     * @dev Internal fallback function that delegates calls to the address
     *      returned by `_implementation()`. Will run if no other function
     *      in the contract matches the call data.
     */
    function _fallback() internal {
        // Delegate if call value is zero.
        if (msg.value == 0) {
            _delegate(_implementation);
        }
    }

    /**
     * @dev Delegates the current call to `implementation`.
     *
     * This function does not return to its internal call site, it will
     * return directly to the external caller.
     */
    function _delegate(address implementation) internal virtual {
        assembly {
            // Copy msg.data. We take full control of memory in this
            // inline assembly block because it will not return to
            // Solidity code. We overwrite the Solidity scratch pad
            // at memory position 0.
            calldatacopy(0, 0, calldatasize())

            // Call the implementation.
            // out and outsize are 0 because we don't know the size yet.
            let result := delegatecall(
                gas(),
                implementation,
                0,
                calldatasize(),
                0,
                0
            )

            // Copy the returned data.
            returndatacopy(0, 0, returndatasize())

            switch result
            // delegatecall returns 0 on error.
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }
}
