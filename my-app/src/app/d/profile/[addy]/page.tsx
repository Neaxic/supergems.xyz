"use client"
import { getUser, postComment, postRep, putDescription } from "@/api/Private/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useUserContext } from "@/contexts/userContext";
import Avatar from "boring-avatars";
import { Activity, Clock, ImageIcon, Star, Users, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

import { getChainNameNFTGO, shortenAddress } from '../../../../lib/helpers';
import { NftGallery } from "@/components/nft-gallery";
import { INFTGONFT } from "@/lib/interfaces/NftGOv2";
import { SimpleUserMessage } from "@/components/simple-user-message";
import { CommentsWithLoading } from "@/components/comments-with-loading";
import { makeAPICall } from "@/lib/apiHelpers";
import { IComment } from "@/lib/interfaces/IUtil";
import { useAccount } from "wagmi";

export default function ProfilePage({ params }: { params: { addy: string } }) {
    const { address } = useAccount();
    const { chainId } = useUserContext();
    const [userData, setUserData] = useState<{
        name: string;
        description: string;
        nfts: INFTGONFT[]
        comments: IComment[]
    } | null>(null);

    const fetchUserData = async () => {
        const data = await getUser(params.addy, getChainNameNFTGO(chainId));
        setUserData(data);
        // postCanIAsk
    };

    const giveRep = async () => {
        const data = await postRep(params.addy);
        console.log("aassss", data);
    }

    const addComment = async (message: string) => {
        const data = await makeAPICall(() => postComment(params.addy, message));
        if (data && userData) setUserData({ ...userData, comments: data as IComment[] });
    }

    const updateDescription = async (description: string) => {
        const data: { description: string } | null = (await makeAPICall(() => putDescription(description))) || null;
        if (data && userData && data.description) setUserData({ ...userData, description: data.description });
    }

    useEffect(() => {
        fetchUserData();
    }, [])

    return (
        <div className="w-full">
            <div className="w-full px-4">
                <Card className="mb-4 ">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="md:w-1/3 flex flex-col items-center text-center">
                                <Avatar variant="beam" className="pt-2" name={params.addy.toLowerCase()} width={128} />
                                <h1 className="text-2xl font-bold mt-6">{userData?.name}</h1>
                                <p className="text-muted-foreground mb-4">{shortenAddress(params.addy)}</p>
                                <div className="flex gap-2 w-full mt-4">
                                    <Button className="flex-1" onClick={giveRep}>Give Rep (3/3)</Button>
                                    <Button disabled variant="outline" className="flex-1">Send Offer</Button>
                                </div>
                            </div>
                            <div className="md:w-2/3">
                                <p className="mb-2 text-muted">*PLACEHOLDER DATA</p>
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div className="flex items-center">
                                        <ImageIcon className="w-5 h-5 mr-2 text-primary" />
                                        <div>
                                            <p className="font-semibold">{userData?.nfts.length}</p>
                                            <p className="text-sm text-muted-foreground">NFTs</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Wallet className="w-5 h-5 mr-2 text-primary" />
                                        <div>
                                            <p className="font-semibold">21 ETH</p>
                                            <p className="text-sm text-muted-foreground">Total Value</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Users className="w-5 h-5 mr-2 text-primary" />
                                        <div>
                                            <p className="font-semibold">2</p>
                                            <p className="text-sm text-muted-foreground">Reps</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="flex items-center">
                                        <Clock className="w-5 h-5 mr-2 text-primary" />
                                        <div>
                                            <p className="font-semibold">2 Months Ago</p>
                                            <p className="text-sm text-muted-foreground">Join Date</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Activity className="w-5 h-5 mr-2 text-primary" />
                                        <div>
                                            <p className="font-semibold">29 T/A</p>
                                            <p className="text-sm text-muted-foreground">Trading Volume</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Star className="w-5 h-5 mr-2 text-primary" />
                                        <div>
                                            <p className="font-semibold">4 ETH</p>
                                            <p className="text-sm text-muted-foreground">Traded For</p>
                                        </div>
                                    </div>
                                </div>
                                <Separator className="my-4" />
                                <div className="flex justify-between items-center">
                                    <SimpleUserMessage onSave={(msg) => updateDescription(msg)} isOwner={address?.toLowerCase() === params.addy.toLowerCase() || false} message={userData?.description} />
                                    {/* <p className="text-sm text-muted-foreground">Joined {user.joinDate}</p> */}
                                    {/* <Button variant="ghost" size="sm">
                                        View all stats
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button> */}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <CommentsWithLoading comments={userData?.comments || []} isLoading={false} disabled={false} onSubmit={(message) => addComment(message)} />
                <Card className=" mt-4">
                    <CardContent className="p-6">
                        <p className="text-sm opacity-30">NFTs from your current connected chain</p>
                        <NftGallery nfts={userData?.nfts || []} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}