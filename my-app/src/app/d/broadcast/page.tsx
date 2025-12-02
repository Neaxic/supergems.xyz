"use client"
import { makeAPICall } from "@/lib/apiHelpers";
import { IBroadcast } from "@/lib/interfaces/IBroadcast";
import { getBroadcasts } from "@/api/Private/o/broadcast";
import { useCallback, useEffect, useRef, useState } from "react";
import { useChainId } from "wagmi";
import { getChainNameNFTGO } from "@/lib/helpers";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ArrowDownWideNarrow, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SimpleUserMessage } from "@/components/simple-user-message";
import Avatar from "boring-avatars";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { NFTCardWithDrawer } from "@/components/NFTCardWithDrawer";
import { INFTGONFT, intialINFTGONFT } from "@/lib/interfaces/NftGOv2";
import { ResponsiveGrid } from "@/components/responsive-grid";
import { shortenAddress } from '../../../lib/helpers';

export default function Page() {
    const chainId = useChainId()
    const [broadcasts, setBroadcasts] = useState<IBroadcast[]>([])
    const gridRef = useRef<HTMLDivElement | null>(null)

    const fetchBroadcastListing = useCallback(async () => {
        // fetch all broadcast listings
        const response = await makeAPICall(() => getBroadcasts(getChainNameNFTGO(chainId) || "ethereum")) as { broadcasts: unknown }
        if (Array.isArray((response as { broadcasts: unknown }).broadcasts)) {
            setBroadcasts(response.broadcasts as IBroadcast[])
        } else {
            console.error("API response is not an array:", response)
        }
    }, [chainId])

    useEffect(() => {
        fetchBroadcastListing()
    }, [fetchBroadcastListing])

    return (
        <div>
            <div className="px-4">
                {/* <Card className="rounded-md">
                    <CardHeader>
                        <h2 className="text-lg font-bold">What is this?</h2>
                        <div>
                            <p>Welcome to the Broadcast Center, where you can explore listings from other traders or create your own.</p>
                            <p>The goal is to bring traders together. Interested in an item? Simply click on it to view the attached message from the seller.</p>
                            <p>Browse this platform like a catalog, connect with others, and trade seamlessly. You can also check if a trader is currently online.</p>
                            <p>This is an off-chain non-binding negotiation spot.</p>
                        </div>
                    </CardHeader>
                </Card> */}

                <div className="mt-4 sticky p-2 border rounded-md">
                    <div className="flex flex-row gap-2 items-center h-full w-full">
                        <Link href={`/d/broadcast/create`}>
                            <Button className="mr-4 px-3" variant={"outline"}>
                                Create post
                            </Button>
                        </Link>
                        <div className="w-full relative">
                            <Input
                                type="text"
                                placeholder="Search for an item..."
                                // value={query}
                                // onChange={handleInputChange}
                                className="pl-8 pr-10"
                            />
                            <Search className="absolute left-2 right-8 top-1/2 transform -translate-y-1/2 h-4 w-4" />
                        </div>
                        <Button className="px-3">
                            <Filter width={18} height={18} />
                        </Button>
                        <Button className="px-3">
                            <ArrowDownWideNarrow width={18} height={18} />
                        </Button>
                    </div>
                </div>

                <div className="mt-4" ref={gridRef}>
                    <ResponsiveGrid parrentRef={gridRef} multiplyer={2} fillers={32}>
                        {Array.isArray(broadcasts) ? (
                            broadcasts.map((broadcast) => (
                                <div key={broadcast.posterID}>
                                    <Popover>
                                        <PopoverTrigger>
                            <NFTCardWithDrawer nfts={{ ...intialINFTGONFT, ...broadcast.item, ...broadcast } as unknown as INFTGONFT} />
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[350px] py-2">
                                            <div className="flex pl-1 justify-between">
                                                <div className="flex">
                                                    <Avatar variant='beam' name={broadcast.posterID.toLowerCase()} className="h-4 w-4" />
                                                    <Label className="ml-2">{broadcast.posterName}</Label>
                                                    <Label className="ml-2 text-muted">{shortenAddress(broadcast.posterID)}</Label>
                                                </div>
                                                <Label className="ml-2 pr-1">Offline</Label>
                                            </div>
                                            <div className="pt-2">
                                                <SimpleUserMessage isOwner={false} message={broadcast.message} />
                                            </div>
                                            <div className="flex justify-between">
                                                <Link href={`/d/trade/formulator/${broadcast.posterID}/offline`}>
                                                    <Button variant={"ghost"} className="px-2 py-0">
                                                        Offer
                                                    </Button>
                                                </Link>
                                                <Link href={`/d/profile/${broadcast.posterID}`}>
                                                    <Button variant={"ghost"}>
                                                        Goto profile
                                                    </Button>
                                                </Link>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            ))

                        ) : (
                            <p>No broadcasts available.</p>
                        )}
                    </ResponsiveGrid>
                </div>
            </div>
        </div>
    )
}