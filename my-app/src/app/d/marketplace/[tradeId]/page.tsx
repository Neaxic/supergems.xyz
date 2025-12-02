"use client"

import { getTrade, postTradeComment, putTradeAccept, putTradeDeny } from "@/api/Private/proposal";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { initialSimpleUser, ITrade } from '../../../../lib/interfaces/ITrades';
import UseSeaportHook from "@/lib/hooks/UseSeaportHook";
import { CryptoApprovalModal } from "@/components/crypto-approval-modal";
import { useAccount, useChainId } from "wagmi";
import { makeAPICall } from "@/lib/apiHelpers";
import TradingViewV2 from "@/components/trading-view-v2";
import { INFTGONFT } from "@/lib/interfaces/NftGOv2";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CommentsWithLoading } from "@/components/comments-with-loading";
import { SimpleUserMessage } from "@/components/simple-user-message";
import { IComment } from "@/lib/interfaces/IUtil";
import { getSeaportAddressForChain } from "@/lib/helpers";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import CurrencyEthereum from "@/assets/currency-ethereum.svg";
import { getChainName } from "@/lib/helpers"
import { differenceInSeconds, format } from "date-fns"

export default function MarketID() {
    const router = useRouter();
    const chainId = useChainId();
    const { address } = useAccount();
    const params = useParams();
    const tradeId = params?.tradeId as string;
    const [approvalModal, setApprovalModal] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);
    const [trade, setTrade] = useState<ITrade>();
    const seaportHook = UseSeaportHook({ onFullfillment: (trade) => handleFullfillment(trade) });
    const [timeDifference, setTimeDifference] = useState('');

    useEffect(() => {
        const formatTimeDifference = (targetDate: Date) => {
            const now = new Date();
            const diffInSeconds = differenceInSeconds(targetDate, now);
        
            const days = Math.floor(diffInSeconds / 86400);
            const hours = Math.floor(diffInSeconds / 3600);
            const minutes = Math.floor((diffInSeconds % 3600) / 60);
            const seconds = diffInSeconds % 60;
        
            const pad = (num: number) => String(num).padStart(2, '0');
        
            return `${hours > 0 ? pad(days) + ":" : ""}${hours > 0 ? pad(hours) + ":" : ""}${pad(minutes)}:${pad(seconds)}`;
        };
    
        const endTime = trade?.makerOrder?.orderComponents?.endTime;
        const targetDate = new Date(typeof endTime === 'bigint' ? Number(endTime) * 1000 : (endTime ?? 1) * 1000);
        setTimeDifference(formatTimeDifference(targetDate));
    
        const interval = setInterval(() => {
            setTimeDifference(formatTimeDifference(targetDate));
        }, 1000);
    
        return () => clearInterval(interval);
    }, [trade?.makerOrder?.orderComponents?.endTime]);

    const fetchPrivateListings = async () => {
        // fetch private listings
        setLoading(true);
        const resp = await getTrade(tradeId);
        if (resp) setTrade(resp);

        setLoading(false);
    }

    const everythingApproved = () => {
        setApprovalModal(false);
        handleAcceptTrade();
    }

    const handleAcceptTrade = () => {
        if (trade?.makerOrder && trade?.makerOrder.signature) {
            seaportHook.fulfillOrder(trade.makerOrder.orderComponents, trade.makerOrder.signature) //Our own sign is not needed if this is the case
        }
    }

    //eslint-disable-next-line
    const handleFullfillment = async (tradeHash: any) => {
        //This should just happen from our contract watcher on onchain events to trigger serverless func..
        //This is a shitty solution, but it works for now for the proto
        //If you read this pls dont fuck with it
        const response = await makeAPICall(() => putTradeAccept(tradeId));
        if (response && typeof response === 'object' && 'tradeStatus' in response) setTrade(response as ITrade);
    }

    const handleCancelTrade = async () => {
        const response = await makeAPICall(() => putTradeDeny(tradeId));
        if (response && typeof response === 'object' && 'tradeStatus' in response) setTrade(response as ITrade);
    }

    const handleTradeCounter = () => {
        console.log("Trade counterd")
        //Put api update trade status to countered
        //Redirect to trade page

        // Extract NFT information from the trade object
        const nftInfo = trade?.parsedOffer?.map(nft => ({
            id: nft.token_id,
            name: nft.contract_address,
            // Add other necessary fields
        }));

        const nftConsiderationInfo = trade?.parsedConsideration?.map(nft => ({
            id: nft.token_id,
            name: nft.contract_address,
            // Add other necessary fields
        }));

        // Encode the NFT information as a JSON string
        const wasReciver = trade?.tradeReciverUser.address === address;
        const encodedOfferNfts = encodeURIComponent(JSON.stringify(nftInfo));
        const EncodedConsiderationNfts = encodeURIComponent(JSON.stringify(nftConsiderationInfo));
        // Construct the URL with the encoded NFT information
        const url = `/d/trade/formulator/${trade?.tradeReciverUser.address === address ? trade?.tradeReciverUser.address : trade?.tradeSenderUser.address}/offline?Onfts=${encodedOfferNfts}&Cnfts=${EncodedConsiderationNfts}&wasReciver=${wasReciver}`;
        router.push(url)
    }

    const handleMessageSend = async (message: string) => {
        const response = await makeAPICall(() => postTradeComment(tradeId, message))
        if (response && typeof response === 'object' && 'comments' in response) setTrade(trade => ({ ...trade, comments: response.comments as IComment[] } as ITrade));
    }

    useEffect(() => {
        fetchPrivateListings();
    }, [tradeId])

    return (
        <div>
            {trade && trade.tradeStatus !== undefined && (
                <div className="flex px-4 w-full gap-4">
                    {/* Trade formulator */}
                    {/* Steam like trading formulator */}
                    {/* Left side */}
                    <div className="w-full">


                        <Card className="max-h-[90vh] h-full">
                            <CardContent>
                                <div className="flex items-center justify-between mt-6">
                                    <h1 className="text-xl font-bold">Private trade porposal</h1>
                                    <div className="flex gap-2">
                                        <Badge variant="secondary" className="mr-2">{trade?.tradeType.toUpperCase() + " "} 1.6</Badge>
                                        <Badge>
                                            <Eye width={14} height={14} className="mr-1" />
                                            {trade?.tradePublicity?.toUpperCase() === "PUBLIC" ? "Public" : "Private"}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm">ID: {trade?.tradeId}, </p>
                                    <div >
                                        <Badge>
                                            <CurrencyEthereum className="w-4 h-4 mr-1" />
                                            {getChainName(trade.chainId)}
                                        </Badge>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between mt-2">
                                        <div>
                                            <p>Publicity: {trade.tradePublicity}</p>
                                            <p>Created: {trade?.tradeTimestamp ? format(new Date(+trade.tradeTimestamp * 1000), 'yyyy-MM-dd HH:mm:ss') : 'N/A'}</p>
                                            <p>Expires in: {timeDifference}</p>
                                            <div className={"mt-2"}>
                                            <Label>Tags found in trade:</Label>
                                            <div className={"flex gap-2"}>
                                                {trade.searchableFields?.map((item, index) => (
                                                <Badge key={"item-"+index}>{item}</Badge>
                                                ))}
                                            </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {trade?.message && (
                                    <div className="mt-8">
                                        <Label>Message from sender</Label>
                                        <div className="mt-2">
                                            <SimpleUserMessage isOwner={false} message={trade?.message} />
                                        </div>
                                    </div>
                                )}

                                {trade?.tradeStatus === "open" && trade?.makerOrder !== undefined && (
                                    <div className="">
                                        <Label>Actions</Label>
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="space-x-2">
                                                <Button disabled={!trade?.tradeSignature} onClick={handleAcceptTrade} size="sm" >Accept</Button>
                                                {trade?.tradePublicity !== "public" && (
                                                <Button onClick={handleCancelTrade} size="sm" variant="outline">Decline</Button>
                                                )}
                                                <Button onClick={handleTradeCounter} size="sm" variant="secondary">Counter</Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="w-full mt-8">
                                    <Label>Comments</Label>
                                    <div className="mt-2">
                                        <CommentsWithLoading disabled={trade?.tradeStatus !== "open"} isLoading={loading} comments={trade?.comments || []} onSubmit={(message) => handleMessageSend(message)} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="w-full">
                        <TradingViewV2 loading={loading}
                            bottomUser={trade?.tradeSenderUser || initialSimpleUser}
                            bottomNFTs={trade?.parsedOffer || []}
                            topNFTs={trade?.parsedConsideration || []}
                            topUser={trade?.tradeReciverUser || initialSimpleUser}
                            topNftPressed={(nft: INFTGONFT) => console.log(nft.name)} bottomNftPressed={(nft: INFTGONFT) => console.log(nft.name)} />
                    </div>
                </div>
            )}

            <CryptoApprovalModal isOpen={approvalModal} toWhom={getSeaportAddressForChain(chainId)} initialItems={trade?.parsedConsideration || []} onAllApproved={everythingApproved} setIsOpen={() => setApprovalModal(false)} />
        </div>
    )
}