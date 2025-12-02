const ethers = require('ethers');

const swapperContracts = {
    ETH: "0x1E0049783F008A0085193E00003D00cd54003c71",
    Sepolia: "0x0000000000000068F116a894984e2DB1123eB395",
    Base: "0x0000000000000068F116a894984e2DB1123eB395",
    BSC: "0x0000000000000068F116a894984e2DB1123eB395",
    POLYGON: "0x0000000000000068F116a894984e2DB1123eB395",
    OPTIMISM: "0x0000000000000068F116a894984e2DB1123eB395",
    ARBITRUM: "0x0000000000000068F116a894984e2DB1123eB395"
};

const getSeaportAddressForChain = (chainId) => {
    switch (chainId) {
        case 1:
            return swapperContracts.ETH?.toString() || "";
        case 11155111:
            return swapperContracts.Sepolia?.toString() || "";
        case 8453:
            return swapperContracts.Base?.toString() || "";
        default:
            return (
                swapperContracts.ETH?.toString() ||
                swapperContracts.Sepolia?.toString() ||
                ""
            );
    }
};

const SEAPORT_ADDRESS = '0x0000000000000068F116a894984e2DB1123eB395';

const domain = {
    name: 'Seaport',
    version: '1.6',
    chainId: 1,
    verifyingContract: SEAPORT_ADDRESS,
};

const types = {
    OrderComponents: [
        { name: 'offerer', type: 'address' },
        { name: 'zone', type: 'address' },
        { name: 'offer', type: 'OfferItem[]' },
        { name: 'consideration', type: 'ConsiderationItem[]' },
        { name: 'orderType', type: 'uint8' },
        { name: 'startTime', type: 'uint256' },
        { name: 'endTime', type: 'uint256' },
        { name: 'zoneHash', type: 'bytes32' },
        { name: 'salt', type: 'uint256' },
        { name: 'conduitKey', type: 'bytes32' },
        { name: 'counter', type: 'uint256' },
    ],
    OfferItem: [
        { name: 'itemType', type: 'uint8' },
        { name: 'token', type: 'address' },
        { name: 'identifierOrCriteria', type: 'uint256' },
        { name: 'startAmount', type: 'uint256' },
        { name: 'endAmount', type: 'uint256' },
    ],
    ConsiderationItem: [
        { name: 'itemType', type: 'uint8' },
        { name: 'token', type: 'address' },
        { name: 'identifierOrCriteria', type: 'uint256' },
        { name: 'startAmount', type: 'uint256' },
        { name: 'endAmount', type: 'uint256' },
        { name: 'recipient', type: 'address' },
    ],
};

function createTakerOrderComponents(takerAddress, makerOrderComponents) {
    return {
        offerer: takerAddress,
        zone: makerOrderComponents.zone,
        offer: makerOrderComponents.consideration.map(item => ({
            itemType: item.itemType,
            token: item.token,
            identifierOrCriteria: item.identifierOrCriteria,
            startAmount: item.startAmount,
            endAmount: item.endAmount
        })),
        consideration: makerOrderComponents.offer.map(item => ({
            itemType: item.itemType,
            token: item.token,
            identifierOrCriteria: item.identifierOrCriteria,
            startAmount: item.startAmount,
            endAmount: item.endAmount,
            recipient: takerAddress //There should be a check here, that if it isent the maker, then it should be the taker - otherwise it probs the fee
        })),
        orderType: makerOrderComponents.orderType,
        startTime: makerOrderComponents.startTime,
        endTime: makerOrderComponents.endTime,
        zoneHash: makerOrderComponents.zoneHash,
        salt: '14446860402761739304752683030156737591518664810215442929817344644220650380343', // Test if its required to be the same or if its actually dangerous // WORKS IF IT THE SAME - HAVENT TESTED IF NOT
        conduitKey: makerOrderComponents.conduitKey,
        counter: '0' // This should be fetched from the Seaport contract for the taker's address
    };
}

function prepareOrdersAndFulfillments(makerOrder, takerOrder) {
    const orders = [
        [makerOrder.orderComponents, makerOrder.signature],
        [takerOrder.orderComponents, takerOrder.signature]
    ];

    const fulfillments = [
        ...makerOrder.orderComponents.offer.map((_, i) => ({
            offerComponents: [{ orderIndex: 0, itemIndex: i }],
            considerationComponents: [{ orderIndex: 1, itemIndex: i }]
        })),
        ...takerOrder.orderComponents.offer.map((_, i) => ({
            offerComponents: [{ orderIndex: 1, itemIndex: i }],
            considerationComponents: [{ orderIndex: 0, itemIndex: i }]
        }))
    ];

    return { orders, fulfillments };
}

function parseOrderComponentsForSeaportAPI(orderComponents) {
    // Create a deep copy of the orderComponents object
    const orderComponentsCopy = JSON.parse(JSON.stringify(orderComponents));

    // Modify the copy
    orderComponentsCopy.offer.forEach(element => {
        element.identifierOrCriteria = Number(element.identifierOrCriteria);
        element.startAmount = Number(element.startAmount);
        element.endAmount = Number(element.endAmount);
    });

    orderComponentsCopy.consideration.forEach(element => {
        element.identifierOrCriteria = Number(element.identifierOrCriteria);
        element.startAmount = Number(element.startAmount);
        element.endAmount = Number(element.endAmount);
    });

    orderComponentsCopy.startTime = Number(orderComponentsCopy.startTime);
    orderComponentsCopy.endTime = Number(orderComponentsCopy.endTime);

    return orderComponentsCopy;
}

module.exports = {
    SEAPORT_ADDRESS,
    domain,
    types,
    createTakerOrderComponents,
    prepareOrdersAndFulfillments,
    parseOrderComponentsForSeaportAPI
};

module.exports = {
    SEAPORT_ADDRESS,
    domain,
    types,
    createTakerOrderComponents,
    prepareOrdersAndFulfillments,
    parseOrderComponentsForSeaportAPI,
    getSeaportAddressForChain
};
