import { Hex } from "viem";
import { OrderComponents } from "../hooks/UseSeaportHook";
import { INFTGONFT } from "./NftGOv2";
import { IComment } from "./IUtil";

export interface ISimpleUser {
    name: string;
    address: string;
    rep: number;
}

export const initialSimpleUser: ISimpleUser = {
    name: "",
    address: "",
    rep: 0
}

export interface ITrade {
    message?: string;
    tradeType: string;
    tradeTimestamp: string;
    tradeStatus: string;
    endAmount: string;
    tradeSenderUser: ISimpleUser
    tradeReciverUser: ISimpleUser
    tradeId: string;
    chainId: number;
    tradePublicity?: string;
    tradeData: unknown;
    parsedOffer: INFTGONFT[];
    parsedConsideration: INFTGONFT[]
    tradeSignature: string;
    makerOrder?: { orderComponents: OrderComponents, signature: Hex }; //ONLY PROVIDED FOR TAKER
    takerOrderComponents?: OrderComponents; //ONLY PROVIDED FOR TAKER
    comments?: IComment[]
    searchableFields?: string[]
}

export interface ITradeSender extends ITrade {
    tradeSignature: string;
}