const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const Ethers = require("ethers");
const axios = require("axios");
const { tradeAccepted, recivedProposalOffer } = require("./notifications");
const { getUserDB, getChainNameFromId, fetchCollection } = require("./helpers");

// use firebase CLI, and cd root, not functions
// firebase deploy --only functions --project apecode
const db = admin.firestore();

const swapperContractABI = [
  { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "OwnableInvalidOwner", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "OwnableUnauthorizedAccount", "type": "error" }, { "inputs": [{ "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "uint256", "name": "length", "type": "uint256" }], "name": "StringsInsufficientHexLength", "type": "error" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "proposalId", "type": "uint256" }], "name": "OpenProposalAdded", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "openProposalId", "type": "uint256" }], "name": "OpenProposalCleared", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "openProposalId", "type": "uint256" }], "name": "OpenProposalFulfilled", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "proposalId", "type": "uint256" }], "name": "ProposalAdded", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "proposalId", "type": "uint256" }], "name": "ProposalCleared", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "proposalId", "type": "uint256" }], "name": "ProposalFulfilled", "type": "event" }, { "inputs": [], "name": "FEE", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_expiryDate", "type": "uint256" }, { "components": [{ "internalType": "enum Swapper.AssetType", "name": "assetType", "type": "uint8" }, { "internalType": "address", "name": "tokenAddress", "type": "address" }, { "internalType": "uint256", "name": "amountOrId", "type": "uint256" }], "internalType": "struct Swapper.Content[]", "name": "_giveContents", "type": "tuple[]" }, { "internalType": "address[]", "name": "_collectionAddresses", "type": "address[]" }, { "internalType": "bool", "name": "_isOr", "type": "bool" }], "name": "addOpenProposal", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_to", "type": "address" }, { "components": [{ "internalType": "enum Swapper.AssetType", "name": "assetType", "type": "uint8" }, { "internalType": "address", "name": "tokenAddress", "type": "address" }, { "internalType": "uint256", "name": "amountOrId", "type": "uint256" }], "internalType": "struct Swapper.Content[]", "name": "_giveContents", "type": "tuple[]" }, { "components": [{ "internalType": "enum Swapper.AssetType", "name": "assetType", "type": "uint8" }, { "internalType": "address", "name": "tokenAddress", "type": "address" }, { "internalType": "uint256", "name": "amountOrId", "type": "uint256" }], "internalType": "struct Swapper.Content[]", "name": "_receiveContents", "type": "tuple[]" }, { "internalType": "uint256", "name": "_expiryDate", "type": "uint256" }], "name": "addProposal", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }, { "internalType": "enum Swapper.ProposalType", "name": "_type", "type": "uint8" }], "name": "closeProposal", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }, { "components": [{ "internalType": "enum Swapper.AssetType", "name": "assetType", "type": "uint8" }, { "internalType": "address", "name": "tokenAddress", "type": "address" }, { "internalType": "uint256", "name": "amountOrId", "type": "uint256" }], "internalType": "struct Swapper.Content[]", "name": "_giveContents", "type": "tuple[]" }], "name": "fulfillOpenProposal", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }], "name": "fulfillProposal", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "isPaused", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "openProposals", "outputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "uint256", "name": "expiryDate", "type": "uint256" }, { "internalType": "bool", "name": "fulfilled", "type": "bool" }, { "internalType": "bool", "name": "isOr", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "pause", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "proposals", "outputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "expiryDate", "type": "uint256" }, { "internalType": "bool", "name": "fulfilled", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_fee", "type": "uint256" }], "name": "setFee", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "unpause", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];

