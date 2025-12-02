/* eslint-disable @typescript-eslint/no-explicit-any */
import { useChainId, useSignTypedData, useWriteContract } from 'wagmi';
import { useUserContext } from "@/contexts/userContext";
import { domain as initialDomain, ISeaportConsideration, ISeaportOffer, types } from "../interfaces/ISeaport";
import { Hex, Address, keccak256, toBytes } from 'viem';
import seaportABI from '@/lib/json/seaportABI.json';
import { useEffect } from 'react';
import { getSeaportAddressForChain } from '../helpers';

const formatBytes32 = (value: any): Hex => {
    if (typeof value === 'string' && value.startsWith('0x')) {
        return value.padEnd(66, '0') as Hex;
    }
    if (typeof value === 'object') {
        console.error('Received object instead of bytes32:', value);
        // Attempt to stringify the object and hash it as a fallback
        return keccak256(toBytes(JSON.stringify(value))) as Hex;
    }
    return `0x${value.toString().padStart(64, '0')}` as Hex;
};

const sanitizeOrder = (order: any) => {
    const safelyConvertToBigInt = (value: any, fieldName: string) => {
        if (value === undefined) {
            console.error(`Field ${fieldName} is undefined`);
            return BigInt(0); // or throw an error if this field is crucial
        }
        try {
            return BigInt(value);
        } catch (error) {
            console.error(`Error converting ${fieldName} to BigInt:`, value);
            throw error;
        }
    };

    const safelyConvertToNumber = (value: any, fieldName: string) => {
        if (value === undefined) {
            console.error(`Field ${fieldName} is undefined`);
            return 0; // or throw an error if this field is crucial
        }
        const num = Number(value);
        if (isNaN(num)) {
            console.error(`Field ${fieldName} is not a valid number:`, value);
            throw new Error(`Invalid number for ${fieldName}`);
        }
        return num;
    };

    console.log("Sanitizing order:", JSON.stringify(order, null, 2));

    return {
        offerer: order.offerer as Address,
        zone: order.zone as Address,
        offer: order.offer.map((o: any, index: number) => ({
            itemType: safelyConvertToNumber(o.itemType, `offer[${index}].itemType`),
            token: o.token as Address,
            identifierOrCriteria: safelyConvertToBigInt(o.identifierOrCriteria, `offer[${index}].identifierOrCriteria`),
            startAmount: safelyConvertToBigInt(o.startAmount, `offer[${index}].startAmount`),
            endAmount: safelyConvertToBigInt(o.endAmount, `offer[${index}].endAmount`)
        })),
        consideration: order.consideration.map((c: any, index: number) => ({
            itemType: safelyConvertToNumber(c.itemType, `consideration[${index}].itemType`),
            token: c.token as Address,
            identifierOrCriteria: safelyConvertToBigInt(c.identifierOrCriteria, `consideration[${index}].identifierOrCriteria`),
            startAmount: safelyConvertToBigInt(c.startAmount, `consideration[${index}].startAmount`),
            endAmount: safelyConvertToBigInt(c.endAmount, `consideration[${index}].endAmount`),
            recipient: c.recipient as Address
        })),
        orderType: safelyConvertToNumber(order.orderType, 'orderType'),
        startTime: safelyConvertToBigInt(order.startTime, 'startTime'),
        endTime: safelyConvertToBigInt(order.endTime, 'endTime'),
        zoneHash: formatBytes32(order.zoneHash),
        salt: safelyConvertToBigInt(order.salt, 'salt'),
        conduitKey: formatBytes32(order.conduitKey),
        counter: safelyConvertToBigInt(order.counter || 0, 'counter'),
        totalOriginalConsiderationItems: safelyConvertToNumber(order.totalOriginalConsiderationItems || 0, 'totalOriginalConsiderationItems'),
    };
};

export type OrderComponents = {
    offerer: Address;
    zone: Address;
    offer: {
        itemType: number;
        token: Address;
        identifierOrCriteria: bigint;
        startAmount: bigint;
        endAmount: bigint;
    }[];
    consideration: {
        itemType: number;
        token: Address;
        identifierOrCriteria: bigint;
        startAmount: bigint;
        endAmount: bigint;
        recipient: Address;
    }[];
    orderType: number;
    startTime: bigint;
    endTime: bigint;
    zoneHash: Hex;
    salt: bigint;
    conduitKey: Hex;
    counter: bigint;
    totalOriginalConsiderationItems?: number;
};

