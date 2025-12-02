"use client"

import { CustomPopup } from "@/components/custom-popup"
import { NftGallery } from "@/components/nft-gallery"
import { SimpleUserMessage } from "@/components/simple-user-message"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useUserContext } from "@/contexts/userContext"
import { makeAPICall } from "@/lib/apiHelpers"
import { getChainNameNFTGO } from "@/lib/helpers"
import { INFTGONFT } from "@/lib/interfaces/NftGOv2"
import { Check, X } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { useChainId } from "wagmi"
import { postBroadcasts, getMyBroadcastListings } from "@/api/Private/broadcast"
import { toast } from "sonner"

interface INFTGONFTwMessage extends INFTGONFT {
    message?: string
}

export default function Page() {
    const { userNfts } = useUserContext();
    const [selcetedItems, setSelectedItems] = useState<INFTGONFT[]>([])
    const [currentlySelected, setCurrentlySelected] = useState<INFTGONFT | undefined>()
    const [popupOpen, setPopupOpen] = useState(false)
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })

    const [itemsReady, setItemsReady] = useState<{ tokenAddress: string, token: string, message: string }[]>([])
    const chainId = useChainId()
    const windowRef = useRef<HTMLDivElement | null>(null);

    const fetchBroadcastListing = useCallback(async () => {
        // fetch all broadcast listings
        const response = await makeAPICall(() => getMyBroadcastListings(getChainNameNFTGO(chainId) || "ethereum")) as { data: INFTGONFTwMessage[] | undefined }
        if (response !== undefined && Array.isArray(response.data) && response.data.length > 0) {
            setSelectedItems(response.data)
            setItemsReady(response.data.map(e => ({ tokenAddress: e.contract_address, token: e.token_id, message: e.message || "" })))
        }
    }, [chainId, setItemsReady, setSelectedItems])

    const handleUploadBroadcast = useCallback(async () => {
        console.log(itemsReady)
        const response = await makeAPICall(() => postBroadcasts(getChainNameNFTGO(chainId) || "ethereum", itemsReady))
        if (response)
            toast("success")
    }, [chainId, itemsReady])

    const handleNFTPressed = useCallback((nft: INFTGONFT, event: React.MouseEvent) => {
        console.log(nft)
        setCurrentlySelected(nft)
        setPopupPosition({ x: event.clientX, y: event.clientY })
        setPopupOpen(true)
        // setSelectedItems([...selectedItems, nft])
    }, [])

    const handleSetMessage = useCallback((msg: string) => {
        console.log("a", currentlySelected)
        if (!currentlySelected) return
        setSelectedItems(prevItems => [...prevItems, currentlySelected as INFTGONFT])
        const item = {
            tokenAddress: currentlySelected.contract_address,
            token: currentlySelected.token_id,
            message: msg
        }
        setItemsReady(prevItems => {
            const existingItemIndex = prevItems.findIndex(e => e.tokenAddress === currentlySelected.contract_address && e.token === currentlySelected.token_id)
            if (existingItemIndex !== -1) {
                const updatedItems = [...prevItems]
                updatedItems[existingItemIndex] = item
                return updatedItems
            } else {
                return [...prevItems, item]
            }
        })
    }, [currentlySelected])

    const handleRemoveItem = useCallback(async () => {
        const nft = currentlySelected as INFTGONFT
        // await makeAPICall(() => deleteBroadcastListing(getChainNameNFTGO(chainId) || "ethereum", nft.contract_address, nft.token_id))
        setSelectedItems(prevItems =>
            prevItems.filter(item =>
                !(item.contract_address === nft.contract_address && item.token_id === nft.token_id)
            )
        );
        setItemsReady(itemsReady.filter(e => e.tokenAddress !== nft.contract_address || e.token !== nft.token_id))
        setPopupOpen(false)
    }, [currentlySelected, itemsReady])

    const handleClosePopup = useCallback(() => {
        setPopupOpen(false)
    }, [])

    useEffect(() => {
        fetchBroadcastListing()
    }, [fetchBroadcastListing])

    return (
        <div ref={windowRef}>
            <div className="flex items-center px-4 py-2 h-full" style={{ height: "52px" }}>
                <h1 className="text-xl font-bold">{"Broadcast > Creator"}</h1>
            </div>
            <Separator />

            <Link
                href={`/d/broadcast`}

            >
                <Button className="mr-4 px-3" variant={"outline"}>
                    Go back
                </Button>
            </Link>

            <div className="p-4">
                <NftGallery
                    handleUpdatedSelected={selcetedItems}
                    onPressed={(nft, event) => handleNFTPressed(nft as INFTGONFT, event as React.MouseEvent)}
                    nfts={userNfts || []} />
                <CustomPopup
                    isOpen={popupOpen}
                    onClose={handleClosePopup}
                    position={popupPosition}
                >
                    <div className="bg-background border rounded-md w-[350px] ">
                        <div className="flex justify-between items-center">
                            <h3 className="text-md pl-2 font-semibold">Enter message</h3>
                            <Button variant="ghost" size="icon" onClick={handleClosePopup}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="px-2 pb-2">
                            <SimpleUserMessage
                                onSave={(msg) => handleSetMessage(msg)}
                                isOwner={true}
                                message={itemsReady.find(e => e.tokenAddress === currentlySelected?.contract_address && e.token === currentlySelected.token_id)?.message || undefined}
                                defaultIsEditing={itemsReady.find(e => e.tokenAddress === currentlySelected?.contract_address && e.token === currentlySelected.token_id) ? false : true} />
                        </div>
                        {/* <div className="flex w-full justify-end gap-4 pt-2">
                            <Button variant={"ghost"}>
                                <X className="h-4 w-4" />
                                Close</Button>
                            <Button variant={"ghost"}>
                                <Check className="h-4 w-4" />
                                Add</Button>
                        </div> */}
                        {itemsReady.find(e => e.tokenAddress === currentlySelected?.contract_address && e.token === currentlySelected.token_id) && (
                            <div className="flex justify-end pr-2 pb-2">
                                <Button variant={"ghost"} onClick={handleRemoveItem}>
                                    <Check className="h-4 w-4" />
                                    <Label className="pl-2">Remove Item</Label>
                                </Button>
                            </div>
                        )}
                    </div>
                </CustomPopup>
            </div>

            {/* Bottom bar */}
            <div className={`fixed bg-background bottom-0 border-t transition-all duration-300 ease-in-out 
                    ${selcetedItems.length > 0 ? 'translate-y-0' : 'translate-y-full'}`} style={{ height: "100px", width: windowRef?.current?.clientWidth }}>
                < div className="flex items-center justify-between px-4 py-2">
                    <h1 className="text-xl font-bold">Broadcasting</h1>
                    <div className="flex gap-4 items-center">
                        <p>{selcetedItems.length} ITEM{selcetedItems.length > 1 && "S"} SELECTED</p>
                        <Button onClick={handleUploadBroadcast}>Tell the world</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}