const seaportContractABI = [
  { "inputs": [{ "internalType": "address", "name": "conduitController", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "BadContractSignature", "type": "error" }, { "inputs": [], "name": "BadFraction", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "BadReturnValueFromERC20OnTransfer", "type": "error" }, { "inputs": [{ "internalType": "uint8", "name": "v", "type": "uint8" }], "name": "BadSignatureV", "type": "error" }, { "inputs": [], "name": "CannotCancelOrder", "type": "error" }, { "inputs": [], "name": "ConsiderationCriteriaResolverOutOfRange", "type": "error" }, { "inputs": [], "name": "ConsiderationLengthNotEqualToTotalOriginal", "type": "error" }, { "inputs": [{ "internalType": "uint256", "name": "orderIndex", "type": "uint256" }, { "internalType": "uint256", "name": "considerationIndex", "type": "uint256" }, { "internalType": "uint256", "name": "shortfallAmount", "type": "uint256" }], "name": "ConsiderationNotMet", "type": "error" }, { "inputs": [], "name": "CriteriaNotEnabledForItem", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256[]", "name": "identifiers", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }], "name": "ERC1155BatchTransferGenericFailure", "type": "error" }, { "inputs": [], "name": "InexactFraction", "type": "error" }, { "inputs": [], "name": "InsufficientNativeTokensSupplied", "type": "error" }, { "inputs": [], "name": "Invalid1155BatchTransferEncoding", "type": "error" }, { "inputs": [], "name": "InvalidBasicOrderParameterEncoding", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "conduit", "type": "address" }], "name": "InvalidCallToConduit", "type": "error" }, { "inputs": [{ "internalType": "bytes32", "name": "conduitKey", "type": "bytes32" }, { "internalType": "address", "name": "conduit", "type": "address" }], "name": "InvalidConduit", "type": "error" }, { "inputs": [{ "internalType": "bytes32", "name": "orderHash", "type": "bytes32" }], "name": "InvalidContractOrder", "type": "error" }, { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "InvalidERC721TransferAmount", "type": "error" }, { "inputs": [], "name": "InvalidFulfillmentComponentData", "type": "error" }, { "inputs": [{ "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "InvalidMsgValue", "type": "error" }, { "inputs": [], "name": "InvalidNativeOfferItem", "type": "error" }, { "inputs": [], "name": "InvalidProof", "type": "error" }, { "inputs": [{ "internalType": "bytes32", "name": "orderHash", "type": "bytes32" }], "name": "InvalidRestrictedOrder", "type": "error" }, { "inputs": [], "name": "InvalidSignature", "type": "error" }, { "inputs": [], "name": "InvalidSigner", "type": "error" }, { "inputs": [{ "internalType": "uint256", "name": "startTime", "type": "uint256" }, { "internalType": "uint256", "name": "endTime", "type": "uint256" }], "name": "InvalidTime", "type": "error" }, { "inputs": [{ "internalType": "uint256", "name": "fulfillmentIndex", "type": "uint256" }], "name": "MismatchedFulfillmentOfferAndConsiderationComponents", "type": "error" }, { "inputs": [{ "internalType": "enum Side", "name": "side", "type": "uint8" }], "name": "MissingFulfillmentComponentOnAggregation", "type": "error" }, { "inputs": [], "name": "MissingItemAmount", "type": "error" }, { "inputs": [], "name": "MissingOriginalConsiderationItems", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "NativeTokenTransferGenericFailure", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "NoContract", "type": "error" }, { "inputs": [], "name": "NoReentrantCalls", "type": "error" }, { "inputs": [], "name": "NoSpecifiedOrdersAvailable", "type": "error" }, { "inputs": [], "name": "OfferAndConsiderationRequiredOnFulfillment", "type": "error" }, { "inputs": [], "name": "OfferCriteriaResolverOutOfRange", "type": "error" }, { "inputs": [{ "internalType": "bytes32", "name": "orderHash", "type": "bytes32" }], "name": "OrderAlreadyFilled", "type": "error" }, { "inputs": [{ "internalType": "enum Side", "name": "side", "type": "uint8" }], "name": "OrderCriteriaResolverOutOfRange", "type": "error" }, { "inputs": [{ "internalType": "bytes32", "name": "orderHash", "type": "bytes32" }], "name": "OrderIsCancelled", "type": "error" }, { "inputs": [{ "internalType": "bytes32", "name": "orderHash", "type": "bytes32" }], "name": "OrderPartiallyFilled", "type": "error" }, { "inputs": [], "name": "PartialFillsNotEnabledForOrder", "type": "error" }, { "inputs": [], "name": "TStoreAlreadyActivated", "type": "error" }, { "inputs": [], "name": "TStoreNotSupported", "type": "error" }, { "inputs": [], "name": "TloadTestContractDeploymentFailed", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "identifier", "type": "uint256" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "TokenTransferGenericFailure", "type": "error" }, { "inputs": [{ "internalType": "uint256", "name": "orderIndex", "type": "uint256" }, { "internalType": "uint256", "name": "considerationIndex", "type": "uint256" }], "name": "UnresolvedConsiderationCriteria", "type": "error" }, { "inputs": [{ "internalType": "uint256", "name": "orderIndex", "type": "uint256" }, { "internalType": "uint256", "name": "offerIndex", "type": "uint256" }], "name": "UnresolvedOfferCriteria", "type": "error" }, { "inputs": [], "name": "UnusedItemParameters", "type": "error" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "newCounter", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "offerer", "type": "address" }], "name": "CounterIncremented", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "bytes32", "name": "orderHash", "type": "bytes32" }, { "indexed": true, "internalType": "address", "name": "offerer", "type": "address" }, { "indexed": true, "internalType": "address", "name": "zone", "type": "address" }], "name": "OrderCancelled", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "bytes32", "name": "orderHash", "type": "bytes32" }, { "indexed": true, "internalType": "address", "name": "offerer", "type": "address" }, { "indexed": true, "internalType": "address", "name": "zone", "type": "address" }, { "indexed": false, "internalType": "address", "name": "recipient", "type": "address" }, { "components": [{ "internalType": "enum ItemType", "name": "itemType", "type": "uint8" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "identifier", "type": "uint256" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "indexed": false, "internalType": "struct SpentItem[]", "name": "offer", "type": "tuple[]" }, { "components": [{ "internalType": "enum ItemType", "name": "itemType", "type": "uint8" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "identifier", "type": "uint256" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "address payable", "name": "recipient", "type": "address" }], "indexed": false, "internalType": "struct ReceivedItem[]", "name": "consideration", "type": "tuple[]" }], "name": "OrderFulfilled", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "bytes32", "name": "orderHash", "type": "bytes32" }, { "components": [{ "internalType": "address", "name": "offerer", "type": "address" }, { "internalType": "address", "name": "zone", "type": "address" }, { "components": [{ "internalType": "enum ItemType", "name": "itemType", "type": "uint8" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "identifierOrCriteria", "type": "uint256" }, { "internalType": "uint256", "name": "startAmount", "type": "uint256" }, { "internalType": "uint256", "name": "endAmount", "type": "uint256" }], "internalType": "struct OfferItem[]", "name": "offer", "type": "tuple[]" }, { "components": [{ "internalType": "enum ItemType", "name": "itemType", "type": "uint8" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "identifierOrCriteria", "type": "uint256" }, { "internalType": "uint256", "name": "startAmount", "type": "uint256" }, { "internalType": "uint256", "name": "endAmount", "type": "uint256" }, { "internalType": "address payable", "name": "recipient", "type": "address" }], "internalType": "struct ConsiderationItem[]", "name": "consideration", "type": "tuple[]" }, { "internalType": "enum OrderType", "name": "orderType", "type": "uint8" }, { "internalType": "uint256", "name": "startTime", "type": "uint256" }, { "internalType": "uint256", "name": "endTime", "type": "uint256" }, { "internalType": "bytes32", "name": "zoneHash", "type": "bytes32" }, { "internalType": "uint256", "name": "salt", "type": "uint256" }, { "internalType": "bytes32", "name": "conduitKey", "type": "bytes32" }, { "internalType": "uint256", "name": "totalOriginalConsiderationItems", "type": "uint256" }], "indexed": false, "internalType": "struct OrderParameters", "name": "orderParameters", "type": "tuple" }], "name": "OrderValidated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "bytes32[]", "name": "orderHashes", "type": "bytes32[]" }], "name": "OrdersMatched", "type": "event" }, { "inputs": [], "name": "__activateTstore", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "address", "name": "offerer", "type": "address" }, { "internalType": "address", "name": "zone", "type": "address" }, { "components": [{ "internalType": "enum ItemType", "name": "itemType", "type": "uint8" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "identifierOrCriteria", "type": "uint256" }, { "internalType": "uint256", "name": "startAmount", "type": "uint256" }, { "internalType": "uint256", "name": "endAmount", "type": "uint256" }], "internalType": "struct OfferItem[]", "name": "offer", "type": "tuple[]" }, { "components": [{ "internalType": "enum ItemType", "name": "itemType", "type": "uint8" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "identifierOrCriteria", "type": "uint256" }, { "internalType": "uint256", "name": "startAmount", "type": "uint256" }, { "internalType": "uint256", "name": "endAmount", "type": "uint256" }, { "internalType": "address payable", "name": "recipient", "type": "address" }], "internalType": "struct ConsiderationItem[]", "name": "consideration", "type": "tuple[]" }, { "internalType": "enum OrderType", "name": "orderType", "type": "uint8" }, { "internalType": "uint256", "name": "startTime", "type": "uint256" }, { "internalType": "uint256", "name": "endTime", "type": "uint256" }, { "internalType": "bytes32", "name": "zoneHash", "type": "bytes32" }, { "internalType": "uint256", "name": "salt", "type": "uint256" }, { "internalType": "bytes32", "name": "conduitKey", "type": "bytes32" }, { "internalType": "uint256", "name": "counter", "type": "uint256" }], "internalType": "struct OrderComponents[]", "name": "orders", "type": "tuple[]" }], "name": "cancel", "outputs": [{ "internalType": "bool", "name": "cancelled", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "components": [{ "components": [{ "internalType": "address", "name": "offerer", "type": "address" }, { "internalType": "address", "name": "zone", "type": "address" }, { "components": [{ "internalType": "enum ItemType", "name": "itemType", "type": "uint8" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "identifierOrCriteria", "type": "uint256" }, { "internalType": "uint256", "name": "startAmount", "type": "uint256" }, { "internalType": "uint256", "name": "endAmount", "type": "uint256" }], "internalType": "struct OfferItem[]", "name": "offer", "type": "tuple[]" }, { "components": [{ "internalType": "enum ItemType", "name": "itemType", "type": "uint8" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "identifierOrCriteria", "type": "uint256" }, { "internalType": "uint256", "name": "startAmount", "type": "uint256" }, { "internalType": "uint256", "name": "endAmount", "type": "uint256" }, { "internalType": "address payable", "name": "recipient", "type": "address" }], "internalType": "struct ConsiderationItem[]", "name": "consideration", "type": "tuple[]" }, { "internalType": "enum OrderType", "name": "orderType", "type": "uint8" }, { "internalType": "uint256", "name": "startTime", "type": "uint256" }, { "internalType": "uint256", "name": "endTime", "type": "uint256" }, { "internalType": "bytes32", "name": "zoneHash", "type": "bytes32" }, { "internalType": "uint256", "name": "salt", "type": "uint256" }, { "internalType": "bytes32", "name": "conduitKey", "type": "bytes32" }, { "internalType": "uint256", "name": "totalOriginalConsiderationItems", "type": "uint256" }], "internalType": "struct OrderParameters", "name": "parameters", "type": "tuple" }, { "internalType": "uint120", "name": "numerator", "type": "uint120" }, { "internalType": "uint120", "name": "denominator", "type": "uint120" }, { "internalType": "bytes", "name": "signature", "type": "bytes" }, { "internalType": "bytes", "name": "extraData", "type": "bytes" }], "internalType": "struct AdvancedOrder", "name": "", "type": "tuple" }, { "components": [{ "internalType": "uint256", "name": "orderIndex", "type": "uint256" }, { "internalType": "enum Side", "name": "side", "type": "uint8" }, { "internalType": "uint256", "name": "index", "type": "uint256" }, { "internalType": "uint256", "name": "identifier", "type": "uint256" }, { "internalType": "bytes32[]", "name": "criteriaProof", "type": "bytes32[]" }], "internalType": "struct CriteriaResolver[]", "name": "", "type": "tuple[]" }, { "internalType": "bytes32", "name": "fulfillerConduitKey", "type": "bytes32" }, { "internalType": "address", "name": "recipient", "type": "address" }], "name": "fulfillAdvancedOrder", "outputs": [{ "internalType": "bool", "name": "fulfilled", "type": "bool" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "components": [{ "components": [{ "internalType": "address", "name": "offerer", "type": "address" }, { "internalType": "address", "name": "zone", "type": "address" }, { "components": [{ "internalType": "enum ItemType", "name": "itemType", "type": "uint8" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "identifierOrCriteria", "type": "uint256" }, { "internalType": "uint256", "name": "startAmount", "type": "uint256" }, { "internalType": "uint256", "name": "endAmount", "type": "uint256" }], "internalType": "struct OfferItem[]", "name": "offer", "type": "tuple[]" }, { "components": [{ "internalType": "enum ItemType", "name": "itemType", "type": "uint8" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "identifierOrCriteria", "type": "uint256" }, { "internalType": "uint256", "name": "startAmount", "type": "uint256" }, { "internalType": "uint256", "name": "endAmount", "type": "uint256" }, { "internalType": "address payable", "name": "recipient", "type": "address" }], "internalType": "struct ConsiderationItem[]", "name": "consideration", "type": "tuple[]" }, { "internalType": "enum OrderType", "name": "orderType", "type": "uint8" }, { "internalType": "uint256", "name": "startTime", "type": "uint256" }, { "internalType": "uint256", "name": "endTime", "type": "uint256" }, { "internalType": "bytes32", "name": "zoneHash", "type": "bytes32" }, { "internalType": "uint256", "name": "salt", "type": "uint256" }, { "internalType": "bytes32", "name": "conduitKey", "type": "bytes32" }, { "internalType": "uint256", "name": "totalOriginalConsiderationItems", "type": "uint256" }], "internalType": "struct OrderParameters", "name": "parameters", "type": "tuple" }, { "internalType": "uint120", "name": "numerator", "type": "uint120" }, { "internalType": "uint120", "name": "denominator", "type": "uint120" }, { "internalType": "bytes", "name": "signature", "type": "bytes" }, { "internalType": "bytes", "name": "extraData", "type": "bytes" }], "internalType": "struct AdvancedOrder[]", "name": "", "type": "tuple[]" }, { "components": [{ "internalType": "uint256", "name": "orderIndex", "type": "uint256" }, { "internalType": "enum Side", "name": "side", "type": "uint8" }, { "internalType": "uint256", "name": "index", "type": "uint256" }, { "internalType": "uint256", "name": "identifier", "type": "uint256" }, { "internalType": "bytes32[]", "name": "criteriaProof", "type": "bytes32[]" }], "internalType": "struct CriteriaResolver[]", "name": "", "type": "tuple[]" }, { "components": [{ "internalType": "uint256", "name": "orderIndex", "type": "uint256" }, { "internalType": "uint256", "name": "itemIndex", "type": "uint256" }], "internalType": "struct FulfillmentComponent[][]", "name": "", "type": "tuple[][]" }, { "components": [{ "internalType": "uint256", "name": "orderIndex", "type": "uint256" }, { "internalType": "uint256", "name": "itemIndex", "type": "uint256" }], "internalType": "struct FulfillmentComponent[][]", "name": "", "type": "tuple[][]" }, { "internalType": "bytes32", "name": "fulfillerConduitKey", "type": "bytes32" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "maximumFulfilled", "type": "uint256" }], "name": "fulfillAvailableAdvancedOrders", "outputs": [{ "internalType": "bool[]", "name": "", "type": "bool[]" }, { "components": [{ "components": [{ "internalType": "enum ItemType", "name": "itemType", "type": "uint8" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "identifier", "type": "uint256" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "address payable", "name": "recipient", "type": "address" }], "internalType": "struct ReceivedItem", "name": "item", "type": "tuple" }, { "internalType": "address", "name": "offerer", "type": "address" }, { "internalType": "bytes32", "name": "conduitKey", "type": "bytes32" }], "internalType": "struct Execution[]", "name": "", "type": "tuple[]" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "components": [{ "components": [{ "internalType": "address", "name": "offerer", "type": "address" }, { "internalType": "address", "name": "zone", "type": "address" }, { "components": [{ "internalType": "enum ItemType", "name": "itemType", "type": "uint8" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "identifierOrCriteria", "type": "uint256" }, { "internalType": "uint256", "name": "startAmount", "type": "uint256" }, { "internalType": "uint256", "name": "endAmount", "type": "uint256" }], "internalType": "struct OfferItem[]", "name": "offer", "type": "tuple[]" }, { "components": [{ "internalType": "enum ItemType", "name": "itemType", "type": "uint8" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "identifierOrCriteria", "type": "uint256" }, { "internalType": "uint256", "name": "startAmount", "type": "uint256" }, { "internalType": "uint256", "name": "endAmount", "type": "uint256" }, { "internalType": "address payable", "name": "recipient", "type": "address" }], "internalType": "struct ConsiderationItem[]", "name": "consideration", "type": "tuple[]" }, { "internalType": "enum OrderType", "name": "orderType", "type": "uint8" }, { "internalType": "uint256", "name": "startTime", "type": "uint256" }, { "internalType": "uint256", "name": "endTime", "type": "uint256" }, { "internalType": "bytes32", "name": "zoneHash", "type": "bytes32" }, { "internalType": "uint256", "name": "salt", "type": "uint256" }, { "internalType": "bytes32", "name": "conduitKey", "type": "bytes32" }, { "internalType": "uint256", "name": "totalOriginalConsiderationItems", "type": "uint256" }], "internalType": "struct OrderParameters", "name": "parameters", "type": "tuple" }, { "internalType": "bytes", "name": "signature", "type": "bytes" }], "internalType": "struct Order[]", "name": "", "type": "tuple[]" }, { "components": [{ "internalType": "uint256", "name": "orderIndex", "type": "uint256" }, { "internalType": "uint256", "name": "itemIndex", "type": "uint256" }], "internalType": "struct FulfillmentComponent[][]", "name": "", "type": "tuple[][]" }, { "components": [{ "internalType": "uint256", "name": "orderIndex", "type": "uint256" }, { "internalType": "uint256", "name": "itemIndex", "type": "uint256" }], "internalType": "struct FulfillmentComponent[][]", "name": "", "type": "tuple[][]" }, { "internalType": "bytes32", "name": "fulfillerConduitKey", "type": "bytes32" }, { "internalType": "uint256", "name": "maximumFulfilled", "type": "uint256" }], "name": "fulfillAvailableOrders", "outputs": [{ "internalType": "bool[]", "name": "", "type": "bool[]" }, { "components": [{ "components": [{ "internalType": "enum ItemType", "name": "itemType", "type": "uint8" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "identifier", "type": "uint256" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "address payable", "name": "recipient", "type": "address" }], "internalType": "struct ReceivedItem", "name": "item", "type": "tuple" }, { "internalType": "address", "name": "offerer", "type": "address" }, { "internalType": "bytes32", "name": "conduitKey", "type": "bytes32" }], "internalType": "struct Execution[]", "name": "", "type": "tuple[]" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "address", "name": "considerationToken", "type": "address" }, { "internalType": "uint256", "name": "considerationIdentifier", "type": "uint256" }, { "internalType": "uint256", "name": "considerationAmount", "type": "uint256" }, { "internalType": "address payable", "name": "offerer", "type": "address" }, { "internalType": "address", "name": "zone", "type": "address" }, { "internalType": "address", "name": "offerToken", "type": "address" }, { "internalType": "uint256", "name": "offerIdentifier", "type": "uint256" }, { "internalType": "uint256", "name": "offerAmount", "type": "uint256" }, { "internalType": "enum BasicOrderType", "name": "basicOrderType", "type": "uint8" }, { "internalType": "uint256", "name": "startTime", "type": "uint256" }, { "internalType": "uint256", "name": "endTime", "type": "uint256" }, { "internalType": "bytes32", "name": "zoneHash", "type": "bytes32" }, { "internalType": "uint256", "name": "salt", "type": "uint256" }, { "internalType": "bytes32", "name": "offererConduitKey", "type": "bytes32" }, { "internalType": "bytes32", "name": "fulfillerConduitKey", "type": "bytes32" }, { "internalType": "uint256", "name": "totalOriginalAdditionalRecipients", "type": "uint256" }, { "components": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "address payable", "name": "recipient", "type": "address" }], "internalType": "struct AdditionalRecipient[]", "name": "additionalRecipients", "type": "tuple[]" }, { "internalType": "bytes", "name": "signature", "type": "bytes" }], "internalType": "struct BasicOrderParameters", "name": "", "type": "tuple" }], "name": "fulfillBasicOrder", "outputs": [{ "internalType": "bool", "name": "fulfilled", "type": "bool" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "address", "name": "considerationToken", "type": "address" }, { "internalType": "uint256", "name": "considerationIdentifier", "type": "uint256" }, { "internalType": "uint256", "name": "considerationAmount", "type": "uint256" }, { "internalType": "address payable", "name": "offerer", "type": "address" }, { "internalType": "address", "name": "zone", "type": "address" }, { "internalType": "address", "name": "offerToken", "type": "address" }, { "internalType": "uint256", "name": "offerIdentifier", "type": "uint256" }, { "internalType": "uint256", "name": "offerAmount", "type": "uint256" }, { "internalType": "enum BasicOrderType", "name": "basicOrderType", "type": "uint8" }, { "internalType": "uint256", "name": "startTime", "type": "uint256" }, { "internalType": "uint256", "name": "endTime", "type": "uint256" }, { "internalType": "bytes32", "name": "zoneHash", "type": "bytes32" }, { "internalType": "uint256", "name": "salt", "type": "uint256" }, { "internalType": "bytes32", "name": "offererConduitKey", "type": "bytes32" }, { "internalType": "bytes32", "name": "fulfillerConduitKey", "type": "bytes32" }, { "internalType": "uint256", "name": "totalOriginalAdditionalRecipients", "type": "uint256" }, { "components": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "address payable", "name": "recipient", "type": "address" }], "internalType": "struct AdditionalRecipient[]", "name": "additionalRecipients", "type": "tuple[]" }, { "internalType": "bytes", "name": "signature", "type": "bytes" }], "internalType": "struct BasicOrderParameters", "name": "", "type": "tuple" }], "name": "fulfillBasicOrder_efficient_6GL6yc", "outputs": [{ "internalType": "bool", "name": "fulfilled", "type": "bool" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "components": [{ "components": [{ "internalType": "address", "name": "offerer", "type": "address" }, { "internalType": "address", "name": "zone", "type": "address" }, { "components": [{ "internalType": "enum ItemType", "name": "itemType", "type": "uint8" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "identifierOrCriteria", "type": "uint256" }, { "internalType": "uint256", "name": "startAmount", "type": "uint256" }, { "internalType": "uint256", "name": "endAmount", "type": "uint256" }], "internalType": "struct OfferItem[]", "name": "offer", "type": "tuple[]" }, { "components": [{ "internalType": "enum ItemType", "name": "itemType", "type": "uint8" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "identifierOrCriteria", "type": "uint256" }, { "internalType": "uint256", "name": "startAmount", "type": "uint256" }, { "internalType": "uint256", "name": "endAmount", "type": "uint256" }, { "internalType": "address payable", "name": "recipient", "type": "address" }], "internalType": "struct ConsiderationItem[]", "name": "consideration", "type": "tuple[]" }, { "internalType": "enum OrderType", "name": "orderType", "type": "uint8" }, { "internalType": "uint256", "name": "startTime", "type": "uint256" }, { "internalType": "uint256", "name": "endTime", "type": "uint256" }, { "internalType": "bytes32", "name": "zoneHash", "type": "bytes32" }, { "internalType": "uint256", "name": "salt", "type": "uint256" }, { "internalType": "bytes32", "name": "conduitKey", "type": "bytes32" }, { "internalType": "uint256", "name": "totalOriginalConsiderationItems", "type": "uint256" }], "internalType": "struct OrderParameters", "name": "parameters", "type": "tuple" }, { "internalType": "bytes", "name": "signature", "type": "bytes" }], "internalType": "struct Order", "name": "", "type": "tuple" }, { "internalType": "bytes32", "name": "fulfillerConduitKey", "type": "bytes32" }], "name": "fulfillOrder", "outputs": [{ "internalType": "bool", "name": "fulfilled", "type": "bool" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "contractOfferer", "type": "address" }], "name": "getContractOffererNonce", "outputs": [{ "internalType": "uint256", "name": "nonce", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "offerer", "type": "address" }], "name": "getCounter", "outputs": [{ "internalType": "uint256", "name": "counter", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "address", "name": "offerer", "type": "address" }, { "internalType": "address", "name": "zone", "type": "address" }, { "components": [{ "internalType": "enum ItemType", "name": "itemType", "type": "uint8" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "identifierOrCriteria", "type": "uint256" }, { "internalType": "uint256", "name": "startAmount", "type": "uint256" }, { "internalType": "uint256", "name": "endAmount", "type": "uint256" }], "internalType": "struct OfferItem[]", "name": "offer", "type": "tuple[]" }, { "components": [{ "internalType": "enum ItemType", "name": "itemType", "type": "uint8" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "identifierOrCriteria", "type": "uint256" }, { "internalType": "uint256", "name": "startAmount", "type": "uint256" }, { "internalType": "uint256", "name": "endAmount", "type": "uint256" }, { "internalType": "address payable", "name": "recipient", "type": "address" }], "internalType": "struct ConsiderationItem[]", "name": "consideration", "type": "tuple[]" }, { "internalType": "enum OrderType", "name": "orderType", "type": "uint8" }, { "internalType": "uint256", "name": "startTime", "type": "uint256" }, { "internalType": "uint256", "name": "endTime", "type": "uint256" }, { "internalType": "bytes32", "name": "zoneHash", "type": "bytes32" }, { "internalType": "uint256", "name": "salt", "type": "uint256" }, { "internalType": "bytes32", "name": "conduitKey", "type": "bytes32" }, { "internalType": "uint256", "name": "counter", "type": "uint256" }], "internalType": "struct OrderComponents", "name": "", "type": "tuple" }], "name": "getOrderHash", "outputs": [{ "internalType": "bytes32", "name": "orderHash", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "bytes32", "name": "orderHash", "type": "bytes32" }], "name": "getOrderStatus", "outputs": [{ "internalType": "bool", "name": "isValidated", "type": "bool" }, { "internalType": "bool", "name": "isCancelled", "type": "bool" }, { "internalType": "uint256", "name": "totalFilled", "type": "uint256" }, { "internalType": "uint256", "name": "totalSize", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "incrementCounter", "outputs": [{ "internalType": "uint256", "name": "newCounter", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "information", "outputs": [{ "internalType": "string", "name": "version", "type": "string" }, { "internalType": "bytes32", "name": "domainSeparator", "type": "bytes32" }, { "internalType": "address", "name": "conduitController", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "components": [{ "components": [{ "internalType": "address", "name": "offerer", "type": "address" }, { "internalType": "address", "name": "zone", "type": "address" }, { "components": [{ "internalType": "enum ItemType", "name": "itemType", "type": "uint8" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "identifierOrCriteria", "type": "uint256" }, { "internalType": "uint256", "name": "startAmount", "type": "uint256" }, { "internalType": "uint256", "name": "endAmount", "type": "uint256" }], "internalType": "struct OfferItem[]", "name": "offer", "type": "tuple[]" }, { "components": [{ "internalType": "enum ItemType", "name": "itemType", "type": "uint8" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "identifierOrCriteria", "type": "uint256" }, { "internalType": "uint256", "name": "startAmount", "type": "uint256" }, { "internalType": "uint256", "name": "endAmount", "type": "uint256" }, { "internalType": "address payable", "name": "recipient", "type": "address" }], "internalType": "struct ConsiderationItem[]", "name": "consideration", "type": "tuple[]" }, { "internalType": "enum OrderType", "name": "orderType", "type": "uint8" }, { "internalType": "uint256", "name": "startTime", "type": "uint256" }, { "internalType": "uint256", "name": "endTime", "type": "uint256" }, { "internalType": "bytes32", "name": "zoneHash", "type": "bytes32" }, { "internalType": "uint256", "name": "salt", "type": "uint256" }, { "internalType": "bytes32", "name": "conduitKey", "type": "bytes32" }, { "internalType": "uint256", "name": "totalOriginalConsiderationItems", "type": "uint256" }], "internalType": "struct OrderParameters", "name": "parameters", "type": "tuple" }, { "internalType": "uint120", "name": "numerator", "type": "uint120" }, { "internalType": "uint120", "name": "denominator", "type": "uint120" }, { "internalType": "bytes", "name": "signature", "type": "bytes" }, { "internalType": "bytes", "name": "extraData", "type": "bytes" }], "internalType": "struct AdvancedOrder[]", "name": "", "type": "tuple[]" }, { "components": [{ "internalType": "uint256", "name": "orderIndex", "type": "uint256" }, { "internalType": "enum Side", "name": "side", "type": "uint8" }, { "internalType": "uint256", "name": "index", "type": "uint256" }, { "internalType": "uint256", "name": "identifier", "type": "uint256" }, { "internalType": "bytes32[]", "name": "criteriaProof", "type": "bytes32[]" }], "internalType": "struct CriteriaResolver[]", "name": "", "type": "tuple[]" }, { "components": [{ "components": [{ "internalType": "uint256", "name": "orderIndex", "type": "uint256" }, { "internalType": "uint256", "name": "itemIndex", "type": "uint256" }], "internalType": "struct FulfillmentComponent[]", "name": "offerComponents", "type": "tuple[]" }, { "components": [{ "internalType": "uint256", "name": "orderIndex", "type": "uint256" }, { "internalType": "uint256", "name": "itemIndex", "type": "uint256" }], "internalType": "struct FulfillmentComponent[]", "name": "considerationComponents", "type": "tuple[]" }], "internalType": "struct Fulfillment[]", "name": "", "type": "tuple[]" }, { "internalType": "address", "name": "recipient", "type": "address" }], "name": "matchAdvancedOrders", "outputs": [{ "components": [{ "components": [{ "internalType": "enum ItemType", "name": "itemType", "type": "uint8" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "identifier", "type": "uint256" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "address payable", "name": "recipient", "type": "address" }], "internalType": "struct ReceivedItem", "name": "item", "type": "tuple" }, { "internalType": "address", "name": "offerer", "type": "address" }, { "internalType": "bytes32", "name": "conduitKey", "type": "bytes32" }], "internalType": "struct Execution[]", "name": "", "type": "tuple[]" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "components": [{ "components": [{ "internalType": "address", "name": "offerer", "type": "address" }, { "internalType": "address", "name": "zone", "type": "address" }, { "components": [{ "internalType": "enum ItemType", "name": "itemType", "type": "uint8" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "identifierOrCriteria", "type": "uint256" }, { "internalType": "uint256", "name": "startAmount", "type": "uint256" }, { "internalType": "uint256", "name": "endAmount", "type": "uint256" }], "internalType": "struct OfferItem[]", "name": "offer", "type": "tuple[]" }, { "components": [{ "internalType": "enum ItemType", "name": "itemType", "type": "uint8" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "identifierOrCriteria", "type": "uint256" }, { "internalType": "uint256", "name": "startAmount", "type": "uint256" }, { "internalType": "uint256", "name": "endAmount", "type": "uint256" }, { "internalType": "address payable", "name": "recipient", "type": "address" }], "internalType": "struct ConsiderationItem[]", "name": "consideration", "type": "tuple[]" }, { "internalType": "enum OrderType", "name": "orderType", "type": "uint8" }, { "internalType": "uint256", "name": "startTime", "type": "uint256" }, { "internalType": "uint256", "name": "endTime", "type": "uint256" }, { "internalType": "bytes32", "name": "zoneHash", "type": "bytes32" }, { "internalType": "uint256", "name": "salt", "type": "uint256" }, { "internalType": "bytes32", "name": "conduitKey", "type": "bytes32" }, { "internalType": "uint256", "name": "totalOriginalConsiderationItems", "type": "uint256" }], "internalType": "struct OrderParameters", "name": "parameters", "type": "tuple" }, { "internalType": "bytes", "name": "signature", "type": "bytes" }], "internalType": "struct Order[]", "name": "", "type": "tuple[]" }, { "components": [{ "components": [{ "internalType": "uint256", "name": "orderIndex", "type": "uint256" }, { "internalType": "uint256", "name": "itemIndex", "type": "uint256" }], "internalType": "struct FulfillmentComponent[]", "name": "offerComponents", "type": "tuple[]" }, { "components": [{ "internalType": "uint256", "name": "orderIndex", "type": "uint256" }, { "internalType": "uint256", "name": "itemIndex", "type": "uint256" }], "internalType": "struct FulfillmentComponent[]", "name": "considerationComponents", "type": "tuple[]" }], "internalType": "struct Fulfillment[]", "name": "", "type": "tuple[]" }], "name": "matchOrders", "outputs": [{ "components": [{ "components": [{ "internalType": "enum ItemType", "name": "itemType", "type": "uint8" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "identifier", "type": "uint256" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "address payable", "name": "recipient", "type": "address" }], "internalType": "struct ReceivedItem", "name": "item", "type": "tuple" }, { "internalType": "address", "name": "offerer", "type": "address" }, { "internalType": "bytes32", "name": "conduitKey", "type": "bytes32" }], "internalType": "struct Execution[]", "name": "", "type": "tuple[]" }], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "pure", "type": "function" }, { "inputs": [{ "components": [{ "components": [{ "internalType": "address", "name": "offerer", "type": "address" }, { "internalType": "address", "name": "zone", "type": "address" }, { "components": [{ "internalType": "enum ItemType", "name": "itemType", "type": "uint8" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "identifierOrCriteria", "type": "uint256" }, { "internalType": "uint256", "name": "startAmount", "type": "uint256" }, { "internalType": "uint256", "name": "endAmount", "type": "uint256" }], "internalType": "struct OfferItem[]", "name": "offer", "type": "tuple[]" }, { "components": [{ "internalType": "enum ItemType", "name": "itemType", "type": "uint8" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "identifierOrCriteria", "type": "uint256" }, { "internalType": "uint256", "name": "startAmount", "type": "uint256" }, { "internalType": "uint256", "name": "endAmount", "type": "uint256" }, { "internalType": "address payable", "name": "recipient", "type": "address" }], "internalType": "struct ConsiderationItem[]", "name": "consideration", "type": "tuple[]" }, { "internalType": "enum OrderType", "name": "orderType", "type": "uint8" }, { "internalType": "uint256", "name": "startTime", "type": "uint256" }, { "internalType": "uint256", "name": "endTime", "type": "uint256" }, { "internalType": "bytes32", "name": "zoneHash", "type": "bytes32" }, { "internalType": "uint256", "name": "salt", "type": "uint256" }, { "internalType": "bytes32", "name": "conduitKey", "type": "bytes32" }, { "internalType": "uint256", "name": "totalOriginalConsiderationItems", "type": "uint256" }], "internalType": "struct OrderParameters", "name": "parameters", "type": "tuple" }, { "internalType": "bytes", "name": "signature", "type": "bytes" }], "internalType": "struct Order[]", "name": "", "type": "tuple[]" }], "name": "validate", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "stateMutability": "payable", "type": "receive" }
]

