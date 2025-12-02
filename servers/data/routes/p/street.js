const { isBluechip, isValidChain } = require("../../util/helpers");
const { getCollectionsRanking } = require("../../api/NFTGoAPI");
const auth = require("../auth"); // assuming auth.js is in the same directory
const db = require("../../firebaseHelper");
const express = require("express");
const maxListnings = 3;
const streetRouter = express.Router();

module.exports = function (router) {
  router.use("/street", streetRouter);

  streetRouter.post("/set/:chain", async (req, res) => {
    try {
      const address = req.user.address.toString().trim().toLowerCase();
      const chain = req.params.chain.toString().trim();
      const { items } = req.body;

      if (!isValidChain(chain)) return res.status(400).json({ error: "Invalid chain" });;

      if (
        !items ||
        items === null ||
        items === undefined ||
        !Array.isArray(items) ||
        items.length > maxListnings
      )
        return res.status(403).json({ error: "Invalid items" });

      const user = (await db.doc(`users/${address}`).get()).data();
      if (user.blacklisted)
        return res.status(403).json({ error: "You are blacklisted" });

      const currentlyListedRef = db.doc(`street/${address}`);

      let tmp = [];
      for (let i = 0; i < items.length; i++) {
        if (
          ((((typeof items[i].address !== "string" ||
            items[i].address.toString().length < 1 ||
            items[i].address.toString().length > 100) &&
            typeof items[i].token !== "string") ||
            items[i].token.toString().length < 1 ||
            items[i].token.toString().length > 100) &&
            typeof items[i].description !== "string") ||
          items[i].description.toString().length > 100
        )
          return res.status(400).json({ error: "Invalid nft address" });

        const docName = `${items[i].address}_${items[i].token}`;
        const nftDoc = await db.doc(`users/${address}`).collection("nfts").doc(chain).collection("nfts").doc(docName).get();


        if (!nftDoc || !nftDoc.exists)
          return res.status(400).json({ error: "Nft not found in wallet" });

        const nft = nftDoc.data();
        const bluechip =
          nft.is_blue_chip_coll || isBluechip(nft.contract_address);

        tmp.push({
          ...items[i],
          ...nft,
          bluechip,
        });
      }
      if (tmp.length > 0) {
        currentlyListedRef.set({
          items: tmp,
          chain: chain,
          lastUpdated: Math.floor(new Date().getTime() / 1000),
        });
      } else {
        currentlyListedRef.delete();
      }
      res.status(200).json({ tmp });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching market data" });
    }
  });

  // Another one to search for street listings by address, nft, collection

  // Need sorting by rarity, bluechip, worthUSD
  streetRouter.get("/get", async (req, res) => {
    const pageSize = 10;

    const page = parseInt(req.query.page) || 1;

    //Sort dosent really work
    const sortBy = req.query.sortBy || "worthUSD";
    const order = req.query.order || "desc";

    try {
      // Return all documents inside collection, where document has items array w. length > 0
      let query = db.collection("street");

      // If this is not the first page, start after the last document of the previous page
      if (page > 1) {
        const lastDoc = await db
          .collection("street")
          .limit((page - 1) * pageSize)
          .get()
          .docs.pop();
        query = query.startAfter(lastDoc);
      }

      query = query.limit(pageSize);

      const street = await query.get();

      let tmp = [];
      street.forEach((doc) => {
        const data = doc.data();
        if (
          data.lastUpdated <
          Math.floor(new Date().getTime() / 1000) - 60 * 60 * 24 * 7
        ) {
          doc.ref.delete();
        } else {
          if (data.items.length > 0) {
            // Sort the items array by the sortBy field
            data.items.sort((a, b) => {
              if (order === "asc") {
                return a[sortBy] - b[sortBy];
              } else {
                return b[sortBy] - a[sortBy];
              }
            });
            tmp.push({ address: doc.id, data });
          }
        }
      });
      res.status(200).json(tmp);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching market data" });
    }
  });

  streetRouter.get("/get/me", async (req, res) => {
    try {
      const address = req.user.address;
      const currentlyListedRef = db.doc(`street/${address}`);
      const currentlyListed = (await currentlyListedRef.get()).data();
      if (currentlyListed) {
        res.json({ items: currentlyListed.items });
      } else {
        res.json({ items: [] });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching market data" });
    }
  });

  streetRouter.get("/get/:address", async (req, res) => {
    try {
      const address = req.params.address.toString().trim();
      const currentlyListedRef = db.doc(`street/${address}`);
      const currentlyListed = (await currentlyListedRef.get()).data();
      if (currentlyListed) {
        res.json({ items: currentlyListed.items });
      } else {
        res.json({ items: [] });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching market data" });
    }
  });

  // Other protected routes...
};
