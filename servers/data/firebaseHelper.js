// Firebase test
const admin = require("firebase-admin"); // Import Admin SDK
const appfd = admin.initializeApp();
const db = appfd.firestore();

module.exports = db;