const ERC721_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
];

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
];

const URL = "https://data-api.nftgo.io";
const API_KEY = "REDACTED";

const fetchOSNFTData = async (tokenAddress, tokenId, chain) => {
  const assetsOptions = {
    method: "GET",
    url: `${URL}/${chain}/v1/nft/${tokenAddress}/${tokenId}/info`,
    headers: { accept: "application/json", "X-API-KEY": `${API_KEY}` },
  };

  try {
    const response = await axios.request(assetsOptions);
    return response.data;
  } catch (error) {
    console.error("axios err: " + error);
    return null;
  }
};

const parsedDocument = (name) => {
  const db = admin.firestore();
  const docRef = db.collection("parsed").doc(name);
  return docRef;
};



const findDocumentContainingProposalID = async (proposalId) => {
  const db = admin.firestore();
  const docs = await db
    .collection("parsed")
    .where("proposalId", "==", proposalId)
    .get();

  if (!docs.empty) return docs.docs[0];
  else {
    console.log("COULD NOT FIND DOCUMENT WITH PROPOSALID: " + proposalId);
    return null;
  }
};

const updateGlobalStatistics = async (tradeWorthUSD, tradeWorthETH, isPrivate) => {
  const docRef = db.collection("statistics").doc("trades");

  const data = {
    proposalPrivateCount: isPrivate ? admin.firestore.FieldValue.increment(1) : admin.firestore.FieldValue.increment(0),
    proposalCount: admin.firestore.FieldValue.increment(1),
    tradeWorthUSD: admin.firestore.FieldValue.increment(tradeWorthUSD),
    tradeWorthETH: admin.firestore.FieldValue.increment(tradeWorthETH),
  };

  await docRef.set(data, { merge: true });
}

