const push = require("web-push");

const vapidKeys = {
    publicKey: process.env.PUSH_PUBLIC_KEY,
    privateKey: process.env.PUSH_PRIVATE_KEY
}

push.setVapidDetails('mailto:noone@gmail.com', vapidKeys.publicKey, vapidKeys.privateKey);

module.exports = push;