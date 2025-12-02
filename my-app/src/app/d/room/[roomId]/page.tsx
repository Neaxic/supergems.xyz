"use client"

import { getUser } from "@/api/Private/user";
import { InventoryTradingViewV2 } from "@/components/inventory-trading-view-v2";
import { Button } from "@/components/ui/button";
import { useChatSidebar } from "@/components/ui/chat-sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { useChatContext } from "@/contexts/chatContext";
import { useUserContext } from "@/contexts/userContext";
import { makeAPICall } from "@/lib/apiHelpers";
import { getChainNameNFTGO } from "@/lib/helpers";
import { INFTGONFT } from "@/lib/interfaces/NftGOv2";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";

export default function RoomPage() {
    const { currentUser, userNfts, chainId } = useUserContext();
    const { openConnectModal } = useConnectModal();
    const { address } = useAccount();
    const { setOpen } = useSidebar();
    const { setOpen: setOpenChat } = useChatSidebar();
    const params = useParams();
    const roomId = params?.roomId as string;
    const { traderHook } = useChatContext();

    const handleSidebars = () => {
        setOpen(false);
        setOpenChat(false); //Subject to change
    }

    const checkRoomValid = () => {
        // Check if room is valid
        traderHook.checkRoom("" + roomId);
    }

    const handleAlreadyJoinedCheck = () => {
        // Check if user has already joined the room - else join it
        if (traderHook.roomId !== roomId) {
            alert("joinRoom run")
            traderHook.joinRoom("" + roomId);
        }
    }

    useEffect(() => {
        fetchOtherPartyInventory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [traderHook.otherParty])

    useEffect(() => {
        if (traderHook.roomValid) {
            handleAlreadyJoinedCheck();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [traderHook.roomValid])

    useEffect(() => {
        handleSidebars();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId])

    useEffect(() => {
        if (!traderHook.isConnected) return;
        if (!address) {
            openConnectModal?.();
            return;
        }


        setTimeout(() => {
            checkRoomValid();
        }, 1500); //Allow socket to get connected

        // Cleanup function to run when the component unmounts
        return () => {
            // traderHook.leaveRoom();
            // traderHook.disconnect(); // Call disconnect when leaving the page
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address, traderHook.isConnected])


    const [inventorySelected, setInventorySelected] = useState("me");
    const [otherPartyInventory, setOtherPartyInventory] = useState<INFTGONFT[]>([]);
    const [meSelectedNft, setMeSelectedNft] = useState<INFTGONFT[]>([]);
    const [youSelectedNft, setYouSelectedNft] = useState<INFTGONFT[]>([]);

    const fetchOtherPartyInventory = useCallback(async () => {
        // setUserLoading(true)
        //And other info¨
        const resp: { nfts: INFTGONFT[] } | null = await makeAPICall(() => getUser(traderHook.otherParty?.address, getChainNameNFTGO(chainId))) ?? null;
        if (resp) {
            setOtherPartyInventory(resp.nfts)
        }
        // setUserLoading(false)
    }, [traderHook.otherParty?.address])


    const handleInventorySelect = (who: string) => {
        setInventorySelected(who);
    };

    const handleNftSelect = (nft: INFTGONFT, isMe: boolean) => {
        //REMOVE
        setYouSelectedNft([]);
        //REMOVE

        if (isMe) {
            setMeSelectedNft(
                meSelectedNft.includes(nft)
                    ? meSelectedNft.filter((selectedNft) => selectedNft !== nft)
                    : [...meSelectedNft, nft]
            );
        } else {
            //Maybe socket ask other user
            // setYouSelectedNft(prev => [...prev, nft]);
        }
    };

    return (
        <div className="px-4">
            {!!!traderHook.otherParty && (
                <div className="w-full items-center justify-center mt-32">
                    <h2 className="text-2xl text-center mt-2">Room ID: {roomId}, status: {traderHook.roomValid === undefined ? "Checking" : traderHook.roomValid === true ? "Valid" : "Invalid"}</h2>

                    {!address && (
                        <div className="flex justify-center items-center flex-col">
                            <h2 className="text-3xl text-center font-semibold">You are not logged in, and herby not authed</h2>
                            <Button className=" mt-8" onClick={() => openConnectModal?.()}>Login</Button>
                        </div>
                    )}

                    {address && (
                        <div>
                            <h2 className="text-3xl text-center font-semibold">Waiting for co-party...</h2>

                        </div>
                    )}
                </div>
            )}
            {!!traderHook.otherParty && (
                <div>
                    <InventoryTradingViewV2
                        currentUser={{ ...currentUser, address: address ?? "" }}
                        youUser={traderHook.otherParty}
                        address={address}
                        addy={"0x"}
                        userLoading={false}
                        inventorySelected={inventorySelected}
                        meInventoryNft={userNfts ?? []}
                        youInventoryNft={otherPartyInventory}
                        meSelectedNft={meSelectedNft}
                        youSelectedNft={youSelectedNft}
                        onInventorySelect={handleInventorySelect}
                        onNftSelect={handleNftSelect}
                    />
                </div>
            )}


        </div >
    )
}