import { NFTCardWithDrawer } from "@/components/NFTCardWithDrawer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { INFTGOCollection, INFTGONFT } from "@/lib/interfaces/NftGOv2";
import Avatar from "boring-avatars";
import { useCallback } from "react";
import CountUp from "react-countup";
import { Skeleton } from "./ui/skeleton";
import { ISimpleUser } from "@/lib/interfaces/ITrades";
import { isINFTGONFT } from "@/lib/helpers";
import { LockIcon } from "lucide-react";

interface ITradingViewV2Props {
    // some props
    bottomUser: ISimpleUser;
    isCollection?: boolean;
    bottomNFTs: INFTGONFT[] | INFTGOCollection[];
    topNFTs: INFTGONFT[];
    topUser: ISimpleUser;
    topNftPressed: (nft: INFTGONFT) => void;
    bottomNftPressed: (nft: INFTGONFT) => void;
    loading?: boolean;
    parrentRef?: React.RefObject<HTMLDivElement>;
    topLocked?: boolean | undefined;
    bottomLocked?: boolean | undefined;
}

export default function TradingViewV2({ bottomUser, topLocked, bottomLocked, isCollection = false, parrentRef, bottomNFTs, topNFTs, topUser, topNftPressed, bottomNftPressed, loading = false }: ITradingViewV2Props) {
    const calculateTopNfts = useCallback(() => {
        return topNFTs.reduce((acc, nft) => acc + (nft.collection?.floor_price?.value ?? 0), 0)
    }, [topNFTs])

    const calculateBottomNfts = useCallback(() => {
        return bottomNFTs.reduce((acc, nft) => acc + (isINFTGONFT(nft) ? nft.collection?.floor_price?.value ?? 0 : nft.floor_price?.value ?? 0), 0)
    }, [bottomNFTs])


    return (
        <div className="w-full flex flex-col gap-2">
            <Card className="border-none">
                <CardHeader className="p-0 px-2 pb-2">
                    {loading ? (
                        <div className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2 rounded-lg">
                            <Avatar variant='beam' name={topUser.address?.toLowerCase() || ""} className="h-8 w-8" />
                            <div className="flex-grow">
                                <div className="flex gap-4">
                                    <p className="font-medium">{topUser?.name && "@"}{topUser?.name || "Unregistered"}</p>
                                    {topLocked !== undefined && (
                                        <div className="flex items-center gap-1">
                                            <LockIcon className="h-3 w-3" color={topLocked ? "red" : "green"} />
                                            <p className={`font-medium ${topLocked ? "text-red-600" : "text-green-500"}`}>
                                                {topLocked ? "Locked" : "Unlocked"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">{topUser.address}</p>
                            </div>
                            <div className="text-right">
                                <div className='flex items-center'>
                                    {/* <Dot className="h-4 w-4" color={selectedUser.online ? "green" : "red"} /> */}
                                    {/* <p className="text-sm">{selectedUser.online ? "Online" : "Offline"}</p> */}
                                </div>
                                {topNFTs.length > 0 && (
                                    <div className="flex">
                                        <p className="text-sm">
                                            {topNFTs.length} @ {" "}
                                            <CountUp
                                                end={calculateTopNfts()}
                                                duration={1}
                                                decimals={3}
                                                decimal="."
                                                separator=","
                                                className="tabular-nums"
                                            />{" "}
                                            ETH
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="px-2 pt-0 relative">
                    <NFTCardWithDrawer multiplyer={1} parrentRef={parrentRef} maxHeight="35vh" fillers={8} onPressed={(nft) => {
                        if (topLocked === true) return;
                        if ('id' in nft) {
                            topNftPressed(nft);
                        }
                    }} nfts={loading ? [] : topNFTs} />
                </CardContent>
            </Card>
            <Card className="border-none">
                <CardHeader className="p-0 px-2 pb-2" >
                    {loading ? (
                        <div className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2  rounded-lg">
                            <Avatar variant='beam' name={isCollection ? "d" : bottomUser.address.toLowerCase()} className="h-8 w-8" />
                            <div className="flex-grow">
                                <div className="flex gap-4">
                                    <p className="font-medium">{!isCollection && bottomUser.name && "@"}{!isCollection && (bottomUser.name || "Unregistered")}{isCollection && "Anybody"}</p>
                                    {bottomLocked !== undefined && (
                                        <div className="flex items-center gap-1">
                                            <LockIcon className="h-3 w-3" color={bottomLocked ? "red" : "green"} />
                                            <p className={`font-medium ${bottomLocked ? "text-red-600" : "text-green-500"}`}>
                                                {bottomLocked ? "Locked" : "Unlocked"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">{bottomUser.address}</p>
                            </div>

                            <div className="text-right">
                                <div className='flex items-center'>
                                    {/* <Dot className="h-4 w-4" color={selectedUser.online ? "green" : "red"} /> */}
                                    {/* <p className="text-sm">{selectedUser.online ? "Online" : "Offline"}</p> */}
                                </div>
                                {bottomNFTs.length > 0 && (
                                    <div className="flex">
                                        <p className="text-sm">
                                            {bottomNFTs.length} @ {" "}
                                            <CountUp
                                                end={calculateBottomNfts()}
                                                duration={1}
                                                decimals={3}
                                                decimal="."
                                                separator=","
                                                className="tabular-nums"
                                            />{" "}
                                            ETH
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="px-2 pt-0">
                    <NFTCardWithDrawer multiplyer={1} parrentRef={parrentRef} maxHeight="35vh" fillers={8} onPressed={(nft) => {
                        if (bottomLocked === true) return;
                        bottomNftPressed(nft as INFTGONFT)
                    }}
                        nfts={loading ? [] : bottomNFTs} />
                </CardContent>
            </Card>
        </div >
    )
}