const db = require("../firebaseHelper");
const bluechips = require("../bluechips.json");

const isValidAddress = (address) => {
  if (address) {
    return address.length === 42 && address.substring(0, 2) === "0x";
  }
};

const isValidChain = (blockchainToValidate) => {
  switch (blockchainToValidate) {
    case "base":
      return true;
    case "ethereum":
      return true;
    case "polygon":
      return true;
    case "zora":
      return true;
    case "ethereum-sepolia":
      return true;
    default:
      return false;
  }
};

const isValidChainID = (blockchainToValidate) => {
  switch (blockchainToValidate) {
    case 1:
      return true;
    case 11155111:
      return true;
    case "sepolia":
      return true;
    case "polygon":
      return true;
    case "zora":
      return true;
    case "ethereum-sepolia":
      return true;
    default:
      return false;
  }
};

const updateUserLastTimeLoggedIn = (db, address) => {
  db.doc(`users/${address}`).get().then((doc) => {
    if (doc.exists) {
      db.doc(`users/${address}`).update({
        lastTimeLoggedInEpoch: Math.floor(new Date().getTime() / 1000)
      });
    }
  });
};

const getChainIdFromName = (chainName) => {
  switch (chainName) {
    case "base":
      return 0;
    case "ethereum":
      return 1;
    case "polygon":
      return 137;
    case "zora":
      return 31337;
    case "ethereum-sepolia":
      return 11155111;
    default:
      return null;
  }
};

const getChainNameFromId = (chainId) => {
  switch (chainId) {
    case 1:
      return "ethereum";
    case 11155111:
      return "ethereum-sepolia";
    case 56:
      return "bnb";
    case 8453:
      return "base";
    case 137:
      return "polygon";
    case 7777777:
      return "zora";
    default:
      return "ethereum";
  }
};

function isBluechip(address) {
  if (address) {
    // return bluechips.addresses.includes(address);
    // return bluechips.some((bluechip) => bluechip.address === address);
    return false;
  }
}

//Using old DB items structure
async function parseOrderObjectToTrade(address, chainName, orderObject) {
  let tmp = [];
  for (let i = 0; i < orderObject.length; i++) {
    const nftdoc = await db.collection("users").doc(address).collection("nfts").doc(chainName).collection("nfts").doc("" + orderObject[i].token.toString().toLowerCase() + "_" + orderObject[i].identifierOrCriteria).get();
    const nft = nftdoc.data();
    tmp.push(nft)
  }
  return tmp;
}

//Using new DB items structure
async function parseConsiderationCollectionsToTrade(chainname, orderObject) {
  let tmp = [];
  for (let i = 0; i < orderObject.length; i++) {
    const collectionDoc = await db.collection("items").doc(chainname).collection("collections").doc("" + orderObject[i].token.toString().toLowerCase()).get();
    const nft = collectionDoc.data();
    tmp.push(nft)
  }
  return tmp;
}

const getRarityLevel = (rank, total) => {
  if (rank >= total * 0.8) {
    return "Legendary";
  } else if (rank >= total * 0.6) {
    return "Epic";
  } else if (rank >= total * 0.4) {
    return "Rare";
  } else if (rank >= total * 0.2) {
    return "Uncommon";
  } else {
    return "Common";
  }
};

const shortenAddress = (address) => {
  return address.substring(0, 6) + "..." + address.substring(address.length - 4, address.length);
};

const tokenExsistsInDatabase = async (chain, address, token) => {
  const nft = await db.collection("items").doc(chain).collection("collections").doc(address).collection("nfts").doc(token).get();
  return nft.exists;
}

module.exports = {
  isValidChain,
  isValidChainID,
  isBluechip,
  getChainIdFromName,
  updateUserLastTimeLoggedIn,
  parseOrderObjectToTrade,
  getRarityLevel,
  shortenAddress,
  isValidAddress,
  tokenExsistsInDatabase,
  getChainNameFromId,
  parseConsiderationCollectionsToTrade
};