const updateUsersStatistics = async (sender, tradeWorthUSD, tradeWorthETH) => {
  const senderDocRef = db.collection("users").doc(sender);

  const data = {
    proposalCount: admin.firestore.FieldValue.increment(1),
    tradeWorthUSD: admin.firestore.FieldValue.increment(tradeWorthUSD),
    tradeWorthETH: admin.firestore.FieldValue.increment(tradeWorthETH),
  };

  await senderDocRef.set(data, { merge: true });
}


//Remeber to firebase deploy after change
//SEPORT REWRITE WORK IN PROGRESS
exports.newAddProposal = functions.firestore
  .document(`moralis/txs/SeaportTest/{id}`)
  .onUpdate(async (snap) => {
    if (snap.after.data().parsed !== undefined && snap.after.data().parsed === "true") return;
    if (snap.after.data().confirmed === false) return;

    //Check if event function is run, and has passed needed data to already parsed document
    const hash = snap.after.data().hash;
    // if (!hash) return;

    //Only decode transactions, with hash ID's that aling with the ones in the parsed document
    //To ensure that the trade was made on our platform - could be removed in the future
    // const doc = await parsedDocument(hash).get();
    // if (!doc) return;

    const inputData = snap.after.data().input;
    const inputInterface = new Ethers.utils.Interface(seaportContractABI);

    var formattedInput = inputInterface.decodeFunctionData(
      "validate",
      inputData,
    );

    // const arr = formattedInput[0];
    // const outerParameters = formattedInput[2];

    const innerParameters = formattedInput[0][0].parameters;
    // const parseAttempt = JSON.parse(JSON.stringify(innerParameters)); Cannot convert an array value in an array value.
    const parseAttempt = JSON.stringify(innerParameters);

    console.log("params", innerParameters);
    console.log("objParseAttempt", parseAttempt);

    const offer = innerParameters.offer;
    console.log("offer", offer);

    return snap.after.ref.set(
      {
        rawInput: parseAttempt,
      },
      { merge: true }
    );

    // console.log(`-> NEW TRADE ${hash.slice(0, 4)}... -> ${isPrivate ? "PRIVATE" : "OPEN"}`);

  });
