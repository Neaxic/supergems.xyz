const db = require("../../firebaseHelper");
const express = require("express");
const notificationRouter = express.Router();

module.exports = function (router) {
    router.use("/notification", notificationRouter);

    notificationRouter.get("/subscription", async (req, res) => {
        try {
            const userAddress = req.user.address.toLowerCase();
            if (!userAddress) return res.status(400).json({ error: "Invalid address" });

            const doc = await db.collection("notifications").doc(userAddress).get();
            if (doc.exists) {
                let filteredWithoutPush = { ...doc.data(), push: undefined };
                res.status(200).json({ response: filteredWithoutPush });
            } else {
                res.status(200).json({ response: "No subscription found" });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "An error occurred while fetching proposal" });
        }
    });

    notificationRouter.post("/subscribe", async (req, res) => {
        try {
            const userAddress = req.user.address.toLowerCase();
            const key = req.body.key; //key also contains some data, like currency, createdate, ect. push val is the key in obj
            if (!userAddress) return res.status(400).json({ error: "Invalid address" });
            if (!key) return res.status(400).json({ error: "Invalid key" });

            console.log(key);

            await db.collection("notifications").doc(userAddress).set({ ...key });
            res.status(200).json({ response: "Subscribed" })
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "An error occurred while fetching proposal" });
        }
    });

    notificationRouter.post("/unsubscribe", async (req, res) => {
        try {
            const userAddress = req.user.address.toLowerCase();
            if (!userAddress) return res.status(400).json({ error: "Invalid address" });

            await db.collection("notifications").doc(userAddress).delete();
            res.status(200).json({ response: "Unsubscribed" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "An error occurred while fetching proposal" });
        }
    });

    notificationRouter.post("/updateSubscription", async (req, res) => {
        try {
            const userAddress = req.user.address.toLowerCase();
            const statsDaily = req.body.statsDaily;
            if (!userAddress) return res.status(400).json({ error: "Invalid address" });
            if (typeof statsDaily !== Boolean) return res.status(400).json({ error: "Invalid value" });

            await db.collection("notifications").doc(userAddress).set({ statsDaily }, { merge: true });
            res.status(200).json({ response: "Subscribed" })
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "An error occurred while fetching proposal" });
        }
    });




    // Other protected routes...
};
