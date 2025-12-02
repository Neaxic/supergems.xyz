const db = require("../firebaseHelper");
const { shortenEnsTokenId, isCollectionENS } = require("./ensHelpers")
const timeInterval = 1000 * 60 * 5; //5 minutes
const timeIntervalNFT = 1000 * 60 * 60 * 24 * 7; //7 days

//Goal, take in an array of NFTs and store them in the database if they don't already exist, and update them if they do exist.
//This is a helper function used every time the NFTs are refreshed, and theres new data to store.
//The function should be able to handle multiple NFTs at once
//The database stucture is as follows:
//items (collection) -> {chain}(document) -> {addresss}(collection)(this also holds data relevant to the collection) 
//-> nfts(collection) -> {tokenID}(document)
//We presume its an NFTGO type of nfts array
const storeAndUpdateNFTS = async (chain, nfts) => {
    if (!chain || typeof chain !== 'string' || chain.trim() === '') {
        console.error("Invalid chain parameter");
        return false;
    }

    try {
        const currentTimestamp = new Date().getTime();
        const nftCollection = db.collection("items").doc(chain).collection("collections");
        const batch = db.batch();

        for (const nft of nfts) {
            const tokenAddress = nft.contract_address?.toString().trim().toLowerCase();
            const tempToken = nft.token_id.toString().trim().toLowerCase()
            const isENS = isCollectionENS(tokenAddress);
            const token = isENS ? shortenEnsTokenId(tempToken) : tempToken

            if (!tokenAddress || tokenAddress === '' || !token || token === "") {
                console.error("Invalid NFT data:", nft);
                console.error("isEns", isENS, "Token Address:", tokenAddress, "Token:", token);
                continue; // Skip this NFT and continue with the next one
            }

            const nftCollectionDoc = await nftCollection.doc(tokenAddress).get();
            if (!nftCollectionDoc.exists) {
                batch.set(nftCollection.doc(tokenAddress), { ...nft.collection, lastFetched: currentTimestamp });
            } else {
                const data = nftCollectionDoc.data();
                if (data.lastFetched < currentTimestamp - timeInterval) {
                    batch.update(nftCollection.doc(tokenAddress), { ...nft.collection, lastFetched: currentTimestamp });
                }
            }

            const nftDoc = await nftCollection.doc(tokenAddress).collection("nfts").doc(token.toString()).get();
            const nftNoCollection = { ...nft, collection: null };
            if (!nftDoc.exists) {
                batch.set(nftCollection.doc(tokenAddress).collection("nfts").doc(token.toString()), nftNoCollection);
            }
            // else {
            //     if (nftDoc.data().lastFetched < currentTimestamp - timeIntervalNFT) {
            //         batch.update(nftCollection.doc(tokenAddress).collection("nfts").doc(token.toString()), nftNoCollection);
            //     }
            // }
        }

        await batch.commit();
        return true;
    } catch (e) {
        console.error("Error in storeAndUpdateNFTS:", e);
        return false;
    }
}

const storeAndUpdateCollections = async (chain, collections) => {
    if (!chain || typeof chain !== 'string' || chain.trim() === '') {
        console.error("Invalid chain parameter");
        return false;
    }

    try {
        const currentTimestamp = new Date().getTime();
        const nftCollection = db.collection("items").doc(chain).collection("collections");
        const batch = db.batch();

        for (const collection of collections) {
            const tokenAddress = collection.contracts[0]?.toString().trim().toLowerCase();

            if (!tokenAddress || tokenAddress === '') {
                console.error("Invalid collection data:", collection);
                continue; // Skip this collection and continue with the next one
            }

            const nftCollectionDoc = await nftCollection.doc(tokenAddress).get();
            if (!nftCollectionDoc.exists) {
                batch.set(nftCollection.doc(tokenAddress), { ...collection, lastFetched: currentTimestamp });
            } else {
                const data = nftCollectionDoc.data();
                if (data.lastFetched < currentTimestamp - timeInterval) {
                    batch.update(nftCollection.doc(tokenAddress), { ...collection, lastFetched: currentTimestamp });
                }
            }
        }

        await batch.commit();
        return true;
    } catch (e) {
        console.error("Error in storeAndUpdateCollections:", e);
        return false;
    }
}

//Purpose is to extract only nesseacry data, and store it in the database
//We presume its an NFTGO type of nfts array
//We only need to safe the 

module.exports = {
    storeAndUpdateNFTS,
    storeAndUpdateCollections
}