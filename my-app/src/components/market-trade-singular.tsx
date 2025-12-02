"use client"

import React, { useEffect, useState } from "react"
import { Clock, Dot, Handshake, MessageSquareMore } from "lucide-react"
import { Label } from "./ui/label"
import Avatar from "boring-avatars"
import { shortenAddress } from "@/lib/helpers"
import { INFTGOCollection, INFTGONFT } from "@/lib/interfaces/NftGOv2"
import { differenceInSeconds } from "date-fns"
import { NFTCardWithDrawerSimple } from "./NFTCardWithDrawerSimple"
import Link from "next/link"

interface MarketTradeSingularProps {
    tradeId: string
    senderItems: INFTGONFT[]
    reciverItems: INFTGONFT[] | INFTGOCollection[]
    tradeExpiery?: number
    message?: string
    user: {
        address: string
        name: string
    }
    nftSize?: number
}

export function MarketTradeSingular({
    tradeId,
    senderItems,
    reciverItems,
    tradeExpiery = 1730282065,
    message = "",
    user,
    nftSize = 160,
}: MarketTradeSingularProps) {
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

        const targetDate = new Date(tradeExpiery * 1000);
        setTimeDifference(formatTimeDifference(targetDate));

        const interval = setInterval(() => {
            setTimeDifference(formatTimeDifference(targetDate));
        }, 1000);

        return () => clearInterval(interval);
    }, [tradeExpiery]);

    return (
        <Link href={`/d/marketplace/${tradeId}`}>
            <div className="w-fit">
                <div className="flex justify-between items-center">
                    <div className="flex items-center ">
                        {message && (
                            <div className="flex items-center gap-1">
                                <MessageSquareMore className="w-4 h-4 ml-1 transform scale-x-[-1]" />
                                <p>3</p>
                            </div>
                        )}
                        <Avatar className="ml-2" name={user.address.toLowerCase()} variant="beam" width={24} height={24} ></Avatar>
                        <Label className="ml-2">@{user.name}</Label>
                        <Label className="text-muted-foreground text-xs ml-2">{shortenAddress(user.address, 4)}</Label>
                        <Dot className="h-8 w-8" color={"green"} />
                    </div>
                    <div className="flex">
                        <Label className={`ml-2`}>{timeDifference}</Label>
                        <Clock className="w-4 h-4 ml-2" />
                    </div>
                </div>
                <div className="flex mt-2 items-center gap-2 ">
                    {senderItems.map((nft, index) => (
                        <NFTCardWithDrawerSimple nftSize={nftSize} key={index} nfts={nft} />
                    ))}
                    <Handshake className="w-6 h-6" />
                    {reciverItems.map((nft, index) => (
                        <NFTCardWithDrawerSimple nftSize={nftSize} key={index} nfts={nft} />
                    ))}
                    {/* <img src="https://via.placeholder.com/150" alt="placeholder" className="absolute opacity-35 right-0 w-24 h-24" /> */}
                    {/* <img src="https://via.placeholder.com/150" alt="placeholder" className="absolute opacity-75 z-9 right-3 w-28 h-28" /> */}
                    {/* <img src="https://via.placeholder.com/150" alt="placeholder" className="absolute right-6 z-10 w-32 h-32" /> */}
                </div>
            </div>
        </Link>
    )
}