export const UseSeaportHook = ({ onSignedOrder, onFullfillment, onWritePending, onSignPending }:
    {
        onSignedOrder?: (signatureData: `0x${string}` | undefined) => void,
        onFullfillment?: (transactionHash: string) => void,
        onWritePending?: (isPending: boolean) => void,
        onSignPending?: (isPending: boolean) => void
    }) => {
    const { address } = useUserContext();
    const chainId = useChainId();
    const { signTypedData, data: signatureData, isPending: isSignPending, isError: isSignError, error: signError } = useSignTypedData();
    const { writeContract, data, isError, isSuccess, error, isPending: isWritePending } = useWriteContract()

    const signOrder = async (offer: ISeaportOffer[], consideration: ISeaportConsideration[]): Promise<{ orderComponents: OrderComponents }> => {
        console.log("Signing order with offer:", offer, "and consideration:", consideration);
        const currentTime = Math.floor(Date.now() / 1000);
        const endTime = currentTime + 60 * 60 * 24 * 7; // 7 days

        const orderComponents: OrderComponents = {
            offerer: address as Address,
            zone: '0x0000000000000000000000000000000000000000' as Address,
            offer: offer.map(o => ({
                itemType: +o.itemType,
                token: o.token as Address,
                identifierOrCriteria: BigInt(o.identifierOrCriteria),
                startAmount: BigInt(o.startAmount),
                endAmount: BigInt(o.endAmount)
            })),
            consideration: consideration.map(c => ({
                itemType: +c.itemType,
                token: c.token as Address,
                identifierOrCriteria: BigInt(c.identifierOrCriteria),
                startAmount: BigInt(c.startAmount),
                endAmount: BigInt(c.endAmount),
                recipient: c.recipient as Address
            })),
            orderType: 0, // FULL_OPEN
            startTime: BigInt(currentTime),
            endTime: BigInt(endTime),
            zoneHash: '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex,
            salt: BigInt('24446860302761739304752683030156737591518664810215442929817344629220650380348'),
            conduitKey: '0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000' as Hex,
            totalOriginalConsiderationItems: consideration.length,
            counter: BigInt(0),
        };

        const domain = {
            ...initialDomain,
            chainId: chainId,
            verifyingContract: getSeaportAddressForChain(chainId) as `0x${string}`,
        }

        signTypedData({ domain, types, primaryType: 'OrderComponents', message: orderComponents });

        return { orderComponents };
    };

    useEffect(() => {
        if (signatureData) {
            onSignedOrder?.(signatureData)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [signatureData])

    useEffect(() => {
        if (isSignError) {
            console.error("Sign Error:", signError.message);
        }
    }, [isSignError, signError])

    const signTakeOrder = async (orderComponents: OrderComponents) => {
        // Sign the taker's order
        const domain = {
            ...initialDomain,
            chainId: chainId,
            verifyingContract: getSeaportAddressForChain(chainId) as `0x${string}`,
        }

        signTypedData({ domain, types, primaryType: 'OrderComponents', message: orderComponents });
    };

    const fulfillOrder = async (orderComponents: OrderComponents, signature: `0x${string}`) => {
        console.log("Original order components:", JSON.stringify(orderComponents, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2));

        const sanitizedOrder = sanitizeOrder(orderComponents);
        console.log("Sanitized order:", JSON.stringify(sanitizedOrder, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2));

        const advancedOrder = {
            parameters: sanitizedOrder,
            numerator: BigInt(1),
            denominator: BigInt(1),
            signature: signature,
            extraData: '0x',
        };

        console.log("Advanced Order:", JSON.stringify(advancedOrder, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2));

        // Check for undefined values in consideration
        sanitizedOrder.consideration.forEach((item: any, index: number) => {
            if (item.startAmount === undefined) {
                console.error(`Consideration item ${index} has undefined startAmount`);
            }
        });

        let totalValue: bigint;
        try {
            totalValue = sanitizedOrder.consideration.reduce((sum: bigint, item: any) => {
                if (item.startAmount === undefined) {
                    throw new Error(`Consideration item has undefined startAmount`);
                }
                return sum + BigInt(item.startAmount);
            }, BigInt(0));
        } catch (error) {
            console.error("Error calculating total value:", error);
            throw error;
        }

        console.log("Total value:", totalValue.toString());

        try {
            await writeContract({
                address: getSeaportAddressForChain(chainId) as `0x${string}`,
                abi: seaportABI,
                functionName: 'fulfillOrder',
                args: [advancedOrder, orderComponents.conduitKey],
                value: totalValue,
            });
        } catch (error) {
            console.error("Error fulfilling order:", error);
            if (error instanceof Error) {
                console.error("Error details:", error.message);
            }
            throw error;
        }
    };

    useEffect(() => {
        if (isError) {
            console.error("Transaction Error:", error.message);
        }
    }, [isError, error])

    useEffect(() => {
        if (isSuccess && data) {
            onFullfillment?.(data);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSuccess, data])

    useEffect(() => {
        onWritePending?.(isWritePending);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isWritePending])

    useEffect(() => {
        onSignPending?.(isSignPending);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSignPending])

    return {
        signOrder,
        signTakeOrder,
        fulfillOrder,
        signatureData,
    };
};

export default UseSeaportHook;