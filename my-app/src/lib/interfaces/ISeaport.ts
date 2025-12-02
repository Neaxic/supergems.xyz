export interface ISeaportOffer {
    itemType: string;
    token: string;
    identifierOrCriteria: string;
    startAmount: string;
    endAmount: string;
}

export interface ISeaportConsideration extends ISeaportOffer {
    recipient: string;
}

export const SEAPORT_ADDRESS = '0x0000000000000068F116a894984e2DB1123eB395';

export const domain = {
    name: 'Seaport',
    version: '1.6',
    chainId: 1,
    verifyingContract: SEAPORT_ADDRESS as `0x${string}`,
};

export const types = {
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