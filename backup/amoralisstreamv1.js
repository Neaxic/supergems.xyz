const functions = require("firebase-functions");
const Moralis = require("moralis").default;
const Ethers = require("ethers");

const addProposal = [
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
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "_id",
                "type": "uint256"
            },
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "from",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "to",
                        "type": "address"
                    },
                    {
                        "components": [
                            {
                                "internalType": "enum Swapper.AssetType",
                                "name": "assetType",
                                "type": "uint8"
                            },
                            {
                                "internalType": "address",
                                "name": "tokenAddress",
                                "type": "address"
                            },
                            {
                                "internalType": "uint256",
                                "name": "amountOrId",
                                "type": "uint256"
                            }
                        ],
                        "internalType": "struct Swapper.Content[]",
                        "name": "giveContents",
                        "type": "tuple[]"
                    },
                    {
                        "components": [
                            {
                                "internalType": "enum Swapper.AssetType",
                                "name": "assetType",
                                "type": "uint8"
                            },
                            {
                                "internalType": "address",
                                "name": "tokenAddress",
                                "type": "address"
                            },
                            {
                                "internalType": "uint256",
                                "name": "amountOrId",
                                "type": "uint256"
                            }
                        ],
                        "internalType": "struct Swapper.Content[]",
                        "name": "receiveContents",
                        "type": "tuple[]"
                    },
                    {
                        "internalType": "uint256",
                        "name": "expiryDate",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "fulfilled",
                        "type": "bool"
                    }
                ],
                "indexed": false,
                "internalType": "struct Swapper.Proposal",
                "name": "_proposal",
                "type": "tuple"
            }
        ],
        "name": "ProposalFulfilled",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_to",
                "type": "address"
            },
            {
                "components": [
                    {
                        "internalType": "enum Swapper.AssetType",
                        "name": "assetType",
                        "type": "uint8"
                    },
                    {
                        "internalType": "address",
                        "name": "tokenAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amountOrId",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct Swapper.Content[]",
                "name": "_giveContents",
                "type": "tuple[]"
            },
            {
                "components": [
                    {
                        "internalType": "enum Swapper.AssetType",
                        "name": "assetType",
                        "type": "uint8"
                    },
                    {
                        "internalType": "address",
                        "name": "tokenAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amountOrId",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct Swapper.Content[]",
                "name": "_receiveContents",
                "type": "tuple[]"
            },
            {
                "internalType": "uint256",
                "name": "_expiryDate",
                "type": "uint256"
            }
        ],
        "name": "addProposal",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_id",
                "type": "uint256"
            }
        ],
        "name": "clearProposalWithId",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_id",
                "type": "uint256"
            }
        ],
        "name": "fulfillProposal",
        "outputs": [],
        "stateMutability": "nonpayable",
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
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "proposals",
        "outputs": [
            {
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "expiryDate",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "fulfilled",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
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
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

const ERC721_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
]

const ERC20_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)"
]


//Remeber to firebase deploy after change
exports.newAddProposal = functions.firestore
    .document(`moralis/txs/Swap/{id}`)
    .onCreate(async (snap) => {
        //Init dep
        await Moralis.start({
            apiKey: 'REDACTED'
        })
        const provider = new Ethers.providers.JsonRpcProvider(`https://eth-goerli.g.alchemy.com/v2/REDACTED`)

        //add notfication
        const inputData = snap.data().input
        const inputInterface = new Ethers.utils.Interface(addProposal);
        const formattedInput = inputInterface.decodeFunctionData("addProposal", inputData);

        const sendingArr = formattedInput[1]
        // const retrivingArr = formattedInput[2]
        const experiery = Ethers.BigNumber.from(formattedInput[3]).toNumber()

        const sendingFormattedArr = []
        // const retrivingFormattedArr = []

        if (sendingArr.length > 0) {
            sendingArr.map(async (e, i) => {
                const tokenType = e[i][0]
                const tokenAddr = e[i][1]
                const tokenId = e[i][2]

                if (tokenType && tokenAddr && tokenId) {
                    var response;
                    try {
                        response = await Moralis.EvmApi.nft.getNFTTokenIdOwners({
                            address: tokenAddr,
                            tokenId: tokenId
                        })
                    } catch (e) {
                        console.log(e)
                    }

                    if (response && response.result === '200') {
                        const metaData = JSON.parse(response.raw.result[0].metadata)
                        sendingFormattedArr.push({
                            metadata: true,
                            nft: true,
                            tokenType: tokenType,
                            address: tokenAddr,
                            tokenOrAmount: tokenId,
                            image: metaData.image ? metaData.image : '',
                            name: metaData.name ? metaData.name : ''
                        })
                    } else {
                        if (tokenType === 0) {
                            const ERC20_TOKEN_CONTRACT = new Ethers.Contract(tokenAddr, ERC20_ABI, provider)
                            const name = ERC20_TOKEN_CONTRACT.name()
                            sendingFormattedArr.push({
                                metadata: true,
                                nft: false,
                                tokenType: tokenType,
                                address: tokenAddr,
                                tokenOrAmount: tokenId,
                                name: name ? name : 'undefined'
                            })
                        } else if (tokenType === 1) {
                            const ERC721_TOKEN_CONTRACT = new Ethers.Contract(tokenAddr, ERC721_ABI, provider)
                            sendingFormattedArr.push({
                                metadata: true,
                                nft: false,
                                tokenType: tokenType,
                                address: tokenAddr,
                                tokenOrAmount: tokenId,
                                name: ERC721_TOKEN_CONTRACT.name(),
                                symbol: ERC20_TOKEN_CONTRACT.symbol()
                            })
                        } else {
                            sendingFormattedArr.push({
                                metadata: false,
                                nft: false,
                                tokenType: tokenType,
                                address: tokenAddr,
                                tokenOrAmount: tokenId
                            })
                        }
                    }
                }
            })
        }

        return snap.ref.set({
            formatted: {
                tradeReciver: formattedInput[0],
                SendingTokens: sendingFormattedArr,
                expectingTokens: {},
                experiery: experiery
            },
        }, { merge: true })

    })


// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
