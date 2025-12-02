"use client"

import { postCreateListing } from "@/api/Private/proposal";
import { CryptoApprovalModal } from "@/components/crypto-approval-modal";
import { NftGallery } from "@/components/nft-gallery";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useUserContext } from "@/contexts/userContext";
import { getSeaportAddressForChain } from "@/lib/helpers";
import UseSeaportHook from "@/lib/hooks/UseSeaportHook";
import { initialUser } from "@/lib/interfaces/firebase";
import { INFTGONFT } from "@/lib/interfaces/NftGOv2";
import Avatar from "boring-avatars";
import { Handshake, Lock } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useChainId } from "wagmi";
import { convertINFTGOtoISeaportOffer, convertINFTOGOtoISeaportConsideration } from '@/lib/helpers';
import { toast } from "sonner";
import TradingViewV2 from "@/components/trading-view-v2";
import { Input } from "@/components/ui/input";

export default function Page() {
    const chainId = useChainId()
    const router = useRouter();

    const { userNfts, currentUser, address } = useUserContext();
    const seaportHook = UseSeaportHook({ onSignedOrder: (sig) => swapFinished(sig) })
    const params = useParams();
    const addy = params?.addy as string;

    const [meInventoryNft, setMeInventoryNft] = useState<INFTGONFT[]>(userNfts || []);
    const [youInventoryNft, setYouInventoryNft] = useState<INFTGONFT[]>([]);
    const [meSelectedNft, setMeSelectedNft] = useState<INFTGONFT[]>([]);
    const [youSelectedNft, setYouSelectedNft] = useState<INFTGONFT[]>([]);
    const [inventorySelected, setInvetorySelected] = useState<string>("me");

    const [approvalModal, setApprovalModal] = useState<boolean>(false);
    const [orderObject, setOrderObject] = useState<unknown>(null);
    const [message, setMessage] = useState<string>("");

    const parrentRef = useRef<HTMLDivElement>(null);

    const selectedNftInventory = (nft: INFTGONFT, isMe: boolean) => {
        if (isMe) {
            if (meSelectedNft.includes(nft)) {
                setMeSelectedNft(meSelectedNft.filter((selectedNft) => selectedNft !== nft))
                setMeInventoryNft([...meInventoryNft, nft])
            } else {
                setMeSelectedNft([...meSelectedNft, nft])
                setMeInventoryNft(meInventoryNft.filter((selectedNft) => selectedNft !== nft))
            }
        } else {
            if (youSelectedNft.includes(nft)) {
                setYouSelectedNft(youSelectedNft.filter((selectedNft) => selectedNft !== nft))
                setYouInventoryNft([...youInventoryNft, nft])
            } else {
                setYouSelectedNft([...youSelectedNft, nft])
                setYouInventoryNft(youInventoryNft.filter((selectedNft) => selectedNft !== nft))
            }
        }
    }

    // const fetchOtherPartyInventory = useCallback(async () => {
    //     setUserLoading(true)
    //     //And other info¨
    //     const resp = await getUser(addy, getChainNameNFTGO(chainId))
    //     if (resp) {
    //         setYouUser(resp)
    //         if (oNfts || cNfts) {
    //             if (wasReciver) {
    //                 const nfts = cNfts ? JSON.parse(decodeURIComponent(cNfts)) as { id: string, name: string }[] : [];
    //                 setYouSelectedNft(resp.nfts.filter((nft: INFTGONFT) => nfts.includes({ id: nft.token_id, name: nft.contract_address })))
    //                 setYouInventoryNft(resp.nfts.filter((nft: INFTGONFT) => !nfts.includes({ id: nft.token_id, name: nft.contract_address })))
    //             } else {
    //                 const nfts = oNfts ? JSON.parse(decodeURIComponent(oNfts)) as { id: string, name: string }[] : [];
    //                 setYouSelectedNft(resp.nfts.filter((nft: INFTGONFT) => nfts.includes({ id: nft.token_id, name: nft.contract_address })))
    //                 setYouInventoryNft(resp.nfts.filter((nft: INFTGONFT) => !nfts.includes({ id: nft.token_id, name: nft.contract_address })))
    //             }
    //         } else {
    //             setYouInventoryNft(resp.nfts)
    //         }
    //     }
    //     setUserLoading(false)
    // }, [addy, cNfts, chainId, oNfts, wasReciver])

    const swapStarted = () => {
        //Start the swap
        setApprovalModal(true)
    }

    const everythingApproved = async () => {
        if (!address || meSelectedNft.length < 1 || youSelectedNft.length < 1) return;
        setApprovalModal(false)
        const orderObject = await seaportHook.signOrder(convertINFTGOtoISeaportOffer(meSelectedNft), convertINFTOGOtoISeaportConsideration(youSelectedNft, address))
        setOrderObject(orderObject);
    }

    const swapFinished = async (sig: `0x${string}` | undefined) => {
        if (!sig || !orderObject) return;
        //Finish the swap
        const response = await postCreateListing(orderObject, sig, addy, message, chainId);
        if (response) {
            toast(response.message)
            router.push(`/d/marketplace/${response.tradeId}`);
        }
    }

    useEffect(() => {
        // if (oNfts && userNfts) {
        //     const nfts = JSON.parse(decodeURIComponent(oNfts)) as { id: string, name: string }[];
        //     console.log(nfts)
        //     setMeSelectedNft(userNfts.filter(nft => nfts.includes({ id: nft.token_id, name: nft.contract_address })))
        //     setMeInventoryNft(userNfts.filter(nft => !nfts.includes({ id: nft.token_id, name: nft.contract_address })))
        // } else {
        setMeInventoryNft(userNfts || [])
        // }
    }, [userNfts])

    return (
        <div>
            <div className="flex items-center px-4 py-2 h-full" style={{ height: "52px" }}>
                <h1 className="text-xl font-bold">{"Trade Creator > Offline Trade"}</h1>
            </div>
            <Separator />

            <div className="p-4 ">
                <div className="rounded-lg w-full flex justify-between items-center">
                    {/* Some trading settings */}
                    <div>
                        <Tabs defaultValue="normal">
                            <TabsList>
                                <TabsTrigger value="normal">New view</TabsTrigger>
                                <TabsTrigger disabled value="beta">
                                    <Lock className="h-3 w-3 mr-2" />
                                    Beta view
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Popover>
                            <PopoverTrigger>
                                Add a message
                            </PopoverTrigger>
                            <PopoverContent className="w-96">
                                <Label htmlFor="message-2">Your Message (optional)</Label>
                                <Textarea onChange={(e) => setMessage(e.target.value)} value={message} className="my-2" placeholder="Add a message, maximum 200 characters" />
                                <p className="text-sm text-muted-foreground">
                                    Your message will be attached to the trade offer
                                </p>
                            </PopoverContent>
                        </Popover>

                        <Button className="flex gap-2 items-center" variant={"default"} onClick={() => swapStarted()} disabled={!(meSelectedNft.length > 0 && youSelectedNft.length > 0)}>
                            <Handshake className="h-4 w-4" />
                            Deal
                        </Button>
                    </div>
                </div>

                <div ref={parrentRef} className="flex w-full mt-4 gap-4">
                    {/* Trade formulator */}
                    {/* Steam like trading formulator */}
                    {/* Left side */}

                    <div className="w-full max-h-[90vh]" >
                        <Card className="">
                            <CardContent >
                                {/* < */}
                            </CardContent >
                        </Card>

                        <Card className=" h-full mt-4">
                            <CardContent >
                                <Select value={inventorySelected} onValueChange={(who) => setInvetorySelected(who)}>
                                    <SelectTrigger className="w-full mt-6 h-full">
                                        <SelectValue placeholder="Select inventory" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="me">
                                            <div className="flex items-center space-x-4 h-8">
                                                <Avatar variant='beam' name={address?.toLowerCase()} className="h-6 w-6" />
                                                <div className="flex-grow">
                                                    <p className="font-medium">{currentUser.name && "@"}{currentUser?.name || "Unregistered"}</p>
                                                    {/* <p className="text-sm text-muted-foreground">{meUser?.address}</p> */}
                                                </div>
                                            </div>
                                        </SelectItem>

                                    </SelectContent>
                                </Select>
                                {inventorySelected === "me" && (
                                    <NftGallery
                                        multiplyer={1}
                                        fillers={16}
                                        maxHeight="75vh"
                                        onPressed={(nft) => selectedNftInventory(nft as INFTGONFT, true)}
                                        nfts={meInventoryNft}
                                        parrentRef={parrentRef} />
                                )}
                                <Input className="mt-4" placeholder="Search for an item..." />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right side */}
                    <div className="w-full flex flex-col gap-2">
                        <TradingViewV2
                            parrentRef={parrentRef}
                            loading={false}
                            topUser={{ ...currentUser, address: address || "" }}
                            topNFTs={meSelectedNft}
                            bottomNFTs={youSelectedNft}
                            bottomUser={initialUser}
                            bottomNftPressed={(nft: INFTGONFT) => selectedNftInventory(nft, false)}
                            topNftPressed={(nft: INFTGONFT) => selectedNftInventory(nft, true)} />
                    </div>
                </div>
            </div>

            {/* Approving to seaport 1.6 contract */}
            <CryptoApprovalModal isOpen={approvalModal} toWhom={getSeaportAddressForChain(chainId)} initialItems={meSelectedNft} onAllApproved={everythingApproved} setIsOpen={() => setApprovalModal(false)} />
        </div>
    )

}