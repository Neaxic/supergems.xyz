const db = require('../../../firebaseHelper');
const express = require('express');
const adminUserRouter = express.Router();

module.exports = function (router) {
    router.use('/user', adminUserRouter);

    adminUserRouter.post("/ban/:address", async (request, response) => {
        const address = request.params.address;
        await db.doc(`users/${address}`).update({ blacklist: true });
        response.send("OK");
    });

    adminUserRouter.post("/unban/:address", async (request, response) => {
        const address = request.params.address;
        await db.doc(`users/${address}`).update({ blacklist: false });
        response.send("OK");
    });
};