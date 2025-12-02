"use client"

import { AnimatedTradingCard } from "@/components/animated-trading-card";
import { NFTCardSimple } from "@/components/NFTCardSimple";
import { RecentTrades } from "@/components/recent-trades";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import UserSearch from "@/hooks/user-search";
import { IUser } from "@/lib/interfaces/firebase";
import { dummyHapeCollection, dummyHapePrime1, dummyHapePrime2, dummyHapePrimeDark1, dummyHapePrimeDark3 } from "@/lib/json/testnfts";
import { cn } from "@/lib/utils";
import Avatar from "boring-avatars";
import { Handshake, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function TradePage() {
    const [selectedUser, setSelectedUser] = useState<IUser>();

    return (
        <div>
            <div className="px-4 overflow-x-hidden">
                <div className="">
                    <div className="grid grid-cols-1 lg:grid-cols-2 w-full gap-4 " >
                        <Card className="w-full pb-8">
                            <CardHeader>
                                <CardTitle>1:1 Trade Forumulator</CardTitle>
                                <CardDescription>Create a proposal with your counter-party</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="w-full lg:flex">
                                    <div className="w-full  mr-8">
                                        {/* Explaing text */}
                                        <p className="text-sm text-muted-foreground">
                                            In an offline setting, browse, and explore your counter-partys wallet.
                                            Whenever ready send the proposal into your counter-partys inbox.
                                        </p>

                                        <div className="relative mr-4 mt-4">
                                            <UserSearch onClear={() => setSelectedUser(undefined)} onUserSelect={(user) => setSelectedUser(user)} />
                                            {/* Call new api search */}
                                            {/* followed by is-users-online on socket (if connected) */}

                                            {/* <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" /> */}
                                            {/* <Input placeholder="Search" className="pl-8" /> */}
                                        </div>
                                        {selectedUser?.address && (
                                            <div className="flex gap-4 mt-4">
                                                <Link
                                                    href={`/d/trade/formulator/${selectedUser?.address}/offline`}
                                                    className={cn(
                                                        buttonVariants({
                                                            variant: "default", className: "gap-2"
                                                        }),
                                                    )}
                                                >
                                                    <span
                                                        className={cn(
                                                            "ml-auto",
                                                            "text-background dark:text-white"
                                                        )}
                                                    >
                                                        Create a proposal
                                                    </span>
                                                    <Send className="w-4" />
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                    <div className="pt-6 lg:pt-0">
                                        <div className="flex justify-between">
                                            <div className="flex items-center">
                                                <Avatar name="benjamin" width={24} height={24} className="-mr-2" ></Avatar>
                                                <Label className="ml-4">@You</Label>
                                            </div>
                                            <div className="flex items-center">
                                                <Label className="mr-2">@Someone</Label>
                                                <Avatar name="benjamin" width={24} height={24} className="-mr-2" ></Avatar>
                                            </div>
                                        </div>
                                        <div className="flex mt-6 justify-between items-center">
                                            <div className="flex gap-1 relative items-center w-[190px]">
                                                {/* <NFTCardSimple nft={dummyHapePrime1} classes={"w-32 h-32"} /> */}
                                                <NFTCardSimple nft={dummyHapePrime1} classes={"w-24 h-24"} />
                                                <NFTCardSimple nft={dummyHapePrimeDark3} classes={"absolute z-9 left-3 w-28 h-28"} />
                                                <NFTCardSimple nft={dummyHapePrime2} classes={"absolute z-10 left-6 w-32 h-32"} />
                                                {/* <img src="https://via.placeholder.com/150" alt="placeholder" className="opacity-35 w-24 h-24" /> */}
                                                {/* <img src="https://via.placeholder.com/150" alt="placeholder" className="absolute z-9 left-3 opacity-75 w-28 h-28" /> */}
                                                {/* <img src="https://via.placeholder.com/150" alt="placeholder" className="absolute z-10 left-6 w-32 h-32" /> */}
                                            </div>
                                            <div>
                                                <Handshake />
                                            </div>
                                            <div className="flex gap-1 relative items-center w-[190px]">
                                                <NFTCardSimple nft={dummyHapePrime1} classes={"absolute right-0 w-24 h-24"} />
                                                <NFTCardSimple nft={dummyHapePrimeDark3} classes={"absolute z-9 right-3 w-28 h-28"} />
                                                <NFTCardSimple nft={dummyHapePrimeDark1} classes={"absolute right-6 z-10 w-32 h-32"} />
                                                {/* <img src="https://via.placeholder.com/150" alt="placeholder" className="absolute opacity-35 right-0 w-24 h-24" /> */}
                                                {/* <img src="https://via.placeholder.com/150" alt="placeholder" className="absolute opacity-75 z-9 right-3 w-28 h-28" /> */}
                                                {/* <img src="https://via.placeholder.com/150" alt="placeholder" className="absolute right-6 z-10 w-32 h-32" /> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="w-full mt-4 lg:mt-0">
                            <CardHeader>
                                <CardTitle>Collection Offer</CardTitle>
                                <CardDescription>Create an open-proposal anybody could fulfill</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="w-full lg:flex">
                                    <div className="w-full mr-8">
                                        <p className="text-sm text-muted-foreground">
                                            Might be intrested in another piece from a collection? Maybe the same collection, or an entirely diffrend one, you can make an offer here.
                                            Optionally allow offers offchain before finalizing onchain.
                                        </p>

                                        <div className="mt-4">
                                            <Button>
                                                <Link
                                                    href={"/d/trade/formulator/open"}
                                                >
                                                    Create a collection deal
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex pt-6 lg:pt-0 justify-between">
                                            <div className="flex items-center">
                                                <Avatar name="benjamin" width={24} height={24} className="-mr-2" ></Avatar>
                                                <Label className="ml-4">@You</Label>
                                            </div>
                                            <div className="flex items-center">
                                                <Label className="mr-2">@Anyone</Label>
                                                <Avatar name="benjamin" width={24} height={24} className="-mr-2" ></Avatar>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-3">
                                            <div className="flex relative items-center w-[170px]">
                                                {/* <NFTCardSimple nft={dummyHapePrime1} classes={"w-32 h-32"} /> */}
                                                <NFTCardSimple nft={dummyHapePrime2} classes={"z-10 w-32 h-32"} />
                                                {/* <img src="https://via.placeholder.com/150" alt="placeholder" className="opacity-35 w-24 h-24" /> */}
                                                {/* <img src="https://via.placeholder.com/150" alt="placeholder" className="absolute z-9 left-3 opacity-75 w-28 h-28" /> */}
                                                {/* <img src="https://via.placeholder.com/150" alt="placeholder" className="absolute z-10 left-6 w-32 h-32" /> */}
                                            </div>
                                            <div>
                                                <Handshake />
                                            </div>
                                            <div className="flex relative items-center w-[170px]">
                                                <NFTCardSimple nft={dummyHapeCollection} classes={"absolute right-0 z-10 w-32 h-32"} />
                                                {/* <img src="https://via.placeholder.com/150" alt="placeholder" className="absolute opacity-35 right-0 w-24 h-24" /> */}
                                                {/* <img src="https://via.placeholder.com/150" alt="placeholder" className="absolute opacity-75 z-9 right-3 w-28 h-28" /> */}
                                                {/* <img src="https://via.placeholder.com/150" alt="placeholder" className="absolute right-6 z-10 w-32 h-32" /> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="mt-4">
                    <AnimatedTradingCard />
                </div>

                {/* {Trade list + user lister} */}
                <div className="flex gap-4 mt-4">
                    {/* List of resent trades */}
                    <RecentTrades />

                    {/* List of users that last sent you trade invites */}
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Invite List</CardTitle>
                            <CardDescription>Some currently online trader friends</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                {/* <div>
                                    <HoverCard>
                                        <HoverCardTrigger className="flex items-center gap-4">
                                            <Avatar variant="beam" name="abracadabra" width={48} height={48}></Avatar>
                                            <div className="flex flex-col ">
                                                <Label>
                                                    @Abracadabra
                                                </Label>
                                                0x12893812jasduioasuidba
                                            </div>
                                        </HoverCardTrigger>
                                        <HoverCardContent>
                                            User data, that hasent yet been implemented
                                        </HoverCardContent>
                                    </HoverCard>
                                </div> */}
                                {/* <Button variant={"link"}>Trade</Button> */}
                                <div className="w-full h-16 flex items-center justify-center">
                                    <p className="text-sm text-muted-foreground">You currently dont have anybody on your friends list</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}