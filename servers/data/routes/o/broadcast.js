const { isValidChain } = require("../../util/helpers");
const db = require("../../firebaseHelper");
const express = require("express");
const broadcastRouterOpen = express.Router();

module.exports = function (router) {
    router.use("/broadcast", broadcastRouterOpen);

    //Paginated endpoint to get the list of NFTs
    //Some query params optional
    //Lookup relevant Doc Ids for updated data
    broadcastRouterOpen.get("/listing", async (req, res) => {
        try {
            const chain = req.query.chain?.toString().trim() || "ethereum";
            if (!isValidChain(chain)) return res.status(400).json({ error: "Invalid chain" });

            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const offset = (page - 1) * limit;

            //Searchable fields / query parmas
            //Like ENS relevant searches

            const broadcasts = await db.collection("broadcasts").doc(chain).collection("broadcasts")
                .orderBy("created", "desc")
                .limit(limit)
                .offset(offset)
                .get();

            const broadcastsData = [];
            const collectionAddresses = [];
            for (const doc of broadcasts.docs) {
                let docData = doc.data();
                const existingCollection = collectionAddresses.find(e => e.address === docData.item.address.toLowerCase());
                if (existingCollection) {
                    broadcastsData.push({ ...docData, collection: existingCollection.collection });
                    continue;
                }
                let collectionDoc = await db.collection("items").doc(chain).collection("collections").doc(docData.item.address.toLowerCase()).get();
                let collectionData = collectionDoc.data();
                collectionAddresses.push({ address: docData.item.address.toLowerCase(), collection: collectionData });
                broadcastsData.push({ ...docData, collection: collectionData });
            }

            res.json({ broadcasts: broadcastsData });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    // Other protected routes...
};