// exports.newAddProposal = functions.firestore
//   .document(`moralis/txs/Proposal/{id}`)
//   .onUpdate(async (snap) => {
//     if (snap.after.data().parsed === "true") return;
//     if (snap.after.data().confirmed === false) return;

//     //Check if event function is run, and has passed needed data to already parsed document
//     const hash = snap.after.data().hash;
//     if (!hash) return;

//     //Step to ensure that id is registed in db, to ensure it comes from website
//     //TODO

//     const doc = await parsedDocument(hash).get();
//     if (!doc) return;
//     const isPrivate = doc.data().proposalEmitName === "ProposalAdded"; // false == open

//     const inputData = snap.after.data().input;
//     var formattedInput;

//     if (isPrivate) {
//       const inputInterface = new Ethers.utils.Interface(swapperContractABI);
//       formattedInput = inputInterface.decodeFunctionData(
//         "addProposal",
//         inputData,
//       );
//     } else {
//       const inputInterface = new Ethers.utils.Interface(swapperContractABI);
//       formattedInput = inputInterface.decodeFunctionData(
//         "addOpenProposal",
//         inputData,
//       );
//     }

//     console.log(`-> NEW TRADE ${hash.slice(0, 4)}... -> ${isPrivate ? "PRIVATE" : "OPEN"}`);

