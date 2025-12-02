const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const Ethers = require("ethers");
const { getUserDB, fetchCollectionData, fetchNFTData, getChainNameFromId } = require("./helpers");
const { switchDonationSuccessfull, switchSomebodySwitched, switchSuccessfullSwitch } = require("./notifications");
const db = admin.firestore();

// 0x95dC2Cc2c8Fb7e033a3892666423192dFfFa0739
// 1000000000000000
// 0
// 1000000000000000000

//[["0x9982d1e50059BC44E92F7084F532081C12c0Bf6A",7,0,true]]

//TODO: implement this cant be bothered for MVP
// const cacheTime = 1000 * 60 * 60 * 24; // 24 hours

const switchContractABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "initialOwner",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_ownerFee",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_minDonorFee",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_maxDonorFee",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "nftContract",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "isAllowed",
                "type": "bool"
            }
        ],
        "name": "CollectionAllowedChange",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "nftContract",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "tokenCount",
                "type": "uint256"
            }
        ],
        "name": "CollectionEmptied",
        "type": "event"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "nftContract",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "tokenId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "donorFee",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "isERC721",
                        "type": "bool"
                    }
                ],
                "internalType": "struct Switch.DonationInput[]",
                "name": "_donations",
                "type": "tuple[]"
            }
        ],
        "name": "donateBatchNFT",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "donor",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "nftContract",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "fee",
                "type": "uint256"
            }
        ],
        "name": "DonationAdded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "donor",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "nftContract",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "DonationWithdrawn",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_nftContract",
                "type": "address"
            }
        ],
        "name": "emptyCollectionDonations",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "ownerFee",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "minDonorFee",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "maxDonorFee",
                "type": "uint256"
            }
        ],
        "name": "FeesUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "FeesWithdrawn",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "oldOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "nftContract",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "oldTokenId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "newTokenId",
                "type": "uint256"
            }
        ],
        "name": "NFTSwapped",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_collection",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "_isAllowed",
                "type": "bool"
            }
        ],
        "name": "setAllowedCollection",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "nftContract",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256[]",
                        "name": "oldTokenIds",
                        "type": "uint256[]"
                    },
                    {
                        "internalType": "uint256[]",
                        "name": "newTokenIds",
                        "type": "uint256[]"
                    },
                    {
                        "internalType": "bool",
                        "name": "isERC721",
                        "type": "bool"
                    }
                ],
                "internalType": "struct Switch.SwapInfo[]",
                "name": "swapInfos",
                "type": "tuple[]"
            }
        ],
        "name": "swapMultipleNFTs",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_nftContract",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_oldTokenId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_newTokenId",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "_isERC721",
                "type": "bool"
            }
        ],
        "name": "swapNFT",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_ownerFee",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_minDonorFee",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_maxDonorFee",
                "type": "uint256"
            }
        ],
        "name": "updateFees",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdrawAccumulatedFees",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_nftContract",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_tokenId",
                "type": "uint256"
            }
        ],
        "name": "withdrawDonation",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address[]",
                "name": "_nftContracts",
                "type": "address[]"
            },
            {
                "internalType": "uint256[]",
                "name": "_tokenIds",
                "type": "uint256[]"
            }
        ],
        "name": "withdrawMultipleDonations",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "accumulatedFees",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "allowedCollections",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "donations",
        "outputs": [
            {
                "internalType": "address",
                "name": "donor",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "nftContract",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "donorFee",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "isERC721",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getActiveDonationContracts",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "",
                "type": "address[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAllowedCollections",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "",
                "type": "address[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_nftContract",
                "type": "address"
            }
        ],
        "name": "getDonatedNFTs",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_nftContract",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_offset",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_limit",
                "type": "uint256"
            }
        ],
        "name": "getDonations",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "donor",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "nftContract",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "tokenId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "donorFee",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "isERC721",
                        "type": "bool"
                    }
                ],
                "internalType": "struct Switch.Donation[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_nftContract",
                "type": "address"
            }
        ],
        "name": "getTotalDonations",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "maxDonorFee",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "minDonorFee",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "ownerFee",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

