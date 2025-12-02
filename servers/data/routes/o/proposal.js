const { isValidChain, getChainIdFromName } = require("../../util/helpers");
const db = require("../../firebaseHelper");
const express = require("express");
const proposalRouterOpen = express.Router();

module.exports = function (router) {
    router.use("/proposal", proposalRouterOpen);

    // Middleware to set custom TTL for /recent - trades route
    proposalRouterOpen.use("/recent-trades", (req, res, next) => {
        req.customTTL = 3600; // Set TTL to 1 hour (3600 seconds)
        next();
    });

    //Paginated endpoint to get the list of NFTs
    //Some query params optional
    //Lookup relevant Doc Ids for updated data
    proposalRouterOpen.get("/recent-trades", async (req, res) => {
        try {
            var chain = req.query.chain?.toString().trim()
            if (chain !== undefined && !isValidChain(chain)) return res.status(400).json({ error: "Invalid chain" });
            else if (chain === undefined) chain = "all";

            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const offset = (page - 1) * limit;

            //Searchable fields / query parmas
            //Like ENS relevant searches

            var broadcasts
            if (chain === "all") {
                broadcasts = await db.collection("trades").doc("private").collection("closed")
                    .where("tradeStatus", "==", "completed")
                    .orderBy("tradeTimestamp", "desc")
                    .limit(limit)
                    .offset(offset)
                    .get();
            } else {
                broadcasts = await db.collection("trades").doc("private").collection("closed")
                    .where("tradeStatus", "==", "completed")
                    .where("chainId" === getChainIdFromName(chain))
                    .orderBy("tradeTimestamp", "desc")
                    .limit(limit)
                    .offset(offset)
                    .get();
            }
            const data = [];
            broadcasts.forEach((doc) => {
                //Sanitize data
                const docData = doc.data();
                const stripped = {
                    tradeId: docData.tradeId,
                    tradeTimestamp: docData.tradeTimestamp,
                    tradeReciverUser: docData.tradeReciverUser,
                    tradeSenderUser: docData.tradeSenderUser,
                    parsedOffer: docData.parsedOffer,
                    parsedConsideration: docData.parsedConsideration
                };

                data.push(stripped);
            });

            res.json({ limit, page, offset, trades: data });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    proposalRouterOpen.get("/seaport/trade/:tradeId", async (req, res) => {
        try {
            const tradeId = req.params.tradeId.toString().trim();

            let trade = undefined;
            trade = (await db.doc(`trades/private/open/${tradeId}`).get()).data();
            //Look for trade in both open and closed in private
            //But also look for trade in public both open or closed
            if (!trade) {
                trade = (await db.doc(`trades/private/closed/${tradeId}`).get()).data();
            }
            if (!trade) {
                trade = (await db.doc(`trades/public/open/${tradeId}`).get()).data();
            }
            if (!trade) {
                trade = (await db.doc(`trades/public/closed/${tradeId}`).get()).data();
            }

            //Remove sensitive signature data if not the reciver
            if (req.user !== undefined && (trade.tradeStatus !== "open" || (trade.tradeStatus === "open" && trade.tradeReciver !== req.user.address.toString().trim().toLowerCase()))) {
                const { tradeSignature, makerOrder, takerOrderComponents, ...rest } = trade;
                trade = rest;
            }
            res.send(trade);
        } catch (error) {
            console.error(error);
            res
                .status(500)
                .json({ error: "An error occurred while fetching trade" });
        }
    });

    //Queriable, searchable, filterable, paginated
    proposalRouterOpen.get("/seaport/public/trades", async (req, res) => {
        try {
            // Parse query parameters
            const limit = req.query.limit ? Number(req.query.limit) : 20;
            const lastVisibleId = req.query.lastVisibleId;
            const search = req.query.search;
            const sender = req.query.sender;

            // Define the collections to query
            const collections = ['public/open', 'public/closed'];
            let allTrades = [];

            for (const collection of collections) {
                // Start building the query for each collection
                let query = db.collection(`trades/${collection}`);

                // Apply filters
                if (sender) query = query.where("tradeSender", "==", sender);

                // Always order by a field
                query = query.orderBy("tradeTimestamp", "desc");

                // Execute query for each collection
                const tradesSnapshot = await query.get();
                tradesSnapshot.forEach((doc) => {
                    allTrades.push({ id: doc.id, ...doc.data(), collection });
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
            console.error("Error in /seaport/public/trades:", error);
            console.error("Error details:", error.message);
            res.status(500).json({ error: "An error occurred while fetching trades" });
        }
    });
    // Other protected routes...
};
