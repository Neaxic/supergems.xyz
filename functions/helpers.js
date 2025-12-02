const axios = require("axios");

const URL = "https://data-api.nftgo.io";
const API_KEY = "REDACTED";

const getUserDB = async (db, address) => {
    const docRef = db.collection("users").doc(address);
    const doc = await docRef.get();
    if (doc.exists) {
        return doc.data();
    }
    return null;
};

const fetchCollection = async (collectionAddr, chainName) => {
    const assetsOptions = {
        method: "GET",
        url: `${URL}/${chainName}/v1/collection/?contract_address=${collectionAddr}`,
        headers: { accept: "application/json", "X-API-KEY": `${API_KEY}` },
    };

    try {
        const response = await axios.request(assetsOptions);
        return response.data;
    } catch (error) {
        console.error("axios err: " + error);
        return null;
    }
}

const fetchCollectionData = async (collectionAddr, chainName) => {
    const collectionData = await fetchCollection(collectionAddr, chainName);
    if (collectionData !== null && collectionData.collections.length > 0) {
        return collectionData.collections[0];
    }
    return null;
}

const fetchNFT = async (nftAddr, token, chainName) => {
    const assetsOptions = {
        method: "GET",

        url: `${URL}/${chainName}/v1/nft/${nftAddr}/${token}/info`,
        headers: { accept: "application/json", "X-API-KEY": `${API_KEY}` },
    };

    try {
        const response = await axios.request(assetsOptions);
        return response.data;
    } catch (error) {
        console.error("axios err: " + error);
        return null;
    }
}

const fetchNFTData = async (nftAddr, token, chainName) => {
    const nftData = await fetchNFT(nftAddr, token, chainName);
    if (nftData !== null) {
        return nftData;
    }
    return null;
}

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

module.exports = {
    getUserDB,
    fetchCollection,
    fetchCollectionData,
    fetchNFTData,
    getChainNameFromId,
};
