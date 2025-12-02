"use client"

import { useCallback, useEffect, useState } from "react"
import { getRecentTrades } from "@/api/Private/o/proposal";
import { makeAPICall } from "@/lib/apiHelpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Avatar from "boring-avatars";
import { Handshake, RefreshCcw } from "lucide-react";
import { NFTCardSimple } from "./NFTCardSimple";
import { formatDistanceToNow } from "date-fns";
import { INFTGONFT, INFTGOCollection } from "@/lib/interfaces/NftGOv2";

interface ITrade {
    tradeTimestamp: string;
    tradeSenderUser: { address: string };
    tradeReciverUser: { address: string };
    parsedOffer: (INFTGONFT | INFTGOCollection | undefined)[];
    parsedConsideration: (INFTGONFT | INFTGOCollection | undefined)[];
}

export function RecentTrades() {
    const [trades, setTrades] = useState<ITrade[]>([])

    const fetchRecentTrades = useCallback(async () => {
        // fetch recent trades
        const response = await makeAPICall(() => getRecentTrades()) as { trades: ITrade[] };
        setTrades(response.trades)
    }, [])

    useEffect(() => {
        fetchRecentTrades();
    }, [])

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Recent Trades</CardTitle>
                <CardDescription>Last few trades fully completed</CardDescription>
            </CardHeader>
            <CardContent>
                <div>
                    {trades.map((trade: ITrade, index) => (
                        <div key={`trade-${index}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex gap-2 items-center text-sm">
                                    Live formulator on Ethereum
                                </div>

                                {/* Calculate trade timestamp to current date, and format it to "x minutes ago" using date-fns  */}
                                <p className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(Number(trade.tradeTimestamp) * 1000), { addSuffix: true })}</p>
                            </div>
                            <div className="mt-1 flex items-center justify-between">
                                <div className="flex items-center">
                                    <Avatar variant="beam" name={trade.tradeSenderUser.address} width={48} height={48} className="-mr-2" ></Avatar>
                                    <Handshake className="z-10" />
                                    <Avatar variant="beam" name={trade.tradeReciverUser.address} width={48} height={48} className="-ml-2"></Avatar>
                                </div>

                                <div className="flex gap-2 items-center">
                                    <div className="flex gap-1">
                                        {trade.parsedOffer.map((nft: INFTGONFT | INFTGOCollection | undefined, index: number) => (
                                            <NFTCardSimple key={`nft-${index}`} nft={nft} classes={"w-12 h-12"} />
                                        ))}
                                        {/* <NFTCardSimple nft={dummyHapePrime1} classes={"w-12 h-12"} />
                                <NFTCardSimple nft={dummyHapePrime2} classes={"w-12 h-12"} />
                                <NFTCardSimple nft={dummyHapePrime3} classes={"w-12 h-12"} />
                                <NFTCardSimple nft={dummyHapePrime4} classes={"w-12 h-12"} /> */}
                                    </div>
                                    <div>
                                        <RefreshCcw className="w-6" />
                                    </div>
                                    <div className="flex gap-1">
                                        {trade.parsedConsideration.map((nft: INFTGONFT | INFTGOCollection | undefined, index: number) => (
                                            <NFTCardSimple key={`nft-${index}`} nft={nft} classes={"w-12 h-12"} />
                                        ))}
                                        {/* <NFTCardSimple nft={dummyHapePrimeDark1} classes={"w-12 h-12"} />
                                <NFTCardSimple nft={dummyHapePrimeDark2} classes={"w-12 h-12"} /> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}