//     const tradeReciver = isPrivate ? formattedInput[0].toLowerCase() : formattedInput[0] //Only true in private proposal funny enough;
//     const sendingArr = formattedInput[1];
//     const retrivingArr = formattedInput[2];
//     // const isOr = formattedInput[3]; Only uscase for open proposal

//     const experiery = isPrivate ? Ethers.BigNumber.from(formattedInput[3]).toNumber() : Ethers.BigNumber.from(formattedInput[0]).toNumber();
//     const chainId = snap.after.data().chainId;
//     const chainName = getChainNameFromId(chainId);

//     let sendingFormattedArr = [];
//     let retrivingFormattedArr = [];

//     let senderWorthUSD = 0;
//     let reciverWorthUSD = 0;
//     let senderWorhtETH = 0;
//     let reciverWorthETH = 0;
//     let tradeWorthUSD = 0;
//     let tradeWorthETH = 0;

//     const fetchCollectionData = async (e) => {
//       const collectionData = await fetchCollection(e, chainName);
//       if (collectionData !== null && collectionData.collections.length > 0) {
//         return collectionData.collections[0];
//       }
//       return null;
//     }

//     const fetchAndFormatData = async (e, isReciver) => {
//       const tokenType = Ethers.BigNumber.from(e[0]).toNumber();
//       const tokenAddr = e[1];
//       const tokenId = Ethers.BigNumber.from(e[2]).toNumber();

//       var nftData = undefined;
//       const nftDocName = `${tokenAddr}_${tokenId}`;
//       const nftDoc = db.collection("users").doc(isReciver ? tradeReciver : snap.after.data().fromAddress).collection("nfts").doc(nftDocName);
//       if (nftDoc.exists) {
//         nftData = nftDoc.data();
//       }

//       // Certenties
//       let tmp = {
//         tokenType: tokenType,
//         tokenAddr: tokenAddr,
//         tokenId: tokenId,
//       };

//       if (nftData && nftData !== undefined) {
//         tmp = {
//           name: nftData.name || nftData.collection_name,
//           image: nftData.image,
//         };

//         if (nftData.collection) tmp.collection = nftData.collection;
//         if (nftData.traits) tmp.traits = nftData.traits;
//         if (nftData.rarity) tmp.rarity = nftData.rarity;
//         if (nftData.collection.floor_price)
//           if (
//             nftData.collection.floor_price &&
//             nftData.collection.floor_price.usd
//           ) {
//             if (isReciver) {
//               reciverWorthUSD += nftData.collection.floor_price.usd;
//               reciverWorthETH += nftData.collection.floor_price.value;
//             }
//             if (!isReciver) {
//               senderWorthUSD += nftData.collection.floor_price.usd;
//               senderWorhtETH += nftData.collection.floor_price.value;
//             }
//             tradeWorthETH += nftData.collection.floor_price.value;
//             tradeWorthUSD += nftData.collection.floor_price.usd;

//             tmp.lastSale = {
//               worthUSD: nftData.collection.floor_price.usd,
//               worthETH: nftData.collection.floor_price.value,
//             };
//           }
//       } else {
//         const OSData = await fetchOSNFTData(tokenAddr, tokenId, chainName);

//         // Certenties
//         tmp = {
//           name: OSData.name || OSData.collection_name,
//           image_preview_url: OSData.image,
//         };

//         if (OSData.collection) tmp.collection = OSData.collection;
//         if (OSData.traits) tmp.traits = OSData.traits;
//         if (OSData.rarity) tmp.rarity = OSData.rarity;
//         if (OSData.lastSale) tmp.lastSale = OSData.lastSale;
//       }

//       return tmp;
//     };

//     if (sendingArr.length > 0) {
//       sendingFormattedArr = await Promise.all(
//         sendingArr.map(fetchAndFormatData, false),
//       );
//     }

//     if (retrivingArr.length > 0) {
//       retrivingFormattedArr = await Promise.all(
//         retrivingArr.map((item) => {
//           if (!isPrivate) {
//             return fetchCollectionData(item, chainName)
//           } else {
//             return fetchAndFormatData(item, true)
//           }
//         }),
//       );
//     }

//     const parsedDoc = parsedDocument(hash);

//     //Get user data
//     const senderData = await getUserDB(snap.after.data().fromAddress.toLowerCase());
//     var ReciverData
//     if (isPrivate) {
//       ReciverData = await getUserDB(tradeReciver);
//     }

//     await parsedDoc.set(
//       {
//         status: "open",
//         tradeSender: {
//           address: snap.after.data().fromAddress.toLowerCase(),
//           name: senderData ? senderData.name : null,
//           avatar: senderData ? senderData.avatar : null,
//         },
//         tradeReciver: isPrivate ? {
//           address: tradeReciver,
//           name: ReciverData ? ReciverData.name : null,
//           avatar: ReciverData ? ReciverData.avatar : null,
//         } : null,
//         experieryEpoch: experiery,
//         chainId: chainId,
//         sendingTokens: sendingFormattedArr,
//         wantingTokens: retrivingFormattedArr,
//         tradeWorthUSD: tradeWorthUSD,
//         tradeWorthETH: tradeWorthETH,
//         parsed: "true",
//       },
//       { merge: true },
//     );

//     await recivedProposalOffer(tradeReciver, hash);

//     await updateGlobalStatistics(tradeWorthUSD, tradeWorthETH, isPrivate);

//     // return snap.after.ref.set(
//     //   {
//     //     formatted: {
//     //       tradeReciver: tradeReciver,
//     //       sendingTokens: sendingFormattedArr,
//     //       experieryEpoch: experiery,
//     //     },
//     //   },
//     //   { merge: true }
//     // );
//   });

exports.getProposalEmitEvents = functions.firestore
  .document(`moralis/events/Proposal/{id}`)
  .onCreate(async (snap) => {
    const hash = snap.data().transactionHash;
    const proposalId = snap.data().proposalId;
    const proposalEmitName = snap.data().name;

    const db = admin.firestore();

    // Create a new document in a new collection
    const newCollectionRef = db.collection("parsed");
    const newDocRef = newCollectionRef.doc("" + hash + "");

    // Set data for the new document
    await newDocRef.set({
      status: "parsing",
      proposalId: proposalId,
      hash: hash,
      proposalEmitName: proposalEmitName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

exports.getProposalClearedOrFulfilled = functions.firestore
  .document(`moralis/events/Proposalclearorfulfilled/{id}`)
  .onUpdate(async (snap) => {
    snap.after.data().documentName;
    const isClosed = snap.after.data().name === "ProposalCleared";
    const isFulfilled = snap.after.data().name === "ProposalFulfilled";

    if (!isClosed && !isFulfilled) return;

    const proposalId = snap.after.data().proposalId;
    const document = await findDocumentContainingProposalID(proposalId);
    console.log("document: ", document);

    if (document) {
      document.ref.set(
        {
          parsed: "true",
          status: isClosed ? "closed" : "fulfilled",
        },
        { merge: true },
      );
    }

    //Delete snap docu
    snap.after.ref.delete();

    if (isFulfilled) {
      await updateUsersStatistics(document.tradeReciver, document.tradeWorthUSD, document.tradeWorthETH)
      await updateUsersStatistics(document.tradeSender, document.tradeWorthUSD, document.tradeWorthETH)
      await tradeAccepted(document.tradeReciver, document.documentName);
    }

    // //Move document to new collection
    // const db = admin.firestore();
    // const newCollectionRef = db.collection('historicalTrades');
    // const newDocRef = newCollectionRef.doc(doc.id);

    // doc.ref.get().then((doc) => {
    //   newDocRef.set(doc.data());

    //   //Delete old document
    //   doc.ref.delete();
    // });
  });

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
