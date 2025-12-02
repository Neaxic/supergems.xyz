"use client"
import { getPrivateTrades } from "@/api/Private/proposal";
import { NftMarketTable } from "@/components/nft-market-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ITrade } from "@/lib/interfaces/ITrades";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MarketPrivate() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [sentListings, setSentListings] = useState<ITrade[]>([]);
    const [recivedListings, setRecivedListings] = useState<ITrade[]>([]);

    const fetchPrivateListings = async () => {
        // fetch private listings
        setLoading(true);
        const sentResp = await getPrivateTrades({ index: 0, limit: 10, isReceiver: false });
        const recivedResp = await getPrivateTrades({ index: 0, limit: 10, isReceiver: true });

        if (sentResp) setSentListings(sentResp.trades);
        if (recivedResp) setRecivedListings(recivedResp.trades);

        setLoading(false);
    }

    useEffect(() => {
        fetchPrivateListings();
    }, [])

    return (
        <div>
            <div className="flex items-center px-4 py-2 h-full" style={{ height: "52px" }}>
                <h1 className="text-xl font-bold">{"Marketplace > Private listings"}</h1>
            </div>
            <Separator />

            <div className="p-4">
                <Card className=" w-full">
                    <CardHeader className="w-full flex flex-row justify-between">
                        <div className="w-auto">
                            <CardTitle>Private listings</CardTitle>
                            <CardDescription>View all outstanding or incomming trade offers</CardDescription>
                        </div>

                        <Button className="w-32 space-x-4" disabled={loading} onClick={() => fetchPrivateListings()}>
                            {loading && (
                                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {loading ? "Refreshing" : "Refresh"}
                        </Button>
                    </CardHeader>
                    <CardContent className="h-full">
                        <div>
                            <p>Open-ended collection proposals & trades</p>
                            <NftMarketTable onUserClick={(addy) => router.push(`/d/profile/${addy}`)} onTradeClick={(trade) => router.push(`/d/marketplace/${trade.tradeId}`)} trades={recivedListings.concat(sentListings) || []} />
                        </div>
                        <div className="mt-4">
                            <p>1:1 Trades</p>
                            <NftMarketTable onUserClick={(addy) => router.push(`/d/profile/${addy}`)} onTradeClick={(trade) => router.push(`/d/marketplace/${trade.tradeId}`)} trades={recivedListings.concat(sentListings) || []} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div >
    )
}