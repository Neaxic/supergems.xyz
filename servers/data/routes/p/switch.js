const { isValidChain } = require("../../util/helpers");
const db = require("../../firebaseHelper");
const express = require("express");
const switchRouter = express.Router();

module.exports = function (router) {
    router.use("/switch", switchRouter);

    // //Return what chains have documents inside
    // switchRouter.get("/items/chains", async (req, res) => {
    //     try {
    //         const address = req.user.address.toString().trim().toLowerCase();
    //         const collectionsSnapshot = await db.collection("switch").doc("actual").collection("collections")
    //     } catch (error) {
    //         console.log(error);
    //         res
    //             .status(500)
    //             .json({ error: "An error occurred while fetching market data" });
    //     }
    // });

    //Return all documents from specific chain
    switchRouter.get("/items/:chain", async (req, res) => {
        try {
            const address = req.user.address.toString().trim().toLowerCase();
            const chain = req.params.chain.toString().trim();
            if (!isValidChain(chain)) return res.status(400).json({ error: "Invalid chain" });

            async function getNestedData(docRef) {
                const result = { data: (await docRef.get()).data() || {}, collections: [] };

                const collections = await docRef.listCollections();
                for (const collectionRef of collections) {
                    const collectionData = {
                        name: collectionRef.id,
                        documents: []
                    };

                    const docs = await collectionRef.get();
                    for (const doc of docs.docs) {
                        const nestedData = await getNestedData(doc.ref);
                        collectionData.documents.push({
                            id: doc.id,
                            ...nestedData
                        });
                    }

                    result.collections.push(collectionData);
                }

                return result;
            }

            function simplifyData(data) {
                const result = [];

                function processCollection(collection) {
                    const simplifiedCollection = {
                        name: collection.name,
                        tokens: []
                    };

                    for (const doc of collection.documents) {
                        if (doc.collections && doc.collections.length > 0) {
                            for (const nestedCollection of doc.collections) {
                                const processed = processCollection(nestedCollection);
                                simplifiedCollection.tokens.push(...processed.tokens);
                            }
                        } else {
                            // Assume this is an NFT document
                            simplifiedCollection.tokens.push({
                                id: doc.id,
                                ...doc.data
                            });
                        }
                    }

                    return simplifiedCollection;
                }

                for (const collection of data.collections) {
                    result.push(processCollection(collection));
                }

                return result;
            }

            const switchDocRef = db.collection("switch").doc("actual").collection("collections").doc(chain);
            const rawResult = await getNestedData(switchDocRef);
            const simplifiedResult = simplifyData(rawResult);
            const allTokens = simplifiedResult.flatMap(collection => collection.tokens);

            res.status(200).json(allTokens);
        } catch (error) {
            console.log(error);
            res
                .status(500)
                .json({ error: "An error occurred while fetching market data" });
        }
    });

    switchRouter.get("/items/:chain/:donater?", async (req, res) => {
        try {
            const address = req.user.address.toString().trim().toLowerCase();
            const chain = req.params.chain.toString().trim();
            const donater = req.params.donater ? req.params.donater.toString().trim().toLowerCase() : null;
            if (!isValidChain(chain)) return res.status(400).json({ error: "Invalid chain" });

            async function getDonaterTokens(docRef, donaterAddress) {
                const result = [];

                const collections = await docRef.listCollections();
                for (const collectionRef of collections) {
                    const query = collectionRef.where('donator', '==', donaterAddress);
                    const querySnapshot = await query.get();

                    for (const doc of querySnapshot.docs) {
                        result.push({
                            id: doc.id,
                            collectionName: collectionRef.id,
                            ...doc.data()
                        });

                        // Check for nested collections
                        const nestedCollections = await doc.ref.listCollections();
                        for (const nestedCollectionRef of nestedCollections) {
                            const nestedQuery = nestedCollectionRef.where('donator', '==', donaterAddress);
                            const nestedQuerySnapshot = await nestedQuery.get();

                            for (const nestedDoc of nestedQuerySnapshot.docs) {
                                result.push({
                                    id: nestedDoc.id,
                                    collectionName: `${collectionRef.id}/${nestedCollectionRef.id}`,
                                    ...nestedDoc.data()
                                });
                            }
                        }
                    }


                }

                return result;
            }

            const switchDocRef = db.collection("switch").doc("actual").collection("collections").doc(chain);

            let tokens;
            if (donater) {
                tokens = await getDonaterTokens(switchDocRef, donater);
            } else {
                // If no donater is specified, return an empty array or handle as needed
                tokens = [];
            }

            res.status(200).json(tokens);
        } catch (error) {
            console.log(error);
            res
                .status(500)
                .json({ error: "An error occurred while fetching market data" });
        }
    });

    switchRouter.get("/allowedCollections/:chain", async (req, res) => {
        try {
            const address = req.user.address.toString().trim().toLowerCase();
            const chain = req.params.chain.toString().trim();
            if (!isValidChain(chain)) return res.status(400).json({ error: "Invalid chain" });;

            const items = (await db.collection("switch").doc("actual").collection("allowedCollections").get()).docs.map((doc) => doc.data());
            const allTokens = items.flatMap(item => item.item);
            res.status(200).json(allTokens);
        } catch (error) {
            console.log(error);
            res
                .status(500)
                .json({ error: "An error occurred while fetching market data" });
        }
    });

    // Another one to search for street listings by address, nft, collection



    // Other protected routes...
};