function getFunctionCallFromEventName(eventName) {
    switch (eventName) {
        case "CollectionAllowedChange":
            return "setAllowedCollection"
        case "FeesUpdated":
            return "updateFees"
        case "DonationAdded":
            return "donateBatchNFT"
        case "DonationWithdrawn":
            return "withdrawDonation"
        case "NFTSwapped":
            return "swapNFT"
        case "FeesWithdrawn":
            return "withdrawAccumulatedFees"
        case "CollectionEmptied":
            return "emptyCollectionDonations"
    }
}

exports.newTxsSwitchProto = functions.firestore
    .document(`moralis/txs/Switch/{id}`)
    .onUpdate(async (snap) => {
        if (snap.after.data().confirmed === false) return;

        const transactionHash = snap.after.data().hash;
        console.log(transactionHash)

        const txDocRefCheck = db.collection("switch").doc("transactions").collection("parsed").doc(transactionHash);
        if ((await txDocRefCheck.get()).exists === false) return;
        const txDocRef = (await txDocRefCheck.get()).data();
        const eventName = txDocRef.proposalEmitName;

        if (eventName === undefined) return;
        if (txDocRef.status === "true") return;

        const transactionInvoker = snap.after.data().fromAddress.toLowerCase();
        const chainId = snap.after.data().chainId;
        const inputData = snap.after.data().input;
        const formattedInput2 = new Ethers.utils.Interface(switchContractABI).decodeFunctionData(getFunctionCallFromEventName(eventName), inputData);
        // console.log("formattedInput", formattedInput);
        console.log("formattedInput2", formattedInput2);
        const invokerDB = await getUserDB(db, transactionInvoker);
        if (invokerDB === null) return; //basically not using if user isent part of our site

        txDocRefCheck.set({
            transactionInvoker,
            chainId,
            user: {
                name: invokerDB.name,
                avatar: invokerDB.avatar,
            },
            parsed: "parsing",
            parsedData: JSON.stringify(formattedInput2),
        }, { merge: true });

        //Actual data parsing step - we have the data we need
        const chainName = getChainNameFromId(chainId);

        //if event and tx is donation
        switch (eventName) {
            case "DonationAdded":
                //[["0x9982d1e50059BC44E92F7084F532081C12c0Bf6A","7","0",true]]
                let itemarr = formattedInput2._donations
                itemarr.forEach(async item => {
                    //Look invoker stored db for item
                    let nftCollection = db.collection("users").doc(transactionInvoker).collection("nfts").doc(chainName);
                    // let lastFetched = nftCollection.get();
                    let doc = nftCollection.collection("nfts").doc(item.nftContract.toLowerCase() + "_" + Number(item.tokenId).toString()).get();
                    let tmpNftData = null
                    tmpNftData = {
                        address: item.nftContract,
                        donorFee: Number(item.donorFee),
                        isERC721: item.isERC721,
                        tokenId: Number(item.tokenId),
                    }
                    if (doc.exists) {
                        //use data
                        tmpNftData = {
                            ...doc.data(),
                            ...tmpNftData,
                        };
                    } else {
                        //fetch item
                        let data = await fetchNFTData(item.nftContract, item.tokenId, chainName);
                        console.log("api fetching collection", data)
                        //update item
                        //use data
                        tmpNftData = {
                            ...data,
                            ...tmpNftData,
                        };
                    }
                    if (tmpNftData === null) return;
                    //depo data into db
                    let loc = db.collection("switch").doc("actual").collection("collections").doc(chainName).collection(item.nftContract.toLowerCase()).doc(Number(item.tokenId).toString());
                    loc.set({
                        donator: transactionInvoker,
                        date: admin.firestore.FieldValue.serverTimestamp(),
                        ...tmpNftData,
                    }, { merge: true });
                });

                await switchDonationSuccessfull(transactionInvoker, "null")
                break;
            case "DonationWithdrawn":
                //Just delete doc
                console.log("with: ", formattedInput2)
                await db.collection("switch").doc("actual").collection("collections").doc(chainName).collection(formattedInput2._nftContract.toLowerCase()).doc(Number(formattedInput2._tokenId).toString()).delete();
                await switchSuccessfulllWithdraw(transactionInvoker, "null")
                break;
            case "NFTSwapped":
                console.log("swap: ", formattedInput2)
                //find item first for dono fee data
                let oldNft = db.collection("switch").doc("actual").collection("collections").doc(chainName).collection(formattedInput2._nftContract.toLowerCase()).doc(Number(formattedInput2._oldTokenId).toString()).get();
                let tmpNftData = {
                    ...(await oldNft).data(),
                    address: formattedInput2.nftContract,
                    tokenId: Number(formattedInput2.newTokenId),
                }

                //find new item from invokers user db
                let nftCollection = db.collection("users").doc(transactionInvoker).collection("nfts").doc(chainName);
                let doc = nftCollection.collection("nfts").doc(formattedInput2.nftContract.toLowerCase() + "_" + Number(formattedInput2.newTokenId).toString()).get();
                if (doc.exists) {
                    //use data
                    tmpNftData = {
                        ...doc.data(),
                        ...tmpNftData,
                    };
                } else {
                    let data = await fetchCollectionData(formattedInput2.nftContract, chainName);
                    console.log("api fetching collection", data)
                    //update item
                    //use data
                    tmpNftData = {
                        ...data,
                        ...tmpNftData,
                    };
                }

                //make new item doc
                let loc = db.collection("switch").doc("actual").collection("collections").doc(chainName).collection(formattedInput2._nftContract.toLowerCase()).doc(Number(formattedInput2._newTokenId).toString());
                loc.set({
                    lastSwitch: admin.firestore.FieldValue.serverTimestamp(),
                    ...tmpNftData,
                }, { merge: true });
                //delete old item doc
                db.collection("switch").doc("actual").collection("collections").doc(chainName).collection(formattedInput2._nftContract.toLowerCase()).doc(Number(formattedInput2._oldTokenId).toString()).delete();

                await switchSomebodySwitched(transactionInvoker, "null")
                await switchSuccessfullSwitch(transactionInvoker, "null")

                break;
            case "CollectionAllowedChange":
                let isAllowed = formattedInput2._isAllowed;
                if (isAllowed) {
                    //fetch data
                    let item = await fetchCollectionData(formattedInput2._collection, chainName);
                    if (item === null) return;
                    //set data
                    let loc = db.collection("switch").doc("actual").collection("allowedCollections").doc(formattedInput2._collection.toLowerCase());
                    loc.set({
                        item,
                    }, { merge: true });
                } else {
                    let loc = db.collection("switch").doc("actual").collection("allowedCollections").doc(formattedInput2._collection.toLowerCase());
                    let doc = loc.get();
                    if (doc.exists) {
                        loc.delete();
                    }
                }
                break;
        }
        //split input collections

        //fetch data on each collection - prefferibly from already stored user data otherwise api call

        //update the switch collections data
    });

exports.newEventSwitchProto = functions.firestore
    .document(`moralis/events/Switch/{id}`)
    .onCreate(async (snap) => {
        //Not on update, as we want to ensure the tx function has all it needs when confirmed
        const doc = snap.data();
        if (doc === undefined || doc.status !== undefined) return;
        const transactionHash = doc.transactionHash;
        const proposalEmitName = doc.name;
        const db = admin.firestore();

        //Create additional changing obj for any emitted extra data, when needed
        const txDocRef = db.collection("switch").doc("transactions").collection("parsed").doc(transactionHash);
        await txDocRef.set({
            status: "parsing",
            proposalEmitName: proposalEmitName,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
    });



function eventNewDonation(item) {
    console.log("epic")


    //Save fees, item, address /user
    //Save collection address


    switchDonationSuccessfull("addy", item)
}

function eventSwitch(item) {
    //switch update donater accumilated fees
    //switch update donater item

    switchSomebodySwitched("original owner addy", item)
    switchSuccessfullSwitch("new owner addy", item)
}

function eventWithdrawDonation() {
    //switch update donater accumilated fees
    //switch update donater item
}

function eventWithdrawFee() {

}

function eventAllowedCollections() {

}


function eventNewFees() { }
