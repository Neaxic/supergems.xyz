const db = require("../../firebaseHelper");
const express = require("express");
const loaderRouter = express.Router();

module.exports = function (router) {
    router.use("/leaderboard", loaderRouter);

    const recalculateTime = 1000 * 60 * 60 * 2; // 2 hours
    const leaderbordCount = 10;

    const calculateRepLeader = async () => {
        const ReppedUserLeaderboard = await db.collection("users").orderBy("rep", "desc").limit(leaderbordCount).get();
        const leaderboard = ReppedUserLeaderboard.docs.map((doc, index) => {
            return {
                pos: index + 1,
                address: doc.id,
                name: doc.data().name,
                rep: doc.data().rep,
            };
        });

        return leaderboard;
    }

    const calculateTradeWorthAndCountLeader = async () => {
        const tradeWorthLeaderboard = await db.collection("users").orderBy("tradedWorthETH", "desc").limit(leaderbordCount).get();
        const leaderboard = tradeWorthLeaderboard.docs.map((doc, index) => {
            return {
                pos: index + 1,
                address: doc.id,
                name: doc.data().name,
                tradeCount: doc.data().tradeCount,
                tradedWorthETH: doc.data().tradedWorthETH,
            };
        });

        return leaderboard;
    }

    //Goto fb collection "statistics" and "leaderboard"
    //Look at time calculated, if time is older than recalculateTime, recalculate
    //Serve client the data from the collection
    loaderRouter.get("/", async (req, res) => {
        try {
            const leaderboard = await db.collection("statistics").doc("leaderboards").get();
            const data = leaderboard.data();
            if (data && data.calculatedTime > Date.now() - recalculateTime) {
                res.json(data);
                return;
            }

            const userCount = await db.collection("users").get().then((snapshot) => {
                return snapshot.size;
            });
            const repLeader = await calculateRepLeader();
            const tradeLeader = await calculateTradeWorthAndCountLeader();
            const calculatedTime = Date.now();
            const response = {
                userCount,
                repLeader,
                tradeLeader,
                calculatedTime
            }
            await db.collection("statistics").doc("leaderboards").set(response);
            res.json(response);
        } catch (error) {
            console.log(error);
            res
                .status(500)
                .json({ error: "An error occurred while fetching collection" });
        }
    });
};
