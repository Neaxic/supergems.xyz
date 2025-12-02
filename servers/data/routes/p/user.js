const auth = require("../auth"); // assuming auth.js is in the same directory
const db = require("../../firebaseHelper");
const express = require("express");
const userRouter = express.Router();
const { isValidChain, isBluechip, updateUserLastTimeLoggedIn, isValidAddress } = require("../../util/helpers");
const { fetchAvatar } = require("../../api/OpenseaAPI");
const { getNftsByOwner } = require("../../api/NFTGoAPI");
const { storeAndUpdateNFTS } = require("../../util/nftHelpers");
const admin = require("firebase-admin"); // Import Admin SDK

async function getUserDataFromAPIs(address, chain) {
  const osprofile = await fetchAvatar(address);
  //This is only the first 35 sorted by fp. if rest is needed in frontend, call from fronted to nftgo w. cursor
  const nfts = await getNftsByOwner(address, chain);

  return {
    osprofile,
    nfts,
  };
}

async function getUserNftsData(address, chain) {
  if (!isValidChain(chain)) {
    throw new Error("Invalid chain");
  }
  const apiData = await getUserDataFromAPIs(address, chain);
  const stats = caluclateNFTStats(apiData.nfts.assets);
  const nftsCallRaw = await getNftsByOwner(address, chain);
  const nfts = nftsCallRaw.assets.map((nft) => {
    return nft.nft;
  });

  const obj = {
    lastFetched: Math.floor(new Date().getTime() / 1000),
    nfts: nfts,
    stats: {
      bluechips: stats.bluechips,
      bluechipsCount: stats.bluechipsCount,
      worthETH: stats.worthETH,
      worthUSD: stats.worthUSD,
      nftcount: nftsCallRaw.total,
    },
  };
  return obj;
}

async function getLatestUserData(address, chain) {
  if (!isValidChain(chain)) {
    throw new Error("Invalid chain");
  }
  const apiData = await getUserDataFromAPIs(address, chain);
  const stats = caluclateNFTStats(apiData.nfts.assets);
  const nfts = apiData.nfts.assets.map((nft) => {
    return nft.nft;
  });

  const obj = {
    address,
    lastFetched: Math.floor(new Date().getTime() / 1000),
    name: apiData.osprofile.username || "Anonymous",
    nfts: nfts,
    stats: {
      bluechips: stats.bluechips,
      bluechipsCount: stats.bluechipsCount,
      worthETH: stats.worthETH,
      worthUSD: stats.worthUSD,
      nftcount: apiData.nfts.total,
    },
  };

  return obj;
}

function caluclateNFTStats(nfts) {
  let worthETH = 0;
  let worthUSD = 0;
  let bluechipsCount = 0;
  let bluechips = [];

  nfts.forEach((nft) => {
    if (isBluechip(nft.nft.contract_address)) {
      bluechipsCount++;
      bluechips.push({
        name: nft.nft.collection.name,
        address: nft.nft.contract_address,
        token: nft.nft.token_id,
      });
    }

    if (nft.nft.collection.floor_price) {
      worthETH += nft.nft.collection.floor_price.value;
      worthUSD += nft.nft.collection.floor_price.usd;
    }
  });
  return {
    worthETH,
    worthUSD,
    bluechipsCount,
    bluechips,
  };
}

