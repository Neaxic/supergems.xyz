var push = require('web-push');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const firebase = require('firebase/app');
const axios = require('axios');

let vapidKeys = {
    publicKey: 'REDACTED',
    privateKey: 'REDACTED'
}

const firebaseConfig = {
    apiKey: "REDACTED",
    authDomain: "REDACTED",
    projectId: "REDACTED",
    storageBucket: "REDACTED",
    messagingSenderId: "REDACTED",
    appId: "REDACTED"
};
const NFT_GO_API_KEY = 'REDACTED';
const OPENSEA_API_KEY = 'REDACTED';
const OPEN_EXCHANGE_KEY = 'REDACTED';
const CRYPTOCOMPARE_API_KEY = 'REDACTED';

push.setVapidDetails('mailto:noone@gmail.com', vapidKeys.publicKey, vapidKeys.privateKey);
firebase.initializeApp(firebaseConfig);
const db = getFirestore();
var currenciesMap = new Map();
var ethereumPriceUSD = 0;

function sendNotification(title, message, pushData, image, address) {
    push.sendNotification(pushData, JSON.stringify({
        body: message, title: title, image: "https://i.imgur.com/3YhQ3QZ.pnhttps://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Solid_red.svg/2048px-Solid_red.svg.png"
    })).catch((err) => {
        //Invalid push key, delete from db
        //Use address to delete doc
        console.log("Invalid push key, deleting.");
    });
}

async function fetchCurrencies() {
    console.log("Reloading currencies")
    const response = await axios.get(`https://openexchangerates.org/api/latest.json?app_id=${"REDACTED"}&base=usd&prettyprint=false&show_alternative=false`)
    currenciesMap = response.data.rates;
}

async function getEhtereumPrice() {
    console.log("Reloading ethereum price")
    const response = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=${CRYPTOCOMPARE_API_KEY}`)
    ethereumPriceUSD = response.data["USD"];
}

async function getNotifications() {
    const querySnapshot = await getDocs(collection(db, 'notifications'));
    querySnapshot.forEach((doc) => {
        let pushData = JSON.parse(doc.data().push);
        if (pushData == null || pushData == '' || pushData == undefined) return;
        //Every user

        //Calculate lort fra addy

        //send notification
        push.sendNotification(pushData, 'test message')
    });
}

async function getWalletStats() {
    console.log("Running notification: walletStats, " + new Date().toLocaleString());
    const querySnapshot = await getDocs(collection(db, 'notifications'));
    querySnapshot.forEach(async (doc) => {
        let pushData = JSON.parse(doc.data().push);
        if (pushData == null || pushData == '' || pushData == undefined) return;
        if (doc.data().statsDaily) {
            const addy = doc.id
            const docRef = doc.data()
            const response = await axios.get(`https://data-api.nftgo.io/eth/v2/address/metrics?address=${addy}`, {
                headers: {
                    'X-API-KEY': NFT_GO_API_KEY,
                    'Content-Type': 'application/json'
                }
            });
            const data = response.data;

            var converted = ""
            if (docRef.currency !== null && docRef.currency !== undefined && docRef.currency !== "")
                converted = (data.portfolio_value.usd * currenciesMap[docRef.currency]).toFixed(2) + " " + docRef.currency.toUpperCase()
            else
                converted = data.portfolio_value.usd + "$"

            const title = `GM ${data.address_tag.ens ? `${data.address_tag.ens}` : `${addy.slice(0, 6)} 👋`}`
            const message = `Your wallet has ${data.portfolio_value.eth.toFixed(3)} ETH / ${converted} this morning. A ${data.portfolio_change_percent["24h"].toFixed(2)}% diff in the last 24hr.`;
            sendNotification(title, message, pushData)
        }
    });
}

async function getCollectionStats() {
    console.log("Running notification: collectionStats, " + new Date().toLocaleString());
    const querySnapshot = await getDocs(collection(db, 'notifications'));
    querySnapshot.forEach(async (doc) => {
        let pushData = JSON.parse(doc.data().push);
        if (pushData == null || pushData == '' || pushData == undefined) return;
        if (doc.data().collection_slug !== null && doc.data().collection_slug !== undefined && doc.data().collection_slug !== "") {
            const addy = doc.id
            const docRef = doc.data()
            const response = await axios.get(`https://api.opensea.io/api/v1/collection/${docRef.collection_slug}/stats`, {
                headers: {
                    'X-API-KEY': OPENSEA_API_KEY,
                    'Content-Type': 'application/json'
                }
            });
            const data = response.data.stats;

            var converted = ""
            if (docRef.currency !== null && docRef.currency !== undefined && docRef.currency !== "")
                converted = (data.floor_price * ethereumPriceUSD * currenciesMap[docRef.currency]).toFixed(2) + " " + docRef.currency.toUpperCase()
            else
                converted = data.floor_price * ethereumPriceUSD + "$"

            const title = `GM ${docRef.collection_slug} 🖼️`
            const message = `The FP is ${data.floor_price.toFixed(3)} ETH / ${converted} this morning. A ${data.one_day_change.toFixed(2)}% FP diff in the last 24hr.`;
            sendNotification(title, message, pushData)
        }
    });
}

async function dailyChecks() {
    await fetchCurrencies()
    await getEhtereumPrice()
    await getWalletStats()
    await getCollectionStats()
}

const CronJob = require('cron').CronJob;
new CronJob('0 8 * * *', dailyChecks, null, true, 'Europe/Copenhagen');

// dailyChecks().catch((err) => {
//     console.log('Error getting documents', err);
// });

// getWalletStats().catch((err) => {
//     console.log('Error getting documents', err);
// });

