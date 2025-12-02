const db = require("../../firebaseHelper");
const { getCollectionByName } = require("../../api/NFTGoAPI");
const express = require("express");
const collectionRouter = express.Router();

module.exports = function (router) {
  router.use("/collection", collectionRouter);

  collectionRouter.use("/name/:keyword", (req, res, next) => {
    req.customTTL = 86400; // Set TTL to 1 day (86400 seconds)
    next();
  });

  //Only works for mainnet currently
  collectionRouter.get("/name/:keyword", async (req, res) => {
    try {
      const keyword = req.params.keyword.toString().trim().toLowerCase();
      if (!keyword) {
        res.status(400).json({ error: "Please provide a keyword" });
        return
      }

      //Lookup the collection by name in DB first, this is a search endpoint, so the name dosenth ave to be exact
      const collectionDoc = await db.collection("items").doc("ethereum").collection("collections")
        .where('name', '>=', keyword)
        .where('name', '<=', keyword + '\uf8ff')
        .get();
      if (!collectionDoc.empty) {
        let collections = [];
        collectionDoc.forEach(doc => {
          collections.push(doc.data());
        });
        res.json({ collection: { collections: collections }, fromDb: true });
        return;
      }

      const response = await getCollectionByName(keyword);

      //Save the response collections into DB / update the existing ones
      //Do not change the nfts / documents inside, only the fields in that collection
      if (true) {
        for (let index = 0; index < response.collections.length; index++) {
          const element = response.collections[index];
          const collectionDoc = await db.collection("items").doc("ethereum").collection("collections").doc(element.contracts[0].toLowerCase()).get();
          const lastFetched = new Date().getTime();

          //NOTE: we have to specify the blockchain, cause the string is diffrend on this api call. Its "ETH" insted of the rest "ethereum"
          if (collectionDoc.exists) {
            await db.collection("items").doc("ethereum").collection("collections").doc(element.contracts[0].toLowerCase()).update({ ...element, lastFetched, blockchain: "ethereum" });
          } else {
            await db.collection("items").doc("ethereum").collection("collections").doc(element.contracts[0].toLowerCase()).set({ ...element, lastFetched, blockchain: "ethereum" });
          }
        }
      }

      // We could cache the results here..
      res.json({ collection: response });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching collection" });
    }
  });
};
