const db = require('../../../firebaseHelper');
const express = require('express');
const statisticsRouter = express.Router();


module.exports = function (router) {
    router.use('/statistics', statisticsRouter);

    statisticsRouter.get('/userCount', async (req, res) => {
        try {
            const snapshot = await db.collection('users').get();
            res.json({ count: snapshot.size });
        } catch (error) {
            console.log(error);
            res
                .status(500)
                .json({ error: "An error occurred while fetching usercount statistics" });
        }
    });

    // Other protected routes...
};