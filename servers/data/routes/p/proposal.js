const auth = require("../auth"); // assuming auth.js is in the same directory
const db = require("../../firebaseHelper");
const express = require("express");
const proposalRouter = express.Router();
const crypto = require("crypto");
const { postCreateItemOffer } = require("../../api/OpenseaAPI");
const { parseOrderObjectToTrade, parseConsiderationCollectionsToTrade, shortenAddress, getRarityLevel, getChainNameFromId } = require("../../util/helpers");
const { sendNotificationToUser } = require("../../util/notification-helper");
const { createTakerOrderComponents, parseOrderComponentsForSeaportAPI } = require('../../util/seaport');

function generateId(length) {
  return crypto.randomBytes(length).toString("hex");
}

const handleCreateListing = async (orderObject, signature) => {
  try {
    const orderComponentsParsed = parseOrderComponentsForSeaportAPI(orderObject.orderComponents);
    const openseaResponse = await postCreateItemOffer(orderComponentsParsed, signature);
    console.log(openseaResponse);
    return openseaResponse;
  } catch (error) {
    console.error("Error creating listing:", error);
  }
};


module.exports = function (router) {
  router.use("/proposal", proposalRouter);

  proposalRouter.get("/seaport/checkOrder", async (req, res) => { });

  proposalRouter.post("/seaport/createListing", async (req, res) => {
    try {
      const address = req.user.address.toString().trim().toLowerCase();
      const user = await db.doc(`users/${address}`).get();

      const { orderObject, chainId, signature, message } = req.body;
      if (!orderObject || !signature || !chainId || typeof chainId !== "number") {
        return res.status(400).json({ error: "Missing parameters" });
      }

      // Verify signature
      const recoveredAddress = await auth.computeSignatureAddress(orderObject.orderComponents, signature, chainId);
      if (recoveredAddress.toString().trim().toLowerCase() !== address) {
        return res.status(401).json({ error: "Invalid signature, you are not who you say you are. (1/2)" });
      }

      // Prepare data for matchOrder
      const makerOrder = {
        orderComponents: orderObject.orderComponents,
        signature: signature
      };

      // Create a taker order components (unsigned) DEPRICATED
      // const takerOrderComponents = createTakerOrderComponents(reciverAddy, orderObject.orderComponents);

      //Update opensea also
      // const OSResponse = await handleCreateListing(orderObject, signature);
      // console.log("OSResponse", OSResponse);

      // Check orderobject for validity -----------------------------------------------------------------------
      // Checking for public/closed trade proposal ie. if its collection offer, or if its a single item offer
      const isPublicProposalType = orderObject.orderComponents.consideration[0].identifierOrCriteria === "0"

      // If isPublicProposalType false, then there shoudl be a reciverAddy
      if (!isPublicProposalType && !req.body.reciverAddy)
        return res.status(400).json({ error: "Missing reciver address" });

      const reciverAddyParsed = !isPublicProposalType ? reciverAddy.toString().trim().toLowerCase() : null;

      // - Fee check
      // - Date checks


      //getExtra data --------------------------------------------------------------------------------------
      const userDoc = user.data();
      const reciverUser = !isPublicProposalType ? await db.doc(`users/${reciverAddyParsed}`).get() : null;

      const parsedOffer = await parseOrderObjectToTrade(address, getChainNameFromId(chainId), orderObject.orderComponents.offer);
      const parsedConsideration =
        !isPublicProposalType ?
          await parseOrderObjectToTrade(reciverAddyParsed, getChainNameFromId(chainId), orderObject.orderComponents.consideration) :
          await parseConsiderationCollectionsToTrade(getChainNameFromId(chainId), orderObject.orderComponents.consideration);

      const tradeId = generateId(8);
      if (!isPublicProposalType)
        sendNotificationToUser("New Trade Proposal", "You recived a new trade proposal", `https://beta.supergems.xyz/d/marketplace/${tradeId}`, reciverAddyParsed);
      sendNotificationToUser("Trade Proposal Sent", "Your proposal was sent successfully", `https://beta.supergems.xyz/d/marketplace/${tradeId}`, address);

      //This works, and decent in idea, but not in practice
      //A very strict array struct should be used
      let searchableFields = [];
      let invlovesBluechip = false;
      let combinedFloorValueETH = 0;
      let combinedRarityScore = 0;

      function safeAccess(obj, ...props) {
        return props.reduce((acc, prop) =>
          (acc && acc[prop] !== undefined) ? acc[prop] : undefined, obj);
      }

      for (let i = 0; i < parsedOffer.length; i++) {
        const item = parsedOffer[i];
        if (safeAccess(item, 'collection', 'is_blue_chip_coll')) {
          invlovesBluechip = true;
        }
        if (safeAccess(item, 'rarity', 'score')) {
          combinedRarityScore += item.rarity.score;
        }
        combinedFloorValueETH += safeAccess(item, 'collection', 'floor_price', 'value') || 0;
        if (item.name) searchableFields.push(item.name.toLowerCase());
      }

      //We have to handle open / closed trades differently
      if (!isPublicProposalType) {

        for (let i = 0; i < parsedConsideration.length; i++) {
          const item = parsedConsideration[i];
          if (safeAccess(item, 'collection', 'is_blue_chip_coll')) {
            invlovesBluechip = true;
          }
          if (safeAccess(item, 'rarity', 'score')) {
            combinedRarityScore += item.rarity.score;
          }
          combinedFloorValueETH += safeAccess(item, 'collection', 'floor_price', 'value') || 0;
          if (item.name) searchableFields.push(item.name.toLowerCase());
        }
        searchableFields.push(getRarityLevel(combinedRarityScore, parsedOffer.length + parsedConsideration.length));
      } else {
        for (let i = 0; i < parsedConsideration.length; i++) {
          const item = parsedConsideration[i];
          if (safeAccess(item, 'is_blue_chip_coll')) {
            invlovesBluechip = true;
          }
          combinedFloorValueETH += safeAccess(item, 'floor_price', 'value') || 0;
          if (item.name) searchableFields.push(item.name.toLowerCase());
        }
      }
      searchableFields.push(invlovesBluechip ? "bluechip" : "non-bluechip");
      searchableFields.push(combinedFloorValueETH);

      //Store trade
      const trade = {
        tradeId: tradeId,
        tradeSender: address,
        tradeSenderUser: { address: address, name: userDoc.name, rep: userDoc.rep },
        parsedOffer: parsedOffer,
        parsedConsideration: parsedConsideration,
        tradeStatus: "open",
        tradePublicity: "public",
        tradeType: "seaport",
        tradeData: orderObject,
        chainId,
        chainName: getChainNameFromId(chainId),
        makerOrder,
        // takerOrderComponents,
        tradeSignature: signature, //Depricated as sig is also in makerOrder, which is only relevant for the taker
        searchableFields: searchableFields,
        message: message,
        tradeTimestamp: Math.floor(new Date().getTime() / 1000),
      };

      if (isPublicProposalType) {
        await db.doc(`trades/public/open/${tradeId}`).set(trade);
      } else {
        const additionalData = {
          ...trade,
          tradePublicity: "private",
          tradeReciver: reciverAddyParsed,
          tradeReciverUser: { address: reciverAddyParsed, name: reciverUser.data().name, rep: reciverUser.data().rep },
        }
        await db.doc(`trades/private/open/${tradeId}`).set(additionalData);
      }

      res
        .status(200)
        .json({ message: "Trade created", tradeId: tradeId });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while creating proposal" });
    }
  });

  //This also functions as a decline / cancel of trade
  proposalRouter.put("/seaport/trade/deny/:tradeId", async (req, res) => {
    try {
      const address = req.user.address.toString().trim().toLowerCase();
      const tradeId = req.params.tradeId.toString().trim();

      const trade = (await db.doc(`trades/private/open/${tradeId}`).get()).data();
      if (!trade) {
        return res.status(404).json({ error: "Trade not found" });
      }

      if (trade.tradeSender !== address && trade.tradeReciver !== address) {
        return res.status(401).json({ error: "Not authorized" });
      }

      const isReciver = trade.tradeReciver === address;
      const newTrade = { ...trade, tradeStatus: isReciver ? "denied" : "canceled" };

      //Move trade to closed
      await db.doc(`trades/private/closed/${tradeId}`).set(newTrade);
      await db.doc(`trades/private/open/${tradeId}`).delete();

      res.status(200).json({ newTrade });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "An error occurred while denying trade" });
    }
  });

  proposalRouter.put("/seaport/trade/:tradeId/accept", async (req, res) => {
    try {
      const address = req.user.address.toString().trim().toLowerCase();
      const tradeId = req.params.tradeId.toString().trim();

      const trade = (await db.doc(`trades/private/open/${tradeId}`).get()).data();

      if (!trade) {
        return res.status(404).json({ error: "Trade not found" });
      }

      if (trade.tradeReciver !== address) {
        return res.status(401).json({ error: "Not authorized" });
      }

      //Notification
      sendNotificationToUser(`Trade w. ${trade.tradeReciverUser.name || shortenAddress(trade.tradeReciverUser.address)} Accepted 🎊`, `${trade.parsedOffer[0].name} <-> ${trade.parsedConsideration[0].name}`, `https://beta.supergems.xyz/d/marketplace/${tradeId}`, trade.tradeSender);

      const newTrade = { ...trade, tradeStatus: "accepted" };

      //Move trade to closed
      await db.doc(`trades/private/closed/${tradeId}`).set(newTrade);
      await db.doc(`trades/private/open/${tradeId}`).delete();

      res.status(200).json({ newTrade });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "An error occurred while accepting trade" });
    }
  });

  proposalRouter.post("/seaport/trade/:tradeId/comment", async (req, res) => {
    try {
      const address = req.user.address.toString().trim().toLowerCase();
      const tradeId = req.params.tradeId.toString().trim();
      const { message } = req.body;

      const tradeDoc = await db.doc(`trades/private/open/${tradeId}`).get();
      if (!tradeDoc.exists) {
        return res.status(404).json({ error: "Trade not found" });
      }

      const tradeData = tradeDoc.data();
      const comments = tradeData.comments || [];

      if (comments.length > 10) {
        return res.status(400).json({ error: "Too many comments" });
      }

      const commentId = generateId(8);
      const comment = {
        address: address,
        message: message,
        timestamp: Math.floor(new Date().getTime() / 1000),
      };

      comments.push(comment);

      // Update the document with the new comments array
      await db.doc(`trades/private/open/${tradeId}`).update({
        comments: comments,
      });
      res.status(200).json({ comments });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "An error occurred while countering trade" });
    }
  });

  proposalRouter.put("/seaport/trade/private/:tradeId", async (req, res) => {
    try {
      const tradeId = req.params.tradeId.toString().trim();
      const address = req.user.address.toString().trim().toLowerCase();

      const trade = (await db.doc(`trades/private/open/${tradeId}`).get()).data();
      if (!trade) {
        return res.status(404).json({ error: "Trade not found" });
      }

      if (trade.tradeSender !== address) {
        return res.status(401).json({ error: "Not authorized" });
      }

      // const { tradeStatus, tradePublicity, message } = req.body;
      // if (!tradeStatus || !tradePublicity) {
      //   return res.status(400).json({ error: "Missing parameters" });
      // }

      res.status(200).json({ message: "Trade updated" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while updating trade" });
    }
  });

  proposalRouter.get("/seaport/private/trades", async (req, res) => {
    try {
      const address = req.user.address.toString().trim().toLowerCase();

      // Parse query parameters
      const lastVisibleId = req.query.lastVisibleId;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const search = req.query.search;
      const searchReceiverORsender = req.query.searchReceiverORsender;
      const isReceiver = req.query.isReceiver === 'true';

      // Define the collections to query
      const collections = ['private/open', 'private/closed'];
      let allTrades = [];

      for (const collection of collections) {
        // Start building the query for each collection
        let query = db.collection(`trades/${collection}`);

        // Apply filters
        if (isReceiver) {
          query = query.where("tradeReciver", "==", address);
        } else {
          query = query.where("tradeSender", "==", address);
        }

        if (searchReceiverORsender) {
          if (isReceiver) {
            query = query.where("tradeSender", "==", searchReceiverORsender);
          } else {
            query = query.where("tradeReciver", "==", searchReceiverORsender);
          }
        }

        // Always order by a field
        query = query.orderBy("tradeTimestamp", "desc");

        // Execute query for each collection
        const tradesSnapshot = await query.get();
        tradesSnapshot.forEach((doc) => {
          if (isReceiver) {
            const { tradeSignature, ...rest } = doc.data();
            allTrades.push({ id: doc.id, ...rest, collection });
          } else {
            allTrades.push({ id: doc.id, ...doc.data(), collection });
          }
        });
      }

      // Sort all trades by timestamp (descending)
      allTrades.sort((a, b) => b.tradeTimestamp - a.tradeTimestamp);

      // Apply pagination
      if (lastVisibleId) {
        const lastVisibleIndex = allTrades.findIndex(trade => trade.id === lastVisibleId);
        if (lastVisibleIndex !== -1) {
          allTrades = allTrades.slice(lastVisibleIndex + 1);
        }
      }

      // Apply search filter if specified
      if (search) {
        const lowerSearch = search.toLowerCase();
        allTrades = allTrades.filter(trade =>
          trade.tradeSender.toLowerCase().includes(lowerSearch) ||
          trade.tradeReciver.toLowerCase().includes(lowerSearch)
        );
      }

      // Apply limit
      const trades = allTrades.slice(0, limit);

      res.json({
        trades,
        lastVisibleId: trades.length > 0 ? trades[trades.length - 1].id : null
      });

    } catch (error) {
      console.error("Error in /seaport/private/trades:", error);
      console.error("Error details:", error.message);
      res.status(500).json({ error: "An error occurred while fetching trades" });
    }
  });

  // proposalRouter.post("/seaport/checkOnlineTrade", aynsc(req, res) => {
  //   //Should maybe be on socket? Or socket ask here?
  //   //Get signatures from both parties
  //   //Check signatures first for validity
  //   //Check that trade offer and consideration is reversed on both sides, & recipiant is correct



  //   // try {
  //   //   const { tradeId } = req.body;
  //   // }, catch(error) {
  //   //   console.error(error);
  //   // }
  // });

  proposalRouter.get("/:hash", async (req, res) => {
    try {
      const hash = req.params.hash.toString().trim();
      const proposalRef = db.doc(`parsed/${hash}`);
      const proposal = (await proposalRef.get()).data();
      const comments = (
        await proposalRef.collection("comments").get()
      ).docs.map((doc) => doc.data());

      res.send({ ...proposal, comments: comments });
    } catch (e) {
      console.log(e);
      res
        .status(500)
        .json({ error: "An error occurred while fetching the proposal" });
    }
  });

  proposalRouter.get("/:hash/comments", async (req, res) => {
    try {
      const hash = req.params.hash.toString().trim();
      const proposalRef = db.doc(`parsed/${hash}`);
      const comments = (
        await proposalRef.collection("comments").get()
      ).docs.map((doc) => doc.data());

      res.send(comments);
    } catch (e) {
      console.log(e);
      res.status(500).json({
        error: "An error occurred while fetching the proposal comments",
      });
    }
  });

  // This is a toggle function
  proposalRouter.post("/bookmark/:hash", async (req, res) => {
    try {
      const hash = req.params.hash.toString().trim();
      const address = req.user.address.toString().trim().toLowerCase();
      const user = await db.doc(`users/${address}`).get();
      let bookmarks = user.data().bookmarks;
      if (bookmarks !== undefined) {
        if (bookmarks.includes(hash))
          bookmarks.splice(bookmarks.indexOf(hash), 1);
        else bookmarks.push(hash);
      } else {
        bookmarks = [hash];
      }

      await db.doc(`users/${address}`).update({ bookmarks });
      res.json("OK");
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while bookmarking proposal" });
    }
  });

  proposalRouter.post("/close/:hash", async (req, res) => {
    try {
      const hash = req.params.hash.toString().trim();
      const address = req.user.address.toString().trim().toLowerCase();
      console.log(hash, address);
      const proposal = (await db.doc(`parsed/${hash}`).get()).data();
      console.log(proposal);
      if (
        (address === proposal.tradeSender ||
          address === proposal.tradeReciver) &&
        proposal.status === "open"
      ) {
        await db.doc(`parsed/${hash}`).update({ status: "closing" });
        res.json("OK");
      } else {
        res.json("Not authorized, or proposal is not open");
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while closing proposal" });
    }
  });

  proposalRouter.post("/fufill/:hash", async (req, res) => {
    try {
      const hash = req.params.hash.toString().trim();
      const address = req.user.address.toString().trim().toLowerCase();
      const proposal = await db.doc(`parsed/${hash}`).get();
      if (
        address === proposal.data().tradeReciver &&
        proposal.data().status === "open"
      ) {
        await db.doc(`parsed/${hash}`).update({ status: "fulfilling" });
        res.json("OK");
      } else {
        res.json("Not authorized, or proposal is not open");
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while fulfilling proposal" });
    }
  });

  proposalRouter.post("/comment", async (req, response) => {
    const { hash, comment } = req.body;
    const address = req.user.address.toLowerCase();
    const user = await db
      .doc(`users/${address}`)
      .get()
      .then((doc) => {
        return doc.data();
      });

    //not the smartes way to do that, but saves database reads
    //not reflecting changes in user data
    db.doc(`parsed/${hash}/comments/${generateId(8)}`).set({
      user: {
        address: address,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        rep: user.rep,
      },
      message: comment,
      timestamp: Math.floor(new Date().getTime() / 1000),
    });

    response.send("OK");
  });


  proposalRouter.get("/dev/trades", async (req, res) => {
    try {
      const trades = (
        await db.collection("moralis").doc("txs").collection("SeaportTest").get()
      ).docs.map((doc) => doc.data());

      res.send(trades);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while closing proposal" });
    }
  });

  // Other protected routes...
};