module.exports = function (router) {
  router.use("/user", userRouter);

  // Middleware to set custom TTL for /recent - trades route
  router.use("/me/ethereum", (req, res, next) => {
    req.customTTL = 3600; // Set TTL to 1 hour (3600 seconds)
    next();
  });

  userRouter.get("/me/:chain", async (req, res) => {
    const address = req.user.address.toString().trim().toLowerCase();
    const chain = req.params.chain.toString().trim();

    updateUserLastTimeLoggedIn(db, address)
    if (!isValidChain(chain)) return res.status(400).json({ error: "Invalid chain" });;

    const user = await db.doc(`users/${address}`).get();
    const nfts = (await db.doc(`users/${address}`).collection("nfts").doc(chain).collection("nfts").get()).docs.map((doc) => doc.data());
    const nftStats = (await db.doc(`users/${address}`).collection("nfts").doc(chain).get()).data()?.statistics || null;
    res.send({ ...user.data(), nfts: nfts, stats: nftStats });
  });

  userRouter.get("/me/nfts/:chain", async (req, res) => {
    const address = req.user.address.toString().trim().toLowerCase();
    const chain = req.params.chain.toString().trim();

    if (!isValidChain(chain)) return res.status(400).json({ error: "Invalid chain" });;
    const nfts = (await db.doc(`users/${address}`).collection("nfts").doc(chain).collection("nfts").get()).docs.map((doc) => doc.data());
    const nftStats = (await db.doc(`users/${address}`).collection("nfts").doc(chain).get()).data().statistics;
    res.send({ nfts: nfts, stats: nftStats });
  });

  userRouter.post("/me/reload/:chain", async (req, res) => {
    try {
      const address = req.user.address.toString().trim().toLowerCase();
      const chain = req.params.chain.toString().trim();

      //Store some value indiating last fetch, and limit to only 1 fetch per 5 minutes
      const userRef = db.doc(`users/${address}`);
      const lastTimeFetched = userRef.collection("nfts").doc(chain).lastFetched;
      if (
        (lastTimeFetched !== undefined &&
          lastTimeFetched < Math.floor(new Date().getTime() / 1000) - 300) ||
        lastTimeFetched === undefined
      ) {
        if (isValidChain(chain)) {
          const data = await getLatestUserData(address, chain);
          await storeAndUpdateNFTS(chain, data.nfts)
          //Make new collection called "nfts", in that - make a document with the chain name if dosent exsist.
          //Then make a document with the user address, and store the nfts there.
          await userRef.collection("nfts").doc(chain).set({ lastFetched: Math.floor(new Date().getTime() / 1000), statistics: data.stats });
          //Make a new collection called "nfts" in the chain document, and make a document for each nft in data.nfts array
          for (let i = 0; i < data.nfts.length; i++) {
            const docName = `${data.nfts[i].contract_address}_${data.nfts[i].token_id}`;
            await userRef.collection("nfts").doc(chain).collection("nfts").doc(docName).set(data.nfts[i]);
          }
          // { [address]: data.nfts })
          db.doc(`users/${address}`).set(
            {
              name: data.name,
              address: address,
            }
            , { merge: true });
          res.json(data);
        } else {
          res.json({ error: "Invalid chain" });
        }
      } else {
        res.json({ error: "You can only fetch once every 5 minutes" });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching the user" });
    }
  });

  userRouter.post("/update", async (req, res) => {
    try {
      const address = req.user.address.toLowerCase();
      const { name } = req.body;
      //Type ensure name string
      if (!name || typeof name !== "string") return res.status(400).json({ error: "No name provided" });
      if (name.length > 50) return res.status(400).json({ error: "Name is too long" });
      if (name.length < 1) return res.status(400).json({ error: "Name is too short" });

      const user = await db.doc(`users/${address}`).update({ name });
      res.json({ user });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while updating the user" });
    }
  });

  //This gets the user data, and if the user has no nfts on the chain, it fetches them from the api
  userRouter.get("/get/:address/:chain", async (req, res) => {
    try {
      if (!req.params.address || req.params.address === undefined || typeof req.params.address !== "string") return res.status(400).json({ error: "No address provided" });
      if (!req.params.chain || req.params.address === undefined || typeof req.params.chain !== "string") return res.status(400).json({ error: "No chain provided" });
      if (!isValidChain(req.params.chain)) return res.status(400).json({ error: "Invalid chain" });
      if (!isValidAddress(req.params.address)) return res.status(400).json({ error: "Invalid address" });

      const address = req.params.address.toString().trim().toLowerCase();
      const chain = req.params.chain.toString().trim();
      if (!isValidChain(chain)) return res.status(400).json({ error: "Invalid chain" });;

      const userRef = db.doc(`users/${address}`);
      const user = (await userRef.get()).data();

      if (user !== undefined && user !== null && user.address !== undefined) {
        //Check if chainNFTS exsist at all even
        const doesExsist = (await db.doc(`users/${address}`).collection("nfts").doc(chain).get()).data();

        //User registed, no nft on chain yet / or not fetched yet
        if (doesExsist === undefined) {
          //Reload the user chain nfts
          const data = await getUserNftsData(address, chain);
          await storeAndUpdateNFTS(chain, data.nfts)

          //Make new collection called "nfts", in that - make a document with the chain name if dosent exsist.
          //Then make a document with the user address, and store the nfts there.
          await userRef.collection("nfts").doc(chain).set({ lastFetched: Math.floor(new Date().getTime() / 1000), statistics: data.stats });

          //Make a new collection called "nfts" in the chain document, and make a document for each nft in data.nfts array
          for (let i = 0; i < data.nfts.length; i++) {
            const docName = `${data.nfts[i].contract_address}_${data.nfts[i].token_id}`;
            await userRef.collection("nfts").doc(chain).collection("nfts").doc(docName).set(data.nfts[i]);
          }
        }

        var chainNFTs = (await db.doc(`users/${address}`).collection("nfts").doc(chain).collection("nfts").get()).docs.map((doc) => doc.data());
        var chainNFTsStats = (await db.doc(`users/${address}`).collection("nfts").doc(chain).get()).data().statistics;

        //Strip out various fields
        let strippedUser = {
          address: user.address.toLowerCase(),
          description: user.description,
          comments: user.comments,
          name: user.name,
          rep: user.rep,
          role: user.role,
          stats: chainNFTsStats,
          nfts: chainNFTs,
        };

        res.json(strippedUser);
      } else {
        const userNew = await getLatestUserData(address, chain);
        await storeAndUpdateNFTS(chain, userNew.nfts)
        if (userNew && userNew.address) {
          const userRef = db.doc(`users/${address}`);

          await userRef.collection("nfts").doc(chain).set({ lastFetched: Math.floor(new Date().getTime() / 1000), statistics: userNew.stats });
          //Make a new collection called "nfts" in the chain document, and make a document for each nft in data.nfts array
          for (let i = 0; i < userNew.nfts.length; i++) {
            const docName = `${userNew.nfts[i].contract_address}_${userNew.nfts[i].token_id}`;
            await userRef.collection("nfts").doc(chain).collection("nfts").doc(docName).set(userNew.nfts[i]);
          }
          await userRef.set(
            {
              name: userNew.name || "Anonymous",
              address: userNew.address.toLowerCase(),
            }, { merge: true }
          );

          res.json(userNew);
        } else {
          res.status(500).json({ error: "Could not populate new user data" });
        }
      }
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .json({ error: "An error occurred while fetching the user" });
    }
  });

  userRouter.get("/who/:address", async (req, res) => {
    try {
      const address = req.params.address.toString().trim().toLowerCase();
      const user = (await db.doc(`users/${address}`).get()).data();
      var openseaUser = await fetchAvatar(address);

      if (user) {
        if (!user.username || !user.avatar) {
          if (openseaUser && openseaUser.username) {
            const userNew = {
              address: address,
              avatar: openseaUser.profile_image_url,
              name: openseaUser.username,
            };
            await db.doc(`users/${address}`).update(userNew);
          }
        }

        let strippedUser = {
          address: address,
          avatar: user.avatar,
          name: user.name,
          rep: user.rep,
          role: user.role,
          stats: user.stats,
        };

        res.json(strippedUser);
      } else {
        //creating user, based on opensea data (that should be fetched)
        if (openseaUser && openseaUser.username) {
          const userNew = {
            address: address,
            avatar: openseaUser.profile_image_url,
            name: openseaUser.username,
            rep: 0,
            role: "UNREGISTED",
            stats: {},
          };
          await db.doc(`users/${address}`).set(userNew);
          res.json(userNew);
        } else {
          res.status(500).json({ error: "Could not populate new general user data" });
        }
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching the user" });
    }
  });

  //Works both with address or name
  //Should return 
  // {
  //  exactMatch: false,
  //  users: [user1, user2, user3, ...],
  // }
  // {
  //  exactMatch: true,
  //  users: [user1],
  // }
  userRouter.get("/search/:term", async (req, res) => {
    try {
      const term = req.params.term.toString().trim().toLowerCase();
      const usersRef = db.collection("users");

      // Query for exact matches
      const exactNameMatches = usersRef.where('name', '==', term).limit(1);
      const exactAddressMatches = usersRef.where('address', '==', term).limit(1);

      const [nameSnapshot, addressSnapshot] = await Promise.all([
        exactNameMatches.get(),
        exactAddressMatches.get()
      ]);

      if (!nameSnapshot.empty || !addressSnapshot.empty) {
        const users = [...nameSnapshot.docs, ...addressSnapshot.docs]
          .map(doc => doc.data());
        return res.json({ exactMatch: true, users });
      }

      // If no exact match, perform a prefix search
      const namePrefix = usersRef.where('name', '>=', term)
        .where('name', '<', term + '\uf8ff')
        .limit(5);
      const addressPrefix = usersRef.where('address', '>=', term)
        .where('address', '<', term + '\uf8ff')
        .limit(5);

      const [namePrefixSnapshot, addressPrefixSnapshot] = await Promise.all([
        namePrefix.get(),
        addressPrefix.get()
      ]);

      const users = [...namePrefixSnapshot.docs, ...addressPrefixSnapshot.docs]
        .map(doc => doc.data());

      res.json({ exactMatch: false, users });
    } catch (error) {
      console.error('Error searching for users:', error);
      res.status(500).json({ error: "An error occurred while searching for users" });
    }
  });

  userRouter.post("/rep/:address", async (req, res) => {
    try {
      const sender = req.user.address.toLowerCase();
      const address = req.params.address.toLowerCase();
      if (!address) return res.status(400).json({ error: "No address provided" });
      if (!sender) return res.status(400).json({ error: "No sender address provided" });
      if (sender === address) return res.status(400).json({ error: "You can't give rep to yourself" });

      const user = await db.doc(`users/${sender}`).get();
      const reciver = await db.doc(`users/${address}`).get();
      if (user.data().repsLeft !== undefined && user.data().repsLeft > 0) {
        await db
          .doc(`users/${address}`)
          .update({ rep: reciver.data().rep + 1 || 1 });
        await db
          .doc(`users/${sender}`)
          .update({ repsLeft: user.data().repsLeft - 1 });
        res.json("OK");
      } else {
        res.json("NO REPS LEFT");
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while giving rep" });
    }
  });

  userRouter.post("/comment/:address", async (req, res) => {
    try {
      const sender = req.user.address.toLowerCase();
      const address = req.params.address.toLowerCase();
      const { message } = req.body;

      if (!message || typeof message !== "string") return res.status(400).json({ error: "No message provided" });
      if (message.toString().trim().length > 200) return res.status(400).json({ error: "Message is too long" });
      if (message.toString().trim().length < 5) return res.status(400).json({ error: "Message is too short" });
      if (!address) return res.status(400).json({ error: "No address provided" });
      if (sender === address) return res.status(400).json({ error: "You can't comment yourself" });

      const userDoc = await db.doc(`users/${address}`).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: "User not found" });
      }

      const senderDoc = await db.doc(`users/${sender}`).get();
      if (!senderDoc.exists) {
        return res.status(404).json({ error: "Sender not found" });
      }

      const userData = userDoc.data();
      const comments = userData.comments || [];

      const comment = {
        address: sender,
        name: senderDoc.data().name || "Anonymous",
        message: message.toString().trim(),
        timestamp: Math.floor(new Date().getTime() / 1000),
      };

      comments.push(comment);

      // Update the document with the new comments array
      await db.doc(`users/${address}`).update({ comments: comments });
      res.status(200).json({ comments });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "An error occurred while countering trade" });
    }
  });

  userRouter.put("/description", async (req, res) => {
    try {
      const address = req.user.address.toLowerCase();
      const { description } = req.body;

      if (!description || typeof description !== "string") return res.status(400).json({ error: "No description provided" });
      if (description.toString().trim().length > 200) return res.status(400).json({ error: "Description is too long" });
      if (description.toString().trim().length < 5) return res.status(400).json({ error: "Description is too short" });

      await db.doc(`users/${address}`).update({ description: description });
      res.status(200).json({ description });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while updating the user" });
    }
  });

  userRouter.post("/caniask/:address", async (req, res) => {
    try {
      const sender = req.user.address.toLowerCase();
      const address = req.params.address.toLowerCase();
      const user = await db.doc(`users/${sender}`).get();
      const reciver = await db.doc(`users/${address}`).get();

      if (user.data().blacklisted !== true) {
        if (reciver.data().ignoreTradeReq !== true) {
          res.json("OK");
        } else {
          res.status(500).json({ error: "User is ignoring trade requests" });
        }
      } else {
        res.status(500).json({ error: "You are blacklisted" });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while checking asking status" });
    }
  });

  userRouter.post("/customData", async (req, res) => {
    try {
      const address = req.user.address.toLowerCase();
      const email = req.query.email;

      const user = await db.doc(`users/${address}`).update({ email: email });
      res.json({ user: user });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while updating the user" });
    }
  });

  userRouter.post("/register", async (req, res) => {
    try {
      //Since vercel
      const ipAddress = req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || "000.000.000";
      const address = req.user.address.toLowerCase();

      if (!address || address === undefined) return res.status(400).json({ error: "No address provided" });

      //Create user
      db.doc(`users/${address}`).set({
        address: address,
        avatar: "",
        name: "",
        rep: 0,
        ipAddress: ipAddress,
        lastTimeLoggedInEpoch: Math.floor(new Date().getTime() / 1000),
        role: "GUEST",
        stats: {},
        createDate: new Date(),
      });

      res.json("OK");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while registering user" });
    }
  })
  // Other protected routes...
};
