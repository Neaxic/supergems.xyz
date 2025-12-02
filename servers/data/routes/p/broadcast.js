const { isValidChain, isValidAddress } = require("../../util/helpers");
const { isCollectionENS, checkEns, shortenEnsTokenId } = require("../../util/ensHelpers");
const db = require("../../firebaseHelper");
const express = require("express");
const maxListnings = 15;
const broadcastRouter = express.Router();

module.exports = function (router) {
  router.use("/broadcast", broadcastRouter);

  broadcastRouter.post("/listing", async (req, res) => {
    try {
      const address = req.user.address.toString().trim().toLowerCase();
      const chain = req.query.chain.toString().trim();
      const items = req.body.items;

      if (!isValidAddress(address)) return res.status(400).json({ error: "Invalid address" });
      if (!isValidChain(chain)) return res.status(400).json({ error: "Invalid chain" });
      // Type ensure items {address: string, token:number, message:string}[]
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Invalid items not an array" });
      }
      if (!items.every((item) => typeof item === "object" && item.tokenAddress && item.token && item.message)) {
        return res.status(400).json({ error: "Invalid items not right types" });
      }
      if (items.length > maxListnings) {
        return res.status(400).json({ error: "Too many items" });
      }

      const userDoc = await db.collection("users").doc(address).get();

      // Get existing listings for this user
      const userListingsSnapshot = await db.collection("broadcasts")
        .doc(chain)
        .collection("broadcasts")
        .where("posterID", "==", address)
        .get();

      const userListings = userListingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // START PROCESSING
      let Items = [];
      const batch = db.batch();
      const processedItems = new Set();

      for (const item of items) {
        const tokenAddress = item.tokenAddress.toString().trim().toLowerCase();
        const isENS = isCollectionENS(tokenAddress);
        const tempToken = item.token.toString().trim().toLowerCase();
        const token = isENS ? shortenEnsTokenId(tempToken) : tempToken;

        if (!address || !token) {
          return res.status(400).json({ error: "Invalid items missing address or token" });
        }
        if (item.message.length > 1000) {
          return res.status(400).json({ error: "Message too long" });
        } else if (item.message.length < 1) {
          return res.status(400).json({ error: "Message too short" });
        } else if (item.message === "undefined") {
          return res.status(400).json({ error: "Invalid message" });
        }

        // Check if this item already exists in ANY user's listings
        const existingListingSnapshot = await db.collection("broadcasts")
          .doc(chain)
          .collection("broadcasts")
          .where("item.address", "==", tokenAddress)
          .where("item.tokenId", "==", token)
          .limit(1)
          .get();

        const nftCollectionDoc = await db.collection("items").doc(chain).collection("collections").doc(tokenAddress).get();
        const nftDoc = await db.collection("items").doc(chain).collection("collections").doc(tokenAddress).collection("nfts").doc(token).get();

        if (!nftCollectionDoc.exists || !nftDoc.exists) {
          return res.status(400).json({ error: `Item doesn't exist, contact admin. ID: 313. ${tokenAddress}, ${token}` });
        }

        const collectionData = nftCollectionDoc.data();
        const nftDocData = nftDoc.data();

        const Broadcast = {
          created: new Date().toISOString(),
          message: item.message,
          posterID: address,
          posterName: userDoc.data().name,
          // expiry: new Date().toISOString() + 86400000,
          item: {
            name: nftDocData.name,
            address: tokenAddress,
            tokenId: token,
            image: nftDocData.image,
            traits: nftDocData.traits,
          },
          floor: collectionData.floor_price ? {
            floor_price_eth: collectionData.floor_price.value,
            floor_price_usd: collectionData.floor_price.usd,
          } : {},
          rarity: nftDocData.rarity && nftDocData.rarity.rank ? {
              rank: nftDocData.rarity.rank,
              score: nftDocData.rarity.score,
          } : {},
          isBluechip: collectionData.is_blue_chip_coll || false,
          ensFilters: isCollectionENS(tokenAddress) ? checkEns(tokenAddress) : null,
        };

        Items.push(Broadcast);

        if (!existingListingSnapshot.empty) {
          // Update existing listing
          batch.update(db.collection("broadcasts").doc(chain).collection("broadcasts").doc(existingListingSnapshot.docs[0].id), Broadcast);
        } else {
          // Create a new listing
          const docRef = db.collection("broadcasts").doc(chain).collection("broadcasts").doc();
          batch.set(docRef, Broadcast);
        }
      }

      // Delete listings that are not in the current request
      const currentItemsMap = new Map(items.map(item => [`${item.tokenAddress}-${item.token}`, true]));

      for (const existingListing of userListings) {
        const key = `${existingListing.item.address}-${existingListing.item.tokenId}`;
        if (!currentItemsMap.has(key)) {
          batch.delete(db.collection("broadcasts").doc(chain).collection("broadcasts").doc(existingListing.id));
        }
      }

      await batch.commit();
      res.json({ items });
    } catch (e) {
      console.log(e);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  broadcastRouter.get("/my-listings", async (req, res) => {
    try {
      const address = req.user.address.toString().trim().toLowerCase();
      const chain = req.query.chain.toString().trim();

      if (!isValidAddress(address)) return res.status(400).json({ error: "Invalid address" });
      if (!isValidChain(chain)) return res.status(400).json({ error: "Invalid chain" });

      const broadcastsRef = db.collection("broadcasts").doc(chain).collection("broadcasts");
      const broadcasts = await broadcastsRef.where("posterID", "==", address).get();

      if (broadcasts.empty) {
        return res.json({ data: [] });
      }

      const data = await Promise.all(broadcasts.docs.map(async (doc) => {
        const docData = doc.data();
        const token = isCollectionENS(docData.item.address) ? shortenEnsTokenId(docData.item.tokenId) : docData.item.tokenId;
        const nftDocRef = db.collection("items").doc(chain).collection("collections").doc(docData.item.address).collection("nfts").doc(token);
        const nftDoc = await nftDocRef.get();

        if (!nftDoc.exists) {
          console.log`NFT document not found for address: ${docData.item.address} token: ${token}`;
          return null;
        }

        return { ...nftDoc.data(), message: docData.message };
      }));

      const filteredData = data.filter(item => item !== null);

      res.json({ data: filteredData });
    } catch (e) {
      console.error("Error in /my-listings:", e);
      res.status(500).json({ error: "Internal server error" });
    }
  });


  broadcastRouter.delete("/my-listing", async (req, res) => {
    try {
      const address = req.user.address.toString().trim().toLowerCase();
      const chain = req.query.chain.toString().trim();

      const itemAddress = req.body.itemAddress;
      const itemToken = req.body.itemToken;

      if (!isValidAddress(address)) return res.status(400).json({ error: "Invalid address" });
      if (!isValidChain(chain)) return res.status(400).json({ error: "Invalid chain" });

      // Get the document reference
      const docRef = db.collection("broadcasts").doc(chain).collection("broadcasts").where(item.address, "==", itemAddress).where(item.token, "==", itemToken);

      // Get the document
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Listing not found" });
      }

      // Check if the user owns this listing
      if (doc.data().posterID !== address) {
        return res.status(403).json({ error: "You don't have permission to delete this listing" });
      }

      // Delete the document
      await docRef.delete();

      res.json({ success: true, message: "Listing deleted successfully" });
    } catch (e) {
      console.log(e);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Other protected routes...
};
