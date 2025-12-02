require('dotenv').config()

const router = require("express").Router();
const crypto = require('crypto');
const ethers = require('ethers');
const jwt = require('jsonwebtoken');
const db = require('../firebaseHelper');
const { domain: initialDomain, types, getSeaportAddressForChain } = require('../util/seaport');

// GET route to retrieve a nonce value for use in signing
router.get('/nonce', (req, res) => {
    // Generate a random 32-byte value to use as the nonce
    const nonce = crypto.randomBytes(32).toString('hex');
    // Return the nonce value as a JSON object in the response body
    res.json({ nonce });
});

const secretKey = process.env.JWT_SECRET;

router.post('/login', (req, res) => {
    const { signedMessage, message, address } = req.body;
    const recoveredAddress = ethers.verifyMessage(message, signedMessage);
    if (recoveredAddress !== address) {
        return res.status(401).json({ error: 'Invalid signature' });
    }

    // Generate the JWT token
    const token = jwt.sign({ address }, secretKey, { expiresIn: '1d' });
    // Send the JWT token to the frontend
    res.json(token);
});


// Endpoint for verifying the JWT token and logging in the user
router.post('/verify', (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify the JWT token
        const decoded = jwt.verify(token, secretKey);
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp < currentTime) {
            res.json("tokenExpired");
        } else {
            res.json("OK");
        }


    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
});


function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401); // if there isn't any token

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next(); // pass the execution off to whatever request the client intended
    });
}

async function authenticateAdmin(req, res, next) {
    const address = req.user.address.toLowerCase();
    const user = await db.doc(`users/${address}`).get();
    if (user.data().role === "ADMIN") {
        next();
    } else {
        res.sendStatus(403);
    }
}

async function authenticateSecret(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401); // if there isn't any token

    if (token === process.env.SECRET_TOKEN) {
        next();
    } else {
        res.sendStatus(403);
    }
}

async function computeSignatureAddress(orderObject, signature, chainId) {
    try {
        const domain = {
            ...initialDomain,
            chainId: chainId,
            verifyingContract: getSeaportAddressForChain(chainId)
        }
        // Compute the address of the seaport contract from the signature
        const messageHash = ethers.verifyTypedData(domain, types, orderObject, signature);

        // Recover the address from the signature
        // const recoveredAddress = ethers.verifyMessage(messageHash, signature);
        // console.log("recoveredAddress", recoveredAddress);

        return messageHash;
    } catch (error) {
        console.error('Error in verifySignature:', error);
        throw error;
    }
}

module.exports = {
    computeSignatureAddress
};

module.exports = router;
module.exports.authenticateToken = authenticateToken;
module.exports.authenticateAdmin = authenticateAdmin;
module.exports.authenticateSecret = authenticateSecret;
module.exports.computeSignatureAddress = computeSignatureAddress;