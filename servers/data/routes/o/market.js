const db = require("../../firebaseHelper");
const express = require("express");
const marketRouter = express.Router();
const { isValidChain, getChainIdFromName } = require("../../util/helpers");
const { getCollectionsRanking } = require("../../api/NFTGoAPI");
const _ = require('lodash');

module.exports = function (router) {
  var market = {};
  var marketFetched;

  router.use("/market", marketRouter);

  marketRouter.get("/", async (req, res) => {
    try {
      // const requestionAddress = req.user.address.toLowerCase();

      const keyword = req.query.keyword; // Accessing 'keyword' query parameter
      const chain = req.query.chain;
      const index = req.query.index; // Accessing 'index' query parameter
      const sortBy = req.query.sortBy; // Accessing 'sortBy' query parameter must be a field in the document
      const proposalType = req.query.proposalType; // Accessing 'proposalType' query parameter open / private
      const status = req.query.status; // Accessing 'status' query parameter closed / open / parsing
      const sender = req.query.sender; // Accessing 'sender' query parameter
      const receiver = req.query.receiver; // Accessing 'receiver' query parameter
      const bookmarked = req.query.bookmarked; // check users bookmarked hashs for proposalhash

      const limit = 25;

      // Helper function to check if a parameter is valid (not undefined and not an empty string)
      const isValidParam = (param) => param !== undefined && param.trim() !== '';

      // Validate chain parameter
      if (chain && (!isValidParam(chain) || !isValidChain(chain.toLowerCase()))) {
        return res.status(400).json({ error: "Invalid chain" });
      }

      let query = db.collection(`trades`).doc("public").collection("open");

      // Apply filters with additional validation
      if (chain) query = query.where("chainId", "==", getChainIdFromName(chain.toLowerCase()));

      // Validate and apply status filter
      if (status && isValidParam(status)) {
        query = query.where("tradeStatus", "==", status);
      } else if (!status) {
        // Exclude parsing proposals from the query unless status is given
        query = query.where("tradeStatus", "!=", "parsing");
      }

      // Validate and apply sender filter
      if (sender && isValidParam(sender)) {
        query = query.where("tradeSender", "==", sender);
      }

      // Validate and apply sortBy filter
      if (sortBy && isValidParam(sortBy)) {
        query = query.orderBy(sortBy, "desc");
      }

      // Validate and apply keyword filter
      if (keyword && isValidParam(keyword)) {
        query = query.where("searchableFields", "array-contains", keyword.toLowerCase());
      }

      // Additional validation for bookmarked (if needed)
      // if (bookmarked && isValidParam(bookmarked)) {
      //   const userBookmarks = await db.collection("users").doc(requestionAddress).get().bookmarks;
      //   if (userBookmarks && userBookmarks.length > 0) {
      //     //Document name is the proposal hash
      //     query = query.where("__name__", "in", userBookmarks);
      //   }
      // }

      //Get total amount that aligns with the query
      const total = (await query.get()).size;
      const pageCount = Math.ceil(total / limit);

      //Get proposals with another query where status === "parsing"
      let parsingQuery = db.collection(`parsed`).where("status", "==", "parsing");
      const parsingTotal = (await parsingQuery.get()).size;


      if (limit) query = query.limit(Number(limit));
      if (index) query = query.startAt(Number(index));

      const proposalsSnapshot = await query.get();
      const proposals = [];
      proposalsSnapshot.forEach((doc) => {
        const data = doc.data();
        const filteredData = _.omit(data, ["tradeData", "makerOrder"]);
        proposals.push({ ...filteredData, expiery: data.tradeData.orderComponents.endTime });
      });

      res.json({ proposals, pageCount: pageCount, total: parsingTotal });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "An error occurred while fetching proposals" });
    }
  });

  marketRouter.get("/:hash", async (req, res) => {
    try {
      const hash = req.params.hash.toString().trim();
      if (!hash) return res.status(400).json({ error: "Invalid hash" });

      const proposal = await db.collection("parsed").doc(hash).get();
      res.json({ proposal: proposal.data() });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "An error occurred while fetching proposal" });
    }
  });

  marketRouter.get("/ranking/:chain/collection", async (req, res) => {
    try {
      const chain = req.params.chain.toString().trim();

      if (!isValidChain(chain)) return res.status(400).json({ error: "Invalid chain" });;

      //Fetch marketdata if stored date is older than 1 hour
      if (
        marketFetched !== undefined ||
        marketFetched > new Date(new Date().getTime() - 60 * 60 * 1000)
      ) {
        res.json({ market });
      } else {
        console.log("refetch collection rank");
        const response = await getCollectionsRanking(chain);
        market = response;
        marketFetched = new Date();
        res.json({ market });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching market data" });
    }
  });





};
