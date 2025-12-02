const { getCollectionByName, fetchAvgPriceChart, fetchFloorPriceChart } = require("../../api/NFTGoAPI");
const { isValidChain, isValidAddress } = require("../../util/helpers");
const collectionRouter = require("express").Router();

//Cached data
let collections = [];
let collectionsCharts = [];
let cacheTime = 3600 * 2;

module.exports = function (router) {
    router.use("/collection", collectionRouter);

    router.get('/data', async (req, res) => {
        try {
            const currentTimeStamp = Math.floor(Date.now() / 1000);
            const collectionAddress = req.query.collectionAddress.toString().trim();
            const chain = req.query.chain.toString().trim();

            if (isValidChain(chain) === false) return res.status(400).json({ error: "Invalid chain" });
            if (isValidAddress(collectionAddress) === false) return res.status(400).json({ error: "Invalid collection address" });

            // Check if we have the collection in cache and if it's not older than 1 hour
            const cachedCollection = collections.find(collection => collection.contracts[0] === collectionAddress);
            if (cachedCollection && (currentTimeStamp - cachedCollection.timestamp) < cacheTime) {
                return res.json({ collection: cachedCollection.collection });
            }

            const storedCollection = db.collection("items").doc(chain).collection("collections").doc(collectionAddress);
            var collection = await storedCollection.get();
            if (!collection.exists) {
                const response = await getCollectionByName(collectionAddress);
                collection = response.collections[0];
                storeAndUpdateCollections(chain, [collection]);
            }

            const collectionWithTimestamp = { collection: collection, timestamp: currentTimeStamp };
            collections.push(collectionWithTimestamp);

            // We could cache the results here..
            res.json({ collection: collection });
        } catch (error) {
            console.log(error);
            res
                .status(500)
                .json({ error: "An error occurred while fetching collection" });
        }
    });

    router.get('/stats/:collectionName', async (req, res) => {
        try {
            const currentTimeStamp = Math.floor(Date.now() / 1000);
            const collectionName = req.params.collectionName.toString().trim();

            // Check if we have the collection in cache and if it's not older than 1 hour
            const cachedCollection = collections.find(collection => collection.collection.slug === collectionName);
            if (cachedCollection && (currentTimeStamp - cachedCollection.timestamp) < cacheTime) {
                return res.json({ collection: cachedCollection.collection });
            }

            if (collectionName === '') return res.status(400).json({ error: "Invalid collection name" });
            if (collectionName !== "hape-prime") return res.status(404).json({ error: "Collection not found" });

            const response = await getCollectionByName(collectionName);
            const collection = { collection: response.collections[0], timestamp: currentTimeStamp };
            collections.push(collection);

            // We could cache the results here..
            res.json({ collection: response.collections[0] });
        } catch (error) {
            console.log(error);
            res
                .status(500)
                .json({ error: "An error occurred while fetching collection" });
        }
    });

    router.get('/charts/:address', async (req, res) => {
        try {
            const currentTimeStamp = Math.floor(Date.now() / 1000);
            const address = req.params.address.toString().trim();

            // Check if we have the collection in cache and if it's not older than 1 hour * 5
            const cachedCollection = collectionsCharts.find(collection => collection.address === address);
            if (cachedCollection && (currentTimeStamp - cachedCollection.timestamp) < cacheTime) {
                return res.json(cachedCollection);
            }

            if (address === '') return res.status(400).json({ error: "Invalid collection name" });
            if (address !== "0x4db1f25d3d98600140dfc18deb7515be5bd293af") return res.status(404).json({ error: "Collection not found" });

            const floorChart = await fetchFloorPriceChart(address);
            const avgChart = await fetchAvgPriceChart(address);
            const collection = { address: address, floor: floorChart, avg: avgChart, timestamp: currentTimeStamp };
            collectionsCharts.push(collection);

            // We could cache the results here..
            res.json(collection);
        } catch (error) {
            console.log(error);
            res
                .status(500)
                .json({ error: "An error occurred while fetching collection" });
        }
